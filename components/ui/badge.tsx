import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs text-black font-medium transition-all hover:brightness-[1.2] focus:outline-none focus:ring-0 cursor-default',
  {
    variants: {
      variant: {
        rarity_uncommon_weapon: 'bg-[#5e98d9]',
        rarity_mythical_weapon: 'bg-[#8847ff]',
        rarity_legendary_weapon: 'bg-[#d32ce6]',
        rarity_ancient_weapon: 'bg-[#eb4b4b]',
        rarity_rare_weapon: 'bg-[#4b69ff]',
        rarity_ancient: 'bg-[#eb4b4b]',
        rarity_contraband_weapon: 'bg-[#e4ae39]',
        rarity_common_weapon: 'bg-[#b0c3d9]',
        souvenir: 'bg-[#ffd700]',
        stattrak: 'bg-[#f89406]',
      },
    },
    defaultVariants: {
      variant: 'rarity_common_weapon',
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
