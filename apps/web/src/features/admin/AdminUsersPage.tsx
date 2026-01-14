import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarInitials } from "@/components/AvatarInitials";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { useAuthStore } from "@/lib/auth";
import { Shield, Plus, MoreHorizontal, Edit, Trash2, X, ExternalLink } from "lucide-react";
import { useState } from "react";

interface UserItem {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
    phone?: string;
    anydesk_id?: string;
    department?: string;
}

function RoleBadge({ role }: { role: string }) {
    const styles: Record<string, string> = {
        admin: "bg-primary/15 text-foreground border border-primary/20",
        agent: "bg-secondary text-foreground border border-border",
        customer: "bg-muted text-muted-foreground border border-border",
    };

    return (
        <Badge
            variant="secondary"
            className={styles[role.toLowerCase()] || "bg-muted text-muted-foreground border border-border"}
        >
            {role.toUpperCase()}
        </Badge>
    );
}

function CreateUserModal({
    isOpen,
    onClose,
    onSuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        email: "",
        full_name: "",
        password: "password123",
        role: "customer",
        phone: "",
        anydesk_id: "",
        department: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await api.post("/users", formData);
            onSuccess();
            onClose();
            setFormData({
                email: "",
                full_name: "",
                password: "password123",
                role: "customer",
                phone: "",
                anydesk_id: "",
                department: "",
            });
        } catch (err: any) {
            setError(err.response?.data?.error?.message || "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40">
            <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Add New User</h2>
                    <button onClick={onClose} className="rounded p-1 hover:bg-muted">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-foreground">Full Name</label>
                        <Input
                            value={formData.full_name}
                            onChange={(e) => setFormData((f) => ({ ...f, full_name: e.target.value }))}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                            placeholder="john@company.com"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground">Role</label>
                            <select
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={formData.role}
                                onChange={(e) => setFormData((f) => ({ ...f, role: e.target.value }))}
                            >
                                <option value="customer">Customer</option>
                                <option value="agent">Agent</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">Department</label>
                            <Input
                                value={formData.department}
                                onChange={(e) => setFormData((f) => ({ ...f, department: e.target.value }))}
                                placeholder="IT, Sales..."
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground">Phone</label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                                placeholder="+1 555 123..."
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">AnyDesk ID</label>
                            <Input
                                value={formData.anydesk_id}
                                onChange={(e) => setFormData((f) => ({ ...f, anydesk_id: e.target.value }))}
                                placeholder="123 456 789"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground">Password</label>
                        <Input
                            value={formData.password}
                            onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
                            placeholder="Initial password"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Default: password123</p>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? "Creating..." : "Create User"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AdminUsersPage() {
    const user = useAuthStore((s) => s.user);
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const res = await api.get("/users");
            return res.data.data as UserItem[];
        },
        placeholderData: (prev) => prev,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            setActionMenuId(null);
        },
    });

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
            api.patch(`/users/${id}`, { is_active }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            setActionMenuId(null);
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

    return (
        <div className="min-h-screen space-y-6 bg-background p-6">
            <PageHeader
                title="User Management"
                subtitle="Manage agents, admins, and customers."
                breadcrumbs={
                    <Breadcrumbs
                        items={[
                            { label: "Agent", href: "/agent/inbox" },
                            { label: "Admin", href: "/agent/admin/users" },
                            { label: "Users" },
                        ]}
                    />
                }
                actions={
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                }
            />

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                {isLoading && (
                    <div className="p-8 text-center text-muted-foreground">Loading users...</div>
                )}

                {error && (
                    <div className="p-8 text-center text-destructive">Failed to load users</div>
                )}

                {data && (
                    <table className="w-full table-dense">
                        <thead className="bg-muted/40">
                            <tr>
                                <th className="w-64">User</th>
                                <th className="w-28">Role</th>
                                <th className="w-24">Status</th>
                                <th className="w-32">Contact</th>
                                <th className="w-28">Joined</th>
                                <th className="w-16 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-background">
                            {data.map((u) => (
                                <tr key={u.id} className="transition-colors hover:bg-muted/40">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <AvatarInitials name={u.full_name} email={u.email} />
                                            <div>
                                                <Link
                                                    to={`/agent/admin/users/${u.id}`}
                                                    className="group flex items-center gap-1 font-medium text-foreground transition-colors hover:text-primary"
                                                >
                                                    {u.full_name || "Unknown"}
                                                    <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                                                </Link>
                                                <div className="text-xs text-muted-foreground">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RoleBadge role={u.role} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                                                u.is_active
                                                    ? "bg-primary/15 text-foreground border-primary/20"
                                                    : "bg-muted text-muted-foreground border-border"
                                            }`}
                                        >
                                            {u.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {u.phone || u.anydesk_id ? (
                                            <div className="space-y-0.5">
                                                {u.phone && <div className="text-xs">{u.phone}</div>}
                                                {u.anydesk_id && <div className="text-xs">AD: {u.anydesk_id}</div>}
                                            </div>
                                        ) : (
                                            <span>N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="relative inline-block text-left">
                                            <button
                                                onClick={() => setActionMenuId(actionMenuId === u.id ? null : u.id)}
                                                className="rounded-full p-1 transition-colors hover:bg-muted"
                                            >
                                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                            {actionMenuId === u.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setActionMenuId(null)} />
                                                    <div className="absolute right-0 z-20 mt-2 w-36 rounded-lg border border-border bg-background py-1 shadow-lg">
                                                        <button
                                                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-muted/50"
                                                            onClick={() =>
                                                                toggleActiveMutation.mutate({
                                                                    id: u.id,
                                                                    is_active: !u.is_active,
                                                                })
                                                            }
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                            {u.is_active ? "Deactivate" : "Activate"}
                                                        </button>
                                                        <button
                                                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                                                            onClick={() => {
                                                                if (confirm("Delete this user?")) {
                                                                    deleteMutation.mutate(u.id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <CreateUserModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}
            />
        </div>
    );
}
