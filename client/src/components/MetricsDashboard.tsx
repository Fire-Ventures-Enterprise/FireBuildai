import { useQuery } from "@tanstack/react-query";
import { Briefcase, DollarSign, MapPin, Star } from "lucide-react";

interface Metrics {
  activeJobs: number;
  revenue: number;
  contractorsOnline: number;
  reviewScore: number;
}

export default function MetricsDashboard() {
  const { data: metrics, isLoading } = useQuery<Metrics>({
    queryKey: ["/api/metrics"],
  });

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-xl animate-pulse">
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        ))}
      </section>
    );
  }

  const metricCards = [
    {
      title: "Active Jobs",
      value: metrics?.activeJobs || 0,
      change: "+3 new this week",
      icon: Briefcase,
      color: "fire-blue",
      testId: "metric-active-jobs"
    },
    {
      title: "Revenue (MTD)",
      value: `$${(metrics?.revenue || 0).toLocaleString()}`,
      change: "+18% vs last month",
      icon: DollarSign,
      color: "fire-success",
      testId: "metric-revenue"
    },
    {
      title: "Contractors Online",
      value: metrics?.contractorsOnline || 0,
      change: "Live GPS tracking",
      icon: MapPin,
      color: "fire-orange",
      testId: "metric-contractors-online"
    },
    {
      title: "Review Score",
      value: metrics?.reviewScore || "4.9",
      change: "★★★★★ 127 reviews",
      icon: Star,
      color: "fire-warning",
      testId: "metric-review-score"
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in" data-testid="metrics-dashboard">
      {metricCards.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <div key={index} className={`glass-card p-6 rounded-xl border-l-4 border-${metric.color}`} data-testid={metric.testId}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{metric.title}</p>
                <p className="text-3xl font-bold text-white" data-testid={`${metric.testId}-value`}>
                  {metric.value}
                </p>
                <p className={`text-sm text-${metric.color}`}>{metric.change}</p>
              </div>
              <div className={`w-12 h-12 bg-${metric.color}/20 rounded-lg flex items-center justify-center`}>
                <IconComponent className={`text-${metric.color} text-xl`} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
