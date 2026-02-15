import { ActivityLogEntry } from '@/types/auto-annotate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Badge } from '@/components/ui/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/ui/table';
import { ScrollText } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  entries: ActivityLogEntry[];
}

export function ActivityLog({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No activity log entries yet.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ScrollText className="h-4 w-4" /> Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">Images</TableHead>
              <TableHead className="text-right">Annotations</TableHead>
              <TableHead className="text-right">Success</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-xs">
                  {format(new Date(entry.date), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell className="text-xs">{entry.user}</TableCell>
                <TableCell className="text-xs">{entry.modelName}</TableCell>
                <TableCell className="text-right text-xs">{entry.imageCount}</TableCell>
                <TableCell className="text-right text-xs">{entry.annotationsCreated}</TableCell>
                <TableCell className="text-right text-xs">{entry.successRate}%</TableCell>
                <TableCell>
                  <Badge
                    variant={entry.status === 'completed' ? 'default' : 'destructive'}
                    className={`text-[10px] ${entry.status === 'completed' ? 'bg-emerald-500' : ''}`}
                  >
                    {entry.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
