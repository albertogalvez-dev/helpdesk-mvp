import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { AvatarInitials } from "@/components/AvatarInitials";
import { cn } from "@/lib/utils";

export function PortalShell() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

    const navItems = [
        { label: "Dashboard", icon: "grid_view", path: "/portal" },
        { label: "My Tickets", icon: "confirmation_number", path: "/portal/tickets" },
        { label: "Knowledge Base", icon: "menu_book", path: "/portal/help-center" },
        { label: "Community", icon: "group", path: "/portal/community" },
    ];

    return (
        <div className="flex min-h-screen bg-background font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-border flex flex-col fixed h-full bg-card z-20">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary-foreground text-xl">bolt</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold tracking-tight">Nexus Support</h1>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                                Enterprise B2B
                            </p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const active = item.path === "/portal"
                                ? location.pathname === "/portal"
                                : isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                        active
                                            ? "bg-primary/10 text-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <span
                                        className="material-symbols-outlined text-xl"
                                        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                    >
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-border">
                    <div className="flex items-center gap-3">
                        <AvatarInitials name={user?.full_name} email={user?.email} size="sm" />
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <p className="text-xs font-bold truncate">{user?.full_name || "Customer"}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                                {user?.company?.name || "Acme Corp"}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen">
                {/* Top Navbar */}
                <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-card/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <a className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium" href="#">
                            Support
                        </a>
                        <span className="text-border">/</span>
                        <span className="text-sm font-semibold">
                            {location.pathname.includes("tickets") && "My Tickets"}
                            {location.pathname.includes("help-center") && "Knowledge Base"}
                            {location.pathname === "/portal" && "Dashboard"}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                                search
                            </span>
                            <input
                                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                placeholder="Search tickets..."
                                type="text"
                            />
                        </div>
                        <button className="size-8 flex items-center justify-center text-muted-foreground hover:bg-muted rounded-full">
                            <span className="material-symbols-outlined text-xl">notifications</span>
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
