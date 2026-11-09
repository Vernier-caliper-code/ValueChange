export type ButtonVariant = 'primary' | 'secondary' | 'light' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

const base =
  'inline-flex items-center justify-center gap-2 rounded-md border font-semibold spring-press glow-hover';

const variants: Record<ButtonVariant, string> = {
  primary: 'border-brand bg-brand text-white hover:border-brand-dark hover:bg-brand-dark',
  secondary: 'border-[#cdd3dd] bg-transparent text-ink hover:border-ink hover:bg-white',
  light: 'border-white bg-white text-[#214bb9] hover:bg-soft-blue',
  ghost: 'border-transparent bg-transparent text-brand hover:underline underline-offset-4',
  danger: 'border-danger bg-danger text-white hover:opacity-90',
};

const sizes: Record<ButtonSize, string> = {
  md: 'min-h-12 px-6 py-3 text-[14px]',
  sm: 'min-h-[38px] px-4 py-2 text-[12px]',
};

export function buttonStyles({ variant = 'primary', size = 'md' }: { variant?: ButtonVariant; size?: ButtonSize } = {}): string {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}
