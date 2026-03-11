import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ElementType;
  description: string;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  trend, 
  trendUp, 
  icon: Icon,
  description,
  color = "blue"
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  }[color] || "bg-blue-50 text-blue-600";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses}`}>
          <Icon size={24} />
        </div>
      </div>
      {(trend) && (
        <div className="flex items-center">
          <span className={`text-sm font-medium ${trendUp ? 'text-emerald-600' : 'text-red-500'} flex items-center`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-xs text-slate-400 ml-2">{description}</span>
        </div>
      )}
    </div>
  );
};