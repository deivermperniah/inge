import { useEffect, useRef, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

interface Props {
	open: boolean;
	onClose: () => void;
	title?: string;
	size?: 'md' | 'lg' | 'xl';
	headerExtra?: ReactNode;
	children: ReactNode;
}

const sizeClass = {
	md: 'max-w-lg',
	lg: 'max-w-3xl',
	xl: 'max-w-4xl',
};

export default function Modal({ open, onClose, title, size = 'md', headerExtra, children }: Props) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	return (
		<dialog ref={ref} className={sizeClass[size]} onClose={onClose}>
			<div className="flex items-center justify-between gap-4 border-b px-5 py-3.5">
				<div className="min-w-0">
					{title && <h2 className="truncate text-base font-semibold tracking-tight">{title}</h2>}
				</div>
				<div className="flex shrink-0 items-center gap-2">
					{headerExtra}
					<form method="dialog">
						<button
							className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
							aria-label="Cerrar"
						>
							<HugeiconsIcon icon={Cancel01Icon} size={15} strokeWidth={1.8} />
						</button>
					</form>
				</div>
			</div>

			<div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
		</dialog>
	);
}
