import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const client = await pool.connect();
  try {
    const hash = await bcrypt.hash('password123', 12);

    await client.query(`
      INSERT INTO users (name, email, password, role, company, phone) VALUES
        ('Admin User',   'admin@logistics.com',  '${hash}', 'admin',  'Smart Logistics', '+1 555 0100'),
        ('Alice Johnson','alice@techcorp.com',    '${hash}', 'client', 'TechCorp Inc',    '+1 555 0101'),
        ('Bob Smith',    'bob@globalexport.com',  '${hash}', 'client', 'Global Export',   '+1 555 0102'),
        ('David Lee',    'david@logistics.com',   '${hash}', 'driver', 'Smart Logistics', '+1 555 0103'),
        ('Emma Davis',   'emma@logistics.com',    '${hash}', 'driver', 'Smart Logistics', '+1 555 0104')
      ON CONFLICT (email) DO NOTHING;
    `);

    const { rows: users } = await client.query('SELECT id, email, role FROM users');
    const admin   = users.find(u => u.email === 'admin@logistics.com');
    const alice   = users.find(u => u.email === 'alice@techcorp.com');
    const bob     = users.find(u => u.email === 'bob@globalexport.com');
    const david   = users.find(u => u.email === 'david@logistics.com');
    const emma    = users.find(u => u.email === 'emma@logistics.com');

    await client.query(`
      INSERT INTO vehicles (vehicle_number, type, model, year, capacity, fuel_type, driver_id, status) VALUES
        ('TRK-001', 'Truck', 'Volvo FH16',   2022, 20000, 'Diesel',   '${david.id}', 'InUse'),
        ('VAN-001', 'Van',   'Mercedes Vito', 2023,  3000, 'Diesel',   '${emma.id}',  'Available'),
        ('TRK-002', 'Truck', 'Scania R500',   2021, 18000, 'Diesel',   null,          'Maintenance')
      ON CONFLICT (vehicle_number) DO NOTHING;
    `);

    const { rows: vehicles } = await client.query('SELECT id, vehicle_number FROM vehicles');
    const trk1 = vehicles.find(v => v.vehicle_number === 'TRK-001');

    const shipment1Id = 'SHP-' + Date.now() + '-AA11';
    const shipment2Id = 'SHP-' + Date.now() + '-BB22';
    const history1 = JSON.stringify([
      { status: 'Pending',    location: 'New York, NY',    note: 'Shipment created',   timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
      { status: 'Packed',     location: 'New York, NY',    note: 'Ready for pickup',   timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      { status: 'InTransit',  location: 'Chicago, IL',     note: 'On the way',         timestamp: new Date(Date.now() - 86400000).toISOString() },
    ]);
    const history2 = JSON.stringify([
      { status: 'Pending', location: 'Los Angeles, CA', note: 'Shipment created', timestamp: new Date().toISOString() },
    ]);

    await client.query(`
      INSERT INTO shipments (shipment_id, client_id, driver_id, vehicle_id, source, destination, shipment_status, shipment_type, priority, weight, value, description, estimated_delivery, shipment_history)
      VALUES
        ($1, $2, $3, $4,
          '{"address":"123 Main St","city":"New York","country":"USA"}',
          '{"address":"456 Oak Ave","city":"Los Angeles","country":"USA"}',
          'InTransit', 'Express', 'High', 1500, 12000, 'Electronics shipment',
          NOW() + INTERVAL '3 days', $5),
        ($6, $7, null, null,
          '{"address":"789 Elm St","city":"Los Angeles","country":"USA"}',
          '{"address":"321 Pine Rd","city":"Chicago","country":"USA"}',
          'Pending', 'Standard', 'Normal', 800, 5000, 'Furniture delivery',
          NOW() + INTERVAL '7 days', $8)
      ON CONFLICT (shipment_id) DO NOTHING;
    `, [shipment1Id, alice.id, david.id, trk1.id, history1, shipment2Id, bob.id, history2]);

    const { rows: shipments } = await client.query('SELECT id FROM shipments LIMIT 1');

    if (shipments[0]) {
      const orderId = 'ORD-' + Date.now() + '-CC33';
      const items = JSON.stringify([{ productName: 'Laptop', sku: 'LPT-001', quantity: 10, unitPrice: 1200, totalPrice: 12000 }]);
      await client.query(`
        INSERT INTO orders (order_id, client_id, shipment_id, items, subtotal, tax, total_amount, payment_status, payment_method)
        VALUES ($1, $2, $3, $4, 12000, 960, 12960, 'Paid', 'Bank Transfer')
        ON CONFLICT (order_id) DO NOTHING;
      `, [orderId, alice.id, shipments[0].id, items]);
    }

    await client.query(`
      INSERT INTO warehouses (warehouse_name, code, location, capacity, used_capacity, stock_items, inventory_status)
      VALUES
        ('NYC Distribution Center', 'WH-NYC',
         '{"address":"100 Industrial Blvd","city":"New York","country":"USA"}',
         50000, 32000,
         '[{"id":"s1","name":"Electronic Components","sku":"ELEC-001","quantity":500,"minQuantity":50,"unit":"units","category":"Electronics"},{"id":"s2","name":"Packaging Material","sku":"PACK-001","quantity":8,"minQuantity":100,"unit":"rolls","category":"Packaging"}]',
         'LowStock'),
        ('LA Fulfillment Center', 'WH-LAX',
         '{"address":"200 Harbor Dr","city":"Los Angeles","country":"USA"}',
         30000, 12000,
         '[{"id":"s3","name":"Furniture Parts","sku":"FURN-001","quantity":200,"minQuantity":20,"unit":"units","category":"Furniture"}]',
         'Normal')
      ON CONFLICT (code) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES
        ('${alice.id}', 'Shipment In Transit', 'Your shipment ${shipment1Id} is now in transit.', 'shipment'),
        ('${alice.id}', 'Order Confirmed',     'Your order has been confirmed and paid.',          'payment'),
        ('${david.id}', 'New Delivery',        'You have a new delivery assigned to you.',         'delivery')
      ON CONFLICT DO NOTHING;
    `);

    return NextResponse.json({ success: true, message: '✅ Database seeded successfully' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}
