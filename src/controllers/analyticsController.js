const { 
  Order, 
  OrderItem, 
  Product, 
  User, 
  InventoryLog,
  sequelize 
} = require('../models');
const { Op } = require('sequelize');

// Gaushala Dashboard Stats
exports.getGaushalaStats = async (req, res) => {
  try {
    const gaushalaId = req.user.id;

    // 1. Total Sales (Revenue from CONFIRMED orders)
    // Note: SQLite might return string for SUM, parse it.
    const revenueResult = await Order.findAll({
      where: { 
        gaushala_id: gaushalaId,
        payment_status: 'PAID'
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_orders']
      ]
    });
    
    // 2. Low Stock Products (< 10 units)
    const lowStockProducts = await Product.findAll({
      where: {
        gaushala_id: gaushalaId,
        stock_quantity: { [Op.lt]: 10 }
      },
      attributes: ['id', 'name', 'stock_quantity'],
      limit: 5
    });

    // 3. Recent Orders (Last 5)
    const recentOrders = await Order.findAll({
      where: { gaushala_id: gaushalaId },
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [{ model: User, as: 'Entrepreneur', attributes: ['full_name', 'email'] }]
    });

    res.json({
      success: true,
      data: {
        total_revenue: revenueResult[0]?.dataValues.total_revenue || 0,
        total_orders: revenueResult[0]?.dataValues.total_orders || 0,
        low_stock_alert: lowStockProducts,
        recent_orders: recentOrders
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Entrepreneur Dashboard Stats
exports.getEntrepreneurStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total Spent
    const spentResult = await Order.findAll({
      where: { 
        entrepreneur_id: userId,
        payment_status: 'PAID'
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_spent'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_orders']
      ]
    });

    // 2. Active Orders (Not Delivered/Cancelled)
    const activeOrders = await Order.findAll({
      where: {
        entrepreneur_id: userId,
        order_status: { [Op.notIn]: ['DELIVERED', 'CANCELLED'] }
      },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        total_spent: spentResult[0]?.dataValues.total_spent || 0,
        total_orders: spentResult[0]?.dataValues.total_orders || 0,
        active_orders: activeOrders
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
