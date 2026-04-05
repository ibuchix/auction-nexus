import { useState, useMemo } from "react";
import { MessageSquare, Send, Phone, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

const TEMPLATE_TEXT =
  "Cześć! Nowy pojazd jest dostępny do licytacji: {{1}}. Sprawdź szczegóły na platformie AUTARO.";

const DEFAULT_FREEFORM =
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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messageBody, setMessageBody] = useState(DEFAULT_FREEFORM);
  const [useTemplate, setUseTemplate] = useState(true);

  const selectedDealer = useMemo(
    () => dealers.find((d) => d.id === selectedDealerId),
    [dealers, selectedDealerId]
  );

  const selectedCar = useMemo(
    () => activeCars.find((c) => c.id === selectedCarId),
    [activeCars, selectedCarId]
  );

  const carTitle = useMemo(() => {
    if (!selectedCar) return "";
    return (
      selectedCar.title ||
      `${selectedCar.make || ""} ${selectedCar.model || ""} ${selectedCar.year || ""}`.trim()
    );
  }, [selectedCar]);

  const resolvedTemplatePreview = useMemo(() => {
    if (!carTitle) return TEMPLATE_TEXT;
    return TEMPLATE_TEXT.replace("{{1}}", carTitle);
  }, [carTitle]);

  const resolvedFreeformMessage = useMemo(() => {
    if (!selectedCar) return messageBody;
    return messageBody.replace("{car_title}", carTitle);
  }, [messageBody, selectedCar, carTitle]);

  const isValidPhone = /^\+\d{7,15}$/.test(phoneNumber);

  const canSend = useMemo(() => {
    if (!selectedDealerId || !isValidPhone || sendMessage.isPending) return false;
    if (useTemplate) return !!selectedCarId;
    return !!resolvedFreeformMessage.trim();
  }, [selectedDealerId, isValidPhone, sendMessage.isPending, useTemplate, selectedCarId, resolvedFreeformMessage]);

  const handleSend = () => {
    if (!canSend) return;

    if (useTemplate) {
      sendMessage.mutate({
        dealerId: selectedDealerId,
        phoneNumber,
        carId: selectedCarId || undefined,
        useTemplate: true,
        contentVariables: { "1": carTitle },
      });
    } else {
      sendMessage.mutate({
        dealerId: selectedDealerId,
        phoneNumber,
        messageBody: resolvedFreeformMessage,
        carId: selectedCarId || undefined,
      });
    }
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
          <CardTitle className="text-lg">Send Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="use-template"
              checked={useTemplate}
              onCheckedChange={setUseTemplate}
            />
            <Label htmlFor="use-template" className="text-sm font-medium">
              Use approved template
            </Label>
            {useTemplate && (
              <Badge variant="secondary" className="text-xs">Recommended</Badge>
            )}
          </div>

          {!useTemplate && (
            <div className="flex items-start gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Free-form messages only work within 24h of the dealer messaging you first. Use the approved template for reliable delivery.
              </span>
            </div>
          )}

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
                <p className="text-xs text-destructive">Format: +48XXXXXXXXX</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Vehicle {useTemplate ? "(required)" : "(optional)"}
            </label>
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

          {/* Template mode: read-only preview */}
          {useTemplate ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Template Preview</label>
              <div className="rounded-md border bg-muted/50 p-3 text-sm">
                {resolvedTemplatePreview}
              </div>
            </div>
          ) : (
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
                {resolvedFreeformMessage.length}/1600 characters. Use {"{car_title}"} to insert the vehicle name.
              </p>
            </div>
          )}

          {selectedDealer && phoneNumber && (
            <div className="rounded-md border p-3 bg-muted/50 text-sm">
              <p className="font-medium mb-1">Preview:</p>
              <p className="flex items-center gap-1 text-muted-foreground">
                <Phone className="h-3 w-3" />
                To: {phoneNumber} ({selectedDealer.dealership_name})
              </p>
              <p className="mt-1">
                {useTemplate ? resolvedTemplatePreview : resolvedFreeformMessage}
              </p>
            </div>
          )}

          <Button onClick={handleSend} disabled={!canSend}>
            <Send className="h-4 w-4 mr-2" />
            {sendMessage.isPending ? "Sending..." : useTemplate ? "Send Template" : "Send WhatsApp"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Message History</CardTitle>
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
              No messages sent.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="max-w-[200px]">Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messageHistory.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(new Date(msg.created_at), "dd MMM yyyy HH:mm")}
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
