const { 
  Cart, CartItem, Order, OrderItem, Product, User, Address, OrderStatusHistory, InventoryLog, sequelize 
} = require('../models');

// --- Cart Management ---

exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const userId = req.user.id;

    // 1. Get or Create Cart
    let [cart] = await Cart.findOrCreate({ 
        where: { user_id: userId },
        defaults: { total_amount: 0, item_count: 0 }
    });

    // 2. Check Product
    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.available_quantity < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    // 3. Add Item to Cart
    let cartItem = await CartItem.findOne({ where: { cart_id: cart.id, product_id } });
    if (cartItem) {
        cartItem.quantity = parseFloat(cartItem.quantity) + parseFloat(quantity);
        cartItem.total_price = cartItem.quantity * product.price_per_unit;
        await cartItem.save();
    } else {
        await CartItem.create({
            cart_id: cart.id,
            product_id,
            quantity,
            unit_price: product.price_per_unit,
            total_price: quantity * product.price_per_unit
        });
    }

    // 4. Update Cart Totals (simplified recalculation)
    const items = await CartItem.findAll({ where: { cart_id: cart.id } });
    let total = 0;
    items.forEach(i => total += parseFloat(i.total_price));
    
    await cart.update({ total_amount: total, item_count: items.length });

    res.json({ success: true, message: 'Item added to cart', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ 
        where: { user_id: req.user.id },
        include: [{ 
            model: CartItem,
            include: [{ model: Product, attributes: ['name', 'price_per_unit'] }]
        }]
    });
    
    if (!cart) return res.json({ success: true, data: { item_count: 0, total_amount: 0, CartItems: [] } });

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Order Management ---

exports.checkout = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { shipping_address_id, billing_address_id } = req.body;

    const cart = await Cart.findOne({ 
        where: { user_id: userId },
        include: [{ model: CartItem }]
    });

    if (!cart || cart.CartItems.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Group items by Gaushala to create separate orders if needed
    // For MVP, assuming single order or we pick the first Product's gaushala for now
    // A robust system would split orders. Here we take the first item's gaushala
    // effectively enforcing "one gaushala per order" or just assigning it to first found.
    // Let's implement simplified single-order logic for now but fetch Gaushala ID properly.
    
    // Fetch product details for all items to get Gaushala ID
    const productIds = cart.CartItems.map(i => i.product_id);
    const products = await Product.findAll({ where: { id: productIds } });
    const productMap = {};
    products.forEach(p => productMap[p.id] = p);

    const gaushalaId = products[0].gaushala_id; // Taking first for MVP

    // Create Order
    const orderNumber = `ORD-${Date.now()}`;
    const order = await Order.create({
        order_number: orderNumber,
        entrepreneur_id: userId,
        gaushala_id: gaushalaId,
        total_amount: cart.total_amount,
        subtotal: cart.total_amount,
        shipping_address_id,
        billing_address_id,
        order_status: 'CONFIRMED' // Auto-confirming for simplicity
    }, { transaction: t });

    // Create Order Items and decrease Stock
    for (const item of cart.CartItems) {
        const prod = productMap[item.product_id];
        await OrderItem.create({
            order_id: order.id,
            product_id: item.product_id,
            product_name: prod.name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price
        }, { transaction: t });

        // Update Inventory
        await prod.decrement('available_quantity', { by: item.quantity, transaction: t });
    }

    // Clear Cart
    await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });
    await cart.update({ total_amount: 0, item_count: 0 }, { transaction: t });

    // Log History
    await OrderStatusHistory.create({
        order_id: order.id,
        new_status: 'CONFIRMED',
        changed_by: userId,
        notes: 'Order placed via Checkout'
    }, { transaction: t });

    await t.commit();

    res.status(201).json({ success: true, message: 'Order placed successfully', data: order });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'GAUSHALA') where.gaushala_id = req.user.id;
    else where.entrepreneur_id = req.user.id;

    const orders = await Order.findAll({
        where,
        include: [{ model: OrderItem }],
        order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: OrderItem }, { model: User, as: 'Entrepreneur', attributes: ['email'] }]
        });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Only gaushala or admin should update status (implied logic)
        const oldStatus = order.order_status;
        
        await order.update({ order_status: status });

        await OrderStatusHistory.create({
            order_id: order.id,
            old_status: oldStatus,
            new_status: status,
            changed_by: req.user.id,
            notes
        });

        res.json({ success: true, message: 'Order status updated', data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
