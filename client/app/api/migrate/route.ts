import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin','client','driver')),
        phone TEXT, profile_image TEXT DEFAULT '', company TEXT, address TEXT,
        is_active BOOLEAN DEFAULT true, last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS vehicles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vehicle_number TEXT UNIQUE NOT NULL,
        type TEXT DEFAULT 'Truck' CHECK (type IN ('Truck','Van','Motorcycle','Ship','Plane')),
        model TEXT, year INT, capacity FLOAT, fuel_type TEXT DEFAULT 'Diesel',
        driver_id UUID REFERENCES users(id),
        status TEXT DEFAULT 'Available' CHECK (status IN ('Available','InUse','Maintenance','Inactive')),
        current_location JSONB, last_service TIMESTAMPTZ, mileage FLOAT,
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS shipments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        shipment_id TEXT UNIQUE, client_id UUID NOT NULL REFERENCES users(id),
        driver_id UUID REFERENCES users(id), vehicle_id UUID REFERENCES vehicles(id),
        source JSONB, destination JSONB, current_location JSONB,
        shipment_status TEXT DEFAULT 'Pending' CHECK (shipment_status IN ('Pending','Packed','InTransit','CustomsClearance','OutForDelivery','Delivered','Cancelled')),
        shipment_type TEXT DEFAULT 'Standard' CHECK (shipment_type IN ('Standard','Express','Freight','ColdChain')),
        priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Low','Normal','High','Urgent')),
        weight FLOAT, value FLOAT, description TEXT,
        estimated_delivery TIMESTAMPTZ, actual_delivery TIMESTAMPTZ,
        shipment_history JSONB DEFAULT '[]', qr_code TEXT, proof_of_delivery TEXT,
        notes TEXT, insurance BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS warehouses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        warehouse_name TEXT NOT NULL, code TEXT UNIQUE, location JSONB,
        manager_id UUID REFERENCES users(id), capacity FLOAT, used_capacity FLOAT DEFAULT 0,
        stock_items JSONB DEFAULT '[]',
        inventory_status TEXT DEFAULT 'Normal' CHECK (inventory_status IN ('Normal','LowStock','Overstocked','Critical')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id TEXT UNIQUE, client_id UUID NOT NULL REFERENCES users(id),
        shipment_id UUID REFERENCES shipments(id), items JSONB DEFAULT '[]',
        subtotal FLOAT, tax FLOAT DEFAULT 0, discount FLOAT DEFAULT 0,
        total_amount FLOAT NOT NULL,
        payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending','Paid','Overdue','Refunded')),
        payment_method TEXT, invoice_url TEXT, notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        title TEXT NOT NULL, message TEXT NOT NULL,
        type TEXT DEFAULT 'system' CHECK (type IN ('shipment','delivery','warehouse','system','payment')),
        read_status BOOLEAN DEFAULT false, link TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    return NextResponse.json({ success: true, message: '✅ All tables created' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
