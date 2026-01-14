const { Review, Order, Product, User, sequelize } = require('../models');

// Add a Review
exports.addReview = async (req, res) => {
  try {
    const { order_id, product_id, rating, comment } = req.body;
    const userId = req.user.id;

    // 1. Verify Verification: User must have purchased the item/order
    const order = await Order.findOne({ 
        where: { id: order_id, entrepreneur_id: userId, order_status: 'CONFIRMED' } // or DELIVERED in real app
    });

    if (!order) {
        return res.status(403).json({ success: false, message: 'You can only review completed orders you purchased.' });
    }

    // 2. Check if already reviewed
    const existing = await Review.findOne({ where: { order_id, product_id: product_id || null } });
    if (existing) {
        return res.status(400).json({ success: false, message: 'Review already submitted for this item.' });
    }

    // 3. Create Review
    const review = await Review.create({
        user_id: userId,
        gaushala_id: order.gaushala_id,
        product_id: product_id || null, // If null, it's a general order review
        order_id,
        rating,
        comment
    });

    res.status(201).json({ success: true, message: 'Review added', data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Product Reviews
exports.getProductReviews = async (req, res) => {
  try {
    const { product_id } = req.params;
    const reviews = await Review.findAll({
        where: { product_id },
        include: [{ model: User, as: 'Author', attributes: ['email'] }],
        order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Gaushala Reviews
exports.getGaushalaReviews = async (req, res) => {
  try {
    const { gaushala_id } = req.params;
    const reviews = await Review.findAll({
        where: { gaushala_id },
        include: [{ model: User, as: 'Author', attributes: ['email'] }],
        order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
