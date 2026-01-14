import { Badge } from "@/components/ui/badge";

const PRIORITY_CONFIG: Record<string, { className: string; label: string }> = {
    low: {
        className: "bg-muted text-muted-foreground border border-border",
        label: "Low",
    },
    medium: {
        className: "bg-secondary text-foreground border border-border",
        label: "Medium",
    },
    high: {
        className: "bg-primary/15 text-foreground border border-primary/20",
        label: "High",
    },
    urgent: {
        className: "bg-destructive/10 text-destructive border border-destructive/20",
        label: "Urgent",
    },
};

export function PriorityBadge({ priority }: { priority: string }) {
    const normalized = priority?.toLowerCase() || "medium";
    const config = PRIORITY_CONFIG[normalized] || PRIORITY_CONFIG.medium;
    return (
        <Badge variant="secondary" className={`font-medium ${config.className}`}>
            {config.label}
        </Badge>
    );
}
