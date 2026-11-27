import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AdminManagePanel from '@/components/admin/AdminManagePanel';
import AdminSubjectsDialog from '@/components/admin/AdminSubjectsDialog';
import {
	fetchHome,
	getProfile,
	getUserId,
	setPersonalHidden,
	setSubjectHidden,
	setTaskDone,
	type Subject,
	type Task,
	type Trayecto,
} from '@/lib/data';
import { dotClass, trimStatus } from '@/lib/progress';
import ScheduleDialog from './ScheduleDialog';
import SubjectsDialog from './SubjectsDialog';

type DialogName = 'subjects' | 'schedule' | 'admin-subjects' | 'admin-manage';

const DIALOG_EVENTS: Record<string, DialogName> = {
	'open-subjects-modal': 'subjects',
	'open-schedule-modal': 'schedule',
	'open-admin-subjects-modal': 'admin-subjects',
	'open-admin-manage-modal': 'admin-manage',
};

function toggled(set: Set<string>, id: string, on: boolean) {
	const next = new Set(set);
	if (on) next.add(id);
	else next.delete(id);
	return next;
}

function TrimDots({ tasks, done }: { tasks: Task[]; done: Set<string> }) {
	return (
		<div className="flex gap-1.5">
			{[1, 2, 3].map((t) => (
				<span
					key={t}
					className={`h-2.5 w-2.5 rounded-full ${dotClass[trimStatus(tasks, t, done)]}`}
					title={`Trimestre ${t}`}
				/>
			))}
		</div>
	);
}

function CardsSkeleton() {
	return (
		<>
			<Skeleton className="mb-6 h-5 w-64 rounded-md" />
			<div className="grid gap-3 sm:grid-cols-2">
				{Array.from({ length: 6 }, (_, i) => (
					<div key={i} className="flex flex-col gap-4 rounded-lg border bg-card p-4">
						<Skeleton className="h-6 w-2/3 rounded-md" />
						<div className="flex items-center justify-between">
							<Skeleton className="h-5 w-10 rounded-md" />
							<div className="flex gap-1.5">
								{[1, 2, 3].map((t) => (
									<Skeleton key={t} className="h-2.5 w-2.5 rounded-full" />
								))}
							</div>
						</div>
					</div>
				))}
			</div>
		</>
	);
}

