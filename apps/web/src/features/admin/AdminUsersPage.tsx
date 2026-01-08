import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/auth";
import { Users, Shield, UserCircle } from "lucide-react";

interface UserItem {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

function RoleBadge({ role }: { role: string }) {
    const styles: Record<string, string> = {
        admin: "bg-purple-100 text-purple-800",
        agent: "bg-lime-100 text-lime-800",
        customer: "bg-gray-100 text-gray-600",
    };
    return (
        <Badge className={styles[role.toLowerCase()] || "bg-gray-100"}>
            {role.toUpperCase()}
        </Badge>
    );
}

export function AdminUsersPage() {
    const user = useAuthStore((s) => s.user);

    const { data, isLoading, error } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const res = await api.get("/users");
            return res.data.data as UserItem[];
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

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold">User Management</h1>
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                {isLoading && (
                    <div className="p-8 text-center text-gray-500">Loading users...</div>
                )}

                {error && (
                    <div className="p-8 text-center text-red-500">Failed to load users</div>
                )}

                {data && (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">User</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                <UserCircle className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{u.full_name || "No Name"}</div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <RoleBadge role={u.role} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium ${u.is_active ? "text-green-600" : "text-gray-400"}`}>
                                            {u.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
