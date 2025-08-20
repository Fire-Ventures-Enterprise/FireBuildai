import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Verification() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendEmailVerification = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/send-email-verification", { email });
      setEmailSent(true);
      toast({
        title: "Email Sent",
        description: "Verification code sent to your email",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendSMSVerification = async () => {
    if (!phone) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/send-sms-verification", { phone });
      setSmsSent(true);
      toast({
        title: "SMS Sent",
        description: "Verification code sent to your phone",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to send verification SMS",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async () => {
    if (!emailCode) {
      toast({
        title: "Error",
        description: "Please enter the email verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/verify-email", { 
        email, 
        code: emailCode 
      });
      const result = await response.json();
      
      if (result.verified) {
        setEmailVerified(true);
        toast({
          title: "Success",
          description: "Email verified successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid or expired verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifySMS = async () => {
    if (!smsCode) {
      toast({
        title: "Error",
        description: "Please enter the SMS verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/verify-sms", { 
        phone, 
        code: smsCode 
      });
      const result = await response.json();
      
      if (result.verified) {
        setSmsVerified(true);
        toast({
          title: "Success",
          description: "Phone number verified successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid or expired verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const activateAccount = async () => {
    if (!emailVerified) {
      toast({
        title: "Error",
        description: "Please verify your email first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/activate-account", { email });
      const result = await response.json();
      
      if (result.activated) {
        toast({
          title: "Success",
          description: "Account activated successfully! You can now access FireBuild.ai",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">FireBuild.ai</h1>
          <p className="text-muted-foreground mt-2">Account Verification</p>
        </div>

        {/* Email Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📧 Email Verification
              {emailVerified && <span className="text-green-500">✓</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={emailVerified}
                data-testid="input-email"
              />
            </div>
            
            {!emailSent && !emailVerified && (
              <Button 
                onClick={sendEmailVerification} 
                disabled={loading}
                data-testid="button-send-email"
              >
                Send Email Verification
              </Button>
            )}

            {emailSent && !emailVerified && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="emailCode">Verification Code</Label>
                  <Input
                    id="emailCode"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="Enter 6-digit code from email"
                    data-testid="input-email-code"
                  />
                </div>
                <Button 
                  onClick={verifyEmail} 
                  disabled={loading}
                  data-testid="button-verify-email"
                >
                  Verify Email
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SMS Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📱 SMS Verification (Optional)
              {smsVerified && <span className="text-green-500">✓</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                disabled={smsVerified}
                data-testid="input-phone"
              />
            </div>
            
            {!smsSent && !smsVerified && (
              <Button 
                onClick={sendSMSVerification} 
                disabled={loading}
                variant="outline"
                data-testid="button-send-sms"
              >
                Send SMS Verification
              </Button>
            )}

            {smsSent && !smsVerified && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="smsCode">Verification Code</Label>
                  <Input
                    id="smsCode"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    placeholder="Enter 6-digit code from SMS"
                    data-testid="input-sms-code"
                  />
                </div>
                <Button 
                  onClick={verifySMS} 
                  disabled={loading}
                  variant="outline"
                  data-testid="button-verify-sms"
                >
                  Verify SMS
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Activation */}
        {emailVerified && (
          <Card>
            <CardHeader>
              <CardTitle>🎉 Account Activation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your email has been verified! Click below to activate your FireBuild.ai account.
              </p>
              <Button 
                onClick={activateAccount} 
                disabled={loading}
                className="w-full"
                data-testid="button-activate-account"
              >
                Activate Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}