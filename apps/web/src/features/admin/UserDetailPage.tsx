import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarInitials } from "@/components/AvatarInitials";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { useState, useEffect } from "react";
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Monitor,
    Building,
    CreditCard,
    Calendar,
    Edit,
    Save,
    X,
    Ticket,
} from "lucide-react";

interface UserData {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    phone?: string;
    anydesk_id?: string;
    department?: string;
    subscription_plan?: string;
    created_at: string;
}

const SUBSCRIPTION_STYLES: Record<string, { className: string; label: string }> = {
    free: { className: "bg-muted text-muted-foreground border border-border", label: "Free" },
    pro: { className: "bg-primary/15 text-foreground border border-primary/20", label: "Pro" },
    enterprise: { className: "bg-secondary text-foreground border border-border", label: "Enterprise" },
};

export function UserDetailPage() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<UserData>>({});

    const { data: user, isLoading, error } = useQuery<UserData>({
        queryKey: ["user", id],
        queryFn: async () => {
            const res = await api.get(`/users/${id}`);
            return res.data.data;
        },
    });

    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    const updateMutation = useMutation({
        mutationFn: (data: Partial<UserData>) => api.patch(`/users/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            setIsEditing(false);
        },
    });

    const { data: userTickets } = useQuery({
        queryKey: ["user-tickets", id],
        queryFn: async () => {
            const res = await api.get(`/tickets?created_by=${id}&size=5`);
            return res.data.data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 rounded bg-muted" />
                    <div className="h-32 rounded-xl bg-muted/60" />
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
                    <p>User not found</p>
                    <Link to="/agent/admin/users" className="mt-2 inline-block text-sm underline">
                        Back to Users
                    </Link>
                </div>
            </div>
        );
    }

    const subStyle = SUBSCRIPTION_STYLES[user.subscription_plan || "free"];

    const handleSave = () => {
        updateMutation.mutate({
            full_name: formData.full_name,
            phone: formData.phone,
            anydesk_id: formData.anydesk_id,
            department: formData.department,
            subscription_plan: formData.subscription_plan,
            is_active: formData.is_active,
        });
    };

    return (
        <div className="space-y-6 p-6">
            <Link to="/agent/admin/users">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </Link>

            <PageHeader
                title="User Profile"
                subtitle="Manage account details and permissions."
                breadcrumbs={
                    <Breadcrumbs
                        items={[
                            { label: "Agent", href: "/agent/inbox" },
                            { label: "Admin", href: "/agent/admin/users" },
                            { label: "Users", href: "/agent/admin/users" },
                            { label: user.full_name || "User" },
                        ]}
                    />
                }
            />

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                        <AvatarInitials name={user.full_name} email={user.email} size="lg" />

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-2xl font-semibold text-foreground">
                                    {user.full_name || "No Name"}
                                </h1>
                                <Badge className={subStyle.className}>{subStyle.label}</Badge>
                                <span
                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                                        user.is_active
                                            ? "bg-primary/15 text-foreground border-primary/20"
                                            : "bg-muted text-muted-foreground border-border"
                                    }`}
                                >
                                    {user.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {user.email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Joined {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant={isEditing ? "default" : "outline"}
                                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                                disabled={updateMutation.isPending}
                            >
                                {isEditing ? (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                ) : (
                                    <>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </>
                                )}
                            </Button>
                            {isEditing && (
                                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase">Full Name</label>
                            {isEditing ? (
                                <Input
                                    value={formData.full_name || ""}
                                    onChange={(e) => setFormData((f) => ({ ...f, full_name: e.target.value }))}
                                    className="mt-1"
                                />
                            ) : (
                                <p className="mt-1 font-medium text-foreground">{user.full_name || "N/A"}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase">Phone</label>
                            {isEditing ? (
                                <Input
                                    value={formData.phone || ""}
                                    onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                                    placeholder="+1 555 123 4567"
                                    className="mt-1"
                                />
                            ) : (
                                <p className="mt-1 flex items-center gap-2 font-medium text-foreground">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    {user.phone || "N/A"}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase">Department</label>
                            {isEditing ? (
                                <Input
                                    value={formData.department || ""}
                                    onChange={(e) => setFormData((f) => ({ ...f, department: e.target.value }))}
                                    placeholder="IT, Sales, Marketing..."
                                    className="mt-1"
                                />
                            ) : (
                                <p className="mt-1 flex items-center gap-2 font-medium text-foreground">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    {user.department || "N/A"}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Monitor className="h-5 w-5 text-primary" />
                            Remote Support
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase">AnyDesk ID</label>
                            {isEditing ? (
                                <Input
                                    value={formData.anydesk_id || ""}
                                    onChange={(e) => setFormData((f) => ({ ...f, anydesk_id: e.target.value }))}
                                    placeholder="123 456 789"
                                    className="mt-1"
                                />
                            ) : (
                                <p className="mt-1 font-mono text-lg text-foreground">
                                    {user.anydesk_id || "Not configured"}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase">Subscription Plan</label>
                            {isEditing ? (
                                <select
                                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={formData.subscription_plan || "free"}
                                    onChange={(e) => setFormData((f) => ({ ...f, subscription_plan: e.target.value }))}
                                >
                                    <option value="free">Free</option>
                                    <option value="pro">Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            ) : (
                                <div className="mt-1 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <Badge className={subStyle.className}>{subStyle.label}</Badge>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-primary" />
                        Recent Tickets
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {userTickets?.length ? (
                        <div className="space-y-2">
                            {userTickets.map((t: any) => (
                                <Link
                                    key={t.id}
                                    to={`/agent/tickets/${t.id}`}
                                    className="flex items-center justify-between rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/40"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 font-medium text-foreground">
                                            {t.subject}
                                            <span className="text-xs font-mono text-muted-foreground">
                                                #{t.id.slice(0, 8)}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-background">
                                        {t.status}
                                    </Badge>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">No tickets yet</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
