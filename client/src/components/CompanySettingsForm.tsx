import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Building, ChevronRight } from "lucide-react";
import type { CompanySettings } from "@shared/schema";

interface CompanySettingsFormProps {
  companyId: string;
}

export function CompanySettingsForm({ companyId }: CompanySettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    firstName: "Nasser",
    lastName: "Oweis",
    email: "noweis2020@gmail.com",
    currency: "Canadian Dollar (CAD)",
    locale: "Canada (English)",
    companyName: "FireBuild Construction",
    companyAddress: "123 Main Street",
    companyCity: "Toronto",
    companyState: "ON",
    companyZipCode: "M5V 3A8",
    companyPhone: "(416) 555-0123",
    companyEmail: "info@firebuild.com",
    companyWebsite: "www.firebuild.com",
    taxNumber: "123456789",
    logoUrl: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const { data: settings, isLoading } = useQuery({
    queryKey: [`/api/company-settings/${companyId}`],
    enabled: !!companyId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PUT", `/api/company-settings/${companyId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/company-settings/${companyId}`] });
      toast({
        title: "Settings Updated",
        description: "Company settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update company settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePassword = () => {
    toast({
      title: "Password Update",
      description: "Password update functionality coming soon...",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Information Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your personal account information</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" data-testid="button-cancel-settings">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={updateMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-save-settings"
              >
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                data-testid="input-email"
              />
            </div>

            {/* Update Password Button */}
            <div className="space-y-2">
              <Label>Update Password</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={handleUpdatePassword}
                data-testid="button-update-password"
              >
                <span>Change your password</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Localization Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                  <SelectTrigger data-testid="select-currency">
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 font-bold">🇨🇦</span>
                      <SelectValue placeholder="Select currency" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Canadian Dollar (CAD)">🇨🇦 Canadian Dollar (CAD)</SelectItem>
                    <SelectItem value="US Dollar (USD)">🇺🇸 US Dollar (USD)</SelectItem>
                    <SelectItem value="British Pound (GBP)">🇬🇧 British Pound (GBP)</SelectItem>
                    <SelectItem value="Euro (EUR)">🇪🇺 Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="locale">Locale</Label>
                <Select value={formData.locale} onValueChange={(value) => handleInputChange("locale", value)}>
                  <SelectTrigger data-testid="select-locale">
                    <SelectValue placeholder="Select locale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Canada (English)">Canada (English)</SelectItem>
                    <SelectItem value="United States (English)">United States (English)</SelectItem>
                    <SelectItem value="United Kingdom (English)">United Kingdom (English)</SelectItem>
                    <SelectItem value="Canada (French)">Canada (French)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Locale changes date, number format and language on documents
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Company Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Company Details
          </CardTitle>
          <CardDescription>Manage your company information and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-4">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-lg">
                <AvatarImage src={logoPreview || formData.logoUrl} alt="Company Logo" />
                <AvatarFallback className="rounded-lg bg-primary/10">
                  <Building className="h-8 w-8 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  data-testid="button-upload-logo"
                >
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended: 200x200px, PNG or JPG format
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Company Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="Enter company name"
                data-testid="input-company-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Address</Label>
              <Input
                id="companyAddress"
                value={formData.companyAddress}
                onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                placeholder="Enter company address"
                data-testid="input-company-address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyCity">City</Label>
                <Input
                  id="companyCity"
                  value={formData.companyCity}
                  onChange={(e) => handleInputChange("companyCity", e.target.value)}
                  placeholder="City"
                  data-testid="input-company-city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyState">State/Province</Label>
                <Input
                  id="companyState"
                  value={formData.companyState}
                  onChange={(e) => handleInputChange("companyState", e.target.value)}
                  placeholder="State/Province"
                  data-testid="input-company-state"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyZipCode">Postal Code</Label>
                <Input
                  id="companyZipCode"
                  value={formData.companyZipCode}
                  onChange={(e) => handleInputChange("companyZipCode", e.target.value)}
                  placeholder="Postal Code"
                  data-testid="input-company-zip"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Phone Number</Label>
                <Input
                  id="companyPhone"
                  value={formData.companyPhone}
                  onChange={(e) => handleInputChange("companyPhone", e.target.value)}
                  placeholder="(416) 555-0123"
                  data-testid="input-company-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Company Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => handleInputChange("companyEmail", e.target.value)}
                  placeholder="info@company.com"
                  data-testid="input-company-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Website</Label>
                <Input
                  id="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={(e) => handleInputChange("companyWebsite", e.target.value)}
                  placeholder="www.company.com"
                  data-testid="input-company-website"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxNumber">Tax Number</Label>
                <Input
                  id="taxNumber"
                  value={formData.taxNumber}
                  onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                  placeholder="123456789"
                  data-testid="input-tax-number"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}