import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VerifiedDealer {
  id: string;
  dealership_name: string;
  user_id: string;
}

export interface MessageLogEntry {
  id: string;
  dealer_id: string;
  car_id: string | null;
  phone_number: string;
  message_body: string;
  twilio_message_sid: string | null;
  status: string;
  error_message: string | null;
  sent_by: string | null;
  created_at: string;
  dealers?: { dealership_name: string } | null;
  cars?: { title: string | null; make: string | null; model: string | null; year: number | null } | null;
}

export function useDealerMessaging() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch verified dealers with phone from profiles
  const { data: dealers = [], isLoading: dealersLoading } = useQuery({
    queryKey: ["verified-dealers-messaging"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dealers")
        .select("id, dealership_name, user_id")
        .eq("is_verified", true)
        .order("dealership_name");

      if (error) throw error;
      return data as VerifiedDealer[];
    },
  });

  // Fetch active auction cars
  const { data: activeCars = [], isLoading: carsLoading } = useQuery({
    queryKey: ["active-auction-cars-messaging"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("id, title, make, model, year")
        .eq("is_auction", true)
        .in("auction_status", ["active", "scheduled"])
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  // Fetch message history
  const { data: messageHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["whatsapp-message-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_message_log")
        .select("*, dealers(dealership_name), cars(title, make, model, year)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as MessageLogEntry[];
    },
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({
      dealerId,
      phoneNumber,
      messageBody,
      carId,
    }: {
      dealerId: string;
      phoneNumber: string;
      messageBody: string;
      carId?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("send-whatsapp", {
        body: { dealerId, phoneNumber, messageBody, carId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to send message");
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "WhatsApp was sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-message-history"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Send error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Diagnostic: test Twilio connector
  const testConnector = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("debug-twilio");
      if (error) throw error;
      return data;
    },
  });

  return {
    dealers,
    dealersLoading,
    activeCars,
    carsLoading,
    messageHistory,
    historyLoading,
    sendMessage,
    testConnector,
  };
}
