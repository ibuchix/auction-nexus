import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface EditFormProps {
  price: string;
  notes: string;
  onPriceChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSave: () => void;
}

export function EditForm({
  price,
  notes,
  onPriceChange,
  onNotesChange,
  onSave
}: EditFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Price</label>
        <Input
          type="number"
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Notes</label>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="mt-1"
        />
      </div>
      <Button onClick={onSave}>Save Changes</Button>
    </div>
  );
}