import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui/select";
import { Badge } from "@/components/ui/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { cn } from "@/lib/utils";
import type { ClassMetrics } from "@/types/evaluation";

interface ClassPerformanceTableProps {
  data: ClassMetrics[];
}

type SortField = "f1_score" | "precision" | "recall" | "tp" | "fp" | "fn";

const getMetricBadgeVariant = (value: number): "default" | "secondary" | "destructive" => {
  if (value >= 0.8) return "default";
  if (value >= 0.6) return "secondary";
  return "destructive";
};

export const ClassPerformanceTable = ({ data }: ClassPerformanceTableProps) => {
  const [sortField, setSortField] = useState<SortField>("f1_score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterClass, setFilterClass] = useState<string>("all");

  const sortedData = [...data]
    .filter((item) => filterClass === "all" || item.class_name === filterClass)
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 -ml-2"
      onClick={() => handleSort(field)}
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="f1_score">F1 Score</SelectItem>
              <SelectItem value="precision">Precision</SelectItem>
              <SelectItem value="recall">Recall</SelectItem>
              <SelectItem value="tp">True Positives</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {data.map((item) => (
                <SelectItem key={item.class_id} value={item.class_name}>
                  {item.class_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Class</TableHead>
              <TableHead>
                <SortButton field="precision" label="Precision" />
              </TableHead>
              <TableHead>
                <SortButton field="recall" label="Recall" />
              </TableHead>
              <TableHead>
                <SortButton field="f1_score" label="F1" />
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="tp" label="TP" />
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="fp" label="FP" />
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="fn" label="FN" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.class_id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.class_name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getMetricBadgeVariant(item.precision)}>
                    {(item.precision * 100).toFixed(0)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getMetricBadgeVariant(item.recall)}>
                    {(item.recall * 100).toFixed(0)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getMetricBadgeVariant(item.f1_score)}>
                    {(item.f1_score * 100).toFixed(0)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {item.tp}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    {item.fp}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                    {item.fn}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
