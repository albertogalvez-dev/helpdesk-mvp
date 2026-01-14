import { Badge } from "@/components/ui/badge";

type SLAStatus = "ok" | "due" | "breached";

const SLA_CONFIG: Record<SLAStatus, { className: string; label: string }> = {
    ok: {
        className: "bg-primary/10 text-foreground border border-primary/20",
        label: "On track",
    },
    due: {
        className: "bg-secondary text-foreground border border-border",
        label: "Due soon",
    },
    breached: {
        className: "bg-destructive/10 text-destructive border border-destructive/20",
        label: "Breached",
    },
};

export function SLABadge({
    status,
    label,
}: {
    status: SLAStatus;
    label?: string;
}) {
    const config = SLA_CONFIG[status];
    return (
        <Badge variant="secondary" className={`text-[11px] font-medium ${config.className}`}>
            {label || config.label}
        </Badge>
    );
}

export function SLAProgressMini({
    value,
    status,
    label,
}: {
    value: number;
    status: SLAStatus;
    label?: string;
}) {
    const clamped = Math.max(0, Math.min(100, value));
    const widthClass =
        clamped >= 90
            ? "w-full"
            : clamped >= 70
            ? "w-4/5"
            : clamped >= 50
            ? "w-3/5"
            : clamped >= 30
            ? "w-2/5"
            : clamped >= 15
            ? "w-1/5"
            : "w-0";
    const barClass =
        status === "breached"
            ? "bg-destructive"
            : status === "due"
            ? "bg-primary/60"
            : "bg-primary";

    return (
        <div className="w-full" title={label}>
            <div className="h-1.5 w-full rounded-full bg-muted">
                <div className={`h-1.5 rounded-full ${barClass} ${widthClass}`} />
            </div>
        </div>
    );
}
