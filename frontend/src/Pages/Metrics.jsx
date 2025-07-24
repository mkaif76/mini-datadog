import React, { useState, useEffect, useCallback } from 'react';
// NEW: Import AreaChart and Area for the gradient effect
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, CartesianGrid } from 'recharts';
import { RefreshCw } from 'lucide-react';

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Define a color palette for our charts
const LEVEL_COLORS = {
  error: '#EF4444', // Red
  warn: '#F59E0B',  // Amber
  info: '#3B82F6',  // Blue
  debug: '#10B981' // Emerald
};

// A reusable component for our dashboard cards
const ChartCard = ({ title, children }) => (
  <div className="bg-secondary-dark p-6 rounded-xl shadow-md">
    <h3 className="text-lg font-semibold text-text-main mb-4">{title}</h3>
    <div style={{ width: '100%', height: 300 }}>
      {children}
    </div>
  </div>
);

function Metrics() {
  const [metricsData, setMetricsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/metrics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const transformedData = {
        logsByLevel: data.logs_by_level.buckets.map(bucket => ({
          name: bucket.key,
          value: bucket.doc_count,
          color: LEVEL_COLORS[bucket.key] || '#6B7280'
        })),
        logsByService: data.logs_by_service.buckets.map(bucket => ({
          name: bucket.key,
          count: bucket.doc_count,
        })),
        logsOverTime: data.logs_over_time.buckets.map(bucket => ({
          time: new Date(bucket.key).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          count: bucket.doc_count,
        })),
      };
      setMetricsData(transformedData);

    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (isLoading && !metricsData) {
    return (
      <div className="flex justify-center items-center p-8 min-h-[80vh]">
        <div className="w-16 h-16 border-4 border-accent-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!metricsData) {
    return <div className="text-center text-text-secondary">Failed to load metrics data.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cyan">Metrics Dashboard</h2>
        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="flex items-center px-4 py-2 rounded-md text-text-secondary bg-secondary-dark hover:bg-border-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logs by Level Pie Chart */}
        <ChartCard title="Logs by Level">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={metricsData.logsByLevel} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {metricsData.logsByLevel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem'}}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Services Bar Chart */}
        <ChartCard title="Top 5 Services by Log Volume">
          <ResponsiveContainer>
            <BarChart data={metricsData.logsByService} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={120} tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: 'rgba(139, 92, 246, 0.1)'}} contentStyle={{backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem'}} />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* UPDATED: Logs Over Time Area Chart */}
        <div className="lg:col-span-2">
          <ChartCard title="Log Volume Over Time (Last 24h)">
            <ResponsiveContainer>
              {/* We now use AreaChart instead of LineChart */}
              <AreaChart data={metricsData.logsOverTime}>
                {/* This defines the gradient fill */}
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                {/* This adds the cool dashed grid */}
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <Tooltip contentStyle={{backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem'}} />
                <Legend />
                
                {/* The Area component draws the filled gradient */}
                <Area type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

export default Metrics;