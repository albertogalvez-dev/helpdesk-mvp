import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, PlusCircle, List, Headphones } from "lucide-react";
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

    return (
        <div className="min-h-screen bg-background font-sans">
            <header className="bg-white border-b shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/portal/tickets" className="font-bold text-xl flex items-center gap-2" style={{ color: 'hsl(var(--primary))' }}>
                            <Headphones className="h-6 w-6" />
                            Support Portal
                        </Link>

                        <nav className="hidden md:flex gap-1">
                            <Link
                                to="/portal/tickets"
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                                    isActive("/portal/tickets") && !location.pathname.includes("/new")
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                <List className="h-4 w-4" /> My Tickets
                            </Link>
                            <Link
                                to="/portal/tickets/new"
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                                    location.pathname === "/portal/tickets/new"
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                <PlusCircle className="h-4 w-4" /> New Ticket
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-gray-900">{user?.full_name}</div>
                            <div className="text-xs text-gray-500">{user?.email}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-500">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
}
