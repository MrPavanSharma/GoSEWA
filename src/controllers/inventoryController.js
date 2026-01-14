const { Category, Product, ProductImage, InventoryLog, User } = require('../models');
const { Op } = require('sequelize');

// --- Categories ---

exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon_url, parent_id } = req.body;
    const slug = name.toLowerCase().replace(/ /g, '-');

    const category = await Category.create({
      name,
      slug,
      description,
      icon_url,
      parent_id
    });

    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Category, as: 'SubCategories' }]
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Products ---

exports.createProduct = async (req, res) => {
  try {
    // Only GAUSHALA can create products
    if (req.user.role !== 'GAUSHALA') {
      return res.status(403).json({ success: false, message: 'Access denied. Only Gaushalas can add products.' });
    }

    const {
      category_id, name, description, unit_type, price_per_unit,
      min_order_quantity, quality_grade, is_organic, expiry_date,
      initial_quantity
    } = req.body;

    const sku = `GS-${req.user.id.substring(0, 4)}-${Date.now()}`; // Simple SKU generation

    const product = await Product.create({
      gaushala_id: req.user.id,
      category_id,
      name,
      description,
      sku,
      unit_type,
      price_per_unit,
      min_order_quantity,
      quality_grade,
      is_organic,
      expiry_date,
      available_quantity: initial_quantity || 0
    });

    // Log initial inventory if quantity provided
    if (initial_quantity > 0) {
      await InventoryLog.create({
        product_id: product.id,
        quantity_change: initial_quantity,
        new_quantity: initial_quantity,
        change_type: 'ADDITION',
        notes: 'Initial stock',
        created_by: req.user.id
      });
    }

    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category_id, gaushala_id, min_price, max_price, search } = req.query;
    const where = { is_available: true };

    if (category_id) where.category_id = category_id;
    if (gaushala_id) where.gaushala_id = gaushala_id;
    if (min_price || max_price) {
      where.price_per_unit = {};
      if (min_price) where.price_per_unit[Op.gte] = min_price;
      if (max_price) where.price_per_unit[Op.lte] = max_price;
    }
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const products = await Product.findAll({
      where,
      include: [
        { model: Category, attributes: ['name'] },
        { model: User, as: 'Gaushala', attributes: ['id', 'email'] } // Be careful not to expose UserProfile here yet if not needed
      ]
    });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
        include: [
            { model: Category },
            { model: ProductImage }
        ]
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params; // Product ID
    const { quantity_change, change_type, notes } = req.body;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Verify ownership
    if (product.gaushala_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const newQuantity = parseFloat(product.available_quantity) + parseFloat(quantity_change);

    if (newQuantity < 0) {
        return res.status(400).json({ success: false, message: 'Insufficient stock for this operation.' });
    }

    await product.update({ available_quantity: newQuantity });

    await InventoryLog.create({
        product_id: id,
        quantity_change,
        new_quantity: newQuantity,
        change_type,
        notes,
        created_by: req.user.id
    });

    res.json({ success: true, message: 'Inventory updated', data: { available_quantity: newQuantity } });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getInventoryLogs = async (req, res) => {
    try {
        const { id } = req.params; // Product ID
        const logs = await InventoryLog.findAll({
            where: { product_id: id },
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
