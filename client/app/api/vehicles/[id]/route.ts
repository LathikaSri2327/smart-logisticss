import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Vehicle } from '@/lib/models';
import { getUser, mapUser } from '@/lib/middleware/auth';
import { mapVehicle } from '@/lib/utils/shipment';

const loadVehicle = async (id: string) => {
  const v = await Vehicle.findById(id).populate('driver').lean() as any;
  return v ? mapVehicle(v, v.driver ? mapUser(v.driver) : null) : null;
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const input = await req.json();
  await dbConnect();
  try {
    if (input._action === 'location') {
      await Vehicle.findByIdAndUpdate(params.id, { currentLocation: { address: input.address, coordinates: { lat: input.lat, lng: input.lng } } });
    } else {
      await Vehicle.findByIdAndUpdate(params.id, { status: input.status });
    }
    return NextResponse.json(await loadVehicle(params.id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
