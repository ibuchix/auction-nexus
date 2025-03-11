import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, Gavel, Activity, MessageSquare, TrendingUp,
  Megaphone, FileText, ArrowRight, History 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  iconColor?: string;
}

function AdminCard({ title, description, icon: Icon, path, iconColor = "text-primary" }: AdminCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <Icon className={`h-6 w-6 ${iconColor} transition-transform group-hover:scale-110`} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
          <Button 
            variant="outline" 
            className="w-full group"
            onClick={() => navigate(path)}
          >
            View {title}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AuditLogStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["auditLogStats"],
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      
      return {
        todayCount: Math.floor(Math.random() * 50),
        totalCount: Math.floor(Math.random() * 1000)
      };
    },
    refetchInterval: 300000 // Refetch every 5 minutes
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Today</span>
        <span className="font-medium text-lg">{data?.todayCount || 0}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="font-medium text-lg">{data?.totalCount || 0}</span>
      </div>
    </div>
  );
}

export function AdminCardGrid() {
  const adminCards = [
    {
      title: "Auction Monitoring",
      description: "Monitor active auctions and their performance",
      icon: Gavel,
      path: "/admin/auctions/monitor",
      iconColor: "text-primary"
    },
    {
      title: "Dispute Resolution",
      description: "Handle user disputes and claims",
      icon: MessageSquare,
      path: "/admin/disputes",
      iconColor: "text-yellow-500"
    },
    {
      title: "Analytics",
      description: "View auction performance metrics",
      icon: TrendingUp,
      path: "/admin/analytics",
      iconColor: "text-green-500"
    },
    {
      title: "Announcements",
      description: "Manage system-wide announcements",
      icon: Megaphone,
      path: "/admin/announcements",
      iconColor: "text-blue-500"
    },
    {
      title: "Fraud Detection",
      description: "Monitor and manage suspicious activities",
      icon: ShieldCheck,
      path: "/admin/fraud",
      iconColor: "text-red-500"
    },
    {
      title: "Compliance",
      description: "Access compliance reports and tools",
      icon: FileText,
      path: "/admin/compliance",
      iconColor: "text-primary"
    },
    {
      title: "Audit Logs",
      description: "View system activity and user actions",
      icon: History,
      path: "/admin/audit-logs",
      iconColor: "text-gray-500"
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {adminCards.map((card) => (
        <AdminCard
          key={card.title}
          title={card.title}
          description={card.description}
          icon={card.icon}
          path={card.path}
          iconColor={card.iconColor}
        />
      ))}
    </div>
  );
}
