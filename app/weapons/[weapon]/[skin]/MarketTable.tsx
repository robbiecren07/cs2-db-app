'use client'

import { Skins } from '@/types/custom'
import { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Props {
  skin: Skins
}

interface Prices {
  [key: string]: { price: string; url: string } | null
}

export default function MarketTable({ skin }: Props) {
  const [prices, setPrices] = useState<Prices>({})
  const [error, setError] = useState<string | null>(null)

  const skinName = skin.name.replace(/ (Black Pearl|Sapphire|Ruby|Emerald|Phase 1|Phase 2|Phase 3|Phase 4)/g, '')

  useEffect(() => {
    const fetchMarketPrices = async () => {
      try {
        const response = await fetch(
          `/api/get-market-prices?itemName=${encodeURIComponent(skinName)}&stattrak=${skin.stattrak}&souvenir=${
            skin.souvenir
          }`
        )
        const data = await response.json()

        if (data && data.prices) {
          setPrices(data.prices)
        } else {
          setError(data.error || 'Failed to fetch prices')
        }
      } catch (error) {
        setError('Error fetching market data')
      }
    }

    fetchMarketPrices()
  }, [skin, skinName])

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

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: skin.name,
    category: skin.stattrak ? 'StatTrak™ Skin' : skin.souvenir ? 'Souvenir Skin' : 'Standard Skin',
    offers: Object.keys(prices)
      .map((key) => {
        if (!prices[key]) return null
        return {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: prices[key]?.price.replace('$', ''),
          url: prices[key]?.url,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          name: key,
        }
      })
      .filter(Boolean),
    brand: {
      '@type': 'Brand',
      name: 'Steam Community Market',
    },
  }

  return (
    <Table aria-label={`Steam Community Market Prices for ${skin.name}`}>
      <TableCaption>
        * Prices are fetched periodically. Click the price to view it on the Steam Community Market.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]"></TableHead>
          <TableHead className="text-center">Factory New</TableHead>
          <TableHead className="text-center">Minimal Wear</TableHead>
          <TableHead className="text-center">Field-Tested</TableHead>
          <TableHead className="text-center">Well-Worn</TableHead>
          <TableHead className="text-center">Battle-Scarred</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {error ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-red-600" aria-label="Error fetching prices">
              {error}
            </TableCell>
          </TableRow>
        ) : (
          <>
            <TableRow>
              <TableCell className="font-medium">Base</TableCell>
              {['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'].map((wear) => (
                <TableCell key={wear} className="text-center">
                  {renderPriceCell(`${skinName} (${wear})`)}
                </TableCell>
              ))}
            </TableRow>
            {skin.stattrak && (
              <TableRow>
                <TableCell className="font-medium">StatTrak™</TableCell>
                {['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'].map((wear) => (
                  <TableCell key={wear} className="text-center">
                    {renderPriceCell(`StatTrak™ ${skinName} (${wear})`)}
                  </TableCell>
                ))}
              </TableRow>
            )}
            {skin.souvenir && (
              <TableRow>
                <TableCell className="font-medium">Souvenir</TableCell>
                {['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'].map((wear) => (
                  <TableCell key={wear} className="text-center">
                    {renderPriceCell(`Souvenir ${skinName} (${wear})`)}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </>
        )}
      </TableBody>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </Table>
  )
}
