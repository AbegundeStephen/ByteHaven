import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const categories = [
  {
    name: "Gaming Laptops",
    slug: "gaming-laptops",
    description:
      "High-performance laptops built for gaming and heavy workloads.",
    sortOrder: 0,
  },
  {
    name: "Business Laptops",
    slug: "business-laptops",
    description: "Reliable, portable laptops for work and productivity.",
    sortOrder: 1,
  },
  {
    name: "Ultrabooks",
    slug: "ultrabooks",
    description: "Slim, lightweight laptops for everyday use and travel.",
    sortOrder: 2,
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Chargers, mice, bags, and other laptop accessories.",
    sortOrder: 3,
  },
] as const;

function placeholderImage(seed: string, i: number) {
  // .png format, not the default SVG — next/image's optimizer blocks SVG
  // optimization by default (a deliberate XSS-safety default), and real
  // uploaded product photos will never be SVG either.
  return `https://placehold.co/800x600/0B2447/FFFFFF.png?text=${encodeURIComponent(seed)}+${i}`;
}

const products = [
  {
    category: "gaming-laptops",
    name: "ASUS ROG Strix G16",
    brand: "ASUS",
    condition: "new",
    price: 2850000,
    discountPrice: null,
    stockQuantity: 6,
    specs: {
      processor: "Intel Core i9-13980HX",
      ram: "32GB DDR5",
      storage: "1TB NVMe SSD",
      screen_size: "16-inch QHD 240Hz",
      gpu: "NVIDIA GeForce RTX 4070 8GB",
      os: "Windows 11 Home",
      battery: "90Wh",
    },
    description:
      "A powerhouse gaming laptop with a high-refresh QHD display, RTX 4070 graphics, and top-tier cooling for extended sessions.",
    status: "active",
  },
  {
    category: "gaming-laptops",
    name: "Lenovo Legion 5",
    brand: "Lenovo",
    condition: "uk_used",
    price: 1650000,
    discountPrice: 1550000,
    stockQuantity: 4,
    specs: {
      processor: "AMD Ryzen 7 6800H",
      ram: "16GB DDR5",
      storage: "512GB NVMe SSD",
      screen_size: "15.6-inch FHD 165Hz",
      gpu: "NVIDIA GeForce RTX 3060 6GB",
      os: "Windows 11 Home",
      battery: "80Wh",
    },
    description:
      "UK-used Legion 5 in excellent condition — great value for 1080p gaming with a smooth 165Hz panel.",
    status: "active",
  },
  {
    category: "gaming-laptops",
    name: "HP Omen 16",
    brand: "HP",
    condition: "refurbished",
    price: 1950000,
    discountPrice: null,
    stockQuantity: 3,
    specs: {
      processor: "Intel Core i7-12700H",
      ram: "16GB DDR5",
      storage: "1TB NVMe SSD",
      screen_size: "16.1-inch QHD 165Hz",
      gpu: "NVIDIA GeForce RTX 3070 Ti 8GB",
      os: "Windows 11 Home",
      battery: "83Wh",
    },
    description:
      "Professionally refurbished Omen 16 with a clean chassis and fresh thermal paste — tested and verified working.",
    status: "active",
  },
  {
    category: "business-laptops",
    name: "Dell Latitude 5440",
    brand: "Dell",
    condition: "uk_used",
    price: 950000,
    discountPrice: null,
    stockQuantity: 8,
    specs: {
      processor: "Intel Core i5-1345U",
      ram: "16GB DDR5",
      storage: "256GB NVMe SSD",
      screen_size: "14-inch FHD",
      gpu: "Intel Iris Xe (integrated)",
      os: "Windows 11 Pro",
      battery: "54Wh",
    },
    description:
      "Dependable UK-used business laptop — lightweight, long battery life, and a spill-resistant keyboard.",
    status: "active",
  },
  {
    category: "business-laptops",
    name: "Lenovo ThinkPad X1 Carbon",
    brand: "Lenovo",
    condition: "refurbished",
    price: 1250000,
    discountPrice: 1150000,
    stockQuantity: 5,
    specs: {
      processor: "Intel Core i7-1265U",
      ram: "16GB LPDDR5",
      storage: "512GB NVMe SSD",
      screen_size: "14-inch WUXGA",
      gpu: "Intel Iris Xe (integrated)",
      os: "Windows 11 Pro",
      battery: "57Wh",
    },
    description:
      "The gold standard for business ultraportables — carbon-fiber chassis, excellent keyboard, refurbished and tested.",
    status: "active",
  },
  {
    category: "business-laptops",
    name: "HP EliteBook 840 G9",
    brand: "HP",
    condition: "new",
    price: 1450000,
    discountPrice: null,
    stockQuantity: 7,
    specs: {
      processor: "Intel Core i7-1265U",
      ram: "16GB DDR5",
      storage: "512GB NVMe SSD",
      screen_size: "14-inch FHD",
      gpu: "Intel Iris Xe (integrated)",
      os: "Windows 11 Pro",
      battery: "51Wh",
    },
    description:
      "Brand new EliteBook with a sturdy MIL-STD build, great security features, and all-day battery life.",
    status: "active",
  },
  {
    category: "ultrabooks",
    name: "Apple MacBook Air M2",
    brand: "Apple",
    condition: "new",
    price: 1750000,
    discountPrice: null,
    stockQuantity: 5,
    specs: {
      processor: "Apple M2 8-core",
      ram: "8GB Unified Memory",
      storage: "256GB SSD",
      screen_size: "13.6-inch Liquid Retina",
      gpu: "Apple 10-core GPU (integrated)",
      os: "macOS",
      battery: "18 hours",
    },
    description:
      "Fanless, silent, and fast — the MacBook Air M2 is ideal for everyday productivity and creative work on the go.",
    status: "active",
  },
  {
    category: "ultrabooks",
    name: "Dell XPS 13",
    brand: "Dell",
    condition: "uk_used",
    price: 1100000,
    discountPrice: null,
    stockQuantity: 0,
    specs: {
      processor: "Intel Core i7-1250U",
      ram: "16GB LPDDR5",
      storage: "512GB NVMe SSD",
      screen_size: "13.4-inch FHD+",
      gpu: "Intel Iris Xe (integrated)",
      os: "Windows 11 Home",
      battery: "52Wh",
    },
    description:
      "Compact and premium with an edge-to-edge InfinityEdge display. Currently sold out — check back soon.",
    status: "sold_out",
  },
  {
    category: "accessories",
    name: "Logitech MX Master 3S",
    brand: "Logitech",
    condition: "new",
    price: 85000,
    discountPrice: null,
    stockQuantity: 20,
    specs: {
      type: "Wireless mouse",
      connectivity: "Bluetooth / USB receiver",
      battery: "Up to 70 days per charge",
      compatibility: "Windows, macOS, Linux",
    },
    description:
      "A precise, quiet wireless mouse with an 8K DPI sensor — a favorite among professionals and creatives.",
    status: "active",
  },
  {
    category: "accessories",
    name: "Anker 65W USB-C Charger",
    brand: "Anker",
    condition: "new",
    price: 35000,
    discountPrice: 30000,
    stockQuantity: 15,
    specs: {
      type: "GaN USB-C charger",
      output: "65W max",
      ports: "2x USB-C, 1x USB-A",
      compatibility: "Most USB-C laptops and phones",
    },
    description:
      "Compact GaN charger that can power a laptop and phone simultaneously — a great travel companion.",
    status: "active",
  },
];

