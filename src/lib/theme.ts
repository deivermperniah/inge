// Preferencia de tema (sistema/claro/oscuro) guardada en localStorage.
// ThemeScript.astro aplica la misma lógica antes del primer render.

export type Theme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme';
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

export function getStoredTheme(): Theme {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored === 'light' || stored === 'dark' ? stored : 'system';
	} catch {
		return 'system';
	}
}

export function applyTheme(theme: Theme) {
	const isDark = theme === 'dark' || (theme === 'system' && darkQuery().matches);
	const root = document.documentElement;
	root.dataset.theme = theme;
	root.dataset.effective = isDark ? 'dark' : 'light';
	root.classList.toggle('dark', isDark);
}

export function setTheme(theme: Theme) {
	try {
		localStorage.setItem(STORAGE_KEY, theme);
	} catch {}
	applyTheme(theme);
}

// Reaplica el tema cuando cambia la preferencia del sistema (solo en modo "system").
export function watchSystemTheme() {
	const query = darkQuery();
	const onChange = () => {
		if (getStoredTheme() === 'system') applyTheme('system');
	};
	query.addEventListener('change', onChange);
	return () => query.removeEventListener('change', onChange);
}
