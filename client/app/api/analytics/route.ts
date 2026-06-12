import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser, mapUser } from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser || authUser.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  try {
    const [total, pending, delivered, inTransit, cancelled, clients, drivers, vehicles, alerts, revenue] =
      await Promise.all([
        pool.query('SELECT COUNT(*) FROM shipments'),
        pool.query("SELECT COUNT(*) FROM shipments WHERE shipment_status='Pending'"),
        pool.query("SELECT COUNT(*) FROM shipments WHERE shipment_status='Delivered'"),
        pool.query("SELECT COUNT(*) FROM shipments WHERE shipment_status='InTransit'"),
        pool.query("SELECT COUNT(*) FROM shipments WHERE shipment_status='Cancelled'"),
        pool.query("SELECT COUNT(*) FROM users WHERE role='client'"),
        pool.query("SELECT COUNT(*) FROM users WHERE role='driver' AND is_active=true"),
        pool.query('SELECT COUNT(*) FROM vehicles'),
        pool.query("SELECT COUNT(*) FROM warehouses WHERE inventory_status IN ('LowStock','Critical')"),
        pool.query('SELECT COALESCE(SUM(total_amount),0) AS total FROM orders'),
      ]);

    const t = parseInt(total.rows[0].count);
    const p = parseInt(pending.rows[0].count);
    const d = parseInt(delivered.rows[0].count);
    const it = parseInt(inTransit.rows[0].count);
    const c = parseInt(cancelled.rows[0].count);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mRaw = await pool.query(
      `SELECT EXTRACT(MONTH FROM created_at) AS month, COUNT(*) AS shipments,
       SUM(CASE WHEN shipment_status='Delivered' THEN 1 ELSE 0 END) AS delivered
       FROM shipments WHERE created_at >= date_trunc('year', NOW()) GROUP BY month`
    );
    const monthlyData = months.map((month, i) => {
      const f = mRaw.rows.find((r: any) => parseInt(r.month) === i + 1);
      return { month, shipments: parseInt(f?.shipments || 0), delivered: parseInt(f?.delivered || 0), revenue: parseInt(f?.shipments || 0) * 1200 };
    });

    const drRaw = await pool.query(
      `SELECT driver_id, COUNT(*) AS total, SUM(CASE WHEN shipment_status='Delivered' THEN 1 ELSE 0 END) AS on_time
       FROM shipments WHERE driver_id IS NOT NULL GROUP BY driver_id ORDER BY total DESC LIMIT 5`
    );
    const driverUsers = drRaw.rows.length
      ? (await pool.query('SELECT * FROM users WHERE id=ANY($1)', [drRaw.rows.map((r: any) => r.driver_id)])).rows
      : [];
    const topDrivers = drRaw.rows.map((r: any) => {
      const u = driverUsers.find((u: any) => u.id === r.driver_id);
      return u ? { driver: mapUser(u), totalDeliveries: parseInt(r.total), onTimeDeliveries: parseInt(r.on_time), rating: Math.min(5, 3 + (r.on_time / r.total) * 2) } : null;
    }).filter(Boolean);

    const typeRaw = await pool.query('SELECT shipment_type, COUNT(*) AS count FROM shipments GROUP BY shipment_type');

    return NextResponse.json({
      stats: { totalShipments: t, pendingShipments: p, deliveredShipments: d, inTransitShipments: it, cancelledShipments: c, totalRevenue: parseFloat(revenue.rows[0].total), totalClients: parseInt(clients.rows[0].count), activeDrivers: parseInt(drivers.rows[0].count), totalVehicles: parseInt(vehicles.rows[0].count), warehouseAlerts: parseInt(alerts.rows[0].count) },
      monthlyData,
      statusBreakdown: [
        { status: 'Pending', count: p, percentage: t ? (p / t) * 100 : 0 },
        { status: 'Delivered', count: d, percentage: t ? (d / t) * 100 : 0 },
        { status: 'InTransit', count: it, percentage: t ? (it / t) * 100 : 0 },
        { status: 'Cancelled', count: c, percentage: t ? (c / t) * 100 : 0 },
      ],
      topDrivers,
      revenueByType: typeRaw.rows.map((r: any) => ({ status: r.shipment_type, count: parseInt(r.count), percentage: t ? (parseInt(r.count) / t) * 100 : 0 })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
