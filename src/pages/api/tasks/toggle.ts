import type { APIRoute } from 'astro';
import { createClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
	const supabase = createClient(cookies, request);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return new Response(JSON.stringify({ error: 'No autorizado' }), {
			status: 401,
		});
	}

	const body = await request.json();
	const taskId = body.task_id?.toString();
	const done = Boolean(body.done);

	if (!taskId) {
		return new Response(JSON.stringify({ error: 'task_id requerido' }), {
			status: 400,
		});
	}

	const { error } = await supabase.from('task_progress').upsert(
		{
			user_id: user.id,
			task_id: taskId,
			done,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: 'user_id,task_id' },
	);

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
		});
	}

	return new Response(JSON.stringify({ ok: true }), { status: 200 });
};