import pool from '@/lib/db';
import { mapUser } from '@/lib/middleware/auth';

export const mapVehicle = (r: any, driver?: any) =>
  r ? {
    id: r.id, vehicleNumber: r.vehicle_number, type: r.type, model: r.model,
    year: r.year, capacity: r.capacity, fuelType: r.fuel_type, driver: driver || null,
    status: r.status, currentLocation: r.current_location,
    lastService: r.last_service, mileage: r.mileage, createdAt: r.created_at,
  } : null;

export const loadShipment = async (id: string) => {
  const { rows } = await pool.query('SELECT * FROM shipments WHERE id=$1', [id]);
  if (!rows[0]) return null;
  const s = rows[0];
  const [cu, du, vu] = await Promise.all([
    s.client_id ? pool.query('SELECT * FROM users WHERE id=$1', [s.client_id]) : null,
    s.driver_id ? pool.query('SELECT * FROM users WHERE id=$1', [s.driver_id]) : null,
    s.vehicle_id ? pool.query('SELECT * FROM vehicles WHERE id=$1', [s.vehicle_id]) : null,
  ]);
  return {
    id: s.id, shipmentId: s.shipment_id,
    client: cu?.rows[0] ? mapUser(cu.rows[0]) : null,
    driver: du?.rows[0] ? mapUser(du.rows[0]) : null,
    vehicle: vu?.rows[0] ? mapVehicle(vu.rows[0]) : null,
    source: s.source, destination: s.destination, currentLocation: s.current_location,
    shipmentStatus: s.shipment_status, shipmentType: s.shipment_type, priority: s.priority,
    weight: s.weight, value: s.value, description: s.description,
    estimatedDelivery: s.estimated_delivery, actualDelivery: s.actual_delivery,
    shipmentHistory: s.shipment_history || [], qrCode: s.qr_code,
    proofOfDelivery: s.proof_of_delivery, notes: s.notes, insurance: s.insurance,
    createdAt: s.created_at, updatedAt: s.updated_at,
  };
};
