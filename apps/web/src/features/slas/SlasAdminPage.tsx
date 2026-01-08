import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/auth";

export function SlasAdminPage() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const { data: policies, isLoading } = useQuery({
        queryKey: ["slas"],
        queryFn: async () => (await api.get("/slas")).data.data
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post("/slas", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["slas"] });
            reset();
        }
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, active }: { id: string, active: boolean }) => api.patch(`/slas/${id}`, { is_active: active }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["slas"] })
    });

    const runJobMutation = useMutation({
        mutationFn: (job: string) => api.post("/admin/jobs/run", { job }),
        onSuccess: () => alert("Job executed successfully! Check logs/inbox.")
    });

    const { register, handleSubmit, reset } = useForm();

    if (user?.role !== "ADMIN") return <div className="p-8">Access Denied</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">SLA Policies</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Create Policy */}
                <Card>
                    <CardHeader><CardTitle>Create Policy</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit((data) => createMutation.mutate({
                            ...data,
                            first_response_time_minutes: parseInt(data.first),
                            resolution_time_minutes: parseInt(data.res),
                            is_active: true
                        }))} className="space-y-4">

                            <div>
                                <label className="text-sm font-medium">Policy Name</label>
                                <Input {...register("name", { required: true })} placeholder="e.g. VIP Support" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">First Resp (min)</label>
                                    <Input {...register("first", { required: true })} type="number" defaultValue={60} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Resolution (min)</label>
                                    <Input {...register("res", { required: true })} type="number" defaultValue={240} />
                                </div>
                            </div>
                            <Button type="submit" disabled={createMutation.isPending}>Create Policy</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Manual Jobs */}
                <Card>
                    <CardHeader><CardTitle>Demo Actions (Admin)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-500">Trigger background jobs instantly for demo purposes.</p>
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" onClick={() => runJobMutation.mutate("sla_escalation")}>
                                Run SLA Escalation Job
                            </Button>
                            <Button variant="outline" onClick={() => runJobMutation.mutate("auto_close")}>
                                Run Auto-Close Job
                            </Button>
                            <Button variant="outline" onClick={() => runJobMutation.mutate("weekly_snapshot")}>
                                Run Weekly Snapshot
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* List */}
            <Card>
                <CardHeader><CardTitle>Existing Policies</CardTitle></CardHeader>
                <CardContent>
                    {isLoading && <div>Loading...</div>}
                    <div className="space-y-2">
                        {policies?.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                <div>
                                    <div className="font-semibold">{p.name}</div>
                                    <div className="text-xs text-gray-500">
                                        Response: {p.first_response_time_minutes}m • Resolution: {p.resolution_time_minutes}m
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={p.is_active ? "success" : "secondary"}>
                                        {p.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                    {/* Toggle button if we had an endpoint for full update, currently patch only supported if implemented. 
                                   Assuming we can patch is_active based on API spec. Check? 
                                   If not, just show status. 
                               */}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
