export interface AnalyticsHeaderProps {
  title: string;
  subtitle: string;
  metrics: {
    totalAuctions: number;
    totalValue: number;
    averagePrice: number;
  };
}
