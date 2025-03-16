
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

interface SummaryTableProps {
  data: any[];
}

export function SummaryTable({ data }: SummaryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Summary</CardTitle>
        <CardDescription>Detailed view of auction performance by day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Total Auctions</th>
                <th className="py-3 px-4 text-left">Sold</th>
                <th className="py-3 px-4 text-left">Unsold</th>
                <th className="py-3 px-4 text-left">Total Value</th>
                <th className="py-3 px-4 text-left">Avg. Sale Price</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((summary) => (
                <tr key={summary.date} className="border-b">
                  <td className="py-3 px-4">{format(new Date(summary.date), "PP")}</td>
                  <td className="py-3 px-4">{summary.total_auctions_closed}</td>
                  <td className="py-3 px-4">{summary.sold_vehicles}</td>
                  <td className="py-3 px-4">{summary.unsold_vehicles}</td>
                  <td className="py-3 px-4">${summary.total_value.toLocaleString()}</td>
                  <td className="py-3 px-4">${summary.average_sale_price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
