import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { AvatarInitials } from "@/components/AvatarInitials";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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

export function InboxPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<string>("");
    const [priority, setPriority] = useState<string>("");
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("inbox");
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    const hasFilters = status !== "" || priority !== "" || search !== "";

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ["tickets", page, status, priority, search],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                size: "20",
                sort: "updated_at",
                order: "desc",
            });
            if (status) params.append("status", status);
            if (priority) params.append("priority", priority);
            if (search) params.append("q", search);

            const res = await api.get(`/tickets?${params.toString()}`);
            return res.data;
        },
        placeholderData: (prev) => prev,
    });

    const tickets = data?.data || [];
    const meta = data?.meta || {};

    const selectedTicket = selectedTicketId
        ? tickets.find((t: any) => t.id === selectedTicketId)
        : tickets[0];

    const tabs = [
        { id: "inbox", label: "Inbox" },
        { id: "unassigned", label: "Unassigned" },
        { id: "breached", label: "Breached", count: 12 },
        { id: "mine", label: "Mine" },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header with Search & Filters */}
            <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-card">
                <div className="flex items-center gap-6 flex-1">
                    <div className="relative max-w-md w-full">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-2 rounded-lg border-none bg-muted text-sm focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                            placeholder="Search tickets..."
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {/* Chips/Filters */}
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-foreground">
                            Status: {status || "All"}
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-foreground">
                            Priority: {priority || "Any"}
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-foreground">
                            Assignee: Me
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>
                </div>
            </header>

            {/* Tabs Navigation */}
            <div className="px-6 border-b border-border bg-card">
                <div className="flex gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "py-4 border-b-2 text-sm font-medium transition-colors",
                                activeTab === tab.id
                                    ? "border-primary text-foreground font-bold"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.label}
                            {tab.count && (
                                <span className="bg-destructive/10 text-destructive px-1.5 py-0.5 rounded text-[10px] ml-1">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Split Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Ticket List Section */}
                <div className="w-[450px] border-r border-border flex flex-col h-full bg-background">
                    <div className="overflow-y-auto flex-1 pb-4">
                        {isLoading && (
                            <div className="p-8 text-center text-muted-foreground">
                                <span className="material-symbols-outlined animate-spin text-2xl">refresh</span>
                                <p className="mt-2 text-sm">Loading tickets...</p>
                            </div>
                        )}

                        {!isLoading && tickets.length === 0 && (
                            <div className="p-8">
                                <EmptyState
                                    title={hasFilters ? "No tickets found" : "All clear"}
                                    description={hasFilters ? "Try adjusting your filters." : "New tickets will appear here."}
                                    icon={<span className="material-symbols-outlined text-4xl">inbox</span>}
                                />
                            </div>
                        )}

                        {!isLoading && tickets.map((ticket: any, index: number) => (
                            <div
                                key={ticket.id}
                                onClick={() => {
                                    setSelectedTicketId(ticket.id);
                                }}
                                onDoubleClick={() => navigate(`/agent/tickets/${ticket.id}`)}
                                className={cn(
                                    "border-b border-border p-4 cursor-pointer relative group transition-colors",
                                    selectedTicket?.id === ticket.id
                                        ? "bg-card border-l-4 border-l-primary"
                                        : "hover:bg-card"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                        #{ticket.id.slice(0, 8)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatRelativeTime(ticket.updated_at || ticket.created_at)}
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
                                    {ticket.subject}
                                </h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <p className="text-xs text-muted-foreground">
                                        {ticket.requester?.full_name || "Unknown"} •
                                        <span className={cn(
                                            "ml-1 font-medium",
                                            ticket.priority === "URGENT" || ticket.priority === "HIGH" ? "text-orange-500" :
                                                ticket.priority === "MEDIUM" ? "text-blue-500" : "text-muted-foreground"
                                        )}>
                                            Priority: {ticket.priority}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <StatusBadge status={ticket.status} />
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
                                            <div
                                                className="bg-primary h-full"
                                                style={{ width: `${Math.random() * 80 + 20}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-medium text-muted-foreground">SLA</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ticket Detail Preview */}
                <div className="flex-1 flex flex-col bg-card overflow-hidden">
                    {selectedTicket ? (
                        <>
                            {/* Ticket Title Area */}
                            <div className="p-8 border-b border-border">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground mb-2">
                                            #{selectedTicket.id.slice(0, 8)}: {selectedTicket.subject}
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <AvatarInitials
                                                name={selectedTicket.requester?.full_name}
                                                email={selectedTicket.requester?.email}
                                                size="sm"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {selectedTicket.requester?.full_name || "Unknown"}
                                                    <span className="text-muted-foreground font-normal text-xs ml-2">
                                                        {selectedTicket.requester?.email}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Submitted {formatRelativeTime(selectedTicket.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/agent/tickets/${selectedTicket.id}`)}
                                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:brightness-95 transition-all flex items-center gap-2"
                                        >
                                            Open Ticket
                                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Status</p>
                                        <StatusBadge status={selectedTicket.status} />
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Priority</p>
                                        <PriorityBadge priority={selectedTicket.priority} />
                                    </div>
                                </div>

                                <div className="p-4 bg-muted rounded-lg mb-6">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Description</p>
                                    <p className="text-sm text-foreground leading-relaxed">
                                        {selectedTicket.description || "No description provided."}
                                    </p>
                                </div>

                                <p className="text-center text-sm text-muted-foreground">
                                    Double-click to open full ticket view
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <EmptyState
                                title="No ticket selected"
                                description="Select a ticket from the list to preview details"
                                icon={<span className="material-symbols-outlined text-4xl">wysiwyg</span>}
                            />
                        </div>
                    )}
                </div>

                {/* Right Metadata Panel */}
                {selectedTicket && (
                    <div className="w-72 border-l border-border bg-background p-6 overflow-y-auto shrink-0">
                        <div className="space-y-8">
                            {/* SLA Progress */}
                            <div>
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                    Service Level Agreement
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-foreground font-medium">First Response</span>
                                            <span className="text-muted-foreground">12m left</span>
                                        </div>
                                        <div className="sla-bar">
                                            <div className="sla-bar-fill" style={{ width: "85%" }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-foreground font-medium">Resolution Time</span>
                                            <span className="text-muted-foreground">4h left</span>
                                        </div>
                                        <div className="sla-bar">
                                            <div className="sla-bar-fill" style={{ width: "25%" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Properties */}
                            <div>
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                    Properties
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] text-muted-foreground font-medium block mb-1">Assignee</label>
                                        <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg cursor-pointer">
                                            <div className="size-5 rounded-full bg-primary/30 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-xs">person</span>
                                            </div>
                                            <span className="text-xs font-medium">
                                                {selectedTicket.assignee?.full_name || "Unassigned"}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-muted-foreground font-medium block mb-1">Tags</label>
                                        <div className="flex flex-wrap gap-1">
                                            <span className="px-2 py-0.5 bg-muted text-[10px] rounded text-muted-foreground">
                                                support
                                            </span>
                                            <span className="px-2 py-0.5 bg-muted text-[10px] rounded text-primary cursor-pointer">
                                                + add
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Card */}
                            <div className="p-4 bg-card border border-border rounded-xl">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                                    Customer Profile
                                </h4>
                                <div className="space-y-2 mb-4">
                                    <p className="text-xs font-bold">
                                        {selectedTicket.requester?.company?.name || "Unknown Company"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Tier: {selectedTicket.requester?.company?.subscription_plan || "Standard"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate(`/agent/tickets/${selectedTicket.id}`)}
                                    className="w-full py-1.5 border border-border text-[10px] font-bold rounded-lg hover:bg-muted"
                                >
                                    View Full Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
