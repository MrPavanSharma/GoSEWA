const { Payment, Order, Invoice, Refund, sequelize, OrderStatusHistory } = require('../models');

// Mock Payment Processing
exports.processPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { order_id, payment_method, amount } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Validate amount (simple check)
    if (parseFloat(amount) !== parseFloat(order.total_amount)) {
        return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    // Simulate Gateway Response
    const paymentId = `PAY-${Date.now()}`; // Mock Gateway ID
    const status = 'SUCCESS'; // Simulating success

    // Create Payment Record
    const payment = await Payment.create({
        order_id,
        payment_id: paymentId,
        payment_method,
        amount,
        status,
        gateway_response: { mock: true, transaction_id: paymentId },
        paid_at: new Date()
    }, { transaction: t });

    // Update Order Status
    await order.update({ 
        payment_status: 'PAID',
        order_status: 'CONFIRMED' // Or move to PROCESSING
    }, { transaction: t });

    // Log History
    await OrderStatusHistory.create({
        order_id,
        new_status: 'CONFIRMED',
        changed_by: req.user.id,
        notes: `Payment successful via ${payment_method}`
    }, { transaction: t });

    // Generate Invoice (Auto)
    const invoiceNumber = `INV-${Date.now()}`;
    await Invoice.create({
        invoice_number: invoiceNumber,
        order_id,
        entrepreneur_id: order.entrepreneur_id,
        gaushala_id: order.gaushala_id,
        invoice_date: new Date(),
        amount: order.total_amount,
        status: 'PAID',
        paid_amount: order.total_amount
    }, { transaction: t });

    await t.commit();

    res.status(201).json({ success: true, message: 'Payment processed successfully', data: payment });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPaymentDetails = async (req, res) => {
    try {
        const payment = await Payment.findOne({ where: { order_id: req.params.order_id } });
        if (!payment) return res.status(404).json({ success: false, message: 'Payment info not found' });
        res.json({ success: true, data: payment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Invoice Management
exports.getInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ where: { order_id: req.params.order_id } });
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
        res.json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Refund Processing
exports.initiateRefund = async (req, res) => {
    try {
        const { payment_id, amount, reason } = req.body;
        
        const payment = await Payment.findByPk(payment_id);
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

        const refund = await Refund.create({
            payment_id,
            refund_id: `REF-${Date.now()}`,
            amount,
            reason,
            status: 'PROCESSED',
            processed_at: new Date()
        });

        res.status(201).json({ success: true, message: 'Refund initiated', data: refund });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
