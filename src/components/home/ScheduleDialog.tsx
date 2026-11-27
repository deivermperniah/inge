import Modal from '@/components/Modal';
import { SCHEDULE } from '@/data/schedule';
import { cellClass, trimStatus } from '@/lib/progress';
import type { Subject } from '@/lib/data';

interface Props {
	open: boolean;
	onClose: () => void;
	subjects: Subject[];
	done: Set<string>;
}

const expandedCells = (row: (typeof SCHEDULE)[number]) =>
	row.cells.flatMap((cell) => Array.from({ length: cell.span ?? 1 }, () => cell.text)).slice(0, 3);

export default function ScheduleDialog({ open, onClose, subjects, done }: Props) {
	return (
		<Modal open={open} onClose={onClose} title="Trayecto III 2026" size="xl">
			<div className="overflow-x-auto rounded-lg border border-border">
				<table className="w-full table-fixed border-collapse text-sm">
					<thead>
						<tr className="border-b border-border">
							<th className="w-[40%] border-r border-border px-3 py-2 text-left text-xs font-medium text-muted-foreground">
								Unidad curricular
							</th>
							{[1, 2, 3].map((t) => (
								<th
									key={t}
									className="border-r border-border px-3 py-2 text-center text-xs font-medium text-muted-foreground last:border-r-0"
								>
									Trimestre {t}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{SCHEDULE.map((row) => {
							const subject = subjects.find((s) => s.name === row.subject);
							return (
								<tr key={row.subject} className="border-b border-border last:border-b-0">
									<td className="border-r border-border px-3 py-2 text-sm font-medium">
										{row.subject}
									</td>
									{expandedCells(row).map((text, idx) => {
										const status = subject ? trimStatus(subject.tasks, idx + 1, done) : 'none';
										return (
											<td
												key={idx}
												className={`h-9 border-r border-border px-3 py-2 last:border-r-0 ${cellClass[status]}`}
												title={text || undefined}
											/>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</Modal>
	);
}
