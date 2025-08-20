import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Calendar, Building, User, ArrowLeft } from "lucide-react";
import PayPalButton from "@/components/PayPalButton";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  invoice: any;
  onPaymentSuccess: () => void;
}

const CheckoutForm = ({ invoice, onPaymentSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your payment!",
      });
      onPaymentSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </h3>
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
        data-testid="button-pay-with-stripe"
      >
        {isProcessing ? "Processing..." : `Pay $${invoice.totalAmount}`}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  const { toast } = useToast();
  
  // Get invoice ID from URL
  const invoiceId = window.location.pathname.split('/').pop();

  const { data: invoice, isLoading } = useQuery({
    queryKey: [`/api/invoices/${invoiceId}/payment`],
    enabled: !!invoiceId,
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/create-payment-intent", { 
        amount: parseFloat(invoice.totalAmount),
        invoiceId: invoice.id 
      });
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize payment",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (invoice && paymentMethod === "stripe") {
      createPaymentIntentMutation.mutate();
    }
  }, [invoice, paymentMethod]);

  const handlePaymentSuccess = () => {
    setLocation('/payment/success');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Invoice Not Found</CardTitle>
            <CardDescription className="text-center">
              The invoice you're looking for doesn't exist or has already been paid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invoice.status === 'paid') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Already Paid</CardTitle>
            <CardDescription className="text-center">
              This invoice has already been paid. Thank you!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Invoice:</span>
                <span className="font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">${invoice.totalAmount}</span>
              </div>
              {invoice.paidDate && (
                <div className="flex justify-between">
                  <span>Paid Date:</span>
                  <span className="font-medium">
                    {new Date(invoice.paidDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-4"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Payment Checkout</h1>
            <p className="text-muted-foreground">
              Complete your payment securely using Stripe or PayPal
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Invoice Number:</span>
                    <Badge variant="outline">{invoice.invoiceNumber}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amount Due:</span>
                    <span className="text-2xl font-bold text-primary">${invoice.totalAmount}</span>
                  </div>

                  {invoice.dueDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Due Date:</span>
                      <span className="text-sm flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {invoice.client && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Client:</span>
                      <span className="text-sm flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {invoice.client.name}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="text-xs text-muted-foreground">
                  Secure payment processing powered by Stripe and PayPal
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Payment Method</CardTitle>
                <CardDescription>
                  Select your preferred payment method to complete the transaction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={paymentMethod === "stripe" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("stripe")}
                    className="h-12"
                    data-testid="button-select-stripe"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Credit Card
                  </Button>
                  <Button
                    variant={paymentMethod === "paypal" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("paypal")}
                    className="h-12"
                    data-testid="button-select-paypal"
                  >
                    PayPal
                  </Button>
                </div>

                <Separator />

                {/* Stripe Payment Form */}
                {paymentMethod === "stripe" && (
                  <div>
                    {!clientSecret ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                        <span className="ml-2">Initializing payment...</span>
                      </div>
                    ) : (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm invoice={invoice} onPaymentSuccess={handlePaymentSuccess} />
                      </Elements>
                    )}
                  </div>
                )}

                {/* PayPal Payment Form */}
                {paymentMethod === "paypal" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Pay with PayPal</h3>
                    <div className="border border-border rounded-lg p-4">
                      <PayPalButton
                        amount={invoice.totalAmount}
                        currency="USD"
                        intent="capture"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}