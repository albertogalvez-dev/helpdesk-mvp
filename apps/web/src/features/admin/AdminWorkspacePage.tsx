import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { useAuthStore } from "@/lib/auth";
import { Shield, Save } from "lucide-react";

interface WorkspaceData {
    id: string;
    name: string;
    profile?: {
        company_name: string | null;
        contact_email: string | null;
        contact_phone: string | null;
        support_hours: string | null;
        remote_support_tool: string | null;
        remote_support_instructions: string | null;
    };
}

export function AdminWorkspacePage() {
    const user = useAuthStore((s) => s.user);
    const queryClient = useQueryClient();

    const { data: workspace, isLoading } = useQuery({
        queryKey: ["workspace-me"],
        queryFn: async () => {
            const res = await api.get("/workspaces/me");
            return res.data.data as WorkspaceData;
        },
    });

    const { register, handleSubmit } = useForm();

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.patch("/workspaces/me/profile", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspace-me"] });
        },
    });

    if (user?.role?.toLowerCase() !== "admin") {
        return (
            <div className="p-6">
                <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
                    <Shield className="h-5 w-5" />
                    <span>Admin access required.</span>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <div className="p-6 text-muted-foreground">Loading workspace...</div>;
    }

    return (
        <div className="max-w-2xl space-y-6 p-6">
            <PageHeader
                title="Workspace Settings"
                subtitle="Configure your company profile and support settings."
                breadcrumbs={
                    <Breadcrumbs
                        items={[
                            { label: "Agent", href: "/agent/inbox" },
                            { label: "Admin", href: "/agent/admin/workspace" },
                            { label: "Workspace" },
                        ]}
                    />
                }
            />

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{workspace?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Company Name</label>
                                <Input
                                    {...register("company_name")}
                                    defaultValue={workspace?.profile?.company_name || ""}
                                    placeholder="ACME Corporation"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Contact Email</label>
                                <Input
                                    {...register("contact_email")}
                                    defaultValue={workspace?.profile?.contact_email || ""}
                                    placeholder="support@company.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Contact Phone</label>
                                <Input
                                    {...register("contact_phone")}
                                    defaultValue={workspace?.profile?.contact_phone || ""}
                                    placeholder="+1 555 123 4567"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Support Hours</label>
                                <Input
                                    {...register("support_hours")}
                                    defaultValue={workspace?.profile?.support_hours || ""}
                                    placeholder="Mon-Fri 9AM-5PM"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Remote Support Tool</label>
                            <Input
                                {...register("remote_support_tool")}
                                defaultValue={workspace?.profile?.remote_support_tool || ""}
                                placeholder="AnyDesk, TeamViewer, etc."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Remote Support Instructions</label>
                            <textarea
                                {...register("remote_support_instructions")}
                                defaultValue={workspace?.profile?.remote_support_instructions || ""}
                                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Instructions for customers on how to prepare for remote support..."
                            />
                        </div>

                        <div className="flex justify-end border-t border-border pt-4">
                            <Button type="submit" disabled={updateMutation.isPending}>
                                <Save className="mr-2 h-4 w-4" />
                                {updateMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
