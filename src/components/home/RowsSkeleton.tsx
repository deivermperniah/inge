import { Skeleton } from '@/components/ui/skeleton';

export default function RowsSkeleton({ rows = 6 }: { rows?: number }) {
	return (
		<ul className="divide-y overflow-hidden rounded-lg border bg-card">
			{Array.from({ length: rows }, (_, i) => (
				<li key={i} className="flex items-center gap-3 px-4 py-3">
					<Skeleton className="size-4 rounded-md" />
					<Skeleton className="h-4 flex-1 rounded-md" />
					<Skeleton className="h-6 w-11 rounded-full" />
				</li>
			))}
		</ul>
	);
}
