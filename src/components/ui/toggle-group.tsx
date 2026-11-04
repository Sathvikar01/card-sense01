'use client'

import * as React from 'react'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * One control for every "pick one of a few" set (shadcn: option sets use ToggleGroup).
 * Arrow keys move between items; the pressed item is the gold fill.
 */
const toggleItemVariants = cva(
  'inline-flex items-center font-medium transition-[background-color,color,scale] duration-(--duration-quick) ease-(--ease-out) enabled:active:scale-[0.96] disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
  {
    variants: {
      variant: {
        chip: 'h-9 rounded-full bg-muted px-4 text-sm hover:bg-muted-strong',
        option: 'min-h-14 w-full rounded-2xl bg-card px-5 py-4 text-left text-base font-normal hover:bg-card/70 data-[state=on]:font-medium',
        plain: 'h-9 rounded-full px-4 text-sm text-muted-foreground hover:text-foreground',
        field: 'h-10 rounded-full bg-field-foreground/10 px-3.5 text-sm text-field-foreground hover:bg-field-foreground/20',
      },
    },
    defaultVariants: { variant: 'chip' },
  }
)

type ItemVariant = VariantProps<typeof toggleItemVariants>['variant']
const VariantContext = React.createContext<ItemVariant>('chip')

function ToggleGroup({
  className,
  variant = 'chip',
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & { variant?: ItemVariant }) {
  return (
    <VariantContext.Provider value={variant}>
      <ToggleGroupPrimitive.Root
        data-slot="toggle-group"
        className={cn(variant === 'option' ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2', className)}
        {...props}
      />
    </VariantContext.Provider>
  )
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  const variant = React.useContext(VariantContext)
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(toggleItemVariants({ variant }), className)}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
