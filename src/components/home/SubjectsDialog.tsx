import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { BookOpen01Icon, InformationCircleIcon } from '@hugeicons/core-free-icons';
import Modal from '@/components/Modal';
import Switch from '@/components/Switch';
import RowsSkeleton from './RowsSkeleton';

interface Props {
	open: boolean;
	onClose: () => void;
	loading: boolean;
	subjects: { id: string; name: string }[];
	hidden: Set<string>;
	onToggle: (subjectId: string) => Promise<void>;
}

export default function SubjectsDialog({ open, onClose, loading, subjects, hidden, onToggle }: Props) {
	const [pending, setPending] = useState<Set<string>>(new Set());

	async function toggle(id: string) {
		setPending((prev) => new Set(prev).add(id));
		await onToggle(id);
		setPending((prev) => {
			const next = new Set(prev);
			next.delete(id);
			return next;
		});
	}

	return (
		<Modal open={open} onClose={onClose} title="Asignaturas" size="lg">
			<p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
				<HugeiconsIcon icon={InformationCircleIcon} size={14} strokeWidth={1.8} />
				Puedes ocultar una asignatura para que no aparezca en tu inicio.
			</p>

			{loading ? (
				<RowsSkeleton />
			) : subjects.length === 0 ? (
				<p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
					No hay asignaturas en el trayecto activo.
				</p>
			) : (
				<ul className="divide-y overflow-hidden rounded-lg border bg-card">
					{subjects.map((subject) => {
						const isHidden = hidden.has(subject.id);
						return (
							<li
								key={subject.id}
								className="group/row flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
								data-hidden={String(isHidden)}
							>
								<span className="shrink-0 text-muted-foreground transition-opacity group-data-[hidden=true]/row:opacity-50">
									<HugeiconsIcon icon={BookOpen01Icon} size={16} strokeWidth={1.8} />
								</span>
								<span className="min-w-0 flex-1 truncate text-sm font-medium transition-colors group-data-[hidden=true]/row:text-muted-foreground group-data-[hidden=true]/row:line-through">
									{subject.name}
								</span>
								<Switch
									checked={!isHidden}
									label={`Mostrar ${subject.name}`}
									disabled={pending.has(subject.id)}
									onClick={() => toggle(subject.id)}
								/>
							</li>
						);
					})}
				</ul>
			)}
		</Modal>
	);
}
