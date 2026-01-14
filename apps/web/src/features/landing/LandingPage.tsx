import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";

export function LandingPage() {
    const navigate = useNavigate();
    const { token, user } = useAuthStore();

    const handleEnterConsole = () => {
        if (token && user) {
            const role = user.role?.toLowerCase();
            if (role === "admin" || role === "agent") {
                navigate("/agent/inbox");
            } else {
                navigate("/portal/tickets");
            }
        } else {
            navigate("/login");
        }
    };

    const handleViewPortal = () => {
        if (token && user) {
            const role = user.role?.toLowerCase();
            if (role === "admin" || role === "agent") {
                navigate("/agent/inbox");
            } else {
                navigate("/portal/tickets");
            }
        } else {
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#1c2210] text-white font-sans overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                {/* Large gradient blobs */}
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/30 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] rounded-full bg-primary/20 blur-[150px]" />
                <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-green-500/10 blur-[100px]" />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            {/* Top Banner */}
            <div className="w-full bg-primary py-2.5 relative z-10">
                <p className="text-primary-foreground text-xs font-bold leading-normal text-center tracking-widest uppercase">
                    🚀 Demo Environment — Data Resets Every 24 Hours
                </p>
            </div>

            {/* Navigation */}
            <header className="flex items-center justify-between px-6 md:px-20 py-5 border-b border-white/10 relative z-10 backdrop-blur-sm bg-black/10">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined text-primary-foreground text-2xl">bolt</span>
                    </div>
                    <h2 className="text-xl font-black tracking-tight">SupportFlow</h2>
                </div>
                <div className="flex items-center gap-8">
                    <a className="text-sm font-medium text-white/60 hover:text-primary transition-colors" href="#">Documentation</a>
                    <a className="text-sm font-medium text-white/60 hover:text-primary transition-colors" href="#">GitHub</a>
                    <button className="flex items-center justify-center rounded-lg h-10 px-5 bg-white text-[#1c2210] text-sm font-bold hover:bg-primary transition-colors">
                        Portfolio Site
                    </button>
                </div>
            </header>

            <main className="relative flex-1 z-10">
                <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-24 flex flex-col items-center">
                    {/* Hero Section */}
                    <div className="text-center mb-20 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/20">
                            <span className="size-2 bg-primary rounded-full animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-white/80">B2B Enterprise Helpdesk</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-[-0.04em] mb-8">
                            Experience the
                            <span className="text-primary"> future </span>
                            of B2B support.
                        </h1>
                        <p className="text-xl text-white/60 font-normal leading-relaxed">
                            Select a portal below to explore the minimalist, high-performance workspace designed for modern enterprise teams.
                        </p>
                    </div>

                    {/* Role Selection Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-24">
                        {/* Agent Card */}
                        <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500">
                            {/* Card Background Image/Pattern */}
                            <div className="aspect-[16/10] relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/20 to-transparent" />
                                <div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9f56b' fill-opacity='0.4'%3E%3Ccircle cx='5' cy='5' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="size-32 rounded-3xl bg-primary/30 backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <span className="material-symbols-outlined text-6xl text-primary">support_agent</span>
                                    </div>
                                </div>
                                {/* Floating elements */}
                                <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-lg text-xs font-bold text-white/80">
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">verified</span>
                                    Admin Access
                                </div>
                                <div className="absolute bottom-6 right-6 px-3 py-1.5 bg-primary/80 backdrop-blur-md rounded-lg text-xs font-bold text-primary-foreground">
                                    12 Open Tickets
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-black mb-3">Agent Console</h3>
                                <p className="text-base text-white/50 mb-6 leading-relaxed">
                                    Manage tickets, view SLAs, and access customer CRM. Optimized for high-volume resolution speed.
                                </p>
                                <button
                                    onClick={handleEnterConsole}
                                    className="w-full h-14 bg-primary text-primary-foreground font-black rounded-xl flex items-center justify-center gap-3 hover:brightness-110 hover:scale-[1.02] transition-all shadow-lg shadow-primary/30"
                                >
                                    Enter Console
                                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* Customer Card */}
                        <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-500">
                            {/* Card Background Image/Pattern */}
                            <div className="aspect-[16/10] relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent" />
                                <div
                                    className="absolute inset-0 opacity-10"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Crect x='0' y='0' width='1' height='40'/%3E%3Crect x='0' y='0' width='40' height='1'/%3E%3C/g%3E%3C/svg%3E")`,
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="size-32 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <span className="material-symbols-outlined text-6xl text-white/80">person_search</span>
                                    </div>
                                </div>
                                {/* Floating elements */}
                                <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-lg text-xs font-bold text-white/80">
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">menu_book</span>
                                    Knowledge Base
                                </div>
                                <div className="absolute bottom-6 right-6 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold text-white/90">
                                    Self-Service
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-black mb-3">Customer Portal</h3>
                                <p className="text-base text-white/50 mb-6 leading-relaxed">
                                    Submit requests, track ticket status, and browse the knowledge base in a clean, self-service UI.
                                </p>
                                <button
                                    onClick={handleViewPortal}
                                    className="w-full h-14 bg-white text-[#1c2210] font-black rounded-xl flex items-center justify-center gap-3 hover:bg-primary hover:scale-[1.02] transition-all shadow-lg shadow-white/10"
                                >
                                    View Portal
                                    <span className="material-symbols-outlined text-xl">open_in_new</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Demo Credentials Block */}
                    <div className="w-full max-w-4xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="size-12 bg-primary/20 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-2xl">key</span>
                            </div>
                            <div>
                                <h4 className="text-2xl font-black">Demo Credentials</h4>
                                <p className="text-white/50 text-sm">Use these to explore the application</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {/* Admin Role */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl bg-white/5 border border-white/10 gap-4 hover:border-primary/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-primary/20 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary">shield_person</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Role</span>
                                        <span className="font-bold">Administrator</span>
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 max-w-[220px]">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Email</span>
                                    <span className="text-sm truncate">admin@acme.com</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <code className="px-3 py-1.5 bg-black/30 rounded-lg text-sm font-mono border border-white/10">password123</code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText("admin@acme.com")}
                                        className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                                        title="Copy Email"
                                    >
                                        <span className="material-symbols-outlined text-xl">content_copy</span>
                                    </button>
                                </div>
                            </div>

                            {/* Agent Role */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl bg-white/5 border border-white/10 gap-4 hover:border-primary/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-white/10 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white/70">support_agent</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Role</span>
                                        <span className="font-bold">Agent</span>
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 max-w-[220px]">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Email</span>
                                    <span className="text-sm truncate">agent@acme.com</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <code className="px-3 py-1.5 bg-black/30 rounded-lg text-sm font-mono border border-white/10">password123</code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText("agent@acme.com")}
                                        className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                                        title="Copy Email"
                                    >
                                        <span className="material-symbols-outlined text-xl">content_copy</span>
                                    </button>
                                </div>
                            </div>

                            {/* Customer Role */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl bg-white/5 border border-white/10 gap-4 hover:border-primary/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-white/10 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white/70">person</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Role</span>
                                        <span className="font-bold">Customer</span>
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 max-w-[220px]">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Email</span>
                                    <span className="text-sm truncate">maria.garcia@techcorp.com</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <code className="px-3 py-1.5 bg-black/30 rounded-lg text-sm font-mono border border-white/10">password123</code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText("maria.garcia@techcorp.com")}
                                        className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                                        title="Copy Email"
                                    >
                                        <span className="material-symbols-outlined text-xl">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap justify-center gap-4 mt-16">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                            <span className="text-sm font-medium">Real-time Updates</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <span className="material-symbols-outlined text-primary text-lg">security</span>
                            <span className="text-sm font-medium">Enterprise Security</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <span className="material-symbols-outlined text-primary text-lg">speed</span>
                            <span className="text-sm font-medium">SLA Tracking</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <span className="material-symbols-outlined text-primary text-lg">analytics</span>
                            <span className="text-sm font-medium">Advanced Reports</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 py-12 backdrop-blur-sm bg-black/20">
                <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3 text-white/40">
                        <span className="material-symbols-outlined">code</span>
                        <span className="text-sm">Built for Portfolio Project 2024</span>
                    </div>
                    <div className="flex gap-8">
                        <a className="text-sm font-medium text-white/50 hover:text-primary transition-colors" href="#">Twitter</a>
                        <a className="text-sm font-medium text-white/50 hover:text-primary transition-colors" href="#">LinkedIn</a>
                        <a className="text-sm font-medium text-white/50 hover:text-primary transition-colors" href="#">GitHub Repo</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
