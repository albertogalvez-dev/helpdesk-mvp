import { cn } from "@/lib/utils";

function getInitials(value?: string) {
    if (!value) return "?";
    const parts = value.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
    const initials = `${first}${last}`.toUpperCase();
    return initials || "?";
}

export function AvatarInitials({
    name,
    email,
    size = "md",
    className,
}: {
    name?: string;
    email?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}) {
    const base = "inline-flex items-center justify-center rounded-full bg-muted text-foreground font-semibold ring-1 ring-border";
    const sizes = {
        sm: "h-7 w-7 text-xs",
        md: "h-9 w-9 text-sm",
        lg: "h-12 w-12 text-base",
    };

    return (
        <span
            className={cn(base, sizes[size], className)}
            aria-label={name || email || "Avatar"}
        >
            {getInitials(name || email)}
        </span>
    );
}
