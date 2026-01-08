import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth";
import { Building2, Shield, Save } from "lucide-react";

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

    const { register, handleSubmit, formState: { isDirty } } = useForm();

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
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <Shield className="h-5 w-5 text-red-500" />
                    <span className="text-red-700">Admin access required.</span>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <div className="p-6">Loading workspace...</div>;
    }

    return (
        <div className="p-6 space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Workspace Settings</h1>
            </div>

            <div className="bg-white border rounded-lg shadow-sm p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-1">{workspace?.name}</h2>
                    <p className="text-sm text-gray-500">Configure your company profile and support settings.</p>
                </div>

                <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company Name</label>
                            <Input
                                {...register("company_name")}
                                defaultValue={workspace?.profile?.company_name || ""}
                                placeholder="ACME Corporation"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contact Email</label>
                            <Input
                                {...register("contact_email")}
                                defaultValue={workspace?.profile?.contact_email || ""}
                                placeholder="support@company.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contact Phone</label>
                            <Input
                                {...register("contact_phone")}
                                defaultValue={workspace?.profile?.contact_phone || ""}
                                placeholder="+1 555 123 4567"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Support Hours</label>
                            <Input
                                {...register("support_hours")}
                                defaultValue={workspace?.profile?.support_hours || ""}
                                placeholder="Mon-Fri 9AM-5PM"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Remote Support Tool</label>
                        <Input
                            {...register("remote_support_tool")}
                            defaultValue={workspace?.profile?.remote_support_tool || ""}
                            placeholder="AnyDesk, TeamViewer, etc."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Remote Support Instructions</label>
                        <textarea
                            {...register("remote_support_instructions")}
                            defaultValue={workspace?.profile?.remote_support_instructions || ""}
                            className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm"
                            placeholder="Instructions for customers on how to prepare for remote support..."
                        />
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={updateMutation.isPending}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
