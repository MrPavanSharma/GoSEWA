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
const Shipment = require('./Shipment');
const ShipmentUpdate = require('./ShipmentUpdate');
const TransporterProfile = require('./TransporterProfile');
const Vehicle = require('./Vehicle');
const BulkRequest = require('./BulkRequest');
const Quote = require('./Quote');
const SubscriptionPlan = require('./SubscriptionPlan');
const UserSubscription = require('./UserSubscription');
const Certification = require('./Certification');
const Scheme = require('./Scheme');
const SchemeApplication = require('./SchemeApplication');
const ForecastData = require('./ForecastData');
const DeliveryRoute = require('./DeliveryRoute');
const RouteStop = require('./RouteStop');
const ColdChainLog = require('./ColdChainLog');
const ColdChainAlert = require('./ColdChainAlert');
const Cattle = require('./Cattle');
const HealthRecord = require('./HealthRecord');
const MilkProductionLog = require('./MilkProductionLog');
const WasteCollection = require('./WasteCollection');
const ByProductProduction = require('./ByProductProduction');

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

// Module 10: Logistics
Order.hasOne(Shipment, { foreignKey: 'order_id', onDelete: 'CASCADE' });
Shipment.belongsTo(Order, { foreignKey: 'order_id' });

// Module 11: Tracking
Shipment.hasMany(ShipmentUpdate, { foreignKey: 'shipment_id', onDelete: 'CASCADE' });
ShipmentUpdate.belongsTo(Shipment, { foreignKey: 'shipment_id' });

// Module 12: Transporter Management
User.hasOne(TransporterProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
TransporterProfile.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Vehicle, { foreignKey: 'transporter_id', onDelete: 'CASCADE' });
Vehicle.belongsTo(User, { foreignKey: 'transporter_id' });

// Module 13: Bulk Order System
User.hasMany(BulkRequest, { foreignKey: 'entrepreneur_id' });
BulkRequest.belongsTo(User, { as: 'Entrepreneur', foreignKey: 'entrepreneur_id' });

Category.hasMany(BulkRequest, { foreignKey: 'category_id' });
BulkRequest.belongsTo(Category, { foreignKey: 'category_id' });

Product.hasMany(BulkRequest, { foreignKey: 'product_id' });
BulkRequest.belongsTo(Product, { foreignKey: 'product_id' });

BulkRequest.hasMany(Quote, { foreignKey: 'bulk_request_id', onDelete: 'CASCADE' });
Quote.belongsTo(BulkRequest, { foreignKey: 'bulk_request_id' });

User.hasMany(Quote, { foreignKey: 'gaushala_id' });
Quote.belongsTo(User, { as: 'Gaushala', foreignKey: 'gaushala_id' });

// Module 14: Subscription Management
User.hasMany(SubscriptionPlan, { foreignKey: 'gaushala_id', onDelete: 'CASCADE' });
SubscriptionPlan.belongsTo(User, { foreignKey: 'gaushala_id' });

Product.hasMany(SubscriptionPlan, { foreignKey: 'product_id' });
SubscriptionPlan.belongsTo(Product, { foreignKey: 'product_id' });

User.hasMany(UserSubscription, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserSubscription.belongsTo(User, { foreignKey: 'user_id' });

SubscriptionPlan.hasMany(UserSubscription, { foreignKey: 'plan_id' });
UserSubscription.belongsTo(SubscriptionPlan, { foreignKey: 'plan_id' });

// Module 15: Quality Certification
User.hasMany(Certification, { foreignKey: 'gaushala_id', onDelete: 'CASCADE' });
Certification.belongsTo(User, { foreignKey: 'gaushala_id' });

// Module 16: Government Schemes [NEW]
Scheme.hasMany(SchemeApplication, { foreignKey: 'scheme_id', onDelete: 'CASCADE' });
SchemeApplication.belongsTo(Scheme, { foreignKey: 'scheme_id' });

User.hasMany(SchemeApplication, { foreignKey: 'user_id', onDelete: 'CASCADE' });
SchemeApplication.belongsTo(User, { foreignKey: 'user_id' });

// Module 17: Demand Forecasting
User.hasMany(ForecastData, { foreignKey: 'gaushala_id', onDelete: 'CASCADE' });
ForecastData.belongsTo(User, { foreignKey: 'gaushala_id' });

Product.hasMany(ForecastData, { foreignKey: 'product_id', onDelete: 'CASCADE' });
ForecastData.belongsTo(Product, { foreignKey: 'product_id' });

// Module 18: Route Optimization
User.hasMany(DeliveryRoute, { foreignKey: 'transporter_id', onDelete: 'CASCADE' });
DeliveryRoute.belongsTo(User, { as: 'Transporter', foreignKey: 'transporter_id' });

Vehicle.hasMany(DeliveryRoute, { foreignKey: 'vehicle_id' });
DeliveryRoute.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });

DeliveryRoute.hasMany(RouteStop, { foreignKey: 'route_id', as: 'Stops', onDelete: 'CASCADE' });
RouteStop.belongsTo(DeliveryRoute, { foreignKey: 'route_id' });

Order.hasOne(RouteStop, { foreignKey: 'order_id' });
RouteStop.belongsTo(Order, { foreignKey: 'order_id' });

// Module 20: Cold Chain
Shipment.hasMany(ColdChainLog, { foreignKey: 'shipment_id', onDelete: 'CASCADE' });
ColdChainLog.belongsTo(Shipment, { foreignKey: 'shipment_id' });

Vehicle.hasMany(ColdChainLog, { foreignKey: 'vehicle_id' });
ColdChainLog.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });

ColdChainLog.hasMany(ColdChainAlert, { foreignKey: 'log_id', onDelete: 'CASCADE' });
ColdChainAlert.belongsTo(ColdChainLog, { foreignKey: 'log_id' });

Shipment.hasMany(ColdChainAlert, { foreignKey: 'shipment_id' });
ColdChainAlert.belongsTo(Shipment, { foreignKey: 'shipment_id' });

// Module 21: Live Stock Management
User.hasMany(Cattle, { foreignKey: 'gaushala_id', onDelete: 'CASCADE' });
Cattle.belongsTo(User, { foreignKey: 'gaushala_id' });

Cattle.hasMany(HealthRecord, { foreignKey: 'cattle_id', onDelete: 'CASCADE' });
HealthRecord.belongsTo(Cattle, { foreignKey: 'cattle_id' });

Cattle.hasMany(MilkProductionLog, { foreignKey: 'cattle_id', onDelete: 'CASCADE' });
MilkProductionLog.belongsTo(Cattle, { foreignKey: 'cattle_id' });

// Module 22: Waste-to-Value
User.hasMany(WasteCollection, { foreignKey: 'gaushala_id', onDelete: 'CASCADE' });
WasteCollection.belongsTo(User, { foreignKey: 'gaushala_id' });

User.hasMany(ByProductProduction, { foreignKey: 'gaushala_id', onDelete: 'CASCADE' });
ByProductProduction.belongsTo(User, { foreignKey: 'gaushala_id' });

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection accepted.');
    await sequelize.sync({ alter: true });
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
  Shipment,
  ShipmentUpdate,
  TransporterProfile,
  Vehicle,
  BulkRequest,
  Quote,
  SubscriptionPlan,
  UserSubscription,
  Certification,
  Scheme,
  SchemeApplication,
  ForecastData,
  DeliveryRoute,
  RouteStop,
  ColdChainLog,
  ColdChainAlert,
  Cattle,
  HealthRecord,
  MilkProductionLog,
  WasteCollection,
  ByProductProduction,
  syncDatabase
};
