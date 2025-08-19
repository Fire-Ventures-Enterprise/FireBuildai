import { useQuery } from "@tanstack/react-query";
import { Truck, Wrench, MapPin } from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  type: string;
  make?: string;
  model?: string;
  contractorName?: string;
  status: string;
  location: string;
  distance?: string;
  eta?: string;
}

interface FleetStats {
  totalVehicles: number;
  currentlyActive: number;
  milesToday: number;
  uptime: number;
}

export default function EquipmentSection() {
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: fleetStats } = useQuery<FleetStats>({
    queryKey: ["/api/fleet-stats"],
  });

  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'truck':
      case 'van':
        return Truck;
      case 'equipment':
        return Wrench;
      default:
        return Truck;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'fire-success';
      case 'en_route':
      case 'en route':
        return 'fire-orange';
      case 'parked':
      case 'available':
        return 'gray-600';
      default:
        return 'gray-600';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <section className="glass-card p-6 rounded-xl" data-testid="equipment-section">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Equipment & Fleet Tracking</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-fire-success rounded-full live-indicator"></div>
          <span className="text-sm text-gray-400">Real-time monitoring</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="vehicles-grid">
        {vehiclesLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-800/50 rounded-lg p-4">
              <div className="h-24 bg-gray-700 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))
        ) : (
          vehicles?.map((vehicle) => {
            const VehicleIcon = getVehicleIcon(vehicle.type);
            const statusColor = getStatusColor(vehicle.status);
            
            return (
              <div key={vehicle.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-fire-blue/50 transition-colors" data-testid={`vehicle-${vehicle.id}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 bg-${statusColor}/20 rounded-lg flex items-center justify-center`}>
                    <VehicleIcon className={`text-${statusColor}`} />
                  </div>
                  <span className={`text-xs bg-${statusColor}/20 text-${statusColor} px-2 py-1 rounded-full`} data-testid={`text-vehicle-status-${vehicle.id}`}>
                    {getStatusText(vehicle.status)}
                  </span>
                </div>
                
                {/* Placeholder for vehicle image */}
                <div className="w-full h-24 bg-gray-700 rounded-lg mb-3 flex items-center justify-center" data-testid={`img-vehicle-${vehicle.id}`}>
                  <VehicleIcon className="text-gray-500 text-2xl" />
                </div>
                
                <div>
                  <p className="font-medium text-white" data-testid={`text-vehicle-name-${vehicle.id}`}>
                    {vehicle.name}
                  </p>
                  <p className="text-sm text-gray-400" data-testid={`text-vehicle-details-${vehicle.id}`}>
                    {vehicle.make && vehicle.model ? `${vehicle.make} ${vehicle.model}` : vehicle.type}
                    {vehicle.contractorName && ` • ${vehicle.contractorName}`}
                  </p>
                  <p className={`text-xs mt-1 ${
                    vehicle.status === 'active' ? 'text-fire-success' : 
                    vehicle.status === 'en_route' ? 'text-fire-orange' : 
                    'text-gray-400'
                  }`} data-testid={`text-vehicle-location-${vehicle.id}`}>
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {vehicle.location}
                    {vehicle.distance && ` • ${vehicle.distance}`}
                    {vehicle.eta && ` • ETA ${vehicle.eta}`}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Fleet Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700" data-testid="fleet-statistics">
        <div className="text-center" data-testid="stat-total-vehicles">
          <p className="text-2xl font-bold text-fire-blue">
            {fleetStats?.totalVehicles || 15}
          </p>
          <p className="text-xs text-gray-400">Total Vehicles</p>
        </div>
        <div className="text-center" data-testid="stat-currently-active">
          <p className="text-2xl font-bold text-fire-success">
            {fleetStats?.currentlyActive || 12}
          </p>
          <p className="text-xs text-gray-400">Currently Active</p>
        </div>
        <div className="text-center" data-testid="stat-miles-today">
          <p className="text-2xl font-bold text-fire-orange">
            {fleetStats?.milesToday || 847}
          </p>
          <p className="text-xs text-gray-400">Miles Today</p>
        </div>
        <div className="text-center" data-testid="stat-uptime">
          <p className="text-2xl font-bold text-fire-warning">
            {fleetStats?.uptime || 96}%
          </p>
          <p className="text-xs text-gray-400">Uptime</p>
        </div>
      </div>
    </section>
  );
}
