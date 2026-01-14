import { useAuthStore } from "@/lib/auth";
import { AvatarInitials } from "@/components/AvatarInitials";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export function PortalAccount() {
    const user = useAuthStore((s) => s.user);

    return (
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
            <PageHeader
                title="Account"
                subtitle="Manage your profile information."
                breadcrumbs={
                    <Breadcrumbs
                        items={[
                            { label: "Portal", href: "/portal/tickets" },
                            { label: "Account" },
                        ]}
                    />
                }
            />

            <Card>
                <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <AvatarInitials name={user?.full_name} email={user?.email} size="lg" />
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-foreground">
                            {user?.full_name || "Your profile"}
                        </h2>
                        <p className="text-sm text-muted-foreground">{user?.email || "No email on file"}</p>
                        <p className="text-sm text-muted-foreground">
                            Role: {user?.role ? user.role.toString() : "Customer"}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
