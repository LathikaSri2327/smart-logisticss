import dbConnect from '@/lib/db';
import { Shipment, Vehicle } from '@/lib/models';
import { mapUser } from '@/lib/middleware/auth';

export const mapVehicle = (v: any, driver?: any) =>
  v ? {
    id: v._id?.toString() || v.id,
    vehicleNumber: v.vehicleNumber, type: v.type, model: v.model,
    year: v.year, capacity: v.capacity, fuelType: v.fuelType,
    driver: driver || null, status: v.status,
    currentLocation: v.currentLocation, lastService: v.lastService,
    mileage: v.mileage, createdAt: v.createdAt,
  } : null;

export const loadShipment = async (id: string) => {
  await dbConnect();
  const s = await Shipment.findById(id)
    .populate('client').populate('driver')
    .populate({ path: 'vehicle', populate: { path: 'driver' } })
    .lean() as any;
  if (!s) return null;
  return {
    id: s._id.toString(), shipmentId: s.shipmentId,
    client: mapUser(s.client), driver: mapUser(s.driver),
    vehicle: s.vehicle ? mapVehicle(s.vehicle, s.vehicle.driver ? mapUser(s.vehicle.driver) : null) : null,
    source: s.source, destination: s.destination, currentLocation: s.currentLocation,
    shipmentStatus: s.shipmentStatus, shipmentType: s.shipmentType, priority: s.priority,
    weight: s.weight, value: s.value, description: s.description,
    estimatedDelivery: s.estimatedDelivery, actualDelivery: s.actualDelivery,
    shipmentHistory: s.shipmentHistory || [], qrCode: s.qrCode,
    proofOfDelivery: s.proofOfDelivery, notes: s.notes, insurance: s.insurance,
    createdAt: s.createdAt, updatedAt: s.updatedAt,
  };
};
