import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Building2, Save, Palette } from "lucide-react";
import type { CompanySettings } from "@shared/schema";

interface CompanySettingsFormProps {
  companyId: string;
}

export function CompanySettingsForm({ companyId }: CompanySettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<CompanySettings>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: [`/api/company-settings/${companyId}`],
    enabled: !!companyId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<CompanySettings>) => {
      const response = await apiRequest("PUT", `/api/company-settings/${companyId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/company-settings/${companyId}`] });
      toast({
        title: "Settings Updated",
        description: "Company branding settings have been saved successfully.",
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
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof CompanySettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Branding Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Branding Settings
        </CardTitle>
        <CardDescription>
          Customize your company information that appears on all documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Company Identity</h3>
              <Badge variant="outline">Appears on all documents</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName || ""}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  placeholder="ABC Contracting Inc."
                  required
                  data-testid="input-company-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl || ""}
                  onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                  placeholder="https://your-site.com/logo.png"
                  data-testid="input-logo-url"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                  data-testid="input-phone"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@company.com"
                  data-testid="input-email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="www.company.com"
                  data-testid="input-website"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Business Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Business Address</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main Street"
                  data-testid="input-address"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="San Francisco"
                    data-testid="input-city"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state || ""}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="CA"
                    data-testid="input-state"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode || ""}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    placeholder="94105"
                    data-testid="input-zip"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Legal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxNumber">Tax ID Number</Label>
                <Input
                  id="taxNumber"
                  value={formData.taxNumber || ""}
                  onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                  placeholder="12-3456789"
                  data-testid="input-tax-number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber || ""}
                  onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                  placeholder="LIC-ABC-12345"
                  data-testid="input-license-number"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Brand Colors */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Brand Colors</h3>
              <Badge variant="outline">Used in document headers</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor || "#2563eb"}
                    onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                    className="w-16 h-10"
                    data-testid="input-primary-color"
                  />
                  <Input
                    value={formData.primaryColor || "#2563eb"}
                    onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                    placeholder="#2563eb"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor || "#1e40af"}
                    onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                    className="w-16 h-10"
                    data-testid="input-secondary-color"
                  />
                  <Input
                    value={formData.secondaryColor || "#1e40af"}
                    onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                    placeholder="#1e40af"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="flex items-center gap-2"
              data-testid="button-save-settings"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}