import { cn } from "@/lib/utils";

export function PageHeader({
    title,
    subtitle,
    actions,
    breadcrumbs,
    className,
}: {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    breadcrumbs?: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col gap-3", className)}>
            {breadcrumbs && <div>{breadcrumbs}</div>}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </div>
    );
}
