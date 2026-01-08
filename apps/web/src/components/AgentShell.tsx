import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Inbox,
    Settings,
    LogOut,
    BarChart3,
    Users,
    Building2,
    Clock,
    ChevronDown,
} from "lucide-react";
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
        { label: "Inbox", icon: Inbox, path: "/agent/inbox" },
        { label: "Reports", icon: BarChart3, path: "/agent/reports" },
    ];

    const adminNavItems = [
        { label: "Users", icon: Users, path: "/agent/admin/users" },
        { label: "Workspace", icon: Building2, path: "/agent/admin/workspace" },
        { label: "SLAs", icon: Clock, path: "/agent/admin/slas" },
    ];

    return (
        <div className="flex h-screen bg-background font-sans">
            {/* Sidebar - Dark Theme */}
            <aside className="w-16 lg:w-64 flex flex-col transition-all duration-300 shadow-xl"
                style={{ backgroundColor: 'hsl(var(--sidebar-background))' }}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b"
                    style={{ borderColor: 'hsl(var(--sidebar-border))', backgroundColor: 'hsl(140 25% 10%)' }}>
                    <LayoutDashboard className="h-6 w-6 mr-0 lg:mr-3" style={{ color: 'hsl(var(--sidebar-primary))' }} />
                    <span className="font-bold text-lg hidden lg:block tracking-tight text-white">HelpDesk</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {mainNavItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center px-2 lg:px-4 py-3 text-sm font-medium rounded-md transition-colors group",
                                location.pathname.startsWith(item.path)
                                    ? "shadow-sm"
                                    : "hover:opacity-90"
                            )}
                            style={{
                                backgroundColor: location.pathname.startsWith(item.path)
                                    ? 'hsl(var(--sidebar-accent))'
                                    : 'transparent',
                                color: location.pathname.startsWith(item.path)
                                    ? 'hsl(var(--sidebar-primary))'
                                    : 'hsl(var(--sidebar-foreground))',
                            }}
                        >
                            <item.icon
                                className="h-5 w-5 mr-0 lg:mr-3 flex-shrink-0"
                                style={{
                                    color: location.pathname.startsWith(item.path)
                                        ? 'hsl(var(--sidebar-primary))'
                                        : 'hsl(var(--sidebar-foreground))'
                                }}
                            />
                            <span className="hidden lg:block">{item.label}</span>
                        </Link>
                    ))}

                    {/* Admin Section */}
                    {isAdmin && (
                        <div className="pt-4 mt-4 border-t" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
                            <button
                                onClick={() => setAdminOpen(!adminOpen)}
                                className="flex items-center justify-between w-full px-2 lg:px-4 py-2 text-sm font-medium rounded-md transition-colors"
                                style={{ color: 'hsl(var(--sidebar-foreground))' }}
                            >
                                <div className="flex items-center">
                                    <Settings className="h-5 w-5 mr-0 lg:mr-3" />
                                    <span className="hidden lg:block">Admin</span>
                                </div>
                                <ChevronDown className={cn("h-4 w-4 hidden lg:block transition-transform", adminOpen && "rotate-180")} />
                            </button>

                            {adminOpen && (
                                <div className="mt-1 space-y-1 pl-2 lg:pl-4">
                                    {adminNavItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={cn(
                                                "flex items-center px-2 lg:px-4 py-2 text-sm rounded-md transition-colors",
                                                location.pathname === item.path
                                                    ? "font-medium"
                                                    : "hover:opacity-90"
                                            )}
                                            style={{
                                                backgroundColor: location.pathname === item.path
                                                    ? 'hsl(var(--sidebar-accent))'
                                                    : 'transparent',
                                                color: location.pathname === item.path
                                                    ? 'hsl(var(--sidebar-primary))'
                                                    : 'hsl(var(--sidebar-foreground))',
                                            }}
                                        >
                                            <item.icon className="h-4 w-4 mr-0 lg:mr-2" />
                                            <span className="hidden lg:block">{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t" style={{ borderColor: 'hsl(var(--sidebar-border))', backgroundColor: 'hsl(140 25% 10%)' }}>
                    <div className="flex items-center mb-4 px-2">
                        <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-lime-400"
                            style={{
                                backgroundColor: 'hsl(var(--sidebar-primary))',
                                color: 'hsl(var(--sidebar-primary-foreground))'
                            }}
                        >
                            {user?.full_name?.charAt(0) || "U"}
                        </div>
                        <div className="ml-3 hidden lg:block overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
                            <p className="text-xs truncate" style={{ color: 'hsl(var(--sidebar-foreground))' }}>{user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center lg:justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4 mr-0 lg:mr-2" />
                        <span className="hidden lg:block">Logout</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
