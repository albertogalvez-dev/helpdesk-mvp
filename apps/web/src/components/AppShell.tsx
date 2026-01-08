import { useAuthStore } from "@/lib/auth";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Ticket, Settings, LogOut } from "lucide-react";

export function AppShell() {
    const { user, logout } = useAuthStore();
    const location = useLocation();

    if (!user) return null;

    const links = [
        { href: "/inbox", label: "Inbox", icon: Ticket },
        { href: "/admin/slas", label: "SLA Admin", icon: Settings, role: "ADMIN" },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
                    <span className="font-bold text-lg text-sidebar-foreground">Helpdesk</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {links.map((link) => (
                        (!link.role || user.role === link.role) && (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    location.pathname.startsWith(link.href)
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                                )}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        )
                    ))}
                </nav>
                <div className="p-4 border-t border-sidebar-border">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.full_name[0]}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium truncate w-32">{user.full_name}</span>
                            <span className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</span>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center px-6 justify-between md:hidden">
                    <span className="font-bold">Helpdesk</span>
                    {/* Mobile menu trigger could go here */}
                </header>
                <div className="flex-1 overflow-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
