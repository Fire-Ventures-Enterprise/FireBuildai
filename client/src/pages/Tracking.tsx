import { MapPin, Navigation } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Tracking() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">GPS Tracking</h1>
        <p className="text-muted-foreground">
          Real-time location tracking for your contractors and equipment
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Live Tracking
            </CardTitle>
            <CardDescription>
              View real-time locations of active contractors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              GPS tracking features coming soon...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Route History
            </CardTitle>
            <CardDescription>
              Review past routes and time logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Route history features coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}