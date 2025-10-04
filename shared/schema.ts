import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, real, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").$type<"user" | "vendor" | "admin">().notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  businessName: text("business_name").notNull(),
  description: text("description"),
  commissionBp: integer("commission_bp").notNull(), // basis points (e.g., 1200 = 12%)
  kycStatus: text("kyc_status").$type<"pending" | "approved" | "rejected">().default("pending"),
  status: text("status").$type<"active" | "suspended" | "pending">().default("pending"),
  stripeAccountId: text("stripe_account_id"),
  shippingProfileId: uuid("shipping_profile_id").references(() => shippingProfiles.id),
  returnPolicy: text("return_policy"),
  shippingPolicy: text("shipping_policy"),
  // Ranking KPIs
  slaP95DispatchHrs: integer("sla_p95_dispatch_hrs").default(96),
  deliveryEtaDays: integer("delivery_eta_days").default(5),
  ratingAvg: real("rating_avg").default(0),
  nps: integer("nps").default(0),
  returnRate: real("return_rate").default(0),
  onTimeShipRate: real("on_time_ship_rate").default(0),
  responseHrs: integer("response_hrs").default(24),
  stockHealth: real("stock_health").default(0),
  takeRateBp: integer("take_rate_bp").default(1000), // monthly GMV in thousands
  sensitiveOk: boolean("sensitive_ok").default(false),
  policyStrikes: integer("policy_strikes").default(0),
  distanceKm: integer("distance_km").default(50),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: uuid("vendor_id").references(() => vendors.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  priceBase: integer("price_base").notNull(), // price in COP cents before VAT
  vat: real("vat").notNull().default(0.19), // 19% Colombian VAT
  images: jsonb("images").$type<string[]>().default([]),
  badges: jsonb("badges").$type<string[]>().default([]),
  stock: integer("stock").default(0),
  status: text("status").$type<"active" | "paused" | "out_of_stock">().default("active"),
  whatIncludes: text("what_includes"),
  howToUse: text("how_to_use"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shippingProfiles = pgTable("shipping_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  rules: jsonb("rules").notNull(), // JSON with shipping rates and zones
  vendorId: uuid("vendor_id").references(() => vendors.id),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  status: text("status").$type<"pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled">().default("pending"),
  subtotal: integer("subtotal").notNull(), // in COP cents
  vatAmount: integer("vat_amount").notNull(),
  shippingAmount: integer("shipping_amount").notNull(),
  total: integer("total").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  vendorId: uuid("vendor_id").references(() => vendors.id).notNull(),
  quantity: integer("quantity").notNull(),
  priceBase: integer("price_base").notNull(),
  vat: real("vat").notNull(),
  feeBp: integer("fee_bp").notNull(), // marketplace commission in basis points
  shipping: integer("shipping").notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  vendorId: uuid("vendor_id").references(() => vendors.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  title: text("title"),
  content: text("content"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payouts = pgTable("payouts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: uuid("vendor_id").references(() => vendors.id).notNull(),
  amount: integer("amount").notNull(), // in COP cents
  status: text("status").$type<"pending" | "processing" | "completed" | "failed">().default("pending"),
  stripeTransferId: text("stripe_transfer_id"),
  period: text("period").notNull(), // e.g., "2024-01"
  createdAt: timestamp("created_at").defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  quizData: jsonb("quiz_data").notNull(),
  segment: text("segment"),
  topPick: text("top_pick"),
  addOns: jsonb("add_ons").$type<string[]>().default([]),
  variant: text("variant"),
  rationale: text("rationale"),
  vendorSuggestion: jsonb("vendor_suggestion").notNull(),
  rankingMeta: jsonb("ranking_meta"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: text("type").$type<"product" | "vendor" | "general">().notNull(),
  rating: integer("rating"),
  content: text("content"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adherenceLogs = pgTable("adherence_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  day: integer("day").notNull(), // 0-7
  completed: boolean("completed").default(false),
  tip: text("tip"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  event: text("event").notNull(), // "RANKER_UPDATE", "COMMISSION_UPDATE", etc.
  actor: uuid("actor").references(() => users.id).notNull(),
  target: text("target"),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  vendor: one(vendors, { fields: [users.id], references: [vendors.userId] }),
  orders: many(orders),
  reviews: many(reviews),
  feedback: many(feedback),
  adherenceLogs: many(adherenceLogs),
  recommendations: many(recommendations),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, { fields: [vendors.userId], references: [users.id] }),
  products: many(products),
  orders: many(orderItems),
  reviews: many(reviews),
  payouts: many(payouts),
  shippingProfile: one(shippingProfiles, { fields: [vendors.shippingProfileId], references: [shippingProfiles.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(vendors, { fields: [products.vendorId], references: [vendors.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  adherenceLogs: many(adherenceLogs),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  vendor: one(vendors, { fields: [orderItems.vendorId], references: [vendors.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type User = typeof users.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type Recommendation = typeof recommendations.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type AdherenceLog = typeof adherenceLogs.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
