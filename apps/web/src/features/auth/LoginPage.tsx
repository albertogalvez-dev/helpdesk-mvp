import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError("");

        try {
            const loginRes = await api.post("/auth/login", {
                email: data.email,
                password: data.password,
            });

            const token = loginRes.data?.data?.access_token;
            if (!token) throw new Error("No access_token in response");

            const meRes = await api.get("/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const userData = meRes.data?.data?.user;
            if (!userData) throw new Error("No user data in /auth/me response");

            setAuth(token, userData);

            const role = userData.role?.toLowerCase();
            if (role === "admin" || role === "agent") {
                navigate("/agent/inbox", { replace: true });
            } else {
                navigate("/portal/tickets", { replace: true });
            }
        } catch (err: any) {
            const apiError = err.response?.data?.error?.message;
            if (apiError) {
                setError(apiError);
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            {/* Decorative side bars */}
            <div className="fixed top-0 left-0 w-1.5 h-full bg-primary/20 hidden lg:block" />
            <div className="fixed top-0 right-0 w-1.5 h-full bg-primary/20 hidden lg:block" />

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                {/* Logo */}
                <div className="mb-10 flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-foreground text-xl font-bold">bolt</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground uppercase">HelpDesk</span>
                </div>

                {/* Login Card */}
                <div className="w-full max-w-[440px] bg-card border border-border rounded-xl p-8 md:p-10">
                    {/* Headline */}
                    <div className="mb-8">
                        <h1 className="text-foreground text-2xl font-bold tracking-tight">Sign in</h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            Enter your credentials to access your workspace.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email Field */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-foreground ml-1">
                                Email Address
                            </label>
                            <input
                                {...form.register("email")}
                                type="email"
                                placeholder="name@company.com"
                                autoComplete="email"
                                disabled={isLoading}
                                className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:border-primary focus:ring-0 focus:outline-none focus-primary transition-all placeholder:text-muted-foreground"
                            />
                            {form.formState.errors.email && (
                                <p className="text-xs text-destructive ml-1">
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[13px] font-semibold text-foreground">Password</label>
                                <a className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors underline decoration-border underline-offset-4" href="#">
                                    Forgot?
                                </a>
                            </div>
                            <div className="relative group">
                                <input
                                    {...form.register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                    className="w-full h-12 px-4 pr-12 rounded-lg border border-border bg-background text-foreground text-sm focus:border-primary focus:ring-0 focus:outline-none focus-primary transition-all placeholder:text-muted-foreground"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-xs text-destructive ml-1">
                                    {form.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-center text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-primary hover:brightness-95 text-primary-foreground font-bold rounded-lg transition-all flex items-center justify-center gap-2 mt-2 shadow-sm disabled:opacity-50"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                            {!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-[11px] uppercase tracking-widest font-bold">
                            <span className="bg-card px-3 text-muted-foreground">or continue with</span>
                        </div>
                    </div>

                    {/* SSO Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 h-11 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-2 h-11 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                            <span className="material-symbols-outlined text-[18px]">key</span>
                            SSO
                        </button>
                    </div>

                    {/* Create account link */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?
                            <a className="text-foreground font-bold hover:underline underline-offset-4 ml-1" href="#">
                                Create one
                            </a>
                        </p>
                    </div>
                </div>

                {/* External Footer Links */}
                <div className="mt-8 flex items-center gap-6 text-[12px] text-muted-foreground font-medium">
                    <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <Link to="/contact" className="hover:text-foreground transition-colors">Contact Support</Link>
                </div>
            </div>
        </div>
    );
}
