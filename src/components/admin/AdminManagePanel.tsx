import { useState, type FormEvent } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
	Add01Icon,
	BookOpen01Icon,
	Cancel01Icon,
	Delete02Icon,
	InformationCircleIcon,
	Loading03Icon,
	PencilEdit01Icon,
	Tick02Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Task {
	id: string;
	text: string;
	trimestre: number;
}

export interface Subject {
	id: string;
	name: string;
	tasks: Task[];
}

interface Props {
	subjects: Subject[];
}

const TRIMESTRES = [1, 2, 3] as const;

function Icon({ icon, size = 16 }: { icon: IconSvgElement; size?: number }) {
	return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8} />;
}

function Spinner({ size = 16 }: { size?: number }) {
	return <HugeiconsIcon icon={Loading03Icon} size={size} strokeWidth={1.8} className="animate-spin" />;
}

async function post(url: string, body: unknown) {
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.error ?? 'No se pudo guardar el cambio');
	return data;
}

function notifyChanged() {
	document.dispatchEvent(new Event('admin-manage-changed'));
}

function TrimSelect({
	value,
	onChange,
	disabled,
}: {
	value: number;
	onChange: (value: number) => void;
	disabled?: boolean;
}) {
	return (
		<select
			value={value}
			disabled={disabled}
			onChange={(event) => onChange(Number(event.target.value))}
			aria-label="Trimestre"
			className="h-7 rounded-md border border-input bg-input/30 px-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
		>
			<option value={1}>T1</option>
			<option value={2}>T2</option>
			<option value={3}>T3</option>
		</select>
	);
}

interface SubjectCardProps {
	subject: Subject;
	onRename: (name: string) => Promise<void>;
	onDelete: () => Promise<void>;
	onAddTask: (text: string, trimestre: number) => Promise<void>;
	onEditTask: (taskId: string, text: string, trimestre: number) => Promise<void>;
	onDeleteTask: (taskId: string) => Promise<void>;
}

