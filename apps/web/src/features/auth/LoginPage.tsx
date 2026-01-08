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
            // 1. Login - Backend expects JSON with {email, password}
            const loginRes = await api.post("/auth/login", {
                email: data.email,
                password: data.password,
            });
            debugLog("login response status", loginRes.status);

            // Backend returns APIResponse envelope: { data: { access_token, ... }, error: null }
            const token = loginRes.data?.data?.access_token;
            if (!token) {
                throw new Error("No access_token in response");
            }
            debugLog("token received", token.substring(0, 20) + "...");

            // 2. Get user profile with the new token
            const meRes = await api.get("/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            debugLog("me response", meRes.data);

            // meRes.data is also wrapped in APIResponse: { data: { user, workspace } }
            const userData = meRes.data?.data?.user;
            if (!userData) {
                throw new Error("No user data in /auth/me response");
            }
            debugLog("user", { role: userData.role, email: userData.email });

            // 3. Save auth state
            setAuth(token, userData);

            // 4. Redirect by role
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
            // Extract meaningful error message
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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur">
                <CardHeader className="space-y-1 pb-4">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">H</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center font-bold">Welcome Back</CardTitle>
                    <p className="text-center text-muted-foreground text-sm">Sign in to your Helpdesk account</p>
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
                            />
                            {form.formState.errors.password && (
                                <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded-md text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-2.5"
                            disabled={isLoading}
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

                        <div className="text-center text-xs text-muted-foreground mt-4 pt-4 border-t">
                            <p className="mb-1">Demo Credentials:</p>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">admin@acme.com / password123</code>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
