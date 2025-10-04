import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { rateLimit } from "./rate-limit";
import { moderateContent } from "./moderation";
import { calculatePriceFinal } from "./currency";
import { rankVendors } from "./ranker";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "vendor") {
      return res.sendStatus(401);
    }

    try {
      // Content moderation
      const moderationResult = moderateContent(req.body.name + " " + req.body.description);
      if (!moderationResult.allowed) {
        return res.status(400).json({ 
          message: "Content contains prohibited claims", 
          suggestions: moderationResult.suggestions 
        });
      }

      const vendor = await storage.getVendorByUserId(req.user.id);
      if (!vendor) {
        return res.status(403).json({ message: "Vendor profile required" });
      }

      const product = await storage.createProduct({
        ...req.body,
        vendorId: vendor.id,
        status: moderationResult.allowed ? "active" : "paused"
      });

      res.status(201).json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Vendors API
  app.get("/api/vendors", async (req, res) => {
    try {
      const vendors = await storage.getAllVendors();
      res.json(vendors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/vendors", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const vendor = await storage.createVendor({
        ...req.body,
        userId: req.user.id,
      });

      // Update user role
      await storage.updateUser(req.user.id, { role: "vendor" });

      res.status(201).json(vendor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Recommendations API with rate limiting
  app.post("/api/recommend", rateLimit, async (req, res) => {
    try {
      const quizData = req.body;
      const vendors = await storage.getAllVendors();
      const products = await storage.getAllProducts();

      // Apply recommendation rules
      const recommendations = applyRecommendationRules(quizData, products);
      
      // Rank vendors
      const rankedVendors = rankVendors(vendors, quizData);
      
      const result = {
        ...recommendations,
        vendorSuggestion: rankedVendors[0],
        alternatives: rankedVendors.slice(1, 3)
      };

      // Save recommendation
      await storage.createRecommendation({
        userId: req.user?.id,
        quizData,
        ...result
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cart API
  app.post("/api/cart", async (req, res) => {
    try {
      // Cart operations would be handled client-side or in session
      res.json({ message: "Cart updated" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Checkout API with rate limiting
  app.post("/api/checkout", rateLimit, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { items } = req.body;
      let total = 0;

      // Calculate totals
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) continue;
        
        const finalPrice = calculatePriceFinal(product.priceBase, product.vat);
        total += finalPrice * item.quantity;
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "cop",
        metadata: {
          userId: req.user.id,
          items: JSON.stringify(items)
        }
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe webhook
  app.post("/api/stripe/webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig!,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update order status
        // This would involve creating order records and handling split payments
        console.log('Payment succeeded:', paymentIntent.id);
      }

      res.json({ received: true });
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // Reviews API with rate limiting
  app.post("/api/reviews", rateLimit, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const review = await storage.createReview({
        ...req.body,
        userId: req.user.id,
      });

      res.status(201).json(review);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Account deletion
  app.post("/api/account/delete", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      // Delete/anonymize user data
      await storage.createAuditLog("ACCOUNT_DELETE", req.user.id);
      
      // In a real implementation, you'd anonymize or delete related records
      // This is a stub for the delete functionality
      
      res.json({ message: "Account deletion initiated" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Recommendation rules
function applyRecommendationRules(quizData: any, products: any[]) {
  let topPick = "";
  let addOns: string[] = [];
  let variant = "";
  let segment = "";
  let rationale = "";

  // Apply business rules
  if (quizData.zona === "espalda" && quizData.vive_solo === "si") {
    topPick = "Kit Bacne Solo";
    segment = "bacne_solo";
    rationale = "Perfecto para cuidado independiente de la espalda";
  }

  if (quizData.cabello_largo === "si") {
    addOns.push("Ducha-Orden™ Rail");
  }

  if (quizData.gym === "si") {
    addOns.push("Pads de bolsillo");
  }

  if (quizData.sensibilidad === "alta") {
    variant = "Sensitive";
  }

  return {
    segment,
    topPick,
    addOns,
    variant,
    rationale
  };
}
