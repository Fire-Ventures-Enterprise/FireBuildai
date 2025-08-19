import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Download, Send, Edit3 } from "lucide-react";
import type { DocumentTemplate, ClientDocument } from "@shared/schema";

export default function Documents() {
  const [activeTab, setActiveTab] = useState("templates");
  const queryClient = useQueryClient();

  // Queries
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/document-templates"],
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="documents-title">
            Document Management
          </h1>
          <p className="text-gray-400" data-testid="documents-subtitle">
            Manage templates and generate documents for your projects
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === "templates"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              data-testid="tab-templates"
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === "documents"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              data-testid="tab-documents"
            >
              Documents
            </button>
          </div>
        </div>

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div>
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
                className="bg-blue-600 hover:bg-blue-700"
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
                {templates.map((template: DocumentTemplate) => (
                  <Card key={template.id} className="bg-gray-800 border-gray-700 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium text-white" data-testid={`template-name-${template.id}`}>
                          {template.name}
                        </CardTitle>
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                      <CardDescription className="text-gray-400" data-testid={`template-type-${template.id}`}>
                        {template.type.replace("_", " ").toUpperCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={template.isActive ? "default" : "secondary"} 
                          data-testid={`template-status-${template.id}`}
                          className={template.isActive ? "bg-green-600" : "bg-gray-600"}
                        >
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                          data-testid={`button-edit-template-${template.id}`}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                      {template.requiredFields && Array.isArray(template.requiredFields) && template.requiredFields.length > 0 && (
                        <p className="text-xs text-gray-400 mt-2" data-testid={`template-fields-${template.id}`}>
                          Fields: {(template.requiredFields as string[]).join(", ")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div>
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
                className="bg-green-600 hover:bg-green-700"
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
                {documents.map((document: ClientDocument) => (
                  <Card key={document.id} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium text-white" data-testid={`document-name-${document.id}`}>
                          Document #{document.id}
                        </CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300"
                            data-testid={`button-download-${document.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-400 hover:text-green-300"
                            data-testid={`button-send-${document.id}`}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-gray-400" data-testid={`document-client-${document.id}`}>
                        Client ID: {document.clientId} | Job ID: {document.jobId}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary"
                          data-testid={`document-status-${document.id}`}
                          className={
                            document.status === "signed" ? "bg-green-600" :
                            document.status === "sent" ? "bg-blue-600" :
                            "bg-gray-600"
                          }
                        >
                          {document.status.toUpperCase()}
                        </Badge>
                        {document.createdAt && (
                          <span className="text-xs text-gray-400" data-testid={`document-date-${document.id}`}>
                            {new Date(document.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}