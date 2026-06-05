'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import type { InfiniteBaseItem } from '@/types/custom'
import InfiniteItemCard from './InfiniteItemCard'

interface Props {
  initialItems: InfiniteBaseItem[]
  fetchMore: (offset: number) => Promise<InfiniteBaseItem[]>
  basePath: string
  pageSize?: number
}

export default function InfiniteItemGrid({ initialItems, fetchMore, basePath, pageSize = 52 }: Props) {
  const [items, setItems] = useState<InfiniteBaseItem[]>(initialItems)
  const [hasMore, setHasMore] = useState(initialItems.length >= pageSize)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(initialItems.length)
  const loadingRef = useRef(false)

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    startTransition(async () => {
      const more = await fetchMore(offsetRef.current)
      if (more.length > 0) {
        setItems((prev) => [...prev, ...more])
        offsetRef.current += more.length
      }
      if (more.length < pageSize) setHasMore(false)
      loadingRef.current = false
    })
  }, [hasMore, fetchMore, pageSize])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: '400px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div className="w-full">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8 lg:py-12">
        {items.map((item, index) => (
          <InfiniteItemCard key={item.id} item={item} index={index} basePath={basePath} />
        ))}
      </div>

      {/* Sentinel triggers next load when scrolled into view */}
      <div ref={sentinelRef} className="h-px" aria-hidden />

      {isPending && (
        <div className="flex justify-center py-8" aria-label="Loading more items">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
      )}

      {!hasMore && items.length > pageSize && (
        <p className="text-center text-sm text-accent-foreground py-6">
          All {items.length} items loaded
        </p>
      )}
    </div>
  )
}
