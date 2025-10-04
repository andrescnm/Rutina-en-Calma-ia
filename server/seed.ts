import { db } from "./db";
import { users, vendors, categories, products, shippingProfiles } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("🌱 Starting database seeding...");

  // 1. Create categories for Colombian personal care market
  const categoryData = [
    { name: "Cuidado Facial", slug: "cuidado-facial", description: "Productos para el cuidado del rostro" },
    { name: "Cuidado Corporal", slug: "cuidado-corporal", description: "Productos para el cuidado del cuerpo" },
    { name: "Cuidado Capilar", slug: "cuidado-capilar", description: "Productos para el cuidado del cabello" },
    { name: "Protección Solar", slug: "proteccion-solar", description: "Protectores solares y after sun" },
    { name: "Cuidado de Manos", slug: "cuidado-manos", description: "Productos para manos y uñas" },
    { name: "Higiene Personal", slug: "higiene-personal", description: "Productos de higiene diaria" },
  ];

  const insertedCategories = await db.insert(categories).values(categoryData).returning();
  console.log(`✅ Created ${insertedCategories.length} categories`);

  const categoryMap: Record<string, string> = Object.fromEntries(
    insertedCategories.map((cat: any) => [cat.slug, cat.id])
  );

  // 2. Create vendor users and vendor accounts
  const vendorUsers = [
    { username: "naturalia_col", email: "ventas@naturalia.co", role: "vendor" as const, businessName: "Naturalia Colombia", description: "Productos naturales y orgánicos certificados", deliveryEta: 3 },
    { username: "dermacol", email: "contacto@dermacol.co", role: "vendor" as const, businessName: "DermaColombia", description: "Línea dermatológica profesional", deliveryEta: 2 },
    { username: "botanica_verde", email: "info@botanicaverde.co", role: "vendor" as const, businessName: "Botánica Verde", description: "Cosmética botánica artesanal", deliveryEta: 4 },
    { username: "sol_tropical", email: "ventas@soltropical.co", role: "vendor" as const, businessName: "Sol Tropical", description: "Especialistas en protección solar", deliveryEta: 3 },
    { username: "belleza_pura", email: "contacto@bellezapura.co", role: "vendor" as const, businessName: "Belleza Pura", description: "Cosméticos veganos y cruelty-free", deliveryEta: 5 },
  ];

  const hashedPassword = await hashPassword("demo123");
  
  const insertedUsers = await db.insert(users).values(
    vendorUsers.map(v => ({
      username: v.username,
      email: v.email,
      password: hashedPassword,
      role: v.role,
    }))
  ).returning();
  console.log(`✅ Created ${insertedUsers.length} vendor users`);

  // 3. Create shipping profiles for each vendor
  const shippingProfilesData = insertedUsers.map((user: any, idx: number) => ({
    name: `Perfil ${vendorUsers[idx].businessName}`,
    rules: {
      zones: [
        { name: "Bogotá", priceBase: 800000, freeOver: 15000000 }, // 8000 COP, free over 150k
        { name: "Principales ciudades", priceBase: 1200000, freeOver: 20000000 }, // 12000 COP, free over 200k
        { name: "Resto del país", priceBase: 1800000, freeOver: 25000000 }, // 18000 COP, free over 250k
      ]
    },
    vendorId: null as any, // Will be set after vendor creation
  }));

  const insertedShippingProfiles = await db.insert(shippingProfiles).values(shippingProfilesData).returning();
  console.log(`✅ Created ${insertedShippingProfiles.length} shipping profiles`);

  // 4. Create vendors
  const vendorsData = insertedUsers.map((user: any, idx: number) => ({
    userId: user.id,
    businessName: vendorUsers[idx].businessName,
    description: vendorUsers[idx].description,
    commissionBp: 1500, // 15% commission
    kycStatus: "approved" as const,
    status: "active" as const,
    shippingProfileId: insertedShippingProfiles[idx].id,
    deliveryEtaDays: vendorUsers[idx].deliveryEta,
    ratingAvg: 4.5 + Math.random() * 0.5, // 4.5 - 5.0
    nps: 70 + Math.floor(Math.random() * 20), // 70-90
    returnRate: Math.random() * 0.05, // 0-5%
    onTimeShipRate: 0.9 + Math.random() * 0.1, // 90-100%
    responseHrs: 2 + Math.floor(Math.random() * 22), // 2-24 hrs
    stockHealth: 0.8 + Math.random() * 0.2, // 80-100%
    takeRateBp: 800 + Math.floor(Math.random() * 400), // 8-12% effective take rate
    sensitiveOk: true,
    policyStrikes: 0,
    distanceKm: 10 + Math.floor(Math.random() * 90), // 10-100 km
    returnPolicy: "Devoluciones aceptadas dentro de 30 días con producto sin abrir",
    shippingPolicy: `Envíos en ${vendorUsers[idx].deliveryEta} días hábiles`,
  }));

  const insertedVendors = await db.insert(vendors).values(vendorsData).returning();
  console.log(`✅ Created ${insertedVendors.length} vendors`);

  // 5. Create products - Colombian personal care products
  const productsData = [
    // Naturalia Colombia - Natural & Organic
    {
      vendorId: insertedVendors[0].id,
      categoryId: categoryMap["cuidado-facial"],
      name: "Sérum Vitamina C Andina",
      slug: "serum-vitamina-c-andina",
      description: "Sérum facial con extracto de camu camu amazónico y vitamina C natural. Ilumina y unifica el tono de la piel.",
      priceBase: 8900000, // 89,000 COP base
      images: ["/products/serum-vitamina-c.jpg"],
      badges: ["Orgánico", "Vegano", "Hecho en Colombia"],
      stock: 45,
      status: "active" as const,
      whatIncludes: "Sérum 30ml con gotero, instructivo de uso",
      howToUse: "Aplicar 3-4 gotas sobre rostro limpio, antes de la crema hidratante. Usar mañana y noche.",
    },
    {
      vendorId: insertedVendors[0].id,
      categoryId: categoryMap["cuidado-corporal"],
      name: "Crema Corporal Café Colombiano",
      slug: "crema-corporal-cafe-colombiano",
      description: "Crema hidratante con extracto de café arábigo colombiano. Reafirma y suaviza la piel.",
      priceBase: 6500000, // 65,000 COP base
      images: ["/products/crema-cafe.jpg"],
      badges: ["Natural", "Vegano"],
      stock: 60,
      status: "active" as const,
      whatIncludes: "Frasco 250ml, cuchara dosificadora",
      howToUse: "Aplicar generosamente después del baño sobre piel húmeda. Masajear hasta absorción completa.",
    },
    {
      vendorId: insertedVendors[0].id,
      categoryId: categoryMap["cuidado-capilar"],
      name: "Aceite Capilar Moringa y Argán",
      slug: "aceite-capilar-moringa-argan",
      description: "Aceite nutritivo para el cabello con moringa colombiana y aceite de argán marroquí.",
      priceBase: 7200000, // 72,000 COP base
      images: ["/products/aceite-capilar.jpg"],
      badges: ["Orgánico", "Sin sulfatos"],
      stock: 30,
      status: "active" as const,
      whatIncludes: "Frasco 100ml con pipeta dosificadora",
      howToUse: "Aplicar 2-3 gotas en puntas del cabello húmedo o seco. No requiere enjuague.",
    },

    // DermaColombia - Professional Dermatological
    {
      vendorId: insertedVendors[1].id,
      categoryId: categoryMap["cuidado-facial"],
      name: "Gel Limpiador Ácido Salicílico",
      slug: "gel-limpiador-acido-salicilico",
      description: "Limpiador facial con ácido salicílico 2% para piel grasa y propensa al acné. Fórmula dermatológica.",
      priceBase: 5800000, // 58,000 COP base
      images: ["/products/gel-limpiador.jpg"],
      badges: ["Dermatológico", "Sin parabenos"],
      stock: 80,
      status: "active" as const,
      whatIncludes: "Frasco dispensador 200ml",
      howToUse: "Aplicar sobre rostro húmedo, masajear suavemente y enjuagar con agua tibia. Usar 2 veces al día.",
    },
    {
      vendorId: insertedVendors[1].id,
      categoryId: categoryMap["cuidado-facial"],
      name: "Crema Antimanchas Niacinamida",
      slug: "crema-antimanchas-niacinamida",
      description: "Crema despigmentante con niacinamida 10% y ácido kójico. Reduce manchas y unifica tono.",
      priceBase: 9500000, // 95,000 COP base
      images: ["/products/crema-antimanchas.jpg"],
      badges: ["Dermatológico", "Clínicamente probado"],
      stock: 55,
      status: "active" as const,
      whatIncludes: "Tubo 50ml, guía de aplicación",
      howToUse: "Aplicar en zonas con manchas por la noche. Usar protector solar durante el día.",
    },
    {
      vendorId: insertedVendors[1].id,
      categoryId: categoryMap["cuidado-facial"],
      name: "Tónico Exfoliante AHA 7%",
      slug: "tonico-exfoliante-aha",
      description: "Tónico exfoliante con ácidos glicólico y láctico. Renueva la piel y mejora textura.",
      priceBase: 6800000, // 68,000 COP base
      images: ["/products/tonico-aha.jpg"],
      badges: ["Dermatológico", "Vegano"],
      stock: 40,
      status: "active" as const,
      whatIncludes: "Frasco 150ml con dosificador",
      howToUse: "Aplicar con algodón sobre rostro limpio por la noche, 2-3 veces por semana. Evitar contacto con ojos.",
    },

    // Botánica Verde - Artisanal Botanical
    {
      vendorId: insertedVendors[2].id,
      categoryId: categoryMap["cuidado-facial"],
      name: "Mascarilla Arcilla Volcánica",
      slug: "mascarilla-arcilla-volcanica",
      description: "Mascarilla purificante con arcilla de volcanes colombianos. Limpia profundamente los poros.",
      priceBase: 4500000, // 45,000 COP base
      images: ["/products/mascarilla-arcilla.jpg"],
      badges: ["Artesanal", "Natural"],
      stock: 35,
      status: "active" as const,
      whatIncludes: "Frasco 100g, espátula aplicadora",
      howToUse: "Aplicar capa gruesa sobre rostro limpio, dejar 10-15 min y enjuagar. Usar 1-2 veces por semana.",
    },
    {
      vendorId: insertedVendors[2].id,
      categoryId: categoryMap["cuidado-corporal"],
      name: "Jabón Artesanal Caléndula",
      slug: "jabon-artesanal-calendula",
      description: "Jabón artesanal con caléndula y miel de abejas. Calma e hidrata pieles sensibles.",
      priceBase: 2800000, // 28,000 COP base
      images: ["/products/jabon-calendula.jpg"],
      badges: ["Artesanal", "Natural", "Sin químicos"],
      stock: 90,
      status: "active" as const,
      whatIncludes: "Barra 120g en empaque biodegradable",
      howToUse: "Usar en ducha o lavado de manos. Mantener en jabonera seca entre usos.",
    },
    {
      vendorId: insertedVendors[2].id,
      categoryId: categoryMap["cuidado-manos"],
      name: "Crema de Manos Manteca de Karité",
      slug: "crema-manos-karite",
      description: "Crema nutritiva para manos con manteca de karité y aceite de coco. Absorción rápida.",
      priceBase: 3200000, // 32,000 COP base
      images: ["/products/crema-manos.jpg"],
      badges: ["Artesanal", "Vegano"],
      stock: 70,
      status: "active" as const,
      whatIncludes: "Tubo 75ml",
      howToUse: "Aplicar las veces necesarias durante el día, especialmente después de lavar las manos.",
    },

    // Sol Tropical - Sun Protection Specialists
    {
      vendorId: insertedVendors[3].id,
      categoryId: categoryMap["proteccion-solar"],
      name: "Protector Solar Facial FPS 50+",
      slug: "protector-solar-facial-fps50",
      description: "Protector solar facial de amplio espectro. Textura ligera, no grasa. Resistente al agua.",
      priceBase: 7500000, // 75,000 COP base
      images: ["/products/protector-facial.jpg"],
      badges: ["FPS 50+", "UVA/UVB", "Resistente al agua"],
      stock: 100,
      status: "active" as const,
      whatIncludes: "Tubo 50ml",
      howToUse: "Aplicar generosamente 15 min antes de exposición solar. Reaplicar cada 2 horas.",
    },
    {
      vendorId: insertedVendors[3].id,
      categoryId: categoryMap["proteccion-solar"],
      name: "Protector Solar Corporal FPS 50+ Familia",
      slug: "protector-solar-corporal-familia",
      description: "Protector solar corporal para toda la familia. Fórmula biodegradable, apta para niños mayores de 3 años.",
      priceBase: 8900000, // 89,000 COP base
      images: ["/products/protector-corporal.jpg"],
      badges: ["FPS 50+", "Para toda la familia", "Biodegradable"],
      stock: 85,
      status: "active" as const,
      whatIncludes: "Envase 200ml con dosificador",
      howToUse: "Aplicar abundantemente antes de exposición al sol. Reaplicar después de nadar o sudar.",
    },
    {
      vendorId: insertedVendors[3].id,
      categoryId: categoryMap["proteccion-solar"],
      name: "After Sun Aloe Vera Colombiano",
      slug: "after-sun-aloe-vera",
      description: "Gel hidratante post-solar con aloe vera cultivado en Colombia. Calma y repara.",
      priceBase: 5200000, // 52,000 COP base
      images: ["/products/after-sun.jpg"],
      badges: ["Natural", "Calma la piel"],
      stock: 60,
      status: "active" as const,
      whatIncludes: "Frasco 250ml con bomba",
      howToUse: "Aplicar generosamente sobre piel limpia después de exposición solar. Repetir según necesidad.",
    },

    // Belleza Pura - Vegan & Cruelty-Free
    {
      vendorId: insertedVendors[4].id,
      categoryId: categoryMap["cuidado-facial"],
      name: "Agua Micelar Vegana",
      slug: "agua-micelar-vegana",
      description: "Agua micelar desmaquillante vegana. Limpia sin enjuague, apta para todo tipo de piel.",
      priceBase: 4800000, // 48,000 COP base
      images: ["/products/agua-micelar.jpg"],
      badges: ["Vegano", "Cruelty-free", "Sin alcohol"],
      stock: 75,
      status: "active" as const,
      whatIncludes: "Frasco 400ml",
      howToUse: "Aplicar con algodón sobre rostro y ojos. No requiere enjuague.",
    },
    {
      vendorId: insertedVendors[4].id,
      categoryId: categoryMap["cuidado-capilar"],
      name: "Shampoo Sólido Vegano",
      slug: "shampoo-solido-vegano",
      description: "Shampoo sólido sin sulfatos para todo tipo de cabello. Equivale a 3 botellas de shampoo líquido.",
      priceBase: 3500000, // 35,000 COP base
      images: ["/products/shampoo-solido.jpg"],
      badges: ["Vegano", "Zero waste", "Sin sulfatos"],
      stock: 50,
      status: "active" as const,
      whatIncludes: "Barra 80g en caja reciclable, jabonera de viaje",
      howToUse: "Humedecer el cabello y frotar la barra. Masajear el cuero cabelludo y enjuagar.",
    },
    {
      vendorId: insertedVendors[4].id,
      categoryId: categoryMap["higiene-personal"],
      name: "Desodorante Natural en Barra",
      slug: "desodorante-natural-barra",
      description: "Desodorante vegano sin aluminio. Protección natural de 24 horas con bicarbonato y aceites esenciales.",
      priceBase: 3800000, // 38,000 COP base
      images: ["/products/desodorante.jpg"],
      badges: ["Vegano", "Sin aluminio", "24h protección"],
      stock: 65,
      status: "active" as const,
      whatIncludes: "Barra 60g en empaque reciclable",
      howToUse: "Aplicar sobre axilas limpias y secas. Dejar absorber antes de vestirse.",
    },
  ];

  const insertedProducts = await db.insert(products).values(productsData).returning();
  console.log(`✅ Created ${insertedProducts.length} products`);

  // Update shipping profiles with vendor IDs
  for (let i = 0; i < insertedVendors.length; i++) {
    await db.update(shippingProfiles)
      .set({ vendorId: insertedVendors[i].id })
      .where(eq(shippingProfiles.id, insertedShippingProfiles[i].id));
  }
  console.log("✅ Updated shipping profiles with vendor IDs");

  console.log("🎉 Seeding completed successfully!");
  console.log(`
📊 Summary:
- ${insertedCategories.length} categories
- ${insertedUsers.length} vendor users
- ${insertedVendors.length} vendors
- ${insertedProducts.length} products
- ${insertedShippingProfiles.length} shipping profiles
  `);
}

seed()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
