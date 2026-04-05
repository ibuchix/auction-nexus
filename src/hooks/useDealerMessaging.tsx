import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DealerWithPhone {
  id: string;
  dealership_name: string;
  user_id: string;
  phone: string | null;
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

export interface BulkSendProgress {
  total: number;
  sent: number;
  failed: number;
  inProgress: boolean;
}

export function useDealerMessaging() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bulkProgress, setBulkProgress] = useState<BulkSendProgress>({
    total: 0,
    sent: 0,
    failed: 0,
    inProgress: false,
  });

  const { data: dealersWithPhones = [], isLoading: dealersLoading } = useQuery({
    queryKey: ["dealers-with-phones"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-dealers-with-phones");
      if (error) throw error;
      if (!data?.dealers) throw new Error("Failed to fetch dealers");
      return data.dealers as DealerWithPhone[];
    },
  });

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

  const sendSingleMessage = async ({
    dealerId,
    phoneNumber,
    messageBody,
    carId,
    useTemplate,
    contentVariables,
  }: {
    dealerId: string;
    phoneNumber: string;
    messageBody?: string;
    carId?: string;
    useTemplate?: boolean;
    contentVariables?: Record<string, string>;
  }) => {
    const { data, error } = await supabase.functions.invoke("send-whatsapp", {
      body: { dealerId, phoneNumber, messageBody, carId, useTemplate, contentVariables },
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error || "Failed to send message");
    return data;
  };

  const sendBulkMessages = async (
    recipients: { dealerId: string; phoneNumber: string }[],
    options: {
      messageBody?: string;
      carId?: string;
      useTemplate?: boolean;
      contentVariables?: Record<string, string>;
    }
  ) => {
    setBulkProgress({
      total: recipients.length,
      sent: 0,
      failed: 0,
      inProgress: true,
    });

    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        await sendSingleMessage({
          dealerId: recipient.dealerId,
          phoneNumber: recipient.phoneNumber,
          ...options,
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${recipient.phoneNumber}:`, err);
        failed++;
      }
      setBulkProgress({ total: recipients.length, sent, failed, inProgress: true });
    }

    setBulkProgress({ total: recipients.length, sent, failed, inProgress: false });

    queryClient.invalidateQueries({ queryKey: ["whatsapp-message-history"] });

    if (failed === 0) {
      toast({
        title: "Wszystkie wiadomości wysłane",
        description: `Wysłano ${sent} wiadomości WhatsApp.`,
      });
    } else {
      toast({
        title: "Wysyłanie zakończone",
        description: `Wysłano: ${sent}, błędy: ${failed} z ${recipients.length}`,
        variant: failed === recipients.length ? "destructive" : "default",
      });
    }
  };

  return {
    dealersWithPhones,
    dealersLoading,
    activeCars,
    carsLoading,
    messageHistory,
    historyLoading,
    sendBulkMessages,
    bulkProgress,
  };
}
