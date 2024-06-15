'use client'

import { Agents, Patches } from '@/types/custom'
import { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Props {
  item: Patches | Agents
}

interface Prices {
  [key: string]: { price: string; url: string } | null
}

export default function GlobalMarketTable({ item }: Props) {
  const [prices, setPrices] = useState<Prices>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarketPrices = async () => {
      try {
        const response = await fetch(`/api/get-agent-price?itemName=${encodeURIComponent(item.name)}`)
        const data = await response.json()

        if (data && data.prices) {
          setPrices(data.prices)
        } else {
          setError(data.error || 'Failed to fetch price')
        }
      } catch (error) {
        setError('Error fetching market data')
      }
    }

    fetchMarketPrices()
  }, [item])

  const renderPriceCell = (key: string) => {
    if (prices[key]) {
      return (
        <a
          className="transition-colors hover:text-purple-500"
          href={prices[key]?.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {prices[key]?.price}
        </a>
      )
    }
    return '—'
  }

  return (
    <Table>
      <TableCaption>
        * Prices are fetched periodically. Click the price to view it on the Steam Community Market.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px] text-center">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {error ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-red-600">
              {error}
            </TableCell>
          </TableRow>
        ) : (
          <>
            <TableRow>
              <TableCell className="text-center">{renderPriceCell(item.name)}</TableCell>
            </TableRow>
          </>
        )}
      </TableBody>
    </Table>
  )
}
