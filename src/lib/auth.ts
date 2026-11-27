import { supabase } from './supabase';

export async function signIn(email: string, password: string) {
	const { error } = await supabase.auth.signInWithPassword({ email, password });
	return error?.message ?? null;
}

export async function signUp(email: string, password: string) {
	const { data, error } = await supabase.auth.signUp({ email, password });
	return { error: error?.message ?? null, session: !!data.session };
}

export async function signOut() {
	await supabase.auth.signOut();
}
