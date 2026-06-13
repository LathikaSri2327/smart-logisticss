export type Role = 'admin' | 'client' | 'driver';
export type ShipmentStatus = 'Pending' | 'Packed' | 'InTransit' | 'CustomsClearance' | 'OutForDelivery' | 'Delivered' | 'Cancelled';
export type ShipmentType = 'Standard' | 'Express' | 'Freight' | 'ColdChain';
export type Priority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type VehicleStatus = 'Available' | 'InUse' | 'Maintenance' | 'Inactive';
export type PaymentStatus = 'Pending' | 'Paid' | 'Overdue' | 'Refunded';
export type InventoryStatus = 'Normal' | 'LowStock' | 'Overstocked' | 'Critical';

export interface Coordinates { lat: number; lng: number; }
export interface Location { address?: string; city?: string; country?: string; coordinates?: Coordinates; }

export interface User {
  id: string; name: string; email: string; role: Role; phone?: string;
  profileImage?: string; company?: string; address?: string; isActive: boolean;
  lastLogin?: string; createdAt: string; updatedAt: string;
}

export interface ShipmentHistory { status: string; location?: string; note?: string; timestamp: string; }

export interface Shipment {
  id: string; shipmentId: string; client?: User; driver?: User; vehicle?: Vehicle;
  source?: Location; destination?: Location; currentLocation?: Location;
  shipmentStatus: ShipmentStatus; shipmentType: ShipmentType; priority: Priority;
  weight?: number; value?: number; description?: string;
  estimatedDelivery?: string; actualDelivery?: string;
  shipmentHistory?: ShipmentHistory[]; qrCode?: string; proofOfDelivery?: string;
  notes?: string; insurance?: boolean; createdAt: string; updatedAt: string;
}

export interface ShipmentConnection {
  shipments: Shipment[]; totalCount: number; totalPages: number; currentPage: number;
}

export interface Vehicle {
  id: string; vehicleNumber: string; type: string; model?: string; year?: number;
  capacity?: number; fuelType?: string; driver?: User; status: VehicleStatus;
  currentLocation?: Location; lastService?: string; mileage?: number; createdAt: string;
}

export interface StockItem {
  id: string; name: string; sku?: string; quantity: number; minQuantity: number;
  unit?: string; category?: string; location?: string; lastUpdated?: string;
}

export interface Warehouse {
  id: string; warehouseName: string; code?: string; location?: Location; manager?: User;
  capacity?: number; usedCapacity?: number; stockItems?: StockItem[];
  inventoryStatus: InventoryStatus; isActive: boolean; createdAt: string;
}

export interface OrderItem { productName?: string; sku?: string; quantity?: number; unitPrice?: number; totalPrice?: number; }

export interface Order {
  id: string; orderId: string; client?: User; shipment?: Shipment; items?: OrderItem[];
  subtotal?: number; tax?: number; discount?: number; totalAmount: number;
  paymentStatus: PaymentStatus; paymentMethod?: string; notes?: string; createdAt: string; updatedAt: string;
}

export interface Notification {
  id: string; userId: string; title: string; message: string;
  type: string; readStatus: boolean; link?: string; createdAt: string;
}

export interface DashboardStats {
  totalShipments: number; pendingShipments: number; deliveredShipments: number;
  inTransitShipments: number; cancelledShipments: number; totalRevenue: number;
  totalClients: number; activeDrivers: number; totalVehicles: number; warehouseAlerts: number;
}

export interface MonthlyData { month: string; shipments: number; revenue: number; delivered: number; }
export interface StatusBreakdown { status: string; count: number; percentage: number; }
export interface DriverPerformance { driver: User; totalDeliveries: number; onTimeDeliveries: number; rating: number; }

export interface AnalyticsData {
  stats: DashboardStats; monthlyData: MonthlyData[]; statusBreakdown: StatusBreakdown[];
  topDrivers: DriverPerformance[]; revenueByType: StatusBreakdown[];
}

export interface AuthPayload { token: string; user: User; }
