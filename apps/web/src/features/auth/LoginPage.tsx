import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Headphones } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Debug helper (dev only)
const DEBUG_AUTH = import.meta.env.DEV;
function debugLog(label: string, data?: unknown) {
    if (DEBUG_AUTH) console.debug(`[auth] ${label}`, data ?? "");
}

export function LoginPage() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginFormData) => {
        debugLog("login request", { email: data.email });
        setIsLoading(true);
        setError("");

        try {
            const loginRes = await api.post("/auth/login", {
                email: data.email,
                password: data.password,
            });
            debugLog("login response status", loginRes.status);

            const token = loginRes.data?.data?.access_token;
            if (!token) {
                throw new Error("No access_token in response");
            }
            debugLog("token received", token.substring(0, 20) + "...");

            const meRes = await api.get("/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            debugLog("me response", meRes.data);

            const userData = meRes.data?.data?.user;
            if (!userData) {
                throw new Error("No user data in /auth/me response");
            }
            debugLog("user", { role: userData.role, email: userData.email });

            setAuth(token, userData);

            const role = userData.role?.toLowerCase();
            if (role === "admin" || role === "agent") {
                debugLog("redirecting to /agent/inbox");
                navigate("/agent/inbox", { replace: true });
            } else {
                debugLog("redirecting to /portal/tickets");
                navigate("/portal/tickets", { replace: true });
            }
        } catch (err: any) {
            debugLog("login error", err);
            const apiError = err.response?.data?.error?.message;
            const statusCode = err.response?.status;

            if (statusCode === 401 || statusCode === 400) {
                setError("Invalid email or password");
            } else if (apiError) {
                setError(apiError);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen"
            style={{
                background: 'linear-gradient(135deg, var(--dark-tertiary) 0%, var(--dark-primary) 100%)'
            }}
        >
            <Card
                className="w-full max-w-md border-0"
                style={{
                    boxShadow: 'var(--shadow-lg)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(8px)'
                }}
            >
                <CardHeader className="space-y-1 pb-4">
                    <div className="flex justify-center mb-4">
                        <div
                            className="h-14 w-14 rounded-xl flex items-center justify-center"
                            style={{
                                background: 'var(--primary-green)',
                                boxShadow: 'var(--shadow-md)'
                            }}
                        >
                            <Headphones className="h-7 w-7" style={{ color: 'var(--dark-primary)' }} />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center font-bold">Welcome Back</CardTitle>
                    <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        Sign in to your Helpdesk account
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                {...form.register("email")}
                                type="email"
                                placeholder="admin@acme.com"
                                autoComplete="email"
                                disabled={isLoading}
                                style={{ borderRadius: 'var(--radius-sm)' }}
                            />
                            {form.formState.errors.email && (
                                <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                {...form.register("password")}
                                type="password"
                                autoComplete="current-password"
                                disabled={isLoading}
                                style={{ borderRadius: 'var(--radius-sm)' }}
                            />
                            {form.formState.errors.password && (
                                <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        {error && (
                            <div
                                className="text-sm p-3 rounded-md text-center"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#dc2626',
                                    borderRadius: 'var(--radius-sm)'
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full font-semibold py-2.5 transition-all"
                            disabled={isLoading}
                            style={{
                                background: 'var(--primary-green)',
                                color: 'var(--dark-primary)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: isLoading ? 'none' : 'var(--shadow-sm)'
                            }}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : "Sign In"}
                        </Button>

                        <div className="text-center text-xs mt-4 pt-4 border-t" style={{ color: 'var(--text-muted)' }}>
                            <p className="mb-2">Demo Credentials:</p>
                            <div className="space-y-1">
                                <code className="block px-2 py-1 rounded text-xs" style={{ background: 'var(--bg-overlay-light)' }}>
                                    admin@acme.com / password123
                                </code>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
