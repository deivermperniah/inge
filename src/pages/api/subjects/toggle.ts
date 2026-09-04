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

	const { data: profile } = await supabase
		.from('profiles')
		.select('role')
		.eq('id', user.id)
		.single();

	if (profile?.role !== 'admin') {
		return new Response(JSON.stringify({ error: 'Requiere rol admin' }), {
			status: 403,
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

	const { error } = await supabase
		.from('subjects')
		.update({ hidden })
		.eq('id', subjectId);

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
		});
	}

	return new Response(JSON.stringify({ ok: true }), { status: 200 });
};