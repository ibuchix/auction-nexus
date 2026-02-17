import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Star, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UnifiedReview {
  id: string;
  reviewType: "seller" | "dealer";
  reviewerName: string | null;
  carTitle: string | null;
  rating: number;
  reviewText: string;
  status: string;
  createdAt: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const [sellerRes, dealerRes] = await Promise.all([
        supabase.from("seller_reviews").select("*").order("created_at", { ascending: false }),
        supabase.from("dealer_reviews").select("*").order("created_at", { ascending: false }),
      ]);

      if (sellerRes.error) throw sellerRes.error;
      if (dealerRes.error) throw dealerRes.error;

      const sellerReviews: UnifiedReview[] = (sellerRes.data || []).map((r: any) => ({
        id: r.id,
        reviewType: "seller" as const,
        reviewerName: r.seller_name,
        carTitle: r.car_title,
        rating: r.rating,
        reviewText: r.review_text,
        status: r.status,
        createdAt: r.created_at,
      }));

      const dealerReviews: UnifiedReview[] = (dealerRes.data || []).map((r: any) => ({
        id: r.id,
        reviewType: "dealer" as const,
        reviewerName: r.dealer_name,
        carTitle: r.car_title,
        rating: r.rating,
        reviewText: r.review_text,
        status: r.status,
        createdAt: r.created_at,
      }));

      return [...sellerReviews, ...dealerReviews].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ reviewId, reviewType, newStatus }: { reviewId: string; reviewType: string; newStatus: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-api", {
        body: { action: "manageReview", params: { reviewId, reviewType, newStatus } },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to update review");
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Review ${variables.newStatus} successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update review");
    },
  });

  const pending = reviews.filter((r) => r.status === "pending");
  const approved = reviews.filter((r) => r.status === "approved");
  const rejected = reviews.filter((r) => r.status === "rejected");

  const renderReviewCard = (review: UnifiedReview, showActions: boolean) => (
    <Card key={`${review.reviewType}-${review.id}`} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={review.reviewType === "seller" ? "default" : "secondary"}>
              {review.reviewType === "seller" ? "Seller Review" : "Dealer Review"}
            </Badge>
            <StarRating rating={review.rating} />
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
        <CardTitle className="text-base mt-1">
          {review.reviewerName || "Anonymous"} — {review.carTitle || "Unknown Vehicle"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{review.reviewText}</p>
        {showActions && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({ reviewId: review.id, reviewType: review.reviewType, newStatus: "approved" })}
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Approve
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={mutation.isPending}>
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject this review?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reject the {review.reviewType} review by {review.reviewerName || "Anonymous"}.
                    The review will no longer be visible to the public.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => mutation.mutate({ reviewId: review.id, reviewType: review.reviewType, newStatus: "rejected" })}
                  >
                    Reject
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Management</h1>
        <p className="text-muted-foreground">Approve or decline seller and dealer reviews</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : pending.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pending reviews</p>
          ) : (
            pending.map((r) => renderReviewCard(r, true))
          )}
        </TabsContent>

        <TabsContent value="approved">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : approved.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No approved reviews</p>
          ) : (
            approved.map((r) => renderReviewCard(r, false))
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : rejected.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No rejected reviews</p>
          ) : (
            rejected.map((r) => renderReviewCard(r, false))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
