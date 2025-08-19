import { Receipt, Upload, DollarSign, Camera } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Expenses() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expense Management</h1>
          <p className="text-muted-foreground">
            OCR receipt scanning and expense tracking
          </p>
        </div>
        <Button>
          <Camera className="h-4 w-4 mr-2" />
          Scan Receipt
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              OCR Scanning
            </CardTitle>
            <CardDescription>
              Automated receipt processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              OCR and expense features coming soon...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Expense Reports
            </CardTitle>
            <CardDescription>
              Generate detailed expense reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Reporting features coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}