'use client'

import { useState, useEffect, useTransition, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command-old'
import { searchItems, type SearchResult } from '@/app/search/actions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Group results by category, preserving the order categories appear
function groupResults(results: SearchResult[]): { label: string; items: SearchResult[] }[] {
  const map = new Map<string, SearchResult[]>()
  for (const r of results) {
    if (!map.has(r.category)) map.set(r.category, [])
    map.get(r.category)!.push(r)
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }))
}

export default function SearchCommand({ open, onOpenChange }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSearch = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const data = await searchItems(value)
        setResults(data)
      })
    }, 280)
  }, [])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  const handleSelect = useCallback(
    (href: string) => {
      onOpenChange(false)
      router.push(href)
    },
    [onOpenChange, router]
  )

  const groups = groupResults(results)
  const hasQuery = query.trim().length >= 2

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[20%] z-50 -translate-x-1/2 w-full max-w-2xl overflow-hidden rounded-xl border border-[#1a1c2e] bg-secondary shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 px-0">
          <Command shouldFilter={false} className="rounded-none bg-transparent">
            <CommandInput
              placeholder="Search skins, cases, agents, stickers..."
              value={query}
              onValueChange={(v) => {
                setQuery(v)
                runSearch(v)
              }}
              className="text-base"
            />
            <CommandList>
              {hasQuery && !isPending && results.length === 0 && (
                <CommandEmpty>No results for &ldquo;{query}&rdquo;</CommandEmpty>
              )}
              {isPending && (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                </div>
              )}
              {!isPending &&
                groups.map((group, i) => (
                  <div key={group.label}>
                    {i > 0 && <CommandSeparator />}
                    <CommandGroup heading={group.label}>
                      {group.items.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          onSelect={() => handleSelect(item.href)}
                          onPointerDown={(e) => {
                            e.preventDefault()
                            handleSelect(item.href)
                          }}
                        >
                          {/* Rarity color bar */}
                          {item.rarityColor && (
                            <span
                              className="w-0.5 h-8 rounded-full shrink-0"
                              style={{ backgroundColor: item.rarityColor }}
                            />
                          )}

                          {/* Image */}
                          {item.image ? (
                            <div className="w-10 h-8 shrink-0 flex items-center justify-center">
                              <Image
                                src={item.image}
                                width={40}
                                height={32}
                                className="object-contain w-full h-full"
                                alt={item.name}
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-8 shrink-0 rounded bg-muted" />
                          )}

                          {/* Name + sub */}
                          <div className="flex flex-col min-w-0">
                            <span className="truncate text-sm font-medium">{item.name}</span>
                            {item.sub && <span className="truncate text-xs text-accent-foreground">{item.sub}</span>}
                          </div>

                          {/* Category pill (only shown if group heading isn't enough context) */}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </div>
                ))}
            </CommandList>

            {/* Footer hint */}
            {hasQuery && !isPending && results.length > 0 && (
              <div className="border-t border-[#1a1c2e] px-3 py-2 flex items-center gap-4 text-xs text-accent-foreground">
                <span>
                  <kbd className="font-mono">↑↓</kbd> navigate
                </span>
                <span>
                  <kbd className="font-mono">↵</kbd> select
                </span>
                <span>
                  <kbd className="font-mono">esc</kbd> close
                </span>
              </div>
            )}
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
