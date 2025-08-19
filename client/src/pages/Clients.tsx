import { MessageCircle, Star, Send, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Clients() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Portal</h1>
          <p className="text-muted-foreground">
            Client communication and review management
          </p>
        </div>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Send Update
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Client Messages
            </CardTitle>
            <CardDescription>
              Communication history and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Client communication features coming soon...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Review Requests
            </CardTitle>
            <CardDescription>
              Automated review collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Review management features coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}