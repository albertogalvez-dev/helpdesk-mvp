import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Clock, User, AlertCircle } from "lucide-react";
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

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        NEW: "bg-lime-100 text-lime-800",
        OPEN: "bg-yellow-100 text-yellow-800",
        PENDING: "bg-orange-100 text-orange-800",
        RESOLVED: "bg-green-100 text-green-800",
        CLOSED: "bg-gray-100 text-gray-600",
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || "bg-gray-100"}`}>
            {status}
        </span>
    );
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
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-32 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    if (ticketError || !ticket) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700">Ticket not found or access denied.</span>
                </div>
            </div>
        );
    }

    const isResolved = ticket.status === "RESOLVED" || ticket.status === "CLOSED";

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link to="/portal/tickets" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to My Tickets
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Created {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                            <StatusBadge status={ticket.status} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Conversation */}
            <div className="bg-white rounded-lg border shadow-sm">
                {/* Original description */}
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <User className="h-4 w-4" />
                        <span>You</span>
                        <span>·</span>
                        <span>{new Date(ticket.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
                </div>

                {/* Messages */}
                <div className="divide-y">
                    {messagesLoading ? (
                        <div className="p-4">
                            <div className="animate-pulse h-16 bg-gray-100 rounded" />
                        </div>
                    ) : messages && messages.length > 0 ? (
                        messages.map((msg) => (
                            <div key={msg.id} className="p-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <User className="h-4 w-4" />
                                    <span className={msg.author_user_id === user?.id ? "text-primary font-medium" : "text-blue-600"}>
                                        {msg.author_user_id === user?.id ? "You" : "Support Team"}
                                    </span>
                                    <span>·</span>
                                    <span>{new Date(msg.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-gray-800 whitespace-pre-wrap">{msg.body}</p>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No replies yet. Our team will respond shortly.
                        </div>
                    )}
                </div>

                {/* Reply Form */}
                {!isResolved && (
                    <div className="p-4 bg-gray-50 border-t">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <textarea
                                {...register("body", { required: true })}
                                className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Write your reply..."
                                disabled={replyMutation.isPending}
                            />
                            <div className="flex justify-end mt-3">
                                <Button
                                    type="submit"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    disabled={replyMutation.isPending}
                                >
                                    {replyMutation.isPending ? "Sending..." : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Reply
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {isResolved && (
                    <div className="p-4 bg-green-50 border-t text-center">
                        <p className="text-green-700 text-sm font-medium">
                            This ticket has been resolved. Need more help? Create a new ticket.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
