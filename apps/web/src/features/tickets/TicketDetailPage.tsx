import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAuthStore } from "@/lib/auth";

export function TicketDetailPage() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    // Data Fetching
    const { data: ticket, isLoading } = useQuery({
        queryKey: ["ticket", id],
        queryFn: async () => (await api.get(`/tickets/${id}`)).data.data
    });

    const { data: messages } = useQuery({
        queryKey: ["ticket", id, "messages"],
        queryFn: async () => (await api.get(`/tickets/${id}/messages`)).data.data
    });

    const { data: notes } = useQuery({
        queryKey: ["ticket", id, "notes"],
        queryFn: async () => (await api.get(`/tickets/${id}/notes`)).data.data
    });

    const { data: slas } = useQuery({
        queryKey: ["ticket", id, "slas"],
        queryFn: async () => (await api.get(`/tickets/${id}/slas`)).data.data,
        retry: false
    });

    // Mutations
    const replyMutation = useMutation({
        mutationFn: (body: string) => api.post(`/tickets/${id}/messages`, { body }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", id, "messages"] });
            resetReply();
        }
    });

    const noteMutation = useMutation({
        mutationFn: (body: string) => api.post(`/tickets/${id}/notes`, { body }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", id, "notes"] });
            resetNote();
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: (status: string) => api.patch(`/tickets/${id}/status`, { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket", id] })
    });

    const assignMeMutation = useMutation({
        mutationFn: () => api.post(`/tickets/${id}/assign`, { assigned_agent_id: user?.id }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket", id] })
    });

    // Forms
    const { register: registerReply, handleSubmit: handleReply, reset: resetReply } = useForm<{ body: string }>();
    const { register: registerNote, handleSubmit: handleNote, reset: resetNote } = useForm<{ body: string }>();

    const [activeTab, setActiveTab] = useState<"messages" | "notes">("messages");

    if (isLoading) return <div className="p-8">Loading Ticket...</div>;
    if (!ticket) return <div className="p-8 text-destructive">Ticket not found</div>;

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Left: Metadata */}
            <div className="w-80 border-r bg-white p-6 space-y-6 overflow-y-auto">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                    <select
                        className="w-full border rounded p-2 text-sm bg-white"
                        value={ticket.status}
                        onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                    >
                        <option value="NEW">NEW</option>
                        <option value="OPEN">OPEN</option>
                        <option value="PENDING">PENDING</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                    </select>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Priority</h3>
                    <Badge variant="outline">{ticket.priority}</Badge>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Assignee</h3>
                    {ticket.assigned_agent_id ? (
                        <div className="text-sm font-medium">{ticket.assigned_agent_id === user?.id ? "You" : "Agent"}</div>
                    ) : (
                        <Button variant="outline" size="sm" className="w-full" onClick={() => assignMeMutation.mutate()}>
                            Assign to me
                        </Button>
                    )}
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">SLA Policies</h3>
                    {slas && slas.length > 0 ? (
                        <div className="space-y-2">
                            {slas.map((s: any) => (
                                <div key={s.id} className="text-xs border p-2 rounded bg-gray-50">
                                    <div className="font-semibold">{s.policy_name || "SLA"}</div>
                                    <div className={s.first_response_breached ? "text-destructive" : "text-green-600"}>
                                        Response: {s.first_response_breached ? "Breached" : "OK"}
                                    </div>
                                    <div className={s.resolution_breached ? "text-destructive" : "text-green-600"}>
                                        Resolution: {s.resolution_breached ? "Breached" : "OK"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-gray-400">No active SLA</div>
                    )}
                </div>

                {user?.role === "ADMIN" && (
                    <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Admin Demo</h3>
                        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => api.post("/admin/jobs/run", { job: "sla_escalation" }).then(() => queryClient.invalidateQueries({ queryKey: ["ticket", id, "slas"] }))}>
                            Trigger Escalation Job
                        </Button>
                    </div>
                )}
            </div>

            {/* Center: Conversation */}
            <div className="flex-1 flex flex-col bg-gray-50">
                <div className="p-6 border-b bg-white shadow-sm">
                    <h1 className="text-xl font-bold">{ticket.subject}</h1>
                    <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
                    <div className="flex gap-2 mt-2">
                        {ticket.tags.map((t: any) => <Badge key={t.id} variant="secondary" style={{ backgroundColor: t.color, color: '#fff' }}>{t.name}</Badge>)}
                    </div>
                </div>

                <div className="flex border-b bg-white">
                    <button
                        onClick={() => setActiveTab("messages")}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === "messages" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
                    >
                        Messages
                    </button>
                    <button
                        onClick={() => setActiveTab("notes")}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === "notes" ? "border-b-2 border-warning text-yellow-600" : "text-gray-500"}`}
                    >
                        Internal Notes
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeTab === "messages" && messages?.map((m: any) => (
                        <div key={m.id} className={`flex flex-col ${m.author_user_id === user?.id ? "items-end" : "items-start"}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${m.author_user_id === user?.id ? "bg-primary text-primary-foreground" : "bg-white border shadow-sm"}`}>
                                <p className="text-sm">{m.body}</p>
                            </div>
                            <span className="text-xs text-gray-400 mt-1">{new Date(m.created_at).toLocaleString()}</span>
                        </div>
                    ))}

                    {activeTab === "notes" && notes?.map((n: any) => (
                        <div key={n.id} className="flex flex-col items-start">
                            <div className="max-w-[80%] rounded-lg p-3 bg-yellow-50 border border-yellow-200 text-yellow-900 shadow-sm w-full">
                                <div className="text-xs font-bold mb-1">Internal Note</div>
                                <p className="text-sm">{n.body}</p>
                            </div>
                            <span className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-white border-t">
                    {activeTab === "messages" ? (
                        <form onSubmit={handleReply((data) => replyMutation.mutate(data.body))}>
                            <textarea {...registerReply("body", { required: true })} className="w-full border rounded-md p-2 text-sm min-h-[80px]" placeholder="Type your reply... public to customer" />
                            <div className="flex justify-end mt-2">
                                <Button type="submit" disabled={replyMutation.isPending}>Send Reply</Button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleNote((data) => noteMutation.mutate(data.body))}>
                            <textarea {...registerNote("body", { required: true })} className="w-full border rounded-md p-2 text-sm min-h-[80px] bg-yellow-50" placeholder="Add an internal note..." />
                            <div className="flex justify-end mt-2">
                                <Button type="submit" variant="secondary" className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800" disabled={noteMutation.isPending}>Add Note</Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Right: Context Panel (Profiles) */}
            <div className="w-80 border-l bg-white p-6 space-y-6 overflow-y-auto hidden xl:block">
                {/* Requester Profile */}
                {ticket.requester && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3">Requester Info</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                    {ticket.requester.full_name?.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="font-medium truncate">{ticket.requester.full_name}</div>
                                    <div className="text-gray-500 text-xs truncate">{ticket.requester.email}</div>
                                </div>
                            </div>

                            {ticket.requester.profile && (
                                <div className="bg-gray-50 rounded-md p-3 space-y-2 border">
                                    <div>
                                        <span className="text-xs text-gray-500 block">Department</span>
                                        <span className="font-medium">{ticket.requester.profile.department || "-"}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Location</span>
                                        <span className="font-medium">{ticket.requester.profile.location || "-"}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Device</span>
                                        <span className="font-medium">{ticket.requester.profile.device_label || "-"}</span>
                                    </div>
                                    {ticket.requester.profile.remote_access_id && (
                                        <div className="pt-2 border-t mt-2">
                                            <span className="text-xs text-gray-500 block">Remote Access ID</span>
                                            <code className="text-xs bg-gray-200 px-1 py-0.5 rounded text-blue-600 font-mono select-all">
                                                {ticket.requester.profile.remote_access_id}
                                            </code>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Workspace Profile */}
                {ticket.workspace && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3">Company Info</h3>
                        <div className="space-y-3 text-sm">
                            <div className="font-semibold text-gray-800">{ticket.workspace.name}</div>

                            {ticket.workspace.profile && (
                                <div className="bg-gray-50 rounded-md p-3 space-y-2 border">
                                    {ticket.workspace.profile.contact_email && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Contact</span>
                                            <span className="font-medium truncate max-w-[120px]" title={ticket.workspace.profile.contact_email}>{ticket.workspace.profile.contact_email}</span>
                                        </div>
                                    )}
                                    {ticket.workspace.profile.support_hours && (
                                        <div>
                                            <span className="text-xs text-gray-500 block">Hours</span>
                                            <span>{ticket.workspace.profile.support_hours}</span>
                                        </div>
                                    )}

                                    {(ticket.workspace.profile.remote_support_tool || ticket.workspace.profile.remote_support_instructions) && (
                                        <div className="pt-2 border-t mt-2">
                                            <span className="text-xs text-gray-500 block">Remote Policy ({ticket.workspace.profile.remote_support_tool || "General"})</span>
                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                {ticket.workspace.profile.remote_support_instructions}
                                            </p>
                                        </div>
                                    )}

                                    {ticket.workspace.profile.security_notes && (
                                        <div className="pt-2 border-t mt-2">
                                            <span className="text-xs text-red-500 font-bold block mb-1">Security Notes</span>
                                            <p className="text-xs text-gray-700 bg-red-50 p-2 rounded border border-red-100">
                                                {ticket.workspace.profile.security_notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
