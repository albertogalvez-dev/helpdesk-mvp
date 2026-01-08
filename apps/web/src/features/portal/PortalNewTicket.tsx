import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

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
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <Link to="/portal/tickets" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to My Tickets
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
                <p className="text-gray-500 mt-1">Describe your issue and we'll get back to you shortly.</p>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Subject</label>
                        <Input
                            {...form.register("subject")}
                            placeholder="Brief summary of your issue"
                            disabled={mutation.isPending}
                        />
                        {form.formState.errors.subject && (
                            <p className="text-red-500 text-xs">{form.formState.errors.subject.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            {...form.register("description")}
                            className="w-full min-h-[150px] px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Please provide details about your issue, including any error messages, steps to reproduce, and what you've already tried..."
                            disabled={mutation.isPending}
                        />
                        {form.formState.errors.description && (
                            <p className="text-red-500 text-xs">{form.formState.errors.description.message}</p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-red-700 text-sm">{error}</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Link to="/portal/tickets">
                            <Button type="button" variant="outline" disabled={mutation.isPending}>
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={mutation.isPending}
                        >
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
