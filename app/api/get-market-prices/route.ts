import { NextResponse } from 'next/server'

const WEARS = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const itemName = searchParams.get('itemName')
  const stattrak = searchParams.get('stattrak') === 'true'
  const souvenir = searchParams.get('souvenir') === 'true'

  if (!itemName) {
    return NextResponse.json({ error: 'Missing itemName parameter' }, { status: 400 })
  }

  try {
    const prices: any = {}

    for (const wear of WEARS) {
      const variations = [itemName]
      if (stattrak) variations.push(`StatTrak™ ${itemName}`)
      if (souvenir) variations.push(`Souvenir ${itemName}`)

      for (const variation of variations) {
        const response = await fetch(
          `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(
            `${variation} (${wear})`
          )}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          continue
        }

        const data = await response.json()
        if (data.lowest_price) {
          prices[`${variation} (${wear})`] = {
            price: data.lowest_price,
            url: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(`${variation} (${wear})`)}`,
          }
        } else {
          prices[`${variation} (${wear})`] = null
        }
      }
    }

    return NextResponse.json({ prices })
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching market data', details: error }, { status: 500 })
  }
}
