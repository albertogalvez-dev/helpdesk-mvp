import { cn } from "@/lib/utils";

export function EmptyState({
    title,
    description,
    icon,
    action,
    className,
}: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-12 text-center",
                className
            )}
        >
            {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
                <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
