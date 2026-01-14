import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/lib/auth";
import { useState } from "react";
import { cn } from "@/lib/utils";

const priorityLevels = [
    { label: "Urgent (S1)", response: "15m", nextResponse: "1h", resolution: "4h", color: "bg-red-500" },
    { label: "High (S2)", response: "1h", nextResponse: "4h", resolution: "8h", color: "bg-orange-400" },
    { label: "Medium (S3)", response: "4h", nextResponse: "8h", resolution: "24h", color: "bg-blue-400" },
];

export function SlasAdminPage() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState("active");

    const { data: policies, isLoading } = useQuery({
        queryKey: ["slas"],
        queryFn: async () => (await api.get("/slas")).data.data,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post("/slas", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["slas"] });
            reset();
        },
    });

    const runJobMutation = useMutation({
        mutationFn: (job: string) => api.post("/admin/jobs/run", { job }),
        onSuccess: () => alert("Job executed successfully."),
    });

    const { register, handleSubmit, reset } = useForm();

    if (user?.role?.toLowerCase() !== "admin") {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                <span className="material-symbols-outlined text-4xl mr-2">lock</span>
                Access denied. Admin role required.
            </div>
        );
    }

    const tabs = [
        { id: "active", label: "Active Policies", count: policies?.filter((p: any) => p.is_active).length || 0 },
        { id: "drafts", label: "Drafts", count: 1 },
        { id: "archived", label: "Archived" },
    ];

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <header className="border-b border-border flex items-center justify-between px-8 py-4 bg-card">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <a className="hover:text-primary transition-colors" href="#">Admin</a>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-foreground font-medium">SLA Policies</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">search</span>
                        <input
                            className="bg-muted border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary w-64 transition-all"
                            placeholder="Search policies..."
                            type="text"
                        />
                    </div>
                    <button className="p-2 rounded-lg hover:bg-muted relative">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
                {/* Heading Section */}
                <div className="flex items-end justify-between mb-8">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl font-black tracking-tight mb-2">SLA Policies</h2>
                        <p className="text-muted-foreground">
                            Define and manage response and resolution time targets for your support team.
                            Policies are evaluated in top-to-bottom order.
                        </p>
                    </div>
                    <button
                        onClick={() => {/* open create modal */ }}
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 hover:brightness-95 transition-all"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Create Policy
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border mb-6 gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-1 py-4 border-b-2 font-bold text-sm transition-colors",
                                activeTab === tab.id
                                    ? "border-primary text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.label} {tab.count !== undefined && `(${tab.count})`}
                        </button>
                    ))}
                </div>

                {/* Policy List */}
                <div className="flex flex-col gap-4">
                    {isLoading && (
                        <div className="p-8 text-center text-muted-foreground">
                            <span className="material-symbols-outlined animate-spin text-2xl">refresh</span>
                            <p className="mt-2 text-sm">Loading policies...</p>
                        </div>
                    )}

                    {policies?.filter((p: any) => activeTab === "active" ? p.is_active : !p.is_active).map((policy: any, index: number) => (
                        <div
                            key={policy.id}
                            className="policy-card bg-card border border-border rounded-xl p-6 transition-all relative flex flex-col gap-6"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground">
                                        <span className="material-symbols-outlined">drag_indicator</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold">{policy.name}</h3>
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                                                policy.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-200 text-gray-600"
                                            )}>
                                                {policy.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Response: {policy.first_response_time_minutes}m / Resolution: {policy.resolution_time_minutes}m
                                        </p>
                                        <div className="flex gap-2">
                                            <span className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                                Business Hours
                                            </span>
                                            <span className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                                                <span className="material-symbols-outlined text-sm">public</span>
                                                UTC
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {policy.is_active ? "Active" : "Inactive"}
                                        </span>
                                        <button className={cn(
                                            "w-10 h-5 rounded-full relative p-0.5",
                                            policy.is_active ? "bg-primary" : "bg-muted"
                                        )}>
                                            <div className={cn(
                                                "absolute top-0.5 size-4 bg-white rounded-full transition-all",
                                                policy.is_active ? "right-0.5" : "left-0.5"
                                            )} />
                                        </button>
                                    </div>
                                    <button className="p-2 hover:bg-muted rounded-lg">
                                        <span className="material-symbols-outlined text-muted-foreground">more_vert</span>
                                    </button>
                                </div>
                            </div>

                            {/* Target Matrix */}
                            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Priority</p>
                                    <div className="flex flex-col gap-3">
                                        {priorityLevels.map((level) => (
                                            <span key={level.label} className="text-sm font-semibold flex items-center gap-2">
                                                <span className={cn("size-2 rounded-full", level.color)} />
                                                {level.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">First Response</p>
                                    <div className="flex flex-col gap-3">
                                        {priorityLevels.map((level, i) => (
                                            <p key={i} className="text-sm font-bold">{level.response}</p>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Next Response</p>
                                    <div className="flex flex-col gap-3">
                                        {priorityLevels.map((level, i) => (
                                            <p key={i} className="text-sm font-bold">{level.nextResponse}</p>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Resolution</p>
                                    <div className="flex flex-col gap-3">
                                        {priorityLevels.map((level, i) => (
                                            <p key={i} className={cn("text-sm font-bold", i === 0 && "text-primary")}>{level.resolution}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Demo Actions hint */}
                    {policies && policies.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                            <span className="material-symbols-outlined text-4xl">policy</span>
                            <p className="mt-2">No policies found. Create your first SLA policy.</p>
                        </div>
                    )}
                </div>

                {/* Hint Section */}
                <div className="mt-12 bg-primary/10 border border-primary/20 rounded-xl p-6 flex items-start gap-4">
                    <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                        <span className="material-symbols-outlined">lightbulb</span>
                    </div>
                    <div>
                        <h4 className="font-bold mb-1">How policies are prioritized</h4>
                        <p className="text-sm text-foreground/70 leading-relaxed">
                            The system checks each ticket against policies starting from the top. The <strong className="text-foreground">first policy</strong> that matches the ticket's criteria will be the one applied. Use the drag handles to reorder priority levels.
                        </p>
                    </div>
                </div>

                {/* Demo Actions Card */}
                <div className="mt-8 p-6 bg-card border border-border rounded-xl">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">bug_report</span>
                        Demo Actions (Admin Only)
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                        Trigger background jobs instantly for demonstration purposes.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => runJobMutation.mutate("sla_escalation")}
                            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                        >
                            Run SLA Escalation
                        </button>
                        <button
                            onClick={() => runJobMutation.mutate("auto_close")}
                            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                        >
                            Run Auto-Close
                        </button>
                        <button
                            onClick={() => runJobMutation.mutate("weekly_snapshot")}
                            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                        >
                            Run Weekly Snapshot
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