function SubjectCard({
	subject,
	onRename,
	onDelete,
	onAddTask,
	onEditTask,
	onDeleteTask,
}: SubjectCardProps) {
	const [editing, setEditing] = useState(false);
	const [name, setName] = useState(subject.name);
	const [drafts, setDrafts] = useState<Record<number, string>>({});
	const [editingTask, setEditingTask] = useState<string | null>(null);
	const [taskText, setTaskText] = useState('');
	const [taskTrim, setTaskTrim] = useState(1);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState<string | null>(null);
	const busy = pending !== null;

	function startEdit() {
		setName(subject.name);
		setEditing(true);
	}

	function setDraft(trimestre: number, value: string) {
		setDrafts((prev) => ({ ...prev, [trimestre]: value }));
	}

	async function saveName(event: FormEvent) {
		event.preventDefault();
		const value = name.trim();
		if (!value || busy) return;
		setPending('rename');
		setError(null);
		try {
			await onRename(value);
			setEditing(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error');
		} finally {
			setPending(null);
		}
	}

	async function handleDelete() {
		if (!confirm(`¿Eliminar la asignatura "${subject.name}" y todas sus tareas?`)) return;
		setPending('delete');
		setError(null);
		try {
			await onDelete();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error');
			setPending(null);
		}
	}

	async function submitTask(event: FormEvent, trimestre: number) {
		event.preventDefault();
		const text = (drafts[trimestre] ?? '').trim();
		if (!text || busy) return;
		setPending(`add-${trimestre}`);
		setError(null);
		try {
			await onAddTask(text, trimestre);
			setDraft(trimestre, '');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error');
		} finally {
			setPending(null);
		}
	}

	function startEditTask(task: Task) {
		setTaskText(task.text);
		setTaskTrim(task.trimestre);
		setEditingTask(task.id);
	}

	async function saveTask(event: FormEvent) {
		event.preventDefault();
		const text = taskText.trim();
		if (!text || !editingTask || busy) return;
		setPending('edit-task');
		setError(null);
		try {
			await onEditTask(editingTask, text, taskTrim);
			setEditingTask(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error');
		} finally {
			setPending(null);
		}
	}

	async function removeTask(task: Task) {
		if (!confirm(`¿Eliminar la tarea "${task.text}"?`)) return;
		setPending(`delete-task-${task.id}`);
		setError(null);
		try {
			await onDeleteTask(task.id);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error');
			setPending(null);
		}
	}

	return (
		<li className="overflow-hidden rounded-lg border bg-card">
			<div className="flex items-center gap-2 border-b px-3 py-2.5">
				{editing ? (
					<form onSubmit={saveName} className="flex flex-1 items-center gap-2">
						<Input
							value={name}
							onChange={(event) => setName(event.target.value)}
							className="h-8"
							autoFocus
						/>
						<Button
							size="icon-sm"
							variant="ghost"
							type="submit"
							aria-label="Guardar"
							disabled={busy}
							className="text-muted-foreground hover:text-foreground"
						>
							{pending === 'rename' ? <Spinner /> : <Icon icon={Tick02Icon} />}
						</Button>
						<Button
							size="icon-sm"
							variant="ghost"
							type="button"
							aria-label="Cancelar"
							disabled={busy}
							onClick={() => setEditing(false)}
							className="text-muted-foreground hover:text-foreground"
						>
							<Icon icon={Cancel01Icon} />
						</Button>
					</form>
				) : (
					<>
						<span className="text-muted-foreground">
							<Icon icon={BookOpen01Icon} size={15} />
						</span>
						<span className="min-w-0 flex-1 truncate text-sm font-medium">{subject.name}</span>
						<span className="shrink-0 text-xs tabular-nums text-muted-foreground">
							{subject.tasks.length} tareas
						</span>
						<Button
							size="icon-sm"
							variant="ghost"
							aria-label={`Editar ${subject.name}`}
							onClick={startEdit}
							className="text-muted-foreground hover:text-foreground"
						>
							<Icon icon={PencilEdit01Icon} />
						</Button>
						<Button
							size="icon-sm"
							variant="ghost"
							aria-label={`Eliminar ${subject.name}`}
							onClick={handleDelete}
							disabled={busy}
							className="text-muted-foreground hover:text-destructive"
						>
							{pending === 'delete' ? <Spinner /> : <Icon icon={Delete02Icon} />}
						</Button>
					</>
				)}
			</div>

			<div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
				{TRIMESTRES.map((trimestre) => {
					const tasks = subject.tasks
						.filter((task) => task.trimestre === trimestre)
						.sort((a, b) => a.text.localeCompare(b.text));

					return (
						<div key={trimestre} className="flex flex-col px-2.5 py-2">
							<div className="mb-1 flex items-center justify-between">
								<span className="text-xs font-medium text-muted-foreground">
									Trimestre {trimestre}
								</span>
								<span className="text-xs tabular-nums text-muted-foreground">{tasks.length}</span>
							</div>

							<ul className="flex flex-1 flex-col">
								{tasks.map((task) => (
									<li key={task.id}>
										{editingTask === task.id ? (
											<form onSubmit={saveTask} className="flex items-center gap-1 py-0.5">
												<Input
													value={taskText}
													onChange={(event) => setTaskText(event.target.value)}
													className="h-7 text-sm"
													autoFocus
												/>
												<TrimSelect value={taskTrim} onChange={setTaskTrim} disabled={busy} />
												<Button
													size="icon-xs"
													variant="ghost"
													type="submit"
													aria-label="Guardar"
													disabled={busy}
													className="text-muted-foreground hover:text-foreground"
												>
													{pending === 'edit-task' ? <Spinner size={13} /> : <Icon icon={Tick02Icon} size={13} />}
												</Button>
												<Button
													size="icon-xs"
													variant="ghost"
													type="button"
													aria-label="Cancelar"
													disabled={busy}
													onClick={() => setEditingTask(null)}
													className="text-muted-foreground hover:text-foreground"
												>
													<Icon icon={Cancel01Icon} size={13} />
												</Button>
											</form>
										) : (
											<div className="flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:bg-muted/50">
												<span className="min-w-0 flex-1 text-sm leading-snug">{task.text}</span>
												<span className="flex shrink-0 items-center">
													<Button
														size="icon-xs"
														variant="ghost"
														aria-label={`Editar ${task.text}`}
														onClick={() => startEditTask(task)}
														className="text-muted-foreground hover:text-foreground"
													>
														<Icon icon={PencilEdit01Icon} size={13} />
													</Button>
													<Button
														size="icon-xs"
														variant="ghost"
														aria-label={`Eliminar ${task.text}`}
														onClick={() => removeTask(task)}
														disabled={busy}
														className="text-muted-foreground hover:text-destructive"
													>
														{pending === `delete-task-${task.id}` ? (
															<Spinner size={13} />
														) : (
															<Icon icon={Delete02Icon} size={13} />
														)}
													</Button>
												</span>
											</div>
										)}
									</li>
								))}
							</ul>

							<form
								onSubmit={(event) => submitTask(event, trimestre)}
								className="mt-1 flex items-center gap-1"
							>
								<Input
									value={drafts[trimestre] ?? ''}
									onChange={(event) => setDraft(trimestre, event.target.value)}
									placeholder="Agregar tarea"
									className="h-7 text-sm"
								/>
								<Button
									size="icon-xs"
									variant="ghost"
									type="submit"
									aria-label={`Agregar tarea al trimestre ${trimestre}`}
									disabled={busy}
									className="text-muted-foreground hover:text-foreground"
								>
									{pending === `add-${trimestre}` ? (
										<Spinner size={14} />
									) : (
										<Icon icon={Add01Icon} size={14} />
									)}
								</Button>
							</form>
						</div>
					);
				})}
			</div>

			{error && <p className="border-t px-3 py-1.5 text-xs text-destructive">{error}</p>}
		</li>
	);
}

export default function AdminManagePanel({ subjects: initial }: Props) {
	const [subjects, setSubjects] = useState<Subject[]>(initial);
	const [newName, setNewName] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	async function addSubject(event: FormEvent) {
		event.preventDefault();
		const name = newName.trim();
		if (!name || busy) return;
		setBusy(true);
		setError(null);
		try {
			const { subject } = await post('/api/subjects/manage', { action: 'create', name });
			setSubjects((prev) => [...prev, { id: subject.id, name: subject.name, tasks: [] }]);
			setNewName('');
			notifyChanged();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error');
		} finally {
			setBusy(false);
		}
	}

	async function renameSubject(id: string, name: string) {
		await post('/api/subjects/manage', { action: 'update', id, name });
		setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
		notifyChanged();
	}

	async function deleteSubject(id: string) {
		await post('/api/subjects/manage', { action: 'delete', id });
		setSubjects((prev) => prev.filter((s) => s.id !== id));
		notifyChanged();
	}

	async function addTask(subjectId: string, text: string, trimestre: number) {
		const { task } = await post('/api/tasks/manage', {
			action: 'create',
			subject_id: subjectId,
			text,
			trimestre,
		});
		setSubjects((prev) =>
			prev.map((s) => (s.id === subjectId ? { ...s, tasks: [...s.tasks, task] } : s)),
		);
		notifyChanged();
	}

	async function editTask(taskId: string, text: string, trimestre: number) {
		await post('/api/tasks/manage', { action: 'update', id: taskId, text, trimestre });
		setSubjects((prev) =>
			prev.map((s) => ({
				...s,
				tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, text, trimestre } : t)),
			})),
		);
		notifyChanged();
	}

	async function deleteTask(taskId: string) {
		await post('/api/tasks/manage', { action: 'delete', id: taskId });
		setSubjects((prev) =>
			prev.map((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== taskId) })),
		);
		notifyChanged();
	}

	return (
		<div className="flex flex-col gap-4">
			<form onSubmit={addSubject} className="flex items-center gap-2">
				<Input
					value={newName}
					onChange={(event) => setNewName(event.target.value)}
					placeholder="Nombre de la nueva asignatura"
					className="h-9"
				/>
				<Button type="submit" disabled={busy}>
					{busy ? <Spinner /> : <Icon icon={Add01Icon} />}
					Agregar
				</Button>
			</form>

			{error && <p className="text-sm text-destructive">{error}</p>}

			{subjects.length === 0 ? (
				<p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
					No hay asignaturas en el trayecto activo.
				</p>
			) : (
				<ul className="flex flex-col gap-3">
					{subjects.map((subject) => (
						<SubjectCard
							key={subject.id}
							subject={subject}
							onRename={(name) => renameSubject(subject.id, name)}
							onDelete={() => deleteSubject(subject.id)}
							onAddTask={(text, trimestre) => addTask(subject.id, text, trimestre)}
							onEditTask={editTask}
							onDeleteTask={deleteTask}
						/>
					))}
				</ul>
			)}

			<p className="flex items-center gap-2 text-xs text-muted-foreground">
				<Icon icon={InformationCircleIcon} size={14} />
				Los cambios afectan a todos los usuarios.
			</p>
		</div>
	);
}
