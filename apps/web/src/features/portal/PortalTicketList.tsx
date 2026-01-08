import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Ticket, Clock, AlertCircle } from "lucide-react";

interface TicketItem {
    id: string;
    subject: string;
    status: string;
    priority: string;
    updated_at: string;
    created_at: string;
}

function StatusBadge({ status }: { status: string }) {
    const classes: Record<string, string> = {
        NEW: "badge-new",
        OPEN: "badge-open",
        PENDING: "badge-pending",
        RESOLVED: "badge-resolved",
        CLOSED: "badge-closed",
    };
    return (
        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${classes[status] || "badge-closed"}`}>
            {status}
        </span>
    );
}

function PriorityIndicator({ priority }: { priority: string }) {
    const classes: Record<string, string> = {
        LOW: "priority-low",
        MEDIUM: "priority-medium",
        HIGH: "priority-high",
        URGENT: "priority-urgent",
    };
    return <span className={`text-sm ${classes[priority] || ""}`}>{priority}</span>;
}

export function PortalTicketList() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["portal-tickets"],
        queryFn: async () => {
            const res = await api.get("/tickets");
            return res.data.data as TicketItem[];
        },
    });

    if (isLoading) {
        return (
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">My Tickets</h1>
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700">Failed to load tickets. Please try again.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
                <Link to="/portal/tickets/new">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Plus className="h-4 w-4 mr-2" />
                        New Ticket
                    </Button>
                </Link>
            </div>

            {!data || data.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                    <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
                    <p className="text-gray-500 mb-4">Create your first support ticket to get help.</p>
                    <Link to="/portal/tickets/new">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            Create Ticket
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Subject</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Priority</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Last Update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                    <td className="px-4 py-4">
                                        <Link to={`/portal/tickets/${ticket.id}`} className="font-medium text-gray-900 hover:text-primary">
                                            {ticket.subject}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-4">
                                        <StatusBadge status={ticket.status} />
                                    </td>
                                    <td className="px-4 py-4">
                                        <PriorityIndicator priority={ticket.priority} />
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(ticket.updated_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
