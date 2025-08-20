import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Receipt, ArrowRight } from "lucide-react";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      setLocation('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-600 dark:text-green-400">
            Payment Successful!
          </CardTitle>
          <CardDescription>
            Thank you for your payment. Your transaction has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            You will receive a confirmation email shortly with your receipt.
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => setLocation('/invoices')} 
              className="w-full"
              data-testid="button-view-invoices"
            >
              <Receipt className="h-4 w-4 mr-2" />
              View All Invoices
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')} 
              className="w-full"
              data-testid="button-return-home"
            >
              Return to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Redirecting to dashboard in 10 seconds...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}