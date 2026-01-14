import { Badge } from "@/components/ui/badge";
import { Circle, AlertCircle, Pause, CheckCircle2, XCircle } from "lucide-react";

const STATUS_CONFIG: Record<
    string,
    { icon: any; variant: "secondary" | "outline"; className: string; label: string }
> = {
    new: {
        icon: Circle,
        variant: "secondary",
        className: "bg-primary/15 text-foreground border border-primary/20",
        label: "New",
    },
    open: {
        icon: AlertCircle,
        variant: "secondary",
        className: "bg-secondary text-foreground border border-border",
        label: "Open",
    },
    pending: {
        icon: Pause,
        variant: "secondary",
        className: "bg-muted text-muted-foreground border border-border",
        label: "Pending",
    },
    resolved: {
        icon: CheckCircle2,
        variant: "secondary",
        className: "bg-primary/10 text-foreground border border-primary/20",
        label: "Resolved",
    },
    closed: {
        icon: XCircle,
        variant: "outline",
        className: "bg-muted/40 text-muted-foreground border border-border",
        label: "Closed",
    },
};

export function StatusBadge({ status }: { status: string }) {
    const normalizedStatus = status?.toLowerCase() || "new";
    const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.new;
    const Icon = config.icon;

    return (
        <Badge variant={config.variant} className={`font-medium gap-1.5 ${config.className}`}>
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}