export default function Home() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [userId, setUserId] = useState<string | null>(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [trayecto, setTrayecto] = useState<Trayecto | null>(null);
	const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
	const [hidden, setHidden] = useState<Set<string>>(new Set());
	const [done, setDone] = useState<Set<string>>(new Set());
	const [busy, setBusy] = useState<Set<string>>(new Set());
	const [openSubject, setOpenSubject] = useState<string | null>(null);
	const [subjectOpen, setSubjectOpen] = useState(false);
	const [dialog, setDialog] = useState<DialogName | null>(null);
	const [adminChanged, setAdminChanged] = useState(false);

	useEffect(() => {
		(async () => {
			const id = await getUserId();
			if (!id) {
				location.replace('/login');
				return;
			}
			try {
				const [profile, data] = await Promise.all([getProfile(), fetchHome(id)]);
				setUserId(id);
				setIsAdmin(profile?.isAdmin ?? false);
				setTrayecto(data.trayecto);
				setAllSubjects(data.subjects);
				setHidden(data.hidden);
				setDone(data.done);
			} catch {
				setError(true);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	useEffect(() => {
		const handlers = Object.entries(DIALOG_EVENTS).map(([event, name]) => {
			const handler = () => setDialog(name);
			document.addEventListener(event, handler);
			return [event, handler] as const;
		});
		const onAdminChange = () => setAdminChanged(true);
		document.addEventListener('admin-manage-changed', onAdminChange);
		return () => {
			handlers.forEach(([event, handler]) => document.removeEventListener(event, handler));
			document.removeEventListener('admin-manage-changed', onAdminChange);
		};
	}, []);

	const subjects = allSubjects.filter((s) => !s.hidden);
	const visibleSubjects = subjects.filter((s) => !hidden.has(s.id));
	const totalTasks = visibleSubjects.reduce((acc, s) => acc + s.tasks.length, 0);
	const allTasks = subjects.flatMap((s) => s.tasks);
	const allDone = allTasks.filter((t) => done.has(t.id)).length;
	const pct = allTasks.length > 0 ? Math.round((allDone / allTasks.length) * 100) : 0;
	const current = visibleSubjects.find((s) => s.id === openSubject);
	const adminTaskCount = allSubjects.reduce((acc, s) => acc + s.tasks.length, 0);

	useEffect(() => {
		const bar = document.getElementById('hdr-prog');
		if (bar) bar.style.width = `${pct}%`;
	}, [pct]);

	async function toggleTask(taskId: string) {
		if (!userId || busy.has(taskId)) return;
		const nowDone = !done.has(taskId);
		setDone((prev) => toggled(prev, taskId, nowDone));
		setBusy((prev) => toggled(prev, taskId, true));
		try {
			await setTaskDone(userId, taskId, nowDone);
		} catch {
			setDone((prev) => toggled(prev, taskId, !nowDone));
		} finally {
			setBusy((prev) => toggled(prev, taskId, false));
		}
	}

	async function togglePersonal(subjectId: string) {
		if (!userId) return;
		const nowHidden = !hidden.has(subjectId);
		setHidden((prev) => toggled(prev, subjectId, nowHidden));
		try {
			await setPersonalHidden(userId, subjectId, nowHidden);
		} catch {
			setHidden((prev) => toggled(prev, subjectId, !nowHidden));
		}
	}

	async function toggleGlobal(subjectId: string) {
		const subject = allSubjects.find((s) => s.id === subjectId);
		if (!subject) return false;
		const apply = (value: boolean) =>
			setAllSubjects((prev) => prev.map((s) => (s.id === subjectId ? { ...s, hidden: value } : s)));
		apply(!subject.hidden);
		try {
			await setSubjectHidden(subjectId, !subject.hidden);
			return true;
		} catch {
			apply(subject.hidden);
			return false;
		}
	}

	const closeDialog = () => setDialog(null);

	return (
		<>
			<main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
				{loading ? (
					<CardsSkeleton />
				) : error ? (
					<p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
						No se pudieron cargar los datos. Recarga la página.
					</p>
				) : (
					<>
						<div className="mb-6 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
							<span className="text-muted-foreground">
								Trayecto{' '}
								<strong className="font-medium text-foreground">{trayecto?.name ?? trayecto?.year}</strong>
								{trayecto?.name && <span className="tabular-nums"> {trayecto.year}</span>}
							</span>
							<span className="text-muted-foreground">
								<strong className="font-medium tabular-nums text-foreground">
									{visibleSubjects.length}
								</strong>{' '}
								asignaturas
							</span>
							<span className="text-muted-foreground">
								<strong className="font-medium tabular-nums text-foreground">{totalTasks}</strong> tareas
							</span>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							{visibleSubjects.map((subject) => (
								<button
									key={subject.id}
									onClick={() => {
										setOpenSubject(subject.id);
										setSubjectOpen(true);
									}}
									className="group flex flex-col gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:border-ring/40 hover:bg-muted/30"
								>
									<div className="flex items-start justify-between gap-2">
										<h2 className="font-medium tracking-tight">{subject.name}</h2>
										<span
											className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
											aria-hidden="true"
										>
											›
										</span>
									</div>

									<div className="flex items-center justify-between">
										<span className="text-sm tabular-nums text-muted-foreground">
											{subject.tasks.filter((t) => done.has(t.id)).length}/{subject.tasks.length}
										</span>
										<TrimDots tasks={subject.tasks} done={done} />
									</div>
								</button>
							))}
						</div>
					</>
				)}
			</main>

			<Modal
				open={subjectOpen && !!current}
				onClose={() => setSubjectOpen(false)}
				title={current?.name}
				headerExtra={current && <TrimDots tasks={current.tasks} done={done} />}
			>
				{current && current.tasks.length === 0 ? (
					<p className="py-6 text-center text-sm text-muted-foreground">Ninguna tarea aún</p>
				) : (
					[1, 2, 3].map((t) => {
						const tasks = current?.tasks.filter((task) => task.trimestre === t) ?? [];
						if (tasks.length === 0) return null;

						return (
							<div key={t} className="mb-5 last:mb-0">
								<h4 className="mb-1.5 text-xs font-medium text-muted-foreground">Trimestre {t}</h4>
								<ul className="flex flex-col gap-0.5">
									{tasks.map((task) => {
										const isDone = done.has(task.id);
										const isBusy = busy.has(task.id);
										return (
											<li key={task.id}>
												<button
													type="button"
													onClick={() => toggleTask(task.id)}
													aria-pressed={isDone}
													aria-busy={isBusy || undefined}
													className={`group flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted/50 ${isBusy ? 'pointer-events-none opacity-60' : ''}`}
												>
													<span
														className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
															isDone
																? 'border-success bg-success'
																: 'border-input bg-background group-hover:border-ring'
														}`}
													>
														<svg
															className={`transition-opacity ${isDone ? 'opacity-100' : 'opacity-0'}`}
															viewBox="0 0 12 12"
															fill="none"
															stroke="white"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<path d="M2 6.5 L5 9.5 L10 3" />
														</svg>
													</span>
													<span
														className={`text-sm transition-colors ${
															isDone ? 'text-muted-foreground line-through' : 'text-foreground'
														}`}
													>
														{task.text}
													</span>
												</button>
											</li>
										);
									})}
								</ul>
							</div>
						);
					})
				)}
			</Modal>

			<SubjectsDialog
				open={dialog === 'subjects'}
				onClose={closeDialog}
				loading={loading}
				subjects={subjects}
				hidden={hidden}
				onToggle={togglePersonal}
			/>

			<ScheduleDialog
				open={dialog === 'schedule'}
				onClose={closeDialog}
				subjects={subjects}
				done={done}
			/>

			{isAdmin && (
				<AdminSubjectsDialog
					open={dialog === 'admin-subjects'}
					onClose={closeDialog}
					subjects={allSubjects}
					onToggle={toggleGlobal}
				/>
			)}

			{isAdmin && (
				<Modal
					open={dialog === 'admin-manage'}
					onClose={() => {
						closeDialog();
						if (adminChanged) location.reload();
					}}
					title="Asignaturas y tareas"
					size="xl"
					headerExtra={
						<Badge variant="secondary" className="tabular-nums">
							{adminTaskCount} tareas
						</Badge>
					}
				>
					<AdminManagePanel subjects={allSubjects} />
				</Modal>
			)}
		</>
	);
}
