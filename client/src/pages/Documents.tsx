import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanySettingsForm } from "@/components/CompanySettingsForm";
import { FileText, Plus, Download, Send, Edit3, Settings, Files, Building2 } from "lucide-react";
import type { DocumentTemplate, JobDocument } from "@shared/schema";

export default function Documents() {
  const queryClient = useQueryClient();
  const companyId = "default"; // In a real app, this would come from user context

  // Queries
  const { data: templates = [], isLoading: templatesLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ["/api/document-templates"],
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery<JobDocument[]>({
    queryKey: ["/api/client-documents"],
  });

  // Mutations
  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/document-templates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-templates"] });
    },
  });

  const generateDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/client-documents", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-documents"] });
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground" data-testid="documents-title">
            Document Management
          </h1>
          <p className="text-muted-foreground" data-testid="documents-subtitle">
            Manage templates and generate documents for your projects
          </p>
        </div>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger 
              value="templates" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
              data-testid="tab-templates"
            >
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
              data-testid="tab-documents"
            >
              <Files className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
              data-testid="tab-settings"
            >
              <Settings className="h-4 w-4" />
              Branding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" data-testid="templates-heading">
                Document Templates
              </h2>
              <Button
                onClick={() => {
                  // Create a new template with default values
                  createTemplateMutation.mutate({
                    name: "New Template",
                    type: "work_order",
                    templateHtml: "<p>Template content here...</p>",
                    requiredFields: ["client_name", "project_title"],
                    isActive: true,
                  });
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-create-template"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>

            {templatesLoading ? (
              <div className="text-center py-8" data-testid="templates-loading">
                Loading templates...
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.id} className="bg-card border-border hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium text-card-foreground" data-testid={`template-name-${template.id}`}>
                          {template.name}
                        </CardTitle>
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardDescription className="text-muted-foreground" data-testid={`template-type-${template.id}`}>
                        {template.type.replace("_", " ").toUpperCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={template.isActive ? "default" : "secondary"} 
                          data-testid={`template-status-${template.id}`}
                        >
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          data-testid={`button-edit-template-${template.id}`}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                      {template.requiredFields && Array.isArray(template.requiredFields) && template.requiredFields.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2" data-testid={`template-fields-${template.id}`}>
                          Fields: {(template.requiredFields as string[]).join(", ")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" data-testid="documents-heading">
                Client Documents
              </h2>
              <Button
                onClick={() => {
                  generateDocumentMutation.mutate({
                    templateId: templates[0]?.id || "1",
                    clientId: "client-1",
                    jobId: "job-1",
                    documentData: { client_name: "Sample Client", project_title: "Sample Project" },
                    status: "draft",
                  });
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={templates.length === 0}
                data-testid="button-generate-document"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate Document
              </Button>
            </div>

            {documentsLoading ? (
              <div className="text-center py-8" data-testid="documents-loading">
                Loading documents...
              </div>
            ) : (
              <div className="grid gap-4">
                {documents.map((document) => (
                  <Card key={document.id} className="bg-card border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium text-card-foreground" data-testid={`document-name-${document.id}`}>
                          Document #{document.id}
                        </CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                            data-testid={`button-download-${document.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                            data-testid={`button-send-${document.id}`}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-muted-foreground" data-testid={`document-client-${document.id}`}>
                        Client ID: {document.clientId} | Job ID: {document.jobId}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={document.status === "signed" ? "default" : "secondary"}
                          data-testid={`document-status-${document.id}`}
                        >
                          {document.status.toUpperCase()}
                        </Badge>
                        {document.createdAt && (
                          <span className="text-xs text-muted-foreground" data-testid={`document-date-${document.id}`}>
                            {new Date(document.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <CompanySettingsForm companyId={companyId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}