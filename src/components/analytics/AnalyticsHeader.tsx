
import React from 'react';

export interface AnalyticsHeaderProps {
  title: string;
  subtitle: string;
  metrics: {
    totalAuctions: number;
    totalValue: number;
    averagePrice: number;
  };
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ 
  title, 
  subtitle, 
  metrics 
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mb-4">{subtitle}</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Total Auctions</h3>
          <p className="text-2xl font-bold">{metrics.totalAuctions}</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
          <p className="text-2xl font-bold">${metrics.totalValue.toLocaleString()}</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Average Price</h3>
          <p className="text-2xl font-bold">${metrics.averagePrice.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};
