import { useEffect, useState, type ReactElement } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
	BookOpen01Icon,
	Calendar03Icon,
	ComputerIcon,
	Key01Icon,
	LibrariesIcon,
	Logout03Icon,
	Moon02Icon,
	Shield01Icon,
	Sun03Icon,
	UserGroupIcon,
	ViewIcon,
} from '@hugeicons/core-free-icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getStoredTheme, setTheme, watchSystemTheme, type Theme } from '@/lib/theme';

interface Props {
	userEmail: string;
	isAdmin: boolean;
}

const THEMES: { value: Theme; label: string; icon: IconSvgElement }[] = [
	{ value: 'system', label: 'Sistema', icon: ComputerIcon },
	{ value: 'light', label: 'Claro', icon: Sun03Icon },
	{ value: 'dark', label: 'Oscuro', icon: Moon02Icon },
];

const ADMIN_SOON: { label: string; icon: IconSvgElement }[] = [
	{ label: 'Materias y tareas', icon: LibrariesIcon },
	{ label: 'Usuarios', icon: UserGroupIcon },
	{ label: 'Roles', icon: Key01Icon },
];

function Icon({ icon }: { icon: IconSvgElement }) {
	return <HugeiconsIcon icon={icon} size={18} strokeWidth={1.8} />;
}

// Botón de ícono con tooltip; `trigger` permite componerlo con un DropdownMenuTrigger.
function IconAction({
	label,
	icon,
	onClick,
	trigger,
}: {
	label: string;
	icon: IconSvgElement;
	onClick?: () => void;
	trigger?: (button: ReactElement) => ReactElement;
}) {
	const button = (
		<Button
			variant="ghost"
			size="icon"
			aria-label={label}
			onClick={onClick}
			className="text-muted-foreground hover:text-foreground"
		/>
	);
	return (
		<Tooltip>
			<TooltipTrigger render={trigger ? trigger(button) : button}>
				<Icon icon={icon} />
			</TooltipTrigger>
			<TooltipContent side="bottom">{label}</TooltipContent>
		</Tooltip>
	);
}

export default function HeaderActions({ userEmail, isAdmin }: Props) {
	const [theme, setThemeState] = useState<Theme>('system');

	useEffect(() => {
		setThemeState(getStoredTheme());
		return watchSystemTheme();
	}, []);

	const changeTheme = (value: Theme) => {
		setThemeState(value);
		setTheme(value);
	};

	const themeIcon = THEMES.find((t) => t.value === theme)?.icon ?? ComputerIcon;
	const initial = userEmail.charAt(0).toUpperCase() || '?';

	return (
		<TooltipProvider delay={300}>
			<div className="flex items-center gap-1">
				{isAdmin && (
					<DropdownMenu>
						<IconAction
							label="Administración"
							icon={Shield01Icon}
							trigger={(button) => <DropdownMenuTrigger render={button} />}
						/>
						<DropdownMenuContent align="end" className="w-64">
							<DropdownMenuGroup>
								<DropdownMenuLabel>Administración</DropdownMenuLabel>
								<DropdownMenuItem render={<a href="/admin/asignaturas" />}>
									<Icon icon={ViewIcon} />
									Visibilidad de asignaturas
								</DropdownMenuItem>
								{ADMIN_SOON.map((item) => (
									<DropdownMenuItem key={item.label} disabled>
										<Icon icon={item.icon} />
										{item.label}
										<Badge variant="secondary" className="ml-auto">
											Pronto
										</Badge>
									</DropdownMenuItem>
								))}
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				)}

				<IconAction
					label="Mis materias"
					icon={BookOpen01Icon}
					onClick={() => document.dispatchEvent(new Event('open-subjects-modal'))}
				/>

				<IconAction
					label="Horario y docentes"
					icon={Calendar03Icon}
					onClick={() => document.dispatchEvent(new Event('open-schedule-modal'))}
				/>

				<DropdownMenu>
					<IconAction
						label="Tema"
						icon={themeIcon}
						trigger={(button) => <DropdownMenuTrigger render={button} />}
					/>
					<DropdownMenuContent align="end" className="w-44">
						<DropdownMenuGroup>
							<DropdownMenuLabel>Tema</DropdownMenuLabel>
							<DropdownMenuRadioGroup
								value={theme}
								onValueChange={(value) => changeTheme(value as Theme)}
							>
								{THEMES.map((t) => (
									<DropdownMenuRadioItem key={t.value} value={t.value}>
										<Icon icon={t.icon} />
										{t.label}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<button
								aria-label="Cuenta"
								className="ml-1 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
							/>
						}
					>
						<Avatar>
							<AvatarFallback className="bg-primary/10 font-semibold text-primary">
								{initial}
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-64">
						<DropdownMenuGroup>
							<DropdownMenuLabel className="flex items-center gap-3 text-foreground">
								<Avatar size="lg">
									<AvatarFallback className="bg-primary/10 font-semibold text-primary">
										{initial}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0">
									<p className="text-xs text-muted-foreground">Sesión iniciada como</p>
									<p className="truncate text-sm font-medium">{userEmail}</p>
								</div>
							</DropdownMenuLabel>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem variant="destructive" render={<a href="/logout" />}>
							<Icon icon={Logout03Icon} />
							Cerrar sesión
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</TooltipProvider>
	);
}
