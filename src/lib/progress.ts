export type TrimStatus = 'none' | 'pending' | 'progress' | 'complete';

export function trimStatus(
	tasks: { id: string; trimestre: number }[],
	trimestre: number,
	done: Set<string>,
): TrimStatus {
	const ofTrim = tasks.filter((task) => task.trimestre === trimestre);
	if (ofTrim.length === 0) return 'none';
	const doneCount = ofTrim.filter((task) => done.has(task.id)).length;
	if (doneCount === 0) return 'pending';
	if (doneCount === ofTrim.length) return 'complete';
	return 'progress';
}

export const dotClass: Record<TrimStatus, string> = {
	none: 'bg-muted',
	pending: 'bg-danger',
	progress: 'bg-warning',
	complete: 'bg-success',
};

export const cellClass: Record<TrimStatus, string> = {
	none: '',
	pending: 'bg-danger/15',
	progress: 'bg-warning/15',
	complete: 'bg-success/15',
};
