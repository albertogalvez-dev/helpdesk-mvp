import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, X, Inbox as InboxIcon, Clock } from "lucide-react";

// Status badge component with design tokens
function StatusBadge({ status }: { status: string }) {
    const classes: Record<string, string> = {
        NEW: "badge-new",
        OPEN: "badge-open",
        PENDING: "badge-pending",
        RESOLVED: "badge-resolved",
        CLOSED: "badge-closed",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[status] || "badge-closed"}`}>
            {status}
        </span>
    );
}

// Priority badge component
function PriorityBadge({ priority }: { priority: string }) {
    const classes: Record<string, string> = {
        LOW: "priority-low",
        MEDIUM: "priority-medium",
        HIGH: "priority-high",
        URGENT: "priority-urgent",
    };
    return (
        <span className={`text-sm ${classes[priority] || ""}`}>
            {priority === "URGENT" && "🔥 "}{priority}
        </span>
    );
}

// Relative time formatter
function formatRelativeTime(date: string): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
}

// Skeleton loader
function TableSkeleton() {
    return (
        <>
            {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-gray-100">
                    <td className="px-4 py-3">
                        <div className="skeleton h-4 w-48 mb-2" />
                        <div className="skeleton h-3 w-24" />
                    </td>
                    <td className="px-4 py-3"><div className="skeleton h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3"><div className="skeleton h-4 w-16" /></td>
                    <td className="px-4 py-3"><div className="skeleton h-4 w-20" /></td>
                </tr>
            ))}
        </>
    );
}

// Empty state component
function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
    return (
        <tr>
            <td colSpan={4} className="p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <InboxIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">No tickets found</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {hasFilters ? "Try adjusting your filters" : "New tickets will appear here"}
                        </p>
                    </div>
                    {hasFilters && (
                        <Button variant="outline" size="sm" onClick={onClear}>
                            Clear filters
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
}

export function InboxPage() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<string>("");
    const [search, setSearch] = useState("");

    const hasFilters = status !== "" || search !== "";

    const { data, isLoading, isError } = useQuery({
        queryKey: ["tickets", page, status, search],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                size: "20",
                sort: "updated_at",
                order: "desc"
            });
            if (status) params.append("status", status);
            if (search) params.append("q", search);

            const res = await api.get(`/tickets?${params.toString()}`);
            return res.data;
        },
        placeholderData: (prev) => prev, // Keep previous data while loading
    });

    const tickets = data?.data || [];
    const meta = data?.meta || {};
    const totalPages = Math.ceil((meta.total || 0) / (meta.size || 20));

    const clearFilters = () => {
        setStatus("");
        setSearch("");
        setPage(1);
    };

    return (
        <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {meta.total ? `${meta.total} ticket${meta.total !== 1 ? 's' : ''}` : 'Manage support tickets'}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 items-center bg-white p-4 rounded-xl border" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search tickets..."
                        className="pl-9 pr-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                        >
                            <X className="h-3 w-3 text-gray-400" />
                        </button>
                    )}
                </div>
                <select
                    className="h-9 rounded-lg border border-input bg-white px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ borderRadius: 'var(--radius-md)' }}
                >
                    <option value="">All Statuses</option>
                    <option value="NEW">New</option>
                    <option value="OPEN">Open</option>
                    <option value="PENDING">Pending</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                </select>
                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
                        <X className="h-4 w-4 mr-1" /> Reset
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-white overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <table className="w-full table-dense">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th className="w-28">Status</th>
                            <th className="w-28">Priority</th>
                            <th className="w-32">Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && <TableSkeleton />}

                        {isError && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-red-600">
                                    Failed to load tickets. Please try again.
                                </td>
                            </tr>
                        )}

                        {!isLoading && !isError && tickets.map((t: any) => (
                            <tr key={t.id} className="cursor-pointer">
                                <td>
                                    <Link to={`/agent/tickets/${t.id}`} className="block group">
                                        <span className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                                            {t.subject}
                                        </span>
                                        <div className="text-gray-400 text-xs mt-0.5 flex items-center gap-2">
                                            <span>#{t.id.slice(0, 8)}</span>
                                            <span>•</span>
                                            <span>{t.channel}</span>
                                        </div>
                                    </Link>
                                </td>
                                <td>
                                    <StatusBadge status={t.status} />
                                </td>
                                <td>
                                    <PriorityBadge priority={t.priority} />
                                </td>
                                <td className="text-gray-500 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatRelativeTime(t.updated_at || t.created_at)}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {!isLoading && !isError && tickets.length === 0 && (
                            <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                        Page {meta.page || 1} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
