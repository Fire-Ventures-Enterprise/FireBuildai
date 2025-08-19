import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Reply, Clock, Camera, MessageSquare, Smartphone } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ClientMessage {
  id: string;
  clientName: string;
  jobTitle: string;
  message: string;
  timeAgo: string;
  replied: boolean;
  replyText?: string;
}

interface ClientStats {
  responseRate: number;
  averageRating: number;
}

interface MobileFeature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

export default function ClientPortalSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clientMessages } = useQuery<ClientMessage[]>({
    queryKey: ["/api/client-messages"],
  });

  const { data: clientStats } = useQuery<ClientStats>({
    queryKey: ["/api/client-stats"],
  });

  const replyMutation = useMutation({
    mutationFn: async ({ messageId, reply }: { messageId: string; reply: string }) => {
      const response = await apiRequest("POST", `/api/client-messages/${messageId}/reply`, { reply });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reply Sent",
        description: "Your message has been sent to the client.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/client-messages"] });
    },
  });

  const mobileFeatures: MobileFeature[] = [
    {
      icon: "clock",
      title: "One-Tap Time Tracking",
      description: "GPS-verified clock in/out",
      color: "fire-blue"
    },
    {
      icon: "camera",
      title: "Photo Documentation",
      description: "Before/after job photos",
      color: "fire-orange"
    },
    {
      icon: "receipt",
      title: "Receipt Capture",
      description: "Instant OCR processing",
      color: "fire-success"
    },
    {
      icon: "comments",
      title: "Client Communication",
      description: "Direct messaging & updates",
      color: "purple-500"
    }
  ];

  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'clock':
        return Clock;
      case 'camera':
        return Camera;
      case 'receipt':
        return Reply; // Using Reply as placeholder for receipt
      case 'comments':
        return MessageSquare;
      default:
        return Clock;
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-testid="client-portal-section">
      {/* Client Communication Portal */}
      <div className="glass-card p-6 rounded-xl" data-testid="client-communication-panel">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Client Portal</h3>
          <span className="text-xs bg-fire-blue/20 text-fire-blue px-2 py-1 rounded-full">
            Real-time Updates
          </span>
        </div>
        
        {/* Recent Client Messages */}
        <div className="space-y-4 mb-6" data-testid="client-messages-list">
          {clientMessages?.map((message) => (
            <div key={message.id} className="p-4 bg-gray-800/50 rounded-lg" data-testid={`message-${message.id}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-white" data-testid={`text-client-name-${message.id}`}>
                    {message.clientName}
                  </span>
                  <span className="text-xs text-gray-400" data-testid={`text-job-title-${message.id}`}>
                    {message.jobTitle}
                  </span>
                </div>
                <span className="text-xs text-gray-400" data-testid={`text-message-time-${message.id}`}>
                  {message.timeAgo}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-2" data-testid={`text-message-content-${message.id}`}>
                "{message.message}"
              </p>
              {message.replied ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-fire-success">✓ Replied</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">Auto-review sent</span>
                </div>
              ) : (
                <button 
                  onClick={() => replyMutation.mutate({ 
                    messageId: message.id, 
                    reply: "Thank you for your message. We'll get back to you shortly." 
                  })}
                  disabled={replyMutation.isPending}
                  className="text-xs text-fire-blue hover:text-fire-blue/80 disabled:opacity-50"
                  data-testid={`button-reply-${message.id}`}
                >
                  {replyMutation.isPending ? "Replying..." : "Reply"}
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Client Satisfaction Metrics */}
        <div className="grid grid-cols-2 gap-4" data-testid="client-satisfaction-metrics">
          <div className="text-center p-3 bg-fire-success/10 rounded-lg border border-fire-success/20" data-testid="response-rate-metric">
            <p className="text-2xl font-bold text-fire-success">
              {clientStats?.responseRate || 98}%
            </p>
            <p className="text-xs text-gray-400">Response Rate</p>
          </div>
          <div className="text-center p-3 bg-fire-blue/10 rounded-lg border border-fire-blue/20" data-testid="rating-metric">
            <p className="text-2xl font-bold text-fire-blue">
              {clientStats?.averageRating || 4.9}
            </p>
            <p className="text-xs text-gray-400">Avg Rating</p>
          </div>
        </div>
      </div>
      
      {/* Mobile App Features */}
      <div className="glass-card p-6 rounded-xl" data-testid="mobile-app-panel">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Mobile App Features</h3>
          <div className="flex items-center space-x-2">
            <Smartphone className="text-fire-orange w-5 h-5" />
            <span className="text-xs text-gray-400">Field-Ready</span>
          </div>
        </div>
        
        {/* Mobile App Preview */}
        <div className="relative mb-4" data-testid="mobile-app-preview">
          <div className="w-full h-48 bg-gray-800 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Smartphone className="text-6xl text-gray-600" />
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-medium">iOS & Android Apps</p>
              <p className="text-xs text-gray-300">Field-optimized interface</p>
            </div>
          </div>
        </div>
        
        {/* Feature List */}
        <div className="space-y-3" data-testid="mobile-features-list">
          {mobileFeatures.map((feature, index) => {
            const FeatureIcon = getFeatureIcon(feature.icon);
            return (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg" data-testid={`mobile-feature-${index}`}>
                <div className={`w-8 h-8 bg-${feature.color}/20 rounded-lg flex items-center justify-center`}>
                  <FeatureIcon className={`text-${feature.color} text-sm`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white" data-testid={`text-feature-title-${index}`}>
                    {feature.title}
                  </p>
                  <p className="text-xs text-gray-400" data-testid={`text-feature-description-${index}`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
