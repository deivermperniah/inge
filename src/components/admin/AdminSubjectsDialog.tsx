import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { BookOpen01Icon, InformationCircleIcon } from '@hugeicons/core-free-icons';
import Modal from '@/components/Modal';
import Switch from '@/components/Switch';
import type { Subject } from '@/lib/data';

interface Props {
	open: boolean;
	onClose: () => void;
	subjects: Subject[];
	onToggle: (subjectId: string) => Promise<boolean>;
}

export default function AdminSubjectsDialog({ open, onClose, subjects, onToggle }: Props) {
	const [pending, setPending] = useState<Set<string>>(new Set());
	const [error, setError] = useState(false);

	async function toggle(id: string) {
		setPending((prev) => new Set(prev).add(id));
		setError(!(await onToggle(id)));
		setPending((prev) => {
			const next = new Set(prev);
			next.delete(id);
			return next;
		});
	}

	return (
		<Modal open={open} onClose={onClose} title="Visibilidad de asignaturas" size="lg">
			<p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
				<HugeiconsIcon icon={InformationCircleIcon} size={14} strokeWidth={1.8} />
				Ocultar una asignatura la oculta para todos los usuarios.
			</p>

			{subjects.length === 0 ? (
				<p className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
					No hay asignaturas en el trayecto activo.
				</p>
			) : (
				<ul className="divide-y overflow-hidden rounded-lg border bg-card">
					{subjects.map((subject) => (
						<li
							key={subject.id}
							className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
							data-hidden={String(subject.hidden)}
						>
							<span className="shrink-0 text-muted-foreground transition-opacity group-data-[hidden=true]:opacity-50">
								<HugeiconsIcon icon={BookOpen01Icon} size={16} strokeWidth={1.8} />
							</span>
							<span className="min-w-0 flex-1 truncate text-sm font-medium transition-colors group-data-[hidden=true]:text-muted-foreground">
								{subject.name}
							</span>
							<Switch
								checked={!subject.hidden}
								label={`Mostrar ${subject.name}`}
								disabled={pending.has(subject.id)}
								onClick={() => toggle(subject.id)}
							/>
						</li>
					))}
				</ul>
			)}

			{error && <p className="mt-3 text-xs text-destructive">No se pudo guardar el cambio.</p>}
		</Modal>
	);
}
