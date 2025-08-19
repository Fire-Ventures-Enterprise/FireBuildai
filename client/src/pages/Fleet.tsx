import { Truck, Fuel, Wrench, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Fleet() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fleet Management</h1>
          <p className="text-muted-foreground">
            Vehicle tracking and maintenance scheduling
          </p>
        </div>
        <Button>
          <Truck className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Vehicle Status
            </CardTitle>
            <CardDescription>
              Real-time vehicle locations and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Fleet tracking features coming soon...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance
            </CardTitle>
            <CardDescription>
              Scheduled maintenance and repairs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Maintenance scheduling coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}