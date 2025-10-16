const { Sequelize } = require('sequelize');
const path = require('path');

// Use SQLite instead of PostgreSQL - no installation needed!
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// Import models
const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Warehouse = require('./Warehouse')(sequelize);
const Product = require('./Product')(sequelize);
const Inventory = require('./Inventory')(sequelize);
const Transaction = require('./Transaction')(sequelize);

// Define associations
User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Warehouse.hasMany(Inventory, { foreignKey: 'warehouseId' });
Inventory.belongsTo(Warehouse, { foreignKey: 'warehouseId' });

Product.hasMany(Inventory, { foreignKey: 'productId' });
Inventory.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(Transaction, { foreignKey: 'productId' });
Transaction.belongsTo(Product, { foreignKey: 'productId' });

Warehouse.hasMany(Transaction, { foreignKey: 'warehouseId' });
Transaction.belongsTo(Warehouse, { foreignKey: 'warehouseId' });

module.exports = {
  sequelize,
  User,
  Category,
  Warehouse,
  Product,
  Inventory,
  Transaction,
};