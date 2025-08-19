import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, MessageSquare, Phone, Plus, Send, Search, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  preferredContactMethod: string;
}

interface Communication {
  id: string;
  clientId: string;
  type: 'sms' | 'email' | 'call';
  direction: 'incoming' | 'outgoing';
  subject?: string;
  content?: string;
  phoneNumber?: string;
  emailAddress?: string;
  status: string;
  sentAt: Date;
  createdAt: Date;
}

const messageSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  type: z.enum(["sms", "email"]),
  subject: z.string().optional(),
  content: z.string().min(1, "Message content is required"),
});

type MessageFormData = z.infer<typeof messageSchema>;

export default function Messages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: recentCommunications } = useQuery<Communication[]>({
    queryKey: ["/api/communications/recent"],
  });

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      type: "email",
      content: "",
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      const client = clients?.find(c => c.id === data.clientId);
      if (!client) throw new Error("Client not found");

      const messageData = {
        clientId: data.clientId,
        type: data.type,
        direction: "outgoing",
        subject: data.subject,
        content: data.content,
        emailAddress: data.type === "email" ? client.email : undefined,
        phoneNumber: data.type === "sms" ? client.phone : undefined,
        status: "sent",
        sentAt: new Date(),
      };

      return apiRequest("POST", "/api/communications", messageData);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/communications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      form.reset();
      setShowComposeDialog(false);
      setSelectedClient(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleComposeMessage = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      form.setValue("clientId", client.id);
      form.setValue("type", client.preferredContactMethod === "phone" ? "sms" : "email");
    }
    setShowComposeDialog(true);
  };

  const onSubmit = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-gray-600 dark:text-gray-400">Send SMS and email communications to clients</p>
        </div>
        <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => handleComposeMessage()}>
              <Plus className="h-4 w-4" />
              Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
              <DialogDescription>
                Send an SMS or email to a client
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{client.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {client.preferredContactMethod}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email
                            </div>
                          </SelectItem>
                          <SelectItem value="sms">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              SMS
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("type") === "email" && (
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch("type") === "email" ? "Email Content" : "SMS Message"}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            form.watch("type") === "email"
                              ? "Enter your email message..."
                              : "Enter your SMS message (160 characters max)..."
                          }
                          rows={form.watch("type") === "email" ? 6 : 3}
                          maxLength={form.watch("type") === "sms" ? 160 : undefined}
                          {...field}
                        />
                      </FormControl>
                      {form.watch("type") === "sms" && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {field.value?.length || 0}/160 characters
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowComposeDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={sendMessageMutation.isPending}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Clients
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredClients?.map((client) => (
              <div
                key={client.id}
                className="p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => handleComposeMessage(client)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {client.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {client.email || client.phone}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {client.preferredContactMethod}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Communications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Communications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCommunications && recentCommunications.length > 0 ? (
              <div className="space-y-4">
                {recentCommunications.slice(0, 10).map((comm) => {
                  const client = clients?.find(c => c.id === comm.clientId);
                  return (
                    <div key={comm.id} className="flex items-start gap-3 p-4 rounded-lg border">
                      <div className={`p-2 rounded-full ${
                        comm.type === 'email' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
                        comm.type === 'sms' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' :
                        'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                      }`}>
                        {comm.type === 'email' ? <Mail className="h-4 w-4" /> :
                         comm.type === 'sms' ? <MessageSquare className="h-4 w-4" /> :
                         <Phone className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {client?.name || 'Unknown Client'}
                            </span>
                            <Badge variant={comm.direction === 'outgoing' ? 'default' : 'outline'} className="text-xs">
                              {comm.direction === 'outgoing' ? '→ Sent' : '← Received'}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {comm.type.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comm.sentAt)}
                          </span>
                        </div>
                        
                        {comm.subject && (
                          <p className="font-medium text-gray-900 dark:text-white mt-1">
                            {comm.subject}
                          </p>
                        )}
                        
                        {comm.content && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {comm.content}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No recent communications</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}