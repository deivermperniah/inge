import type { APIRoute } from 'astro';
import { createClient } from '../../../lib/supabase';

function json(data: unknown, status: number) {
	return new Response(JSON.stringify(data), { status });
}

function parseTrimestre(value: unknown) {
	const n = Number(value);
	return Number.isInteger(n) && n >= 1 && n <= 3 ? n : null;
}

export const POST: APIRoute = async ({ request, cookies }) => {
	const supabase = createClient(cookies, request);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return json({ error: 'No autorizado' }, 401);
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select('role')
		.eq('id', user.id)
		.single();

	if (profile?.role !== 'admin') {
		return json({ error: 'Requiere rol admin' }, 403);
	}

	const body = await request.json();
	const action = body.action?.toString();

	if (action === 'create') {
		const subjectId = body.subject_id?.toString();
		const text = body.text?.toString().trim();
		const trimestre = parseTrimestre(body.trimestre);

		if (!subjectId || !text || trimestre === null) {
			return json({ error: 'subject_id, texto y trimestre (1-3) requeridos' }, 400);
		}

		const { data, error } = await supabase
			.from('tasks')
			.insert({ subject_id: subjectId, text, trimestre })
			.select('id, text, trimestre')
			.single();

		if (error) {
			return json({ error: error.message }, 500);
		}

		return json({ task: data }, 200);
	}

	if (action === 'update') {
		const id = body.id?.toString();
		const text = body.text?.toString().trim();
		const trimestre = parseTrimestre(body.trimestre);

		if (!id || !text || trimestre === null) {
			return json({ error: 'id, texto y trimestre (1-3) requeridos' }, 400);
		}

		const { error } = await supabase.from('tasks').update({ text, trimestre }).eq('id', id);

		if (error) {
			return json({ error: error.message }, 500);
		}

		return json({ ok: true }, 200);
	}

	if (action === 'delete') {
		const id = body.id?.toString();
		if (!id) {
			return json({ error: 'id requerido' }, 400);
		}

		const { error } = await supabase.from('tasks').delete().eq('id', id);

		if (error) {
			return json({ error: error.message }, 500);
		}

		return json({ ok: true }, 200);
	}

	return json({ error: 'acción inválida' }, 400);
};
