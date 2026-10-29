import type { APIRoute } from 'astro';
import { createClient } from '../../../lib/supabase';

function json(data: unknown, status: number) {
	return new Response(JSON.stringify(data), { status });
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
		const name = body.name?.toString().trim();
		if (!name) {
			return json({ error: 'nombre requerido' }, 400);
		}

		const { data: trayecto } = await supabase
			.from('trayectos')
			.select('id')
			.eq('active', true)
			.single();

		if (!trayecto) {
			return json({ error: 'No hay trayecto activo' }, 400);
		}

		const { data, error } = await supabase
			.from('subjects')
			.insert({ trayecto_id: trayecto.id, name })
			.select('id, name')
			.single();

		if (error) {
			return json({ error: error.message }, 500);
		}

		return json({ subject: data }, 200);
	}

	if (action === 'update') {
		const id = body.id?.toString();
		const name = body.name?.toString().trim();
		if (!id || !name) {
			return json({ error: 'id y nombre requeridos' }, 400);
		}

		const { error } = await supabase.from('subjects').update({ name }).eq('id', id);

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

		const { error } = await supabase.from('subjects').delete().eq('id', id);

		if (error) {
			return json({ error: error.message }, 500);
		}

		return json({ ok: true }, 200);
	}

	return json({ error: 'acción inválida' }, 400);
};
