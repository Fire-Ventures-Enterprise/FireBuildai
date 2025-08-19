import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Phone, Mail, MapPin, Plus, Eye } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  totalSpent: number;
  rating: number;
  isActive: boolean;
  tags?: string[];
  totalJobs: number;
}

export default function Clients() {
  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your client relationships and communications
          </p>
        </div>
        <Button data-testid="button-add-client" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {clients?.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-blue-700 dark:text-blue-300 font-semibold">
                      {getInitials(client.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate" data-testid={`text-client-name-${client.id}`}>
                      {client.name}
                    </h3>
                    {client.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-rating-${client.id}`}>
                          {client.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge 
                  variant={client.isActive ? "default" : "secondary"}
                  className="text-xs"
                  data-testid={`status-${client.id}`}
                >
                  {client.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-2">
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-3 w-3" />
                    <span className="truncate" data-testid={`text-email-${client.id}`}>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-3 w-3" />
                    <span data-testid={`text-phone-${client.id}`}>{client.phone}</span>
                  </div>
                )}
                {(client.city || client.state) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-3 w-3" />
                    <span data-testid={`text-location-${client.id}`}>
                      {client.city}{client.city && client.state && ', '}{client.state}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid={`text-total-spent-${client.id}`}>
                    {formatCurrency(client.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid={`text-jobs-count-${client.id}`}>
                    {client.totalJobs}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Jobs</p>
                </div>
              </div>

              {client.tags && client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {client.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-1" data-testid={`tag-${tag}-${client.id}`}>
                      {tag}
                    </Badge>
                  ))}
                  {client.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      +{client.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-2"
                  data-testid={`button-view-details-${client.id}`}
                >
                  <Eye className="h-3 w-3" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clients?.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="h-16 w-16 rounded-full bg-gray-400 dark:bg-gray-600 mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Clients Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start building relationships by adding your first client
            </p>
            <Button data-testid="button-add-first-client" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Client
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}