import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { AvatarInitials } from "@/components/AvatarInitials";
import { ArrowLeft, Send, Clock, AlertCircle, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/lib/auth";

interface Message {
    id: string;
    body: string;
    author_user_id: string;
    created_at: string;
}

interface Ticket {
    id: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
}

export function PortalTicketDetail() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const { register, handleSubmit, reset } = useForm<{ body: string }>();

    const { data: ticket, isLoading: ticketLoading, error: ticketError } = useQuery({
        queryKey: ["portal-ticket", id],
        queryFn: async () => {
            const res = await api.get(`/tickets/${id}`);
            return res.data.data as Ticket;
        },
    });

    const { data: messages, isLoading: messagesLoading } = useQuery({
        queryKey: ["portal-ticket-messages", id],
        queryFn: async () => {
            const res = await api.get(`/tickets/${id}/messages`);
            return res.data.data as Message[];
        },
    });

    const replyMutation = useMutation({
        mutationFn: async (body: string) => {
            await api.post(`/tickets/${id}/messages`, { body });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["portal-ticket-messages", id] });
            reset();
        },
    });

    const onSubmit = (data: { body: string }) => {
        if (data.body.trim()) {
            replyMutation.mutate(data.body);
        }
    };

    if (ticketLoading) {
        return <div className="p-6 text-muted-foreground">Loading ticket...</div>;
    }

    if (ticketError || !ticket) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <span>Ticket not found or access denied.</span>
                </div>
            </div>
        );
    }

    const isResolved = ticket.status === "RESOLVED" || ticket.status === "CLOSED";
    const ticketCode = `HD-${ticket.id.slice(0, 8).toUpperCase()}`;

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <Link to="/portal/tickets" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to My Tickets
            </Link>

            <PageHeader
                title={ticket.subject}
                subtitle={`Created ${new Date(ticket.created_at).toLocaleDateString()}`}
                breadcrumbs={
                    <Breadcrumbs
                        items={[
                            { label: "Portal", href: "/portal/tickets" },
                            { label: "Tickets", href: "/portal/tickets" },
                            { label: ticketCode },
                        ]}
                    />
                }
                actions={
                    <div className="flex items-center gap-2">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                    </div>
                }
            />

            <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                        <AvatarInitials name={user?.full_name || "You"} size="sm" />
                        <span className="font-medium text-foreground">You</span>
                        <span>-</span>
                        <span>{new Date(ticket.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                </div>

                <div className="divide-y divide-border">
                    {messagesLoading ? (
                        <div className="p-6 text-muted-foreground">Loading messages...</div>
                    ) : messages && messages.length > 0 ? (
                        messages.map((msg) => {
                            const isRequester = msg.author_user_id === user?.id;
                            return (
                                <div key={msg.id} className="p-6 transition-colors hover:bg-muted/20">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                                        <AvatarInitials
                                            name={isRequester ? "You" : "Support"}
                                            size="sm"
                                            className={isRequester ? "bg-muted" : "bg-primary/15"}
                                        />
                                        <span className={isRequester ? "text-foreground font-medium" : "text-foreground font-semibold"}>
                                            {isRequester ? "You" : "Support Team"}
                                        </span>
                                        <span>-</span>
                                        <span>{new Date(msg.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-foreground whitespace-pre-wrap leading-relaxed pl-11">
                                        {msg.body}
                                    </p>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-6">
                            <EmptyState
                                title="No replies yet"
                                description="Our team will respond shortly."
                                icon={<MessageSquare className="h-10 w-10" />}
                            />
                        </div>
                    )}
                </div>

                {!isResolved && (
                    <div className="p-6 border-t border-border bg-muted/20">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="relative">
                                <textarea
                                    {...register("body", { required: true })}
                                    className="w-full min-h-[120px] rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="Write your reply..."
                                    disabled={replyMutation.isPending}
                                />
                                <div className="absolute bottom-3 right-3">
                                    <Button type="submit" disabled={replyMutation.isPending} size="sm">
                                        {replyMutation.isPending ? "Sending..." : (
                                            <>
                                                <Send className="h-3.5 w-3.5 mr-2" />
                                                Send Reply
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {isResolved && (
                    <div className="p-6 border-t border-border text-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
                                <Clock className="h-4 w-4 text-foreground" />
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                This ticket has been resolved. Need more help?
                            </p>
                            <Link to="/portal/tickets/new">
                                <Button variant="outline" size="sm" className="mt-2">
                                    Create New Ticket
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
