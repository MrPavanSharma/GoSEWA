const { Product, Category, User, SearchHistory, SavedSearch, ProductView } = require('../models');
const { Op } = require('sequelize');

// Advanced Search
exports.searchProducts = async (req, res) => {
  try {
    const { 
      q, category_id, min_price, max_price, 
      quality_grade, is_organic, sort_by 
    } = req.query;

    const where = { is_available: true };

    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } }
      ];
    }
    if (category_id) where.category_id = category_id;
    if (min_price || max_price) {
      where.price_per_unit = {};
      if (min_price) where.price_per_unit[Op.gte] = min_price;
      if (max_price) where.price_per_unit[Op.lte] = max_price;
    }
    if (quality_grade) where.quality_grade = quality_grade;
    if (is_organic === 'true') where.is_organic = true;

    // Sorting
    let order = [['created_at', 'DESC']]; // default
    if (sort_by === 'price_asc') order = [['price_per_unit', 'ASC']];
    if (sort_by === 'price_desc') order = [['price_per_unit', 'DESC']];
    if (sort_by === 'name') order = [['name', 'ASC']];

    const products = await Product.findAll({
      where,
      include: [
        { model: Category, attributes: ['name'] },
        { model: User, as: 'Gaushala', attributes: ['id', 'email'] }
      ],
      order
    });

    // Log search history if user is logged in (handled by middleware usually, but optional here)
    if (req.user) {
      await SearchHistory.create({
        user_id: req.user.id,
        search_query: q || 'Filtered Search',
        filters: req.query,
        result_count: products.length
      });
    }

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Log Product View
exports.logProductView = async (req, res) => {
  try {
    const { id } = req.params; // Product ID
    const { view_duration } = req.body;

    await ProductView.create({
      user_id: req.user.id,
      product_id: id,
      view_duration: view_duration || 0
    });

    res.json({ success: true, message: 'View logged' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Saved Searches ---

exports.saveSearch = async (req, res) => {
  try {
    const { name, search_query, filters, notification_frequency } = req.body;

    const savedSearch = await SavedSearch.create({
      user_id: req.user.id,
      name,
      search_query,
      filters,
      notification_frequency: notification_frequency || 'DAILY'
    });

    res.status(201).json({ success: true, message: 'Search saved', data: savedSearch });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSavedSearches = async (req, res) => {
  try {
    const searches = await SavedSearch.findAll({ where: { user_id: req.user.id } });
    res.json({ success: true, data: searches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get User Search History
exports.getSearchHistory = async (req, res) => {
  try {
    const history = await SearchHistory.findAll({ 
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']],
        limit: 20
    });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
