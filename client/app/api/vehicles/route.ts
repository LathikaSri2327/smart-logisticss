import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Vehicle } from '@/lib/models';
import { getUser, mapUser } from '@/lib/middleware/auth';
import { mapVehicle } from '@/lib/utils/shipment';

const loadVehicle = async (id: string) => {
  const v = await Vehicle.findById(id).populate('driver').lean() as any;
  return v ? mapVehicle(v, v.driver ? mapUser(v.driver) : null) : null;
};

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 }).lean() as any[];
    return NextResponse.json(await Promise.all(vehicles.map((v: any) => loadVehicle(v._id.toString()))));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser || authUser.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const input = await req.json();
  await dbConnect();
  try {
    const vehicle = await Vehicle.create({
      vehicleNumber: input.vehicleNumber, type: input.type || 'Truck',
      model: input.model, year: input.year, capacity: input.capacity,
      fuelType: input.fuelType || 'Diesel', driver: input.driverId || null,
    });
    return NextResponse.json(await loadVehicle(vehicle._id.toString()));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
