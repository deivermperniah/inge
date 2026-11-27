import { supabase } from './supabase';

export interface Task {
	id: string;
	text: string;
	trimestre: number;
}

export interface Subject {
	id: string;
	name: string;
	hidden: boolean;
	tasks: Task[];
}

export interface Trayecto {
	id: string;
	year: number;
	name: string;
}

export interface Profile {
	id: string;
	email: string;
	isAdmin: boolean;
}

function check<T>({ data, error }: { data: T; error: { message: string } | null }) {
	if (error) throw new Error(error.message);
	return data;
}

export async function getUserId() {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return session?.user.id ?? null;
}

let profilePromise: Promise<Profile | null> | undefined;

export function getProfile() {
	profilePromise ??= (async () => {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		const user = session?.user;
		if (!user) return null;
		const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
		return { id: user.id, email: user.email ?? '', isAdmin: data?.role === 'admin' };
	})();
	return profilePromise;
}

export async function fetchHome(userId: string) {
	const [trayecto, subjects, hidden, progress] = await Promise.all([
		supabase.from('trayectos').select('id, year, name').eq('active', true).single(),
		supabase
			.from('subjects')
			.select('id, name, hidden, tasks(id, text, trimestre), trayectos!inner(active)')
			.eq('trayectos.active', true)
			.order('name')
			.order('sort_order', { referencedTable: 'tasks' }),
		supabase.from('hidden_subjects').select('subject_id').eq('user_id', userId),
		supabase.from('task_progress').select('task_id, done').eq('user_id', userId),
	]);

	return {
		trayecto: trayecto.data as Trayecto | null,
		subjects: (check(subjects) ?? []) as Subject[],
		hidden: new Set((hidden.data ?? []).map((h) => h.subject_id as string)),
		done: new Set((progress.data ?? []).filter((p) => p.done).map((p) => p.task_id as string)),
	};
}

export async function setTaskDone(userId: string, taskId: string, done: boolean) {
	check(
		await supabase.from('task_progress').upsert(
			{ user_id: userId, task_id: taskId, done, updated_at: new Date().toISOString() },
			{ onConflict: 'user_id,task_id' },
		),
	);
}

export async function setPersonalHidden(userId: string, subjectId: string, hidden: boolean) {
	if (hidden) {
		check(await supabase.from('hidden_subjects').insert({ user_id: userId, subject_id: subjectId }));
	} else {
		check(
			await supabase
				.from('hidden_subjects')
				.delete()
				.eq('user_id', userId)
				.eq('subject_id', subjectId),
		);
	}
}

export async function setSubjectHidden(subjectId: string, hidden: boolean) {
	check(await supabase.from('subjects').update({ hidden }).eq('id', subjectId));
}

export async function createSubject(name: string) {
	const trayecto = check(
		await supabase.from('trayectos').select('id').eq('active', true).single(),
	);
	return check(
		await supabase
			.from('subjects')
			.insert({ trayecto_id: trayecto.id, name })
			.select('id, name')
			.single(),
	) as { id: string; name: string };
}

export async function updateSubject(id: string, name: string) {
	check(await supabase.from('subjects').update({ name }).eq('id', id));
}

export async function deleteSubject(id: string) {
	check(await supabase.from('subjects').delete().eq('id', id));
}

export async function createTask(subjectId: string, text: string, trimestre: number) {
	return check(
		await supabase
			.from('tasks')
			.insert({ subject_id: subjectId, text, trimestre })
			.select('id, text, trimestre')
			.single(),
	) as Task;
}

export async function updateTask(id: string, text: string, trimestre: number) {
	check(await supabase.from('tasks').update({ text, trimestre }).eq('id', id));
}

export async function deleteTask(id: string) {
	check(await supabase.from('tasks').delete().eq('id', id));
}
