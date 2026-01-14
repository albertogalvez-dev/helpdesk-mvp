import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { AvatarInitials } from "@/components/AvatarInitials";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function AgentShell() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [adminOpen, setAdminOpen] = useState(location.pathname.includes("/admin"));

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isAdmin = user?.role?.toLowerCase() === "admin";

    const mainNavItems = [
        { label: "Inbox", icon: "inbox", path: "/agent/inbox" },
        { label: "Reports", icon: "analytics", path: "/agent/reports" },
    ];

    const adminNavItems = [
        { label: "Users", icon: "group", path: "/agent/admin/users" },
        { label: "Workspace", icon: "apartment", path: "/agent/admin/workspace" },
        { label: "SLAs", icon: "timer", path: "/agent/admin/slas" },
    ];

    return (
        <div className="flex h-screen bg-background font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card flex flex-col justify-between p-4 shrink-0">
                <div className="flex flex-col gap-8">
                    {/* Branding */}
                    <div className="flex items-center gap-3 px-2">
                        <div className="bg-primary size-8 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary-foreground text-xl">bolt</span>
                        </div>
                        <div>
                            <h1 className="text-foreground text-base font-bold leading-tight">Helpdesk</h1>
                            <p className="text-muted-foreground text-xs font-normal">Enterprise Plan</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-1">
                        {mainNavItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                        isActive
                                            ? "bg-primary/20 text-foreground font-medium"
                                            : "text-muted-foreground hover:bg-muted cursor-pointer"
                                    )}
                                >
                                    <span
                                        className="material-symbols-outlined"
                                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="text-sm">{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Admin Section */}
                        {isAdmin && (
                            <>
                                <div className="h-px bg-border my-2 mx-3" />
                                <button
                                    onClick={() => setAdminOpen(!adminOpen)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full",
                                        adminOpen ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    <span
                                        className="material-symbols-outlined"
                                        style={adminOpen ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                    >
                                        settings
                                    </span>
                                    <span className="text-sm font-medium">Admin</span>
                                    <span className={cn("material-symbols-outlined text-sm ml-auto transition-transform", adminOpen && "rotate-180")}>
                                        expand_more
                                    </span>
                                </button>

                                {adminOpen && (
                                    <div className="mt-1 space-y-1 pl-4">
                                        {adminNavItems.map((item) => {
                                            const isActive = location.pathname === item.path;
                                            return (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                                                        isActive
                                                            ? "bg-primary/20 text-foreground font-medium"
                                                            : "text-muted-foreground hover:bg-muted"
                                                    )}
                                                >
                                                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                                    <span>{item.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </nav>
                </div>

                {/* Profile & Action */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => navigate("/agent/inbox")}
                        className="w-full bg-primary hover:brightness-95 text-primary-foreground py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    >
                        <span className="material-symbols-outlined text-base">add</span>
                        New Ticket
                    </button>
                    <div className="flex items-center gap-3 border-t border-border pt-4">
                        <AvatarInitials name={user?.full_name} email={user?.email} size="sm" />
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-semibold truncate text-foreground">{user?.full_name || "Agent"}</p>
                            <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Logout"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full bg-card overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
}
