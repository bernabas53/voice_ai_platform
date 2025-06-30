import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { frappeApi } from '../../../../src/lib/frappeApi'; // Adjust path as needed

interface CallLog {
  name: string;
  caller_name?: string;
  phone_number?: string;
  intent?: string;
  summary?: string;
  status?: string;
}

export default function RecentOrders() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    frappeApi
      .getCallLogs()
      .then((logs: unknown[]) => {
        setCallLogs(logs as CallLog[]);
      })
      .catch(() => {
        setError("Failed to load call logs");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const statusColor = (status?: string) => {
    switch (status) {
      case "Lead":
        return "warning";
      case "Converted":
        return "success";
      case "Pending":
        return "primary";
      default:
        return "primary";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Call Logs
          </h3>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Caller Name</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Phone Number</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Intent</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Summary</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {callLogs.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-8 text-gray-400">No call logs found.</TableCell>
                </TableRow>
              ) : (
                callLogs.map((log) => (
                  <TableRow key={log.name}>
                    <TableCell className="py-3 text-gray-800 text-theme-sm dark:text-white/90">{log.caller_name ?? 'Unknown'}</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{log.phone_number ?? 'N/A'}</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{log.intent ?? 'N/A'}</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{log.summary ?? 'N/A'}</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color={statusColor(log.status)}>
                        {log.status ?? 'Unknown'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
