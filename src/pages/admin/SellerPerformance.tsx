
import { useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SellerPerformanceMetrics } from "@/components/admin/sellers/SellerPerformanceMetrics";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellerPerformance() {
  const { sellerId } = useParams<{ sellerId: string }>();
  
  const { data: seller, isLoading } = useQuery({
    queryKey: ['sellerDetails', sellerId],
    queryFn: async () => {
      if (!sellerId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*, sellers(*)')
        .eq('id', sellerId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!sellerId,
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          {isLoading ? (
            <Skeleton className="h-10 w-64 mb-2" />
          ) : (
            <h1 className="text-3xl font-bold">
              {seller?.full_name || (seller?.sellers && seller.sellers[0]?.full_name) || "Seller"} Performance
            </h1>
          )}
          <p className="text-muted-foreground">
            Detailed metrics and performance analysis
          </p>
        </div>

        {sellerId ? (
          <SellerPerformanceMetrics sellerId={sellerId} />
        ) : (
          <p>Select a seller to view performance metrics</p>
        )}
      </div>
    </DashboardLayout>
  );
}
