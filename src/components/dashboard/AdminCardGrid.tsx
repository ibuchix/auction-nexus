
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gavel, TrendingUp,
  FileText, ArrowRight, Users
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
    <Card className="hover:shadow-md transition-all duration-300 group h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${iconColor} transition-transform group-hover:scale-110`} />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
          <Button 
            variant="outline" 
            size="sm"
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
      title: "Analytics",
      description: "View auction performance metrics",
      icon: TrendingUp,
      path: "/admin/analytics",
      iconColor: "text-green-500"
    },
    {
      title: "User Management",
      description: "Manage user accounts and roles",
      icon: Users,
      path: "/admin/users",
      iconColor: "text-indigo-500"
    },
    {
      title: "Compliance",
      description: "Access compliance reports and tools",
      icon: FileText,
      path: "/admin/compliance",
      iconColor: "text-purple-500"
    },
    {
      title: "Dealer Verification",
      description: "Review and approve dealer registrations",
      icon: Users,
      path: "/admin/dealers/verification",
      iconColor: "text-amber-500"
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
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
