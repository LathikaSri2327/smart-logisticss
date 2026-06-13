import mongoose, { Schema, models } from 'mongoose';

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: String,
  role: { type: String, enum: ['admin', 'client', 'driver'], default: 'client' },
  phone: String,
  company: String,
  address: String,
  profileImage: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true });

const ShipmentSchema = new Schema({
  shipmentId: { type: String, unique: true },
  client: { type: Schema.Types.ObjectId, ref: 'User' },
  driver: { type: Schema.Types.ObjectId, ref: 'User' },
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  source: Schema.Types.Mixed,
  destination: Schema.Types.Mixed,
  currentLocation: Schema.Types.Mixed,
  shipmentStatus: { type: String, default: 'Pending' },
  driverAcceptance: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  shipmentType: { type: String, default: 'Standard' },
  priority: { type: String, default: 'Normal' },
  weight: Number,
  value: Number,
  description: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  shipmentHistory: { type: [Schema.Types.Mixed], default: [] },
  qrCode: String,
  proofOfDelivery: String,
  notes: String,
  insurance: { type: Boolean, default: false },
}, { timestamps: true });

const VehicleSchema = new Schema({
  vehicleNumber: { type: String, unique: true },
  type: { type: String, default: 'Truck' },
  model: String,
  year: Number,
  capacity: Number,
  fuelType: { type: String, default: 'Diesel' },
  driver: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Available' },
  currentLocation: Schema.Types.Mixed,
  lastService: Date,
  mileage: Number,
}, { timestamps: true });

const OrderSchema = new Schema({
  orderId: { type: String, unique: true },
  client: { type: Schema.Types.ObjectId, ref: 'User' },
  shipment: { type: Schema.Types.ObjectId, ref: 'Shipment' },
  items: { type: [Schema.Types.Mixed], default: [] },
  subtotal: Number,
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: Number,
  paymentStatus: { type: String, default: 'Pending' },
  paymentMethod: String,
  notes: String,
}, { timestamps: true });

const WarehouseSchema = new Schema({
  warehouseName: String,
  code: { type: String, unique: true },
  location: Schema.Types.Mixed,
  manager: { type: Schema.Types.ObjectId, ref: 'User' },
  capacity: Number,
  usedCapacity: { type: Number, default: 0 },
  stockItems: { type: [Schema.Types.Mixed], default: [] },
  inventoryStatus: { type: String, default: 'Normal' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  title: String,
  message: String,
  type: String,
  readStatus: { type: Boolean, default: false },
  link: String,
}, { timestamps: true });

export const User = models.User || mongoose.model('User', UserSchema);
export const Shipment = models.Shipment || mongoose.model('Shipment', ShipmentSchema);
export const Vehicle = models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
export const Order = models.Order || mongoose.model('Order', OrderSchema);
export const Warehouse = models.Warehouse || mongoose.model('Warehouse', WarehouseSchema);
export const Notification = models.Notification || mongoose.model('Notification', NotificationSchema);
