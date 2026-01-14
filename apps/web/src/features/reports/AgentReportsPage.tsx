import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { cn } from "@/lib/utils";

const MOCK_SUMMARY = {
    tickets_created: 247,
    tickets_resolved: 198,
    sla_breaches: 12,
    avg_response_minutes: 23,
    resolved_percentage: 88,
    active_agents: 4,
};

const MOCK_LEADERBOARD = [
    { agent_id: "1", name: "Bob Agent", role: "Senior Agent", score: 52, avatar: "B" },
    { agent_id: "2", name: "Alice Support", role: "Agent", score: 41, avatar: "A" },
    { agent_id: "3", name: "Carlos Tech", role: "Agent", score: 38, avatar: "C" },
    { agent_id: "4", name: "Diana Help", role: "Junior", score: 29, avatar: "D" },
    { agent_id: "5", name: "Elena IT", role: "Agent", score: 18, avatar: "E" },
];

const TRENDING_TAGS = [
    { tag: "billing", count: 89 },
    { tag: "api-integration", count: 64 },
    { tag: "sso", count: 52 },
    { tag: "performance", count: 48 },
    { tag: "mobile", count: 36 },
];

const CHART_DATA = [
    { label: "Mon", value: 35, created: 42 },
    { label: "Tue", value: 52, created: 58 },
    { label: "Wed", value: 45, created: 51 },
    { label: "Thu", value: 61, created: 70 },
    { label: "Fri", value: 73, created: 82 },
    { label: "Sat", value: 28, created: 32 },
    { label: "Sun", value: 15, created: 18 },
];

export function AgentReportsPage() {
    const [dateRange, setDateRange] = useState("7d");

    const { data: apiSummary, isLoading: loadingSummary } = useQuery({
        queryKey: ["agent-stats-summary"],
        queryFn: async () => {
            try {
                return (await api.get("/reports/agents/summary")).data.data;
            } catch {
                return null;
            }
        },
        retry: false,
    });

    const { data: apiLeaderboard, isLoading: loadingLeaderboard } = useQuery({
        queryKey: ["agent-stats-leaderboard"],
        queryFn: async () => {
            try {
                return (await api.get("/reports/agents/leaderboard")).data.data;
            } catch {
                return null;
            }
        },
        retry: false,
    });

    const summary = apiSummary || MOCK_SUMMARY;
    const leaderboard = apiLeaderboard?.length ? apiLeaderboard : MOCK_LEADERBOARD;
    const maxChartValue = Math.max(...CHART_DATA.map(d => Math.max(d.value, d.created)));

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="border-b border-border px-8 py-4 flex items-center justify-between bg-card">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <a className="hover:text-primary transition-colors" href="#">Agent</a>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-foreground font-medium">Reports</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">search</span>
                        <input
                            className="bg-muted border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary w-64"
                            placeholder="Search reports..."
                            type="text"
                        />
                    </div>
                    <select
                        className="bg-muted border-none rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
                {/* Summary Cards Row */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Tickets Created</p>
                                <p className="text-3xl font-black">{loadingSummary ? "..." : summary.tickets_created || 247}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <span className="text-primary font-medium">↑ 12%</span> vs last week
                                </p>
                            </div>
                            <div className="p-3 bg-primary/20 rounded-xl">
                                <span className="material-symbols-outlined text-foreground">confirmation_number</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Resolved</p>
                                <p className="text-3xl font-black text-primary">{loadingSummary ? "..." : summary.tickets_resolved || 198}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {summary.resolved_percentage || 88}% resolution rate
                                </p>
                            </div>
                            <div className="p-3 bg-primary/20 rounded-xl">
                                <span className="material-symbols-outlined text-foreground">check_circle</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">SLA Breaches</p>
                                <p className="text-3xl font-black text-destructive">{loadingSummary ? "..." : summary.sla_breaches || 12}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <span className="text-destructive font-medium">↓ 3%</span> improvement
                                </p>
                            </div>
                            <div className="p-3 bg-destructive/10 rounded-xl">
                                <span className="material-symbols-outlined text-destructive">warning</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Avg Response</p>
                                <p className="text-3xl font-black">{loadingSummary ? "..." : `${summary.avg_response_minutes || 23}m`}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    First response time
                                </p>
                            </div>
                            <div className="p-3 bg-muted rounded-xl">
                                <span className="material-symbols-outlined text-foreground">schedule</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Ticket Volume Chart */}
                    <div className="col-span-2 bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold">Ticket Volume</h3>
                                <p className="text-xs text-muted-foreground">Created vs Resolved this week</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="size-3 rounded-full bg-primary" />
                                    <span className="text-xs text-muted-foreground">Resolved</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-3 rounded-full bg-muted-foreground/30" />
                                    <span className="text-xs text-muted-foreground">Created</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-end justify-between h-48 gap-4">
                            {CHART_DATA.map((item) => (
                                <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex flex-col items-center gap-1 h-full justify-end">
                                        <div
                                            className="w-full max-w-8 bg-muted-foreground/20 rounded-t-md"
                                            style={{ height: `${(item.created / maxChartValue) * 100}%` }}
                                        />
                                        <div
                                            className="w-full max-w-8 bg-primary rounded-md -mt-1"
                                            style={{ height: `${(item.value / maxChartValue) * 100}%`, minHeight: 4 }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trending Tags */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4">Trending Tags</h3>
                        <div className="space-y-3">
                            {TRENDING_TAGS.map((tag, i) => (
                                <div key={tag.tag} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                                        <span className="text-sm font-medium">#{tag.tag}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{tag.count} tickets</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Agent Leaderboard */}
                <div className="mt-6 bg-card border border-border rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">emoji_events</span>
                            <h3 className="text-lg font-bold">Agent Leaderboard</h3>
                        </div>
                    </div>

                    {loadingLeaderboard ? (
                        <div className="p-8 text-center text-muted-foreground">Loading...</div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rank</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Agent</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Resolved</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {leaderboard.slice(0, 5).map((entry: any, i: number) => (
                                    <tr key={entry.agent_id || i} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className={cn(
                                                "size-8 rounded-full flex items-center justify-center text-sm font-bold",
                                                i === 0 ? "bg-primary text-primary-foreground" :
                                                    i === 1 ? "bg-muted text-foreground" :
                                                        i === 2 ? "bg-muted text-foreground" :
                                                            "bg-transparent text-muted-foreground"
                                            )}>
                                                {i + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                                                    {entry.avatar || entry.name?.charAt(0) || "A"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{entry.name || "Agent"}</p>
                                                    {i === 0 && (
                                                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                                                            Top Performer
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {entry.role || "Agent"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-lg">
                                                {entry.score || 0} tickets
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
