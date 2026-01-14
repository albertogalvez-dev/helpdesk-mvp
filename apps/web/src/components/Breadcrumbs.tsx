import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export function Breadcrumbs({
    items,
    className,
}: {
    items: BreadcrumbItem[];
    className?: string;
}) {
    return (
        <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
            <ol className="flex flex-wrap items-center gap-2 text-muted-foreground">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                            {item.href && !isLast ? (
                                <Link
                                    to={item.href}
                                    className="hover:text-foreground transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className={isLast ? "text-foreground font-medium" : ""}>
                                    {item.label}
                                </span>
                            )}
                            {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
