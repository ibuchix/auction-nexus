import { useState, useMemo, useCallback } from "react";
import { MessageSquare, Send, AlertTriangle, CheckSquare, Square, Users, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
import { useDealerMessaging, DealerWithPhone } from "@/hooks/useDealerMessaging";
import { format } from "date-fns";

const TEMPLATE_TEXT =
  "Cześć! Nowy pojazd jest dostępny do licytacji. Sprawdź szczegóły na platformie AUTARO. https://aukcja.autaro.pl";

const DEFAULT_FREEFORM =
  "Cześć! Mamy nowy pojazd dostępny do licytacji. Sprawdź szczegóły na platformie AUTARO.";

export default function DealerMessaging() {
  const {
    dealersWithPhones,
    dealersLoading,
    activeCars,
    carsLoading,
    messageHistory,
    historyLoading,
    sendBulkMessages,
    bulkProgress,
  } = useDealerMessaging();

  const [selectedDealerIds, setSelectedDealerIds] = useState<Set<string>>(new Set());
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [messageBody, setMessageBody] = useState(DEFAULT_FREEFORM);
  const [useTemplate, setUseTemplate] = useState(true);
  const [overridePhone, setOverridePhone] = useState("");

  const dealersWithValidPhone = useMemo(
    () => dealersWithPhones.filter((d): d is DealerWithPhone & { phone: string } => !!d.phone),
    [dealersWithPhones]
  );

  const dealersWithoutPhone = useMemo(
    () => dealersWithPhones.filter((d) => !d.phone),
    [dealersWithPhones]
  );

  // When override phone is set, all dealers are selectable
  const selectableDealers = useMemo(
    () => overridePhone.trim() ? dealersWithPhones : dealersWithValidPhone,
    [dealersWithPhones, dealersWithValidPhone, overridePhone]
  );

  const selectedDealers = useMemo(
    () => selectableDealers.filter((d) => selectedDealerIds.has(d.id)),
    [selectableDealers, selectedDealerIds]
  );

  const toggleDealer = useCallback((dealerId: string) => {
    setSelectedDealerIds((prev) => {
      const next = new Set(prev);
      if (next.has(dealerId)) {
        next.delete(dealerId);
      } else {
        next.add(dealerId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedDealerIds(new Set(dealersWithValidPhone.map((d) => d.id)));
  }, [dealersWithValidPhone]);

  const deselectAll = useCallback(() => {
    setSelectedDealerIds(new Set());
  }, []);

  const canSend = useMemo(() => {
    if (selectedDealers.length === 0 || bulkProgress.inProgress) return false;
    if (!useTemplate && !messageBody.trim()) return false;
    return true;
  }, [selectedDealers.length, bulkProgress.inProgress, useTemplate, messageBody]);

  const handleSend = () => {
    if (!canSend) return;

    const recipients = selectedDealers.map((d) => ({
      dealerId: d.id,
      phoneNumber: d.phone,
    }));

    if (useTemplate) {
      sendBulkMessages(recipients, {
        carId: selectedCarId || undefined,
        useTemplate: true,
      });
    } else {
      sendBulkMessages(recipients, {
        messageBody,
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

  const progressPercent = bulkProgress.total > 0
    ? ((bulkProgress.sent + bulkProgress.failed) / bulkProgress.total) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">WhatsApp — wiadomości do dealerów</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wyślij wiadomość</CardTitle>
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
              Użyj zatwierdzonego szablonu
            </Label>
            {useTemplate && (
              <Badge variant="secondary" className="text-xs">Zalecane</Badge>
            )}
          </div>

          {!useTemplate && (
            <div className="flex items-start gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Wiadomości dowolne działają tylko w ciągu 24h od ostatniej wiadomości dealera do Ciebie. Użyj szablonu dla niezawodnej dostawy.
              </span>
            </div>
          )}

          {/* Dealer multi-select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Dealerzy ({selectedDealers.length} / {dealersWithValidPhone.length} wybranych)
              </label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll} disabled={dealersLoading}>
                  <CheckSquare className="h-3 w-3 mr-1" />
                  Zaznacz wszystkich
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll} disabled={dealersLoading}>
                  <Square className="h-3 w-3 mr-1" />
                  Odznacz
                </Button>
              </div>
            </div>

            {dealersLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : dealersWithValidPhone.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Brak zweryfikowanych dealerów z numerem telefonu.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto rounded-md border">
                {dealersWithValidPhone.map((dealer) => (
                  <label
                    key={dealer.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                  >
                    <Checkbox
                      checked={selectedDealerIds.has(dealer.id)}
                      onCheckedChange={() => toggleDealer(dealer.id)}
                    />
                    <span className="text-sm font-medium flex-1">{dealer.dealership_name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{dealer.phone}</span>
                  </label>
                ))}
              </div>
            )}

            {dealersWithoutPhone.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {dealersWithoutPhone.length} dealer(ów) bez numeru telefonu — nie można wysłać.
              </p>
            )}
          </div>

          {/* Vehicle selector (optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Pojazd (opcjonalnie — do logowania)</label>
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

          {/* Template preview or free-form */}
          {useTemplate ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Podgląd szablonu</label>
              <div className="rounded-md border bg-muted/50 p-3 text-sm">
                {TEMPLATE_TEXT}
              </div>
            </div>
          ) : (
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
                {messageBody.length}/1600 znaków.
              </p>
            </div>
          )}

          {/* Send summary */}
          {selectedDealers.length > 0 && (
            <div className="rounded-md border p-3 bg-muted/50 text-sm space-y-1">
              <p className="font-medium">
                Wysyłanie do {selectedDealers.length} dealer(ów):
              </p>
              <div className="max-h-24 overflow-y-auto">
                {selectedDealers.map((d) => (
                  <p key={d.id} className="text-muted-foreground text-xs">
                    {d.dealership_name} — {d.phone}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Bulk progress */}
          {bulkProgress.inProgress && (
            <div className="space-y-2">
              <Progress value={progressPercent} />
              <p className="text-sm text-muted-foreground">
                Wysłano {bulkProgress.sent} / {bulkProgress.total}
                {bulkProgress.failed > 0 && `, błędy: ${bulkProgress.failed}`}
              </p>
            </div>
          )}

          <Button onClick={handleSend} disabled={!canSend}>
            <Send className="h-4 w-4 mr-2" />
            {bulkProgress.inProgress
              ? `Wysyłanie (${bulkProgress.sent + bulkProgress.failed}/${bulkProgress.total})...`
              : useTemplate
                ? `Wyślij szablon (${selectedDealers.length})`
                : `Wyślij WhatsApp (${selectedDealers.length})`}
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
