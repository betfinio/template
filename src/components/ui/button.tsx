import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// A tiny self-contained button so the template has ZERO private-component deps.
// Swap in your own design system (shadcn/ui, etc.) — nothing about federation
// depends on this file.
type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
	primary: 'bg-primary text-primary-foreground hover:opacity-90',
	outline: 'border border-border bg-transparent hover:bg-muted',
	ghost: 'bg-transparent hover:bg-muted',
};

const SIZES: Record<Size, string> = {
	sm: 'h-8 px-3 text-sm',
	md: 'h-10 px-4 text-sm',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	size?: Size;
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
	return (
		<button
			className={cn(
				'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
				VARIANTS[variant],
				SIZES[size],
				className,
			)}
			type="button"
			{...props}
		/>
	);
}
