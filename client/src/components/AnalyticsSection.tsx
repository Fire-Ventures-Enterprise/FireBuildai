import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

interface RevenueData {
  months: string[];
  revenue: number[];
  growth: number;
  totalRevenue: number;
  completedJobs: number;
}

interface TeamMember {
  id: string;
  name: string;
  profileImageUrl?: string;
  role: string;
  rating: number;
  reviews: number;
  monthlyRevenue: number;
  growthPercentage: number;
  isTopPerformer: boolean;
}

export default function AnalyticsSection() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  const { data: revenueData } = useQuery<RevenueData>({
    queryKey: ["/api/analytics/revenue"],
  });

  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team/performance"],
  });

  useEffect(() => {
    if (chartRef.current && revenueData && typeof window !== 'undefined') {
      import('chart.js/auto').then((Chart) => {
        const ctx = chartRef.current?.getContext('2d');
        if (!ctx) return;

        // Destroy existing chart
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        chartInstanceRef.current = new Chart.default(ctx, {
          type: 'line',
          data: {
            labels: revenueData.months,
            datasets: [{
              label: 'Revenue',
              data: revenueData.revenue,
              borderColor: '#1a73e8',
              backgroundColor: 'rgba(26, 115, 232, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: '#9ca3af',
                  callback: function(value) {
                    return '$' + (value as number).toLocaleString();
                  }
                }
              },
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: '#9ca3af'
                }
              }
            }
          }
        });
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [revenueData]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-testid="analytics-section">
      {/* Revenue Analytics Chart */}
      <div className="glass-card p-6 rounded-xl" data-testid="revenue-analytics-panel">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Revenue Analytics</h3>
          <select className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-600" data-testid="select-time-period">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last year</option>
          </select>
        </div>
        
        {/* Chart Container */}
        <div className="h-64 bg-gray-800/30 rounded-lg flex items-center justify-center mb-4" data-testid="revenue-chart-container">
          <canvas ref={chartRef} className="max-h-full" data-testid="revenue-chart"></canvas>
        </div>
        
        {/* Chart Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div data-testid="stat-revenue-growth">
            <p className="text-2xl font-bold text-fire-success">
              +{revenueData?.growth || 23}%
            </p>
            <p className="text-xs text-gray-400">Revenue Growth</p>
          </div>
          <div data-testid="stat-total-revenue">
            <p className="text-2xl font-bold text-fire-blue">
              ${(revenueData?.totalRevenue || 156000).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">Total Revenue</p>
          </div>
          <div data-testid="stat-completed-jobs">
            <p className="text-2xl font-bold text-fire-orange">
              {revenueData?.completedJobs || 42}
            </p>
            <p className="text-xs text-gray-400">Completed Jobs</p>
          </div>
        </div>
      </div>
      
      {/* Team Performance */}
      <div className="glass-card p-6 rounded-xl" data-testid="team-performance-panel">
        <h3 className="text-xl font-semibold text-white mb-6">Team Performance</h3>
        
        <div className="space-y-4">
          {teamMembers?.map((member, index) => (
            <div 
              key={member.id} 
              className={`flex items-center justify-between p-4 rounded-lg ${
                member.isTopPerformer 
                  ? 'bg-gradient-to-r from-fire-success/10 to-fire-blue/10 border border-fire-success/20' 
                  : 'bg-gray-800/50'
              }`}
              data-testid={`team-member-${member.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {member.profileImageUrl ? (
                    <img 
                      src={member.profileImageUrl} 
                      alt={member.name} 
                      className="w-12 h-12 rounded-full object-cover" 
                      data-testid={`img-team-member-${member.id}`}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  {member.isTopPerformer && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                      <i className="fas fa-crown text-xs text-gray-900"></i>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-white" data-testid={`text-team-member-name-${member.id}`}>
                    {member.name}
                  </p>
                  <div className="flex items-center text-xs text-gray-400" data-testid={`text-team-member-stats-${member.id}`}>
                    <span>{member.rating} ★</span>
                    <span className="mx-2">•</span>
                    <span>{member.reviews} reviews</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-fire-success" data-testid={`text-team-member-revenue-${member.id}`}>
                  ${member.monthlyRevenue.toLocaleString()}
                </p>
                <p className={`text-xs ${member.growthPercentage > 0 ? 'text-fire-success' : 'text-fire-orange'}`} data-testid={`text-team-member-growth-${member.id}`}>
                  {member.growthPercentage > 0 ? '+' : ''}{member.growthPercentage}% this month
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
