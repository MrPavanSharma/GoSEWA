const { Shipment, Order, User } = require('../models');

// Mock Shipping Rates Calculator
exports.getShippingRates = async (req, res) => {
  try {
    const { weight, destination_pincode } = req.body;
    
    // Simulate API delay
    // In real app, call Delhivery/Shiprocket API
    const rates = [
        { carrier: 'Delhivery', service: 'Standard', price: 50 + (weight * 10), estimated_days: 3 },
        { carrier: 'BlueDart', service: 'Express', price: 100 + (weight * 20), estimated_days: 1 }
    ];

    res.json({ success: true, data: rates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Book Shipment
exports.bookShipment = async (req, res) => {
  try {
    const { order_id, carrier, service } = req.body;
    const userId = req.user.id; // Gaushala User

    // 1. Verify Order Ownership & Status
    const order = await Order.findOne({ 
        where: { id: order_id, gaushala_id: userId } 
    });

    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found or access denied' });
    }

    if (order.payment_status !== 'PAID') {
        return res.status(400).json({ success: false, message: 'Cannot ship unpaid order' });
    }

    if (order.order_status === 'SHIPPED') {
        return res.status(400).json({ success: false, message: 'Order already shipped' });
    }

    // 2. Create Shipment Record (Simulate Booking)
    const trackingNumber = `TRK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const shippingCost = 150; // Use rate calculator logic in real app

    const shipment = await Shipment.create({
        order_id,
        carrier,
        tracking_number: trackingNumber,
        status: 'SHIPPED',
        estimated_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days
        shipping_cost: shippingCost,
        label_url: `https://gosewa.com/api/v1/logistics/label/${trackingNumber}.pdf`
    });

    // 3. Update Order Status
    await order.update({ order_status: 'SHIPPED' });

    res.status(201).json({ success: true, message: 'Shipment booked', data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Shipment Details
exports.getShipmentDetails = async (req, res) => {
    try {
        const { order_id } = req.params;
        const shipment = await Shipment.findOne({ where: { order_id } });
        if(!shipment) return res.status(404).json({ success: false, message: 'No shipment found' });
        
        res.json({ success: true, data: shipment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
