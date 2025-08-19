import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, MapPin, Bot, Star } from "lucide-react";
import { SiFacebook, SiGoogle } from "react-icons/si";

interface Contractor {
  id: string;
  name: string;
  profileImageUrl?: string;
  currentJob: string;
  eta: string;
  distance: string;
  status: string;
}

interface RecentPayment {
  id: string;
  amount: number;
  invoiceNumber: string;
  project: string;
  client: string;
  reviewRequestSent: boolean;
}

interface RecentReview {
  id: string;
  platform: string;
  client: string;
  project: string;
  timeAgo: string;
}

export default function LiveTrackingSection() {
  const { data: contractors, isLoading: contractorsLoading } = useQuery<Contractor[]>({
    queryKey: ["/api/contractors/active"],
  });

  const { data: recentPayment } = useQuery<RecentPayment>({
    queryKey: ["/api/payments/recent"],
  });

  const { data: recentReviews } = useQuery<RecentReview[]>({
    queryKey: ["/api/reviews/recent"],
  });

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-testid="live-tracking-section">
      {/* Live GPS Tracking */}
      <div className="glass-card p-6 rounded-xl" data-testid="gps-tracking-panel">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Live Contractor Tracking</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-fire-success rounded-full live-indicator"></div>
            <span className="text-sm text-gray-400">Live</span>
          </div>
        </div>
        
        {/* Mock GPS Map */}
        <div className="map-container h-64 rounded-lg mb-6 relative overflow-hidden" data-testid="gps-map">
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="text-6xl text-gray-600 opacity-30" />
          </div>
          {/* Contractor GPS pins */}
          <div className="absolute top-8 left-12 w-4 h-4 bg-fire-success rounded-full border-2 border-white contractor-pin shadow-lg"></div>
          <div className="absolute top-20 left-32 w-4 h-4 bg-fire-success rounded-full border-2 border-white contractor-pin shadow-lg"></div>
          <div className="absolute top-16 left-24 w-4 h-4 bg-fire-success rounded-full border-2 border-white contractor-pin shadow-lg"></div>
          <div className="absolute top-12 left-40 w-4 h-4 bg-fire-orange rounded-full border-2 border-white contractor-pin shadow-lg"></div>
          
          {/* Map overlay info */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-white font-medium">
              {contractors?.length || 0} contractors active
            </p>
            <p className="text-xs text-gray-300">Real-time GPS tracking</p>
          </div>
        </div>
        
        {/* Contractor Status List */}
        <div className="space-y-3" data-testid="contractor-list">
          {contractorsLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 bg-gray-800/50 rounded-lg">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))
          ) : (
            contractors?.map((contractor) => (
              <div key={contractor.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm" data-testid={`contractor-${contractor.id}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${contractor.status === 'active' ? 'bg-fire-success' : 'bg-fire-orange'} rounded-full live-indicator`}></div>
                  {contractor.profileImageUrl ? (
                    <img 
                      src={contractor.profileImageUrl} 
                      alt={`${contractor.name} profile`} 
                      className="w-10 h-10 rounded-full object-cover" 
                      data-testid={`img-contractor-${contractor.id}`}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {contractor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white" data-testid={`text-contractor-name-${contractor.id}`}>
                      {contractor.name}
                    </p>
                    <p className="text-sm text-gray-400" data-testid={`text-contractor-job-${contractor.id}`}>
                      {contractor.currentJob}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${contractor.status === 'active' ? 'text-fire-success' : 'text-fire-orange'}`} data-testid={`text-contractor-eta-${contractor.id}`}>
                    {contractor.eta}
                  </p>
                  <p className="text-xs text-gray-400" data-testid={`text-contractor-distance-${contractor.id}`}>
                    {contractor.distance}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Payment & Review Automation */}
      <div className="glass-card p-6 rounded-xl" data-testid="payment-review-panel">
        <h3 className="text-xl font-semibold text-white mb-6">Payment & Review System</h3>
        
        <div className="space-y-4">
          {recentPayment && (
            <div className="p-4 bg-fire-success/10 border border-fire-success/30 rounded-lg" data-testid="recent-payment">
              <div className="flex items-center justify-between mb-3">
                <span className="text-fire-success font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Payment Received!
                </span>
                <span className="text-xs text-gray-400">2 min ago</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-white font-medium" data-testid="text-payment-amount">
                  ${recentPayment.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400" data-testid="text-payment-invoice">
                  Invoice {recentPayment.invoiceNumber}
                </p>
                <p className="text-xs text-gray-400" data-testid="text-payment-project">
                  {recentPayment.project} - {recentPayment.client}
                </p>
              </div>
              
              {/* Auto Review Request */}
              {recentPayment.reviewRequestSent && (
                <div className="mt-3 p-3 bg-fire-blue/10 border border-fire-blue/30 rounded-lg" data-testid="auto-review-sent">
                  <div className="flex items-center text-fire-blue text-sm">
                    <Bot className="w-4 h-4 mr-2" />
                    <span className="font-medium">Auto Review Request Sent!</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    SMS sent to client with Google & Facebook review links
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Recent Reviews */}
          <div className="p-4 bg-gray-800/50 rounded-lg" data-testid="recent-reviews">
            <h4 className="font-medium text-white mb-4 flex items-center">
              <Star className="text-yellow-400 mr-2 w-4 h-4" />
              Recent Reviews Generated
            </h4>
            <div className="space-y-3">
              {recentReviews?.map((review, index) => (
                <div key={review.id} className="flex items-center justify-between" data-testid={`review-${review.id}`}>
                  <div className="flex items-center space-x-3">
                    {review.platform === 'google' && <SiGoogle className="text-blue-400 w-4 h-4" />}
                    {review.platform === 'facebook' && <SiFacebook className="text-blue-500 w-4 h-4" />}
                    {review.platform === 'angie_list' && <div className="w-4 h-4 bg-green-400 rounded"></div>}
                    <div>
                      <p className="text-sm text-white">★★★★★ {review.platform} Review</p>
                      <p className="text-xs text-gray-400" data-testid={`text-review-client-${review.id}`}>
                        {review.client} - {review.project}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-fire-success" data-testid={`text-review-time-${review.id}`}>
                    {review.timeAgo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
