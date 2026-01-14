import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";

interface TicketItem {
    id: string;
    subject: string;
    status: string;
    priority: string;
    updated_at: string;
    created_at: string;
}

function formatRelativeTime(date: string): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `Updated ${diffMins}m ago`;
    if (diffHours < 24) return `Updated ${diffHours}h ago`;
    if (diffDays < 7) return `Updated ${diffDays}d ago`;
    return `Closed ${d.toLocaleDateString()}`;
}

export function PortalTicketList() {
    const navigate = useNavigate();
    const { data, isLoading, error } = useQuery({
        queryKey: ["portal-tickets"],
        queryFn: async () => {
            const res = await api.get("/tickets");
            return res.data.data as TicketItem[];
        },
    });

    const tickets = data || [];
    const activeTickets = tickets.filter(t => t.status !== "CLOSED" && t.status !== "RESOLVED");

    const getStatusClass = (status: string) => {
        switch (status.toUpperCase()) {
            case "OPEN":
            case "NEW":
                return "status-badge bg-blue-100 text-blue-700";
            case "PENDING":
                return "status-badge bg-yellow-100 text-yellow-700";
            case "RESOLVED":
            case "CLOSED":
                return "status-badge bg-green-100 text-green-700";
            default:
                return "status-badge bg-gray-100 text-gray-600";
        }
    };

    return (
        <div>
            {/* Page Heading */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight mb-2">My Tickets</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            Showing {activeTickets.length} active tickets
                        </span>
                        <div className="flex gap-2 items-center">
                            <span className="size-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                                {data ? `${data.filter(t => t.status === "OPEN" || t.status === "NEW").length} New Responses` : ""}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">tune</span>
                        Filters
                    </button>
                    <Link
                        to="/portal/tickets/new"
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:brightness-95 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        New Ticket
                    </Link>
                </div>
            </div>

            {/* Tickets List Section */}
            {isLoading && (
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <span className="material-symbols-outlined animate-spin text-2xl text-muted-foreground">refresh</span>
                    <p className="mt-2 text-sm text-muted-foreground">Loading your tickets...</p>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
                    <span className="material-symbols-outlined">error</span>
                    <span>Failed to load tickets. Please try again.</span>
                </div>
            )}

            {!isLoading && !error && tickets.length === 0 && (
                <div className="bg-card rounded-xl border border-border p-8">
                    <EmptyState
                        title="No tickets yet"
                        description="Create your first support ticket to get help."
                        icon={<span className="material-symbols-outlined text-4xl">confirmation_number</span>}
                        action={
                            <Link
                                to="/portal/tickets/new"
                                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold"
                            >
                                Create Ticket
                            </Link>
                        }
                    />
                </div>
            )}

            {!isLoading && !error && tickets.length > 0 && (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Subject</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ID</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last Activity</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {tickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        className="ticket-row transition-colors group relative cursor-pointer"
                                        onClick={() => navigate(`/portal/tickets/${ticket.id}`)}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-semibold text-foreground hover:underline">
                                                    {ticket.subject}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground font-medium">
                                                    {ticket.priority} Priority
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-mono text-muted-foreground">
                                                #{ticket.id.slice(0, 8)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={getStatusClass(ticket.status)}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                                {formatRelativeTime(ticket.updated_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-6 py-4 flex items-center justify-between border-t border-border bg-muted/30">
                        <span className="text-xs text-muted-foreground">
                            Showing {tickets.length} of {tickets.length} tickets
                        </span>
                        <div className="flex gap-2">
                            <button
                                className="px-3 py-1 text-xs font-bold border border-border rounded disabled:opacity-30"
                                disabled
                            >
                                Previous
                            </button>
                            <button className="px-3 py-1 text-xs font-bold bg-card border border-border rounded hover:border-primary transition-colors">
                                1
                            </button>
                            <button className="px-3 py-1 text-xs font-bold border border-border rounded hover:bg-muted transition-colors">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Knowledge Base Teaser */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-4">
                    <div className="size-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary-foreground">lightbulb</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold mb-1">Self-Service Help</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Most common integration questions are answered in our technical documentation.
                        </p>
                        <Link
                            to="/portal/help-center"
                            className="inline-block mt-3 text-xs font-bold text-foreground border-b-2 border-primary hover:bg-primary transition-all"
                        >
                            Visit Knowledge Base
                        </Link>
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-muted border border-border flex items-start gap-4">
                    <div className="size-10 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">forum</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold mb-1">Developer Community</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Connect with other enterprise architects and share implementation strategies.
                        </p>
                        <a
                            href="#"
                            className="inline-block mt-3 text-xs font-bold text-foreground border-b-2 border-foreground/20 hover:bg-foreground hover:text-background transition-all"
                        >
                            Join the Forum
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
