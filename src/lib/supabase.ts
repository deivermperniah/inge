import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export function createClient(cookies: AstroCookies, request: Request) {
	return createServerClient(
		import.meta.env.PUBLIC_SUPABASE_URL,
		import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll() {
					return parseCookieHeader(request.headers.get('Cookie') ?? '');
				},
				setAll(cookiesToSet) {
					for (const { name, value, options } of cookiesToSet) {
						cookies.set(name, value, options);
					}
				},
			},
		},
	);
}