import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Shipment, User, Vehicle, Warehouse, Order } from '@/lib/models';
import { getUser, mapUser } from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser || authUser.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  await dbConnect();

  try {
    const [total, pending, delivered, inTransit, cancelled, clients, drivers, vehicles, alerts, revenueAgg] =
      await Promise.all([
        Shipment.countDocuments(),
        Shipment.countDocuments({ shipmentStatus: 'Pending' }),
        Shipment.countDocuments({ shipmentStatus: 'Delivered' }),
        Shipment.countDocuments({ shipmentStatus: 'InTransit' }),
        Shipment.countDocuments({ shipmentStatus: 'Cancelled' }),
        User.countDocuments({ role: 'client' }),
        User.countDocuments({ role: 'driver', isActive: true }),
        Vehicle.countDocuments(),
        Warehouse.countDocuments({ inventoryStatus: { $in: ['LowStock', 'Critical'] } }),
        Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      ]);

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const mRaw = await Shipment.aggregate([
      { $match: { createdAt: { $gte: yearStart } } },
      { $group: { _id: { $month: '$createdAt' }, shipments: { $sum: 1 }, delivered: { $sum: { $cond: [{ $eq: ['$shipmentStatus', 'Delivered'] }, 1, 0] } } } },
    ]);
    const monthlyData = months.map((month, i) => {
      const f = mRaw.find((r: any) => r._id === i + 1);
      return { month, shipments: f?.shipments || 0, delivered: f?.delivered || 0, revenue: (f?.shipments || 0) * 1200 };
    });

    const topDriversRaw = await Shipment.aggregate([
      { $match: { driver: { $ne: null } } },
      { $group: { _id: '$driver', total: { $sum: 1 }, onTime: { $sum: { $cond: [{ $eq: ['$shipmentStatus', 'Delivered'] }, 1, 0] } } } },
      { $sort: { total: -1 } }, { $limit: 5 },
    ]);
    const driverDocs = await User.find({ _id: { $in: topDriversRaw.map((r: any) => r._id) } }).lean();
    const topDrivers = topDriversRaw.map((r: any) => {
      const u = driverDocs.find((d: any) => d._id.toString() === r._id.toString());
      return u ? { driver: mapUser(u), totalDeliveries: r.total, onTimeDeliveries: r.onTime, rating: Math.min(5, 3 + (r.onTime / r.total) * 2) } : null;
    }).filter(Boolean);

    const typeRaw = await Shipment.aggregate([{ $group: { _id: '$shipmentType', count: { $sum: 1 } } }]);

    return NextResponse.json({
      stats: { totalShipments: total, pendingShipments: pending, deliveredShipments: delivered, inTransitShipments: inTransit, cancelledShipments: cancelled, totalRevenue: revenueAgg[0]?.total || 0, totalClients: clients, activeDrivers: drivers, totalVehicles: vehicles, warehouseAlerts: alerts },
      monthlyData,
      statusBreakdown: [
        { status: 'Pending', count: pending, percentage: total ? (pending / total) * 100 : 0 },
        { status: 'Delivered', count: delivered, percentage: total ? (delivered / total) * 100 : 0 },
        { status: 'InTransit', count: inTransit, percentage: total ? (inTransit / total) * 100 : 0 },
        { status: 'Cancelled', count: cancelled, percentage: total ? (cancelled / total) * 100 : 0 },
      ],
      topDrivers,
      revenueByType: typeRaw.map((r: any) => ({ status: r._id, count: r.count, percentage: total ? (r.count / total) * 100 : 0 })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
