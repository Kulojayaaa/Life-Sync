import { cn } from '@/lib/utils';

type LifeSyncLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizes = {
  sm: 'h-10 w-10 rounded-xl',
  md: 'h-12 w-12 rounded-2xl',
  lg: 'h-16 w-16 rounded-[1.35rem]',
};

export function LifeSyncLogo({ size = 'md', className }: LifeSyncLogoProps) {
  return (
    <img
      src="/icon-192.png"
      alt="LifeSync logo"
      className={cn(
        'shrink-0 object-cover shadow-md ring-1 ring-black/5 dark:ring-white/10',
        sizes[size],
        className,
      )}
    />
  );
}
