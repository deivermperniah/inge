interface Props {
	checked: boolean;
	label: string;
	disabled?: boolean;
	onClick: () => void;
}

export default function Switch({ checked, label, disabled, onClick }: Props) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={label}
			aria-busy={disabled || undefined}
			disabled={disabled}
			onClick={onClick}
			className="group inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-input p-0.5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-checked:bg-primary disabled:cursor-wait disabled:opacity-60"
		>
			<span className="size-5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 group-aria-checked:translate-x-5" />
		</button>
	);
}
