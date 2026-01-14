import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { AlertCircle, Send } from "lucide-react";

const ticketSchema = z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export function PortalNewTicket() {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const form = useForm<TicketFormData>({
        resolver: zodResolver(ticketSchema),
        defaultValues: { subject: "", description: "" },
    });

    const mutation = useMutation({
        mutationFn: async (data: TicketFormData) => {
            const res = await api.post("/tickets", data);
            return res.data.data;
        },
        onSuccess: (data) => {
            navigate(`/portal/tickets/${data.id}`);
        },
        onError: (err: any) => {
            setError(err.response?.data?.error?.message || "Failed to create ticket");
        },
    });

    const onSubmit = (data: TicketFormData) => {
        setError("");
        mutation.mutate(data);
    };

    return (
        <div className="p-6 space-y-6 max-w-2xl mx-auto">
            <PageHeader
                title="Create New Ticket"
                subtitle="Describe your issue and we will get back to you shortly."
                breadcrumbs={
                    <Breadcrumbs
                        items={[
                            { label: "Portal", href: "/portal/tickets" },
                            { label: "New Ticket" },
                        ]}
                    />
                }
            />

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Subject</label>
                        <Input
                            {...form.register("subject")}
                            placeholder="Brief summary of your issue"
                            disabled={mutation.isPending}
                        />
                        {form.formState.errors.subject && (
                            <p className="text-xs text-destructive">{form.formState.errors.subject.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Description</label>
                        <textarea
                            {...form.register("description")}
                            className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Please provide details about your issue, including any error messages, steps to reproduce, and what you've already tried..."
                            disabled={mutation.isPending}
                        />
                        {form.formState.errors.description && (
                            <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Link to="/portal/tickets">
                            <Button type="button" variant="outline" disabled={mutation.isPending}>
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? (
                                "Creating..."
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit Ticket
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
