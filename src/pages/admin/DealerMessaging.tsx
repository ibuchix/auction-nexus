import { useState, useMemo } from "react";
import { MessageSquare, Send, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useDealerMessaging } from "@/hooks/useDealerMessaging";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const DEFAULT_TEMPLATE =
  "Cześć! Mamy nowy pojazd dostępny do licytacji: {car_title}. Sprawdź szczegóły na platformie AUTARO.";

export default function DealerMessaging() {
  const {
    dealers,
    dealersLoading,
    activeCars,
    carsLoading,
    messageHistory,
    historyLoading,
    sendMessage,
  } = useDealerMessaging();

  const [selectedDealerId, setSelectedDealerId] = useState<string>("");
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [messageBody, setMessageBody] = useState(DEFAULT_TEMPLATE);

  const selectedDealer = useMemo(
    () => dealers.find((d) => d.id === selectedDealerId),
    [dealers, selectedDealerId]
  );

  const selectedCar = useMemo(
    () => activeCars.find((c) => c.id === selectedCarId),
    [activeCars, selectedCarId]
  );

  // Auto-fill template when car changes
  const resolvedMessage = useMemo(() => {
    if (!selectedCar) return messageBody;
    const carTitle =
      selectedCar.title ||
      `${selectedCar.make || ""} ${selectedCar.model || ""} ${selectedCar.year || ""}`.trim();
    return messageBody.replace("{car_title}", carTitle);
  }, [messageBody, selectedCar]);

  const handleSend = () => {
    if (!selectedDealer?.phone_number) return;
    sendMessage.mutate({
      dealerId: selectedDealerId,
      phoneNumber: selectedDealer.phone_number,
      messageBody: resolvedMessage,
      carId: selectedCarId || undefined,
    });
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      queued: "secondary",
      sent: "default",
      delivered: "default",
      failed: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Wiadomości WhatsApp do Dealerów</h1>
      </div>

      {/* Send Message Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wyślij wiadomość</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dealer selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Dealer</label>
              {dealersLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedDealerId} onValueChange={setSelectedDealerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz dealera..." />
                  </SelectTrigger>
                  <SelectContent>
                    {dealers.map((dealer) => (
                      <SelectItem key={dealer.id} value={dealer.id}>
                        <span className="flex items-center gap-2">
                          {dealer.dealership_name}
                          {dealer.phone_number && (
                            <span className="text-muted-foreground text-xs">
                              ({dealer.phone_number})
                            </span>
                          )}
                          {!dealer.phone_number && (
                            <span className="text-destructive text-xs">
                              (brak numeru)
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Car selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Pojazd (opcjonalnie)</label>
              {carsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedCarId} onValueChange={setSelectedCarId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz pojazd..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {car.title || `${car.make} ${car.model} ${car.year}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Message body */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Treść wiadomości</label>
            <Textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={4}
              placeholder="Wpisz treść wiadomości..."
              maxLength={1600}
            />
            <p className="text-xs text-muted-foreground">
              {resolvedMessage.length}/1600 znaków. Użyj {"{car_title}"} aby wstawić nazwę pojazdu.
            </p>
          </div>

          {/* Preview */}
          {selectedDealer && (
            <div className="rounded-md border p-3 bg-muted/50 text-sm">
              <p className="font-medium mb-1">Podgląd:</p>
              <p className="flex items-center gap-1 text-muted-foreground">
                <Phone className="h-3 w-3" />
                Do: {selectedDealer.phone_number || "brak numeru"}
              </p>
              <p className="mt-1">{resolvedMessage}</p>
            </div>
          )}

          <Button
            onClick={handleSend}
            disabled={
              !selectedDealerId ||
              !selectedDealer?.phone_number ||
              !resolvedMessage.trim() ||
              sendMessage.isPending
            }
          >
            <Send className="h-4 w-4 mr-2" />
            {sendMessage.isPending ? "Wysyłanie..." : "Wyślij WhatsApp"}
          </Button>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historia wiadomości</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : messageHistory.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Brak wysłanych wiadomości.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Pojazd</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="max-w-[200px]">Wiadomość</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messageHistory.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(new Date(msg.created_at), "dd MMM yyyy HH:mm", {
                          locale: pl,
                        })}
                      </TableCell>
                      <TableCell>
                        {msg.dealers?.dealership_name || "—"}
                      </TableCell>
                      <TableCell className="text-sm">{msg.phone_number}</TableCell>
                      <TableCell className="text-sm">
                        {msg.cars
                          ? msg.cars.title ||
                            `${msg.cars.make || ""} ${msg.cars.model || ""}`.trim()
                          : "—"}
                      </TableCell>
                      <TableCell>{statusBadge(msg.status)}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {msg.message_body}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
