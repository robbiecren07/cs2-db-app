'use client'

import { SkinWithDetails } from '@/types/custom'
import { useState, useEffect } from 'react'
import { rarityOrder } from '@/lib/helpers'
import { SkinCard } from '@/components/SkinCard'
import SortFilterButton from './SortFilterButton'
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu'

interface Data {
  skins: SkinWithDetails[]
  weapon: string
}

type Checked = DropdownMenuCheckboxItemProps['checked']

export default function SortFilterContainer({ skins, weapon }: Data) {
  const [filteredAndSortedSkins, setFilteredAndSortedSkins] = useState(skins)
  const [sortOption, setSortOption] = useState<'ASC' | 'DESC' | 'Rarity' | null>(null)
  const [showStatTrak, setShowStatTrak] = useState<Checked>(true)
  const [showSouvenir, setShowSouvenir] = useState<Checked>(true)

  useEffect(() => {
    let updatedSkins = [...skins]

    // Apply filters first
    if (!showStatTrak) {
      updatedSkins = updatedSkins.filter((skin) => !skin.stattrak)
    }
    if (!showSouvenir) {
      updatedSkins = updatedSkins.filter((skin) => !skin.souvenir)
    }

    // Apply sorting
    switch (sortOption) {
      case 'ASC':
        updatedSkins.sort((a, b) => (a.shortName ?? '').localeCompare(b.shortName ?? ''))
        break
      case 'DESC':
        updatedSkins.sort((a, b) => (b.shortName ?? '').localeCompare(a.shortName ?? ''))
        break
      case 'Rarity':
        updatedSkins.sort((a, b) => (rarityOrder[a.rarityId ?? ''] || 999) - (rarityOrder[b.rarityId ?? ''] || 999))
        break
      default:
        updatedSkins = [...updatedSkins] // default order
    }

    setFilteredAndSortedSkins(updatedSkins)
  }, [sortOption, showStatTrak, showSouvenir, skins])

  return (
    <div className="flex-1 basis-full h-max grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SortFilterButton
        onSortChange={setSortOption}
        showStatTrak={showStatTrak}
        setShowStatTrak={setShowStatTrak}
        showSouvenir={showSouvenir}
        setShowSouvenir={setShowSouvenir}
      />
      {filteredAndSortedSkins.map((skin, i) => {
        return <SkinCard key={skin.id} weapon={weapon} skin={skin} index={i} />
      })}
    </div>
  )
}
