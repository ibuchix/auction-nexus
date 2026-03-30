import { useState, useMemo } from "react";
import { MessageSquare, Send, Phone, TestTube2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    testConnector,
  } = useDealerMessaging();

  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  const [selectedDealerId, setSelectedDealerId] = useState<string>("");
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messageBody, setMessageBody] = useState(DEFAULT_TEMPLATE);

  const selectedDealer = useMemo(
    () => dealers.find((d) => d.id === selectedDealerId),
    [dealers, selectedDealerId]
  );

  const selectedCar = useMemo(
    () => activeCars.find((c) => c.id === selectedCarId),
    [activeCars, selectedCarId]
  );

  const resolvedMessage = useMemo(() => {
    if (!selectedCar) return messageBody;
    const carTitle =
      selectedCar.title ||
      `${selectedCar.make || ""} ${selectedCar.model || ""} ${selectedCar.year || ""}`.trim();
    return messageBody.replace("{car_title}", carTitle);
  }, [messageBody, selectedCar]);

  const isValidPhone = /^\+\d{7,15}$/.test(phoneNumber);

  const handleSend = () => {
    if (!selectedDealerId || !isValidPhone) return;
    sendMessage.mutate({
      dealerId: selectedDealerId,
      phoneNumber,
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
        <h1 className="text-2xl font-bold">WhatsApp Messages to Dealers</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TestTube2 className="h-5 w-5" />
            Twilio Connection Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Check if the Twilio connector gateway is properly configured.
          </p>
          <Button
            variant="outline"
            onClick={async () => {
              setDiagnosticResult(null);
              try {
                const result = await testConnector.mutateAsync();
                setDiagnosticResult(JSON.stringify(result, null, 2));
              } catch (err: unknown) {
                setDiagnosticResult(
                  `Error: ${err instanceof Error ? err.message : String(err)}`
                );
              }
            }}
            disabled={testConnector.isPending}
          >
            <TestTube2 className="h-4 w-4 mr-2" />
            {testConnector.isPending ? "Testing..." : "Test Twilio Connection"}
          </Button>
          {diagnosticResult && (
            <pre className="mt-2 p-3 rounded-md bg-muted text-xs overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
              {diagnosticResult}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Send Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dealer</label>

              {dealersLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedDealerId} onValueChange={setSelectedDealerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dealer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {dealers.map((dealer) => (
                      <SelectItem key={dealer.id} value={dealer.id}>
                        {dealer.dealership_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number (E.164)</label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+48123456789"
              />
              {phoneNumber && !isValidPhone && (
                <p className="text-xs text-destructive">
                  Format: +48XXXXXXXXX
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Vehicle (optional)</label>
            {carsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedCarId} onValueChange={setSelectedCarId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle..." />
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Message Body</label>
            <Textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={4}
              placeholder="Enter message body..."
              maxLength={1600}
            />
            <p className="text-xs text-muted-foreground">
              {resolvedMessage.length}/1600 znaków. Użyj {"{car_title}"} aby wstawić nazwę pojazdu.
            </p>
          </div>

          {selectedDealer && phoneNumber && (
            <div className="rounded-md border p-3 bg-muted/50 text-sm">
              <p className="font-medium mb-1">Podgląd:</p>
              <p className="flex items-center gap-1 text-muted-foreground">
                <Phone className="h-3 w-3" />
                Do: {phoneNumber} ({selectedDealer.dealership_name})
              </p>
              <p className="mt-1">{resolvedMessage}</p>
            </div>
          )}

          <Button
            onClick={handleSend}
            disabled={
              !selectedDealerId ||
              !isValidPhone ||
              !resolvedMessage.trim() ||
              sendMessage.isPending
            }
          >
            <Send className="h-4 w-4 mr-2" />
            {sendMessage.isPending ? "Wysyłanie..." : "Wyślij WhatsApp"}
          </Button>
        </CardContent>
      </Card>

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
