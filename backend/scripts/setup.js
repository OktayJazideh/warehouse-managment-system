const bcrypt = require('bcryptjs');
require('dotenv').config();

const { sequelize, User, Category, Warehouse, Product, Inventory, Transaction } = require('../models');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync all models
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created.');

    console.log('🌱 Seeding initial data...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@warehouse.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin'
    });
    console.log('✅ Admin user created (username: admin, password: admin123)');

    // Create warehouse manager
    const managerPassword = await bcrypt.hash('manager123', 12);
    const managerUser = await User.create({
      username: 'manager',
      email: 'manager@warehouse.com',
      password: managerPassword,
      firstName: 'Warehouse',
      lastName: 'Manager',
      role: 'warehouse_manager'
    });
    console.log('✅ Manager user created (username: manager, password: manager123)');

    // Create categories
    const categories = await Category.bulkCreate([
      { name: 'Electronics', description: 'Electronic devices and components' },
      { name: 'Clothing', description: 'Apparel and fashion items' },
      { name: 'Books', description: 'Books and publications' },
      { name: 'Home & Garden', description: 'Home improvement and gardening items' },
      { name: 'Sports', description: 'Sports equipment and accessories' }
    ]);
    console.log('✅ Categories created');

    // Create warehouses
    const warehouses = await Warehouse.bulkCreate([
      {
        name: 'Main Warehouse',
        code: 'MW01',
        address: '123 Industrial Street',
        city: 'Tehran',
        state: 'Tehran',
        postalCode: '1234567890',
        country: 'Iran',
        phone: '+98-21-12345678',
        email: 'main@warehouse.com',
        managerName: 'Ali Ahmadi',
        capacity: 10000
      },
      {
        name: 'Secondary Warehouse',
        code: 'SW02',
        address: '456 Storage Avenue',
        city: 'Isfahan',
        state: 'Isfahan',
        postalCode: '9876543210',
        country: 'Iran',
        phone: '+98-31-87654321',
        email: 'secondary@warehouse.com',
        managerName: 'Sara Rezaei',
        capacity: 5000
      }
    ]);
    console.log('✅ Warehouses created');

    // Create products
    const products = await Product.bulkCreate([
      {
        code: 'ELC001',
        name: 'Smartphone Samsung Galaxy',
        description: 'Latest Samsung Galaxy smartphone with advanced features',
        categoryId: categories[0].id,
        unit: 'piece',
        unitPrice: 25000000,
        costPrice: 20000000,
        minStockLevel: 10,
        maxStockLevel: 100,
        weight: 0.2,
        dimensions: '15x7x0.8 cm'
      },
      {
        code: 'ELC002',
        name: 'Laptop Dell Inspiron',
        description: 'Dell Inspiron laptop for business and personal use',
        categoryId: categories[0].id,
        unit: 'piece',
        unitPrice: 45000000,
        costPrice: 38000000,
        minStockLevel: 5,
        maxStockLevel: 50,
        weight: 2.1,
        dimensions: '35x25x2 cm'
      },
      {
        code: 'CLT001',
        name: 'T-Shirt Cotton',
        description: 'High-quality cotton t-shirt available in various colors',
        categoryId: categories[1].id,
        unit: 'piece',
        unitPrice: 500000,
        costPrice: 300000,
        minStockLevel: 50,
        maxStockLevel: 500,
        weight: 0.2,
        dimensions: 'Various sizes'
      },
      {
        code: 'BK001',
        name: 'Programming Book - JavaScript',
        description: 'Complete guide to JavaScript programming',
        categoryId: categories[2].id,
        unit: 'piece',
        unitPrice: 800000,
        costPrice: 500000,
        minStockLevel: 20,
        maxStockLevel: 200,
        weight: 0.5,
        dimensions: '24x16x3 cm'
      },
      {
        code: 'HG001',
        name: 'Garden Tool Set',
        description: 'Complete set of gardening tools for home use',
        categoryId: categories[3].id,
        unit: 'set',
        unitPrice: 2500000,
        costPrice: 1800000,
        minStockLevel: 15,
        maxStockLevel: 100,
        weight: 3.5,
        dimensions: '60x30x15 cm'
      }
    ]);
    console.log('✅ Products created');

    // Create initial inventory
    const inventoryData = [];
    products.forEach(product => {
      warehouses.forEach(warehouse => {
        const quantity = Math.floor(Math.random() * 100) + 20; // Random quantity between 20-120
        inventoryData.push({
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: quantity,
          location: `A-${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 20) + 1}`
        });
      });
    });

    await Inventory.bulkCreate(inventoryData);
    console.log('✅ Initial inventory created');

    // Create sample transactions
    const transactionData = [];
    for (let i = 0; i < 20; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const type = ['inbound', 'outbound'][Math.floor(Math.random() * 2)];
      const quantity = Math.floor(Math.random() * 20) + 1;
      
      transactionData.push({
        type: type,
        referenceNumber: `${type.toUpperCase()}-${Date.now()}-${i.toString().padStart(3, '0')}`,
        productId: product.id,
        warehouseId: warehouse.id,
        userId: Math.random() > 0.5 ? adminUser.id : managerUser.id,
        quantity: quantity,
        unitCost: product.costPrice,
        reason: `Sample ${type} transaction`,
        transactionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });
    }

    await Transaction.bulkCreate(transactionData);
    console.log('✅ Sample transactions created');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Admin - Username: admin, Password: admin123');
    console.log('Manager - Username: manager, Password: manager123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();