const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');
const Product = require('../models/product.model');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/p1';

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@grocery.com',
    password: 'Password@123',
    role: 'admin',
    isEmailVerified: true,
    phone: '+1 800 555 0199',
  },
  {
    name: 'John Doe',
    email: 'user@grocery.com',
    password: 'Password@123',
    role: 'user',
    isEmailVerified: true,
    phone: '+1 800 555 0123',
  },
];

const sampleProducts = [
  {
    name: 'Fresh Organic Bananas',
    slug: 'fresh-organic-bananas',
    description: 'Sweet and creamy organic bananas packed with potassium and essential nutrients. Perfect for morning smoothies or snacks.',
    price: 3.99,
    discountPrice: 2.99,
    stock: 150,
    brand: 'Organic Farm',
    category: 'Fruits & Vegetables',
    unit: '1 bunch (approx. 6 pcs)',
    isFeatured: true,
    isPublished: true,
    ratingAverage: 4.8,
    ratingCount: 42,
    images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80'],
    tags: ['organic', 'fruit', 'potassium', 'healthy'],
  },
  {
    name: 'Organic Whole Milk',
    slug: 'organic-whole-milk',
    description: 'Farm-fresh 100% organic whole milk, rich in calcium and vitamin D. Pasteurized and homogenized for high quality.',
    price: 4.49,
    discountPrice: 3.99,
    stock: 80,
    brand: 'Dairy Gold',
    category: 'Dairy & Eggs',
    unit: '1 Gallon',
    isFeatured: true,
    isPublished: true,
    ratingAverage: 4.9,
    ratingCount: 35,
    images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80'],
    tags: ['dairy', 'milk', 'organic', 'calcium'],
  },
  {
    name: 'Artisan Whole Wheat Bread',
    slug: 'artisan-whole-wheat-bread',
    description: 'Freshly baked 100% whole grain wheat bread with a crispy crust and soft texture. No artificial preservatives.',
    price: 4.99,
    discountPrice: 3.49,
    stock: 50,
    brand: 'BakeHouse',
    category: 'Bakery',
    unit: '1 loaf (500g)',
    isFeatured: true,
    isPublished: true,
    ratingAverage: 4.7,
    ratingCount: 28,
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'],
    tags: ['bakery', 'bread', 'whole grain', 'fresh'],
  },
  {
    name: 'Hass Avocados (Pack of 4)',
    slug: 'hass-avocados-pack-of-4',
    description: 'Creamy and ripe Hass avocados. Ideal for guacamole, salads, sandwiches, and healthy morning toasts.',
    price: 5.99,
    discountPrice: 4.99,
    stock: 90,
    brand: 'Green Harvest',
    category: 'Fruits & Vegetables',
    unit: 'Pack of 4',
    isFeatured: true,
    isPublished: true,
    ratingAverage: 4.6,
    ratingCount: 19,
    images: ['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80'],
    tags: ['avocado', 'superfood', 'healthy fats'],
  },
  {
    name: 'Extra Virgin Olive Oil',
    slug: 'extra-virgin-olive-oil',
    description: 'Cold-pressed 100% extra virgin olive oil from premium Mediterranean olives. Rich flavor for salad dressings and cooking.',
    price: 12.99,
    discountPrice: 10.99,
    stock: 40,
    brand: 'Mediterraneo',
    category: 'Pantry & Oil',
    unit: '750ml Bottle',
    isFeatured: true,
    isPublished: true,
    ratingAverage: 4.9,
    ratingCount: 52,
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'],
    tags: ['pantry', 'olive oil', 'cooking', 'healthy'],
  },
  {
    name: 'Organic Greek Yogurt',
    slug: 'organic-greek-yogurt',
    description: 'Thick, creamy plain Greek yogurt packed with 15g protein per serving. Made with live and active probiotics.',
    price: 4.29,
    discountPrice: null,
    stock: 65,
    brand: 'Dairy Gold',
    category: 'Dairy & Eggs',
    unit: '32 oz',
    isFeatured: false,
    isPublished: true,
    ratingAverage: 4.5,
    ratingCount: 14,
    images: ['https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80'],
    tags: ['dairy', 'yogurt', 'protein', 'probiotics'],
  },
  {
    name: 'Cold Pressed Orange Juice',
    slug: 'cold-pressed-orange-juice',
    description: '100% pure squeezed Florida orange juice with pulp. High in Vitamin C, no added sugar or artificial additives.',
    price: 4.99,
    discountPrice: 3.99,
    stock: 75,
    brand: 'SunOranges',
    category: 'Beverages',
    unit: '59 fl oz',
    isFeatured: false,
    isPublished: true,
    ratingAverage: 4.8,
    ratingCount: 22,
    images: ['https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80'],
    tags: ['beverages', 'juice', 'vitamin c', 'fresh'],
  },
  {
    name: 'Artisan Dark Chocolate 70%',
    slug: 'artisan-dark-chocolate-70',
    description: 'Single-origin cocoa dark chocolate bar with rich, dark roasted espresso notes and smooth finish.',
    price: 3.49,
    discountPrice: 2.99,
    stock: 120,
    brand: 'ChocoCrafters',
    category: 'Snacks & Sweets',
    unit: '100g bar',
    isFeatured: false,
    isPublished: true,
    ratingAverage: 4.9,
    ratingCount: 61,
    images: ['https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80'],
    tags: ['chocolate', 'snacks', 'dark chocolate', 'gourmet'],
  },
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    console.log('Clearing old users and products...');
    await User.deleteMany({});
    await Product.deleteMany({});

    console.log('Creating initial users...');
    const createdUsers = await User.create(sampleUsers);
    const adminUser = createdUsers.find((u) => u.role === 'admin');

    console.log(`Admin user created: ${adminUser.email}`);

    console.log('Creating initial products...');
    const productsToInsert = sampleProducts.map((p) => ({
      ...p,
      createdBy: adminUser._id,
    }));

    await Product.create(productsToInsert);
    console.log(`Successfully seeded ${productsToInsert.length} products!`);

    console.log('\n--- SEED COMPLETE ---');
    console.log('Admin Login: admin@grocery.com / Password@123');
    console.log('User Login: user@grocery.com / Password@123');
    console.log('--------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