async function main() {
  console.log("Seeding categories...");
  const categoryBySlug = new Map<string, string>();
  for (const c of categories) {
    const created = await db.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        sortOrder: c.sortOrder,
      },
      create: c,
    });
    categoryBySlug.set(c.slug, created.id);
  }
  console.log(`Seeded ${categoryBySlug.size} categories.`);

  console.log("Seeding products...");
  let count = 0;
  for (const p of products) {
    const categoryId = categoryBySlug.get(p.category);
    if (!categoryId) throw new Error(`Unknown category slug: ${p.category}`);

    const slug = p.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const product = await db.product.upsert({
      where: { slug },
      update: {
        name: p.name,
        brand: p.brand,
        categoryId,
        condition: p.condition as never,
        price: p.price,
        discountPrice: p.discountPrice,
        stockQuantity: p.stockQuantity,
        specs: p.specs,
        description: p.description,
        status: p.status as never,
      },
      create: {
        name: p.name,
        slug,
        brand: p.brand,
        categoryId,
        condition: p.condition as never,
        price: p.price,
        discountPrice: p.discountPrice,
        stockQuantity: p.stockQuantity,
        specs: p.specs,
        description: p.description,
        status: p.status as never,
      },
    });

    const existingImages = await db.productImage.count({
      where: { productId: product.id },
    });
    if (existingImages === 0) {
      await db.productImage.createMany({
        data: [
          {
            productId: product.id,
            url: placeholderImage(p.brand, 1),
            isPrimary: true,
            sortOrder: 0,
          },
          {
            productId: product.id,
            url: placeholderImage(p.brand, 2),
            isPrimary: false,
            sortOrder: 1,
          },
        ],
      });
    }
    count++;
  }
  console.log(`Seeded ${count} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
