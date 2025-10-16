const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('inbound', 'outbound', 'transfer', 'adjustment'),
      allowNull: false,
    },
    referenceNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    warehouseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'warehouses',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unitCost: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    totalCost: {
      type: DataTypes.VIRTUAL,
      get() {
        return parseFloat(this.quantity * this.unitCost).toFixed(2);
      },
    },
    reason: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    supplierName: {
      type: DataTypes.STRING,
    },
    supplierContact: {
      type: DataTypes.STRING,
    },
    customerName: {
      type: DataTypes.STRING,
    },
    customerContact: {
      type: DataTypes.STRING,
    },
    batchNumber: {
      type: DataTypes.STRING,
    },
    expiryDate: {
      type: DataTypes.DATE,
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      defaultValue: 'completed',
    },
    attachments: {
      type: DataTypes.TEXT,
      get() {
        const value = this.getDataValue('attachments');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('attachments', JSON.stringify(value || []));
      },
      defaultValue: '[]',
    },
  }, {
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['referenceNumber'],
      },
      {
        fields: ['productId'],
      },
      {
        fields: ['warehouseId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['transactionDate'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['status'],
      },
    ],
  });

  return Transaction;
};