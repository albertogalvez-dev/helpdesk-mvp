import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from "./features/auth/LoginPage";
import { LandingPage } from "./features/landing/LandingPage";
import { PrivacyPage, TermsPage, ContactPage } from "./features/landing/LegalPages";
import { InboxPage } from "./features/tickets/InboxPage";
import { TicketDetailPage } from "./features/tickets/TicketDetailPage";
import { SlasAdminPage } from "./features/slas/SlasAdminPage";
import { AgentReportsPage } from "./features/reports/AgentReportsPage";
import { PortalTicketList } from "./features/portal/PortalTicketList";
import { PortalNewTicket } from "./features/portal/PortalNewTicket";
import { PortalTicketDetail } from "./features/portal/PortalTicketDetail";
import { PortalHelpCenter } from "./features/portal/PortalHelpCenter";
import { PortalAccount } from "./features/portal/PortalAccount";
import { AdminUsersPage } from "./features/admin/AdminUsersPage";
import { AdminWorkspacePage } from "./features/admin/AdminWorkspacePage";
import { UserDetailPage } from "./features/admin/UserDetailPage";
import { PortalShell } from "./components/PortalShell";
import { AgentShell } from "./components/AgentShell";
import { useAuthStore } from "./lib/auth";

const queryClient = new QueryClient();

// Helper to check if user is agent/admin (handles both lowercase and uppercase)
function isAgentOrAdmin(role: string | undefined): boolean {
    if (!role) return false;
    const r = role.toLowerCase();
    return r === "admin" || r === "agent";
}

function AgentRoute({ children }: { children: JSX.Element }) {
    const { token, user } = useAuthStore();
    if (!token) return <Navigate to="/login" replace />;
    if (!isAgentOrAdmin(user?.role)) return <Navigate to="/portal/tickets" replace />;
    return children;
}

function PortalRoute({ children }: { children: JSX.Element }) {
    const { token, user } = useAuthStore();
    if (!token) return <Navigate to="/login" replace />;
    // Agents/admins go to agent console
    if (isAgentOrAdmin(user?.role)) return <Navigate to="/agent/inbox" replace />;
    return children;
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* Public Landing Page */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />

                    {/* Agent Console */}
                    <Route path="/agent" element={<AgentRoute><AgentShell /></AgentRoute>}>
                        <Route path="" element={<Navigate to="inbox" replace />} />
                        <Route path="inbox" element={<InboxPage />} />
                        <Route path="tickets/:id" element={<TicketDetailPage />} />
                        <Route path="reports" element={<AgentReportsPage />} />
                        <Route path="admin/slas" element={<SlasAdminPage />} />
                        <Route path="admin/users" element={<AdminUsersPage />} />
                        <Route path="admin/users/:id" element={<UserDetailPage />} />
                        <Route path="admin/workspace" element={<AdminWorkspacePage />} />
                    </Route>


                    {/* Customer Portal */}
                    <Route path="/portal" element={<PortalRoute><PortalShell /></PortalRoute>}>
                        <Route path="" element={<Navigate to="tickets" replace />} />
                        <Route path="tickets" element={<PortalTicketList />} />
                        <Route path="tickets/new" element={<PortalNewTicket />} />
                        <Route path="new" element={<PortalNewTicket />} />
                        <Route path="tickets/:id" element={<PortalTicketDetail />} />
                        <Route path="help-center" element={<PortalHelpCenter />} />
                        <Route path="account" element={<PortalAccount />} />
                    </Route>

                    {/* Default Redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
