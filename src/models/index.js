const sequelize = require('../config/database');
const User = require('./User');
const VerificationToken = require('./VerificationToken');
const UserProfile = require('./UserProfile');
const Address = require('./Address');
const BusinessDocument = require('./BusinessDocument');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const InventoryLog = require('./InventoryLog');
const SearchHistory = require('./SearchHistory');
const SavedSearch = require('./SavedSearch');
const ProductView = require('./ProductView');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const OrderStatusHistory = require('./OrderStatusHistory');
const Payment = require('./Payment');
const PaymentMethod = require('./PaymentMethod');
const Invoice = require('./Invoice');
const Refund = require('./Refund');
const Review = require('./Review');
const Notification = require('./Notification');
const NotificationTemplate = require('./NotificationTemplate');

// Module 1: Auth
User.hasMany(VerificationToken, { foreignKey: 'user_id' });
VerificationToken.belongsTo(User, { foreignKey: 'user_id' });

// Module 2: Profile
User.hasOne(UserProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserProfile.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Address, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(BusinessDocument, { foreignKey: 'user_id', onDelete: 'CASCADE' });
BusinessDocument.belongsTo(User, { foreignKey: 'user_id' });

// Module 3: Inventory
Category.hasMany(Category, { as: 'SubCategories', foreignKey: 'parent_id' });
Category.belongsTo(Category, { as: 'ParentCategory', foreignKey: 'parent_id' });

Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

User.hasMany(Product, { foreignKey: 'gaushala_id', onDelete: 'CASCADE' });
Product.belongsTo(User, { foreignKey: 'gaushala_id', as: 'Gaushala' });

Product.hasMany(ProductImage, { foreignKey: 'product_id', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(InventoryLog, { foreignKey: 'product_id', onDelete: 'CASCADE' });
InventoryLog.belongsTo(Product, { foreignKey: 'product_id' });

// Module 4: Marketplace
User.hasMany(SearchHistory, { foreignKey: 'user_id', onDelete: 'CASCADE' });
SearchHistory.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(SavedSearch, { foreignKey: 'user_id', onDelete: 'CASCADE' });
SavedSearch.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(ProductView, { foreignKey: 'user_id', onDelete: 'CASCADE' });
ProductView.belongsTo(User, { foreignKey: 'user_id' });

Product.hasMany(ProductView, { foreignKey: 'product_id', onDelete: 'CASCADE' });
ProductView.belongsTo(Product, { foreignKey: 'product_id' });

// Module 5: Orders
User.hasOne(Cart, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'user_id' });

Cart.hasMany(CartItem, { foreignKey: 'cart_id', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });

Product.hasMany(CartItem, { foreignKey: 'product_id', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'product_id' });

User.hasMany(Order, { as: 'PlacedOrders', foreignKey: 'entrepreneur_id' });
Order.belongsTo(User, { as: 'Entrepreneur', foreignKey: 'entrepreneur_id' });

User.hasMany(Order, { as: 'ReceivedOrders', foreignKey: 'gaushala_id' });
Order.belongsTo(User, { as: 'Gaushala', foreignKey: 'gaushala_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' }); 
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id', onDelete: 'CASCADE' });
OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id' });

// Module 6: Payments
Order.hasOne(Payment, { foreignKey: 'order_id', onDelete: 'CASCADE' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });

User.hasMany(PaymentMethod, { foreignKey: 'user_id', onDelete: 'CASCADE' });
PaymentMethod.belongsTo(User, { foreignKey: 'user_id' });

Order.hasOne(Invoice, { foreignKey: 'order_id' });
Invoice.belongsTo(Order, { foreignKey: 'order_id' });

Payment.hasMany(Refund, { foreignKey: 'payment_id' });
Refund.belongsTo(Payment, { foreignKey: 'payment_id' });

// Module 7: Reviews
User.hasMany(Review, { foreignKey: 'user_id', as: 'WrittenReviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'Author' });

User.hasMany(Review, { foreignKey: 'gaushala_id', as: 'ReceivedReviews' });
Review.belongsTo(User, { foreignKey: 'gaushala_id', as: 'Gaushala' });

Product.hasMany(Review, { foreignKey: 'product_id' });
Review.belongsTo(Product, { foreignKey: 'product_id' });

Order.hasMany(Review, { foreignKey: 'order_id' });
Review.belongsTo(Order, { foreignKey: 'order_id' });

// Module 8: Notifications
User.hasMany(Notification, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection accepted.');
    await sequelize.sync({ force: false });
    console.log('Database synced.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  VerificationToken,
  UserProfile,
  Address,
  BusinessDocument,
  Category,
  Product,
  ProductImage,
  InventoryLog,
  SearchHistory,
  SavedSearch,
  ProductView,
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderStatusHistory,
  Payment,
  PaymentMethod,
  Invoice,
  Refund,
  Review,
  Notification,
  NotificationTemplate,
  syncDatabase
};
