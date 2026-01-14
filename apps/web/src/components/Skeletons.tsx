import { Skeleton } from "@/components/ui/skeleton";

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b">
            {Array.from({ length: columns }).map((_, index) => (
                <td key={index} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

export function CardSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-3 h-4 w-48" />
            <Skeleton className="mt-6 h-24 w-full" />
        </div>
    );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full" />
            ))}
        </div>
    );
}
