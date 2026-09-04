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
	const subjectId = body.subject_id?.toString();
	const hidden = Boolean(body.hidden);

	if (!subjectId) {
		return new Response(JSON.stringify({ error: 'subject_id requerido' }), {
			status: 400,
		});
	}

	if (hidden) {
		const { error } = await supabase.from('hidden_subjects').insert({
			user_id: user.id,
			subject_id: subjectId,
		});
		if (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
			});
		}
	} else {
		const { error } = await supabase
			.from('hidden_subjects')
			.delete()
			.eq('user_id', user.id)
			.eq('subject_id', subjectId);
		if (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
			});
		}
	}

	return new Response(JSON.stringify({ ok: true }), { status: 200 });
};