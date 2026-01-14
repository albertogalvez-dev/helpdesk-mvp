import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { AvatarInitials } from "@/components/AvatarInitials";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAuthStore } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function TicketDetailPage() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [copiedId, setCopiedId] = useState(false);
    const [activeTab, setActiveTab] = useState<"conversation" | "notes" | "activity">("conversation");
    const [replyMode, setReplyMode] = useState<"public" | "internal">("public");

    const { data: ticket, isLoading } = useQuery({
        queryKey: ["ticket", id],
        queryFn: async () => (await api.get(`/tickets/${id}`)).data.data,
    });

    const { data: messages } = useQuery({
        queryKey: ["ticket", id, "messages"],
        queryFn: async () => (await api.get(`/tickets/${id}/messages`)).data.data,
    });

    const { data: notes } = useQuery({
        queryKey: ["ticket", id, "notes"],
        queryFn: async () => (await api.get(`/tickets/${id}/notes`)).data.data,
    });

    const replyMutation = useMutation({
        mutationFn: (body: string) => api.post(`/tickets/${id}/messages`, { body }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", id, "messages"] });
            resetReply();
        },
    });

    const noteMutation = useMutation({
        mutationFn: (body: string) => api.post(`/tickets/${id}/notes`, { body }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", id, "notes"] });
            resetReply();
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: (status: string) => api.patch(`/tickets/${id}/status`, { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket", id] }),
    });

    const assignMeMutation = useMutation({
        mutationFn: () => api.post(`/tickets/${id}/assign`, { assigned_agent_id: user?.id }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket", id] }),
    });

    const { register: registerReply, handleSubmit: handleReply, reset: resetReply } = useForm<{ body: string }>();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                <span className="material-symbols-outlined animate-spin text-2xl mr-2">refresh</span>
                Loading ticket...
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="h-full flex items-center justify-center text-destructive">
                <span className="material-symbols-outlined text-2xl mr-2">error</span>
                Ticket not found
            </div>
        );
    }

    const ticketCode = `TK-${ticket.id.slice(0, 4).toUpperCase()}`;
    const createdDate = new Date(ticket.created_at);
    const timeAgo = Math.floor((Date.now() - createdDate.getTime()) / 3600000);

    return (
        <div className="flex flex-col h-full bg-[#f7f8f6]">
            {/* Top Navigation Bar */}
            <header className="h-14 border-b border-border bg-white flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary-foreground text-lg">bolt</span>
                        </div>
                        <span className="font-bold text-sm">HelpDesk Pro</span>
                    </div>
                    <nav className="flex items-center gap-1">
                        <Link to="/agent/inbox" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Dashboard
                        </Link>
                        <Link to="/agent/inbox" className="px-3 py-1.5 text-sm font-bold text-foreground border-b-2 border-primary">
                            Tickets
                        </Link>
                        <a href="#" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Customers
                        </a>
                        <Link to="/agent/reports" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Reports
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
                        <input
                            className="bg-muted border-none rounded-full py-2 pl-10 pr-4 text-sm w-48 focus:ring-2 focus:ring-primary"
                            placeholder="Search tickets..."
                            type="text"
                        />
                    </div>
                    <AvatarInitials name={user?.full_name} email={user?.email} size="sm" />
                </div>
            </header>

            {/* Breadcrumb */}
            <div className="px-6 py-3 text-xs text-muted-foreground bg-white border-b border-border">
                <Link to="/agent/inbox" className="hover:text-foreground">Tickets</Link>
                <span className="mx-2">/</span>
                <span className="text-muted-foreground">Support</span>
                <span className="mx-2">/</span>
                <span className="text-foreground font-medium">{ticketCode}</span>
            </div>

            {/* Main 3-Column Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* LEFT SIDEBAR - Ticket Properties */}
                <aside className="w-64 bg-white border-r border-border p-6 overflow-y-auto shrink-0">
                    {/* Ticket Title */}
                    <div className="mb-6">
                        <h1 className="text-lg font-bold leading-tight mb-2">{ticket.subject}</h1>
                        <p className="text-xs text-muted-foreground">
                            Created {timeAgo}h ago by {ticket.requester?.full_name || "Customer"}
                        </p>
                    </div>

                    {/* Status */}
                    <div className="mb-5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Status</label>
                        <div className="relative">
                            <select
                                className="w-full appearance-none bg-white border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
                                value={ticket.status}
                                onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                            >
                                <option value="NEW">● New</option>
                                <option value="OPEN">● Open</option>
                                <option value="PENDING">● Pending</option>
                                <option value="RESOLVED">● Resolved</option>
                                <option value="CLOSED">● Closed</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">expand_more</span>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="mb-5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Priority</label>
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border",
                            ticket.priority === "URGENT" || ticket.priority === "HIGH"
                                ? "bg-red-50 border-red-200 text-red-700"
                                : ticket.priority === "MEDIUM"
                                    ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                                    : "bg-green-50 border-green-200 text-green-700"
                        )}>
                            <span className="material-symbols-outlined text-sm">flag</span>
                            <span className="text-sm font-medium">{ticket.priority}</span>
                        </div>
                    </div>

                    {/* Assignee */}
                    <div className="mb-5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Assignee</label>
                        {ticket.assigned_agent_id ? (
                            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border">
                                <AvatarInitials
                                    name={ticket.assigned_agent_id === user?.id ? user?.full_name : "Agent"}
                                    size="sm"
                                />
                                <span className="text-sm font-medium">
                                    {ticket.assigned_agent_id === user?.id ? user?.full_name || "You" : "Alex Rivera"}
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={() => assignMeMutation.mutate()}
                                className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">person_add</span>
                                Assign to me
                            </button>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Tags</label>
                        <div className="flex flex-wrap gap-2">
                            {ticket.tags?.map((tag: any) => (
                                <span key={tag.id} className="px-2 py-1 bg-muted text-xs font-medium rounded border border-border">
                                    {tag.name}
                                </span>
                            ))}
                            {(!ticket.tags || ticket.tags.length === 0) && (
                                <>
                                    <span className="px-2 py-1 bg-muted text-xs font-medium rounded border border-border">vpn-issue</span>
                                    <span className="px-2 py-1 bg-muted text-xs font-medium rounded border border-border">macos-14</span>
                                </>
                            )}
                            <button className="px-2 py-1 text-xs font-medium text-primary border border-primary/30 rounded hover:bg-primary/10 transition-colors">
                                + Add
                            </button>
                        </div>
                    </div>
                </aside>

                {/* CENTER - Conversation Timeline */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    {/* Tabs */}
                    <div className="flex border-b border-border px-6 shrink-0">
                        <button
                            onClick={() => setActiveTab("conversation")}
                            className={cn(
                                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === "conversation"
                                    ? "border-primary text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Conversation
                        </button>
                        <button
                            onClick={() => setActiveTab("notes")}
                            className={cn(
                                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === "notes"
                                    ? "border-primary text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Internal Notes
                        </button>
                        <button
                            onClick={() => setActiveTab("activity")}
                            className={cn(
                                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === "activity"
                                    ? "border-primary text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Activity
                        </button>
                    </div>

                    {/* Messages Timeline */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {activeTab === "conversation" && (
                            <>
                                {/* Customer Message */}
                                <div className="flex gap-4">
                                    <AvatarInitials
                                        name={ticket.requester?.full_name}
                                        email={ticket.requester?.email}
                                        size="md"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <span className="font-bold text-sm">{ticket.requester?.full_name || "Sarah Jenkins"}</span>
                                            <span className="text-xs text-muted-foreground">10:42 AM</span>
                                        </div>
                                        <div className="bg-[#f7f8f6] rounded-lg p-4 text-sm leading-relaxed text-foreground">
                                            {ticket.description || "Hi support team, I'm unable to connect to the corporate VPN since updating to macOS 14.1. It hangs at \"Connecting...\" and then eventually times out with a \"Peer not responding\" error. I've tried restarting but no luck. Any suggestions?"}
                                        </div>
                                    </div>
                                </div>

                                {/* Internal Note Example */}
                                {notes && notes.length > 0 && (
                                    <div className="flex gap-4">
                                        <AvatarInitials name="Agent" size="md" />
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="font-bold text-sm">Alex Rivera</span>
                                                <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">Internal</span>
                                                <span className="text-xs text-muted-foreground">10:55 AM</span>
                                            </div>
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm leading-relaxed italic text-yellow-800">
                                                {notes[0]?.body || "Note: Check if user is on the latest Tunnelblick client. We had similar reports yesterday from the design team."}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Agent Reply */}
                                {messages && messages.length > 0 && messages.map((m: any, i: number) => (
                                    <div key={m.id} className="flex gap-4">
                                        <AvatarInitials
                                            name={m.author_user_id === user?.id ? user?.full_name : "Agent"}
                                            size="md"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="font-bold text-sm">
                                                    {m.author_user_id === user?.id ? user?.full_name : "Alex Rivera"}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="bg-[#f7f8f6] rounded-lg p-4 text-sm leading-relaxed text-foreground">
                                                {m.body}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {(!messages || messages.length === 0) && (
                                    <div className="flex gap-4">
                                        <AvatarInitials name="Agent" size="md" />
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="font-bold text-sm">Alex Rivera</span>
                                                <span className="text-xs text-muted-foreground">11:02 AM</span>
                                            </div>
                                            <div className="bg-[#f7f8f6] rounded-lg p-4 text-sm leading-relaxed text-foreground">
                                                Hi Sarah, sorry for the trouble. Could you please check which version of the VPN client you are currently running? Also, if possible, please share your AnyDesk ID so I can take a quick look at your settings.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === "notes" && (
                            <>
                                {notes?.map((n: any) => (
                                    <div key={n.id} className="flex gap-4">
                                        <AvatarInitials name="Agent" size="md" />
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="font-bold text-sm">Internal Note</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm leading-relaxed text-yellow-800">
                                                {n.body}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!notes || notes.length === 0) && (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <span className="material-symbols-outlined text-4xl mb-2 block">sticky_note_2</span>
                                        No internal notes yet
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === "activity" && (
                            <div className="text-center py-12 text-muted-foreground">
                                <span className="material-symbols-outlined text-4xl mb-2 block">history</span>
                                Activity log coming soon
                            </div>
                        )}
                    </div>

                    {/* Reply Composer */}
                    <div className="border-t border-border p-4 shrink-0 bg-white">
                        <div className="flex gap-4 mb-3">
                            <button
                                onClick={() => setReplyMode("public")}
                                className={cn(
                                    "text-sm font-medium pb-1 border-b-2 transition-colors",
                                    replyMode === "public"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Public Reply
                            </button>
                            <button
                                onClick={() => setReplyMode("internal")}
                                className={cn(
                                    "text-sm font-medium pb-1 border-b-2 transition-colors",
                                    replyMode === "internal"
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Internal Note
                            </button>
                        </div>
                        <form onSubmit={handleReply((data) => {
                            if (replyMode === "public") {
                                replyMutation.mutate(data.body);
                            } else {
                                noteMutation.mutate(data.body);
                            }
                        })}>
                            <div className="border border-border rounded-lg overflow-hidden">
                                <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
                                    <button type="button" className="p-1 hover:bg-muted rounded"><b>B</b></button>
                                    <button type="button" className="p-1 hover:bg-muted rounded"><i>I</i></button>
                                    <button type="button" className="p-1 hover:bg-muted rounded">
                                        <span className="material-symbols-outlined text-sm">link</span>
                                    </button>
                                    <button type="button" className="p-1 hover:bg-muted rounded">
                                        <span className="material-symbols-outlined text-sm">attach_file</span>
                                    </button>
                                </div>
                                <textarea
                                    {...registerReply("body", { required: true })}
                                    className="w-full min-h-[80px] p-3 text-sm border-none focus:ring-0 resize-none"
                                    placeholder="Type your response here..."
                                />
                                <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30">
                                    <span className="text-xs text-muted-foreground">Markdown supported</span>
                                    <button
                                        type="submit"
                                        disabled={replyMutation.isPending || noteMutation.isPending}
                                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:brightness-95 transition-all disabled:opacity-50"
                                    >
                                        Send Response
                                        <span className="material-symbols-outlined text-sm">send</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* RIGHT SIDEBAR - Requester Info */}
                <aside className="w-72 bg-white border-l border-border overflow-y-auto shrink-0">
                    {/* Requester Section */}
                    <div className="p-5 border-b border-border">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Requester</h3>
                        <div className="flex items-start gap-3">
                            <AvatarInitials
                                name={ticket.requester?.full_name}
                                email={ticket.requester?.email}
                                size="lg"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{ticket.requester?.full_name || "Sarah Jenkins"}</p>
                                <p className="text-xs text-primary truncate">{ticket.requester?.department || "Design Lead"} @ {ticket.workspace?.name || "Acme Corp"}</p>
                                <p className="text-[10px] text-muted-foreground">Local Time: 11:14 AM (PST)</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email</span>
                                <span className="font-medium truncate ml-2">{ticket.requester?.email || "sarah.j@acme.com"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone</span>
                                <span className="font-medium">{ticket.requester?.phone || "+1(555) 012-3456"}</span>
                            </div>
                            <a href="#" className="text-primary font-medium flex items-center gap-1 mt-2">
                                View last 5 tickets
                            </a>
                        </div>
                    </div>

                    {/* Remote Access Section */}
                    <div className="p-5 border-b border-border">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Remote Access</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span className="text-red-500 text-lg">⬤</span>
                                    <span className="text-xs font-medium">ANYDESK</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="text-xs font-mono font-bold">{ticket.requester?.anydesk_id || "492 183 284"}</code>
                                    <button
                                        onClick={() => copyToClipboard(ticket.requester?.anydesk_id || "492183284")}
                                        className="p-1 hover:bg-muted rounded"
                                    >
                                        <span className="material-symbols-outlined text-sm">{copiedId ? "check" : "content_copy"}</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-500 text-lg">⬤</span>
                                    <span className="text-xs font-medium">TEAMVIEWER</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Not Set</span>
                                    <button className="text-primary text-xs font-medium">+</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technical Specs Section */}
                    <div className="p-5 border-b border-border">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Technical Specs</h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Device</span>
                                <span className="font-medium">MacBook Pro M2</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">OS Version</span>
                                <span className="font-medium">macOS 14.1 (Sonoma)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Browser</span>
                                <span className="font-medium">Chrome 118.0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">IP Address</span>
                                <span className="font-medium">192.168.1.104</span>
                            </div>
                        </div>
                    </div>

                    {/* Network Health Section */}
                    <div className="p-5 border-b border-border">
                        <button className="w-full flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Network Health
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                    </div>

                    {/* Company Context Section */}
                    <div className="p-5">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Company Context</h3>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <div className="size-10 bg-primary/20 rounded-lg flex items-center justify-center font-bold text-sm">
                                AC
                            </div>
                            <div>
                                <p className="font-bold text-sm">{ticket.workspace?.name || "Acme Corp"}</p>
                                <p className="text-[10px] text-muted-foreground">Enterprise Tier • 150 Seats</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
