import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'launch' | 'sold'
  className?: string
}

const variants = {
  default: 'bg-zinc-100 text-zinc-700',
  launch: 'bg-amber-100 text-amber-800',
  sold: 'bg-red-100 text-red-700',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
