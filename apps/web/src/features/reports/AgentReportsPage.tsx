import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AgentReportsPage() {
    const { data: summary, isLoading: loadingSummary } = useQuery({
        queryKey: ["agent-stats-summary"],
        queryFn: async () => (await api.get("/reports/agents/summary")).data.data
    });

    const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery({
        queryKey: ["agent-stats-leaderboard"],
        queryFn: async () => (await api.get("/reports/agents/leaderboard")).data.data
    });

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">My Performance</h1>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Assigned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loadingSummary ? "..." : summary?.my_open_assigned}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved (Week)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{loadingSummary ? "..." : summary?.my_resolved_this_week}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary?.my_sla_breaches_this_week > 0 ? 'text-destructive' : 'text-gray-900'}`}>{loadingSummary ? "..." : summary?.my_sla_breaches_this_week}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-- min</div>
                    </CardContent>
                </Card>
            </div>

            {/* Leaderboard */}
            <Card>
                <CardHeader>
                    <CardTitle>Leaderboard (Top Agents)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loadingLeaderboard ? <div>Loading...</div> : leaderboard?.map((entry: any, i: number) => (
                            <div key={entry.agent_id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-400' : 'bg-gray-100 text-gray-500'}`}>
                                        {i + 1}
                                    </div>
                                    <span className="font-medium">{entry.name}</span>
                                </div>
                                <Badge variant="secondary">{entry.score} Resolved</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
