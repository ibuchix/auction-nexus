
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, Gavel, Activity, MessageSquare, TrendingUp,
  Megaphone, Settings, FileText, LogIn, ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
      description: "View user activity and system logs",
      icon: LogIn,
      path: "/admin/audit-logs",
      iconColor: "text-gray-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
