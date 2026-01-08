import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function InboxPage() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<string>("");
    const [search, setSearch] = useState("");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["tickets", page, status, search],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                size: "20",
                sort_by: "priority",
                sort_order: "desc"
            });
            if (status) params.append("status", status);
            if (search) params.append("q", search);

            const res = await api.get(`/tickets?${params.toString()}`);
            return res.data;
        }
    });

    const tickets = data?.data || [];
    const meta = data?.meta || {};

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
                <Input
                    placeholder="Search tickets..."
                    className="max-w-xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="NEW">New</option>
                    <option value="OPEN">Open</option>
                    <option value="PENDING">Pending</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                </select>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">Subject</th>
                            <th className="px-4 py-3 font-medium w-32">Status</th>
                            <th className="px-4 py-3 font-medium w-32">Priority</th>
                            <th className="px-4 py-3 font-medium w-40">Created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {isLoading && <tr><td colSpan={4} className="p-4 text-center">Loading tickets...</td></tr>}
                        {isError && <tr><td colSpan={4} className="p-4 text-center text-destructive">Failed to load tickets</td></tr>}
                        {tickets.map((t: any) => (
                            <tr key={t.id} className="hover:bg-gray-50 group">
                                <td className="px-4 py-3">
                                    <Link to={`/agent/tickets/${t.id}`} className="block font-medium text-primary hover:underline">
                                        {t.subject}
                                    </Link>
                                    <div className="text-gray-500 text-xs">#{t.id.slice(0, 8)} • via {t.channel}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={t.status === 'NEW' ? 'destructive' : t.status === 'OPEN' ? 'default' : 'secondary'}>
                                        {t.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={t.priority === 'URGENT' ? 'text-destructive font-bold' : t.priority === 'HIGH' ? 'text-orange-600 font-medium' : ''}>
                                        {t.priority}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {new Date(t.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {!isLoading && tickets.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">No tickets found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Page {meta.page || 1} of {Math.ceil((meta.total || 0) / (meta.size || 20))}</span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={tickets.length < 20}>Next</Button>
                </div>
            </div>
        </div>
    );
}
