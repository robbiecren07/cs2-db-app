'use client'

import { Skins } from '@/types/custom'
import { useState, useEffect } from 'react'
import { rarityOrder } from '@/lib/helpers'
import { SkinCard } from '@/components/SkinCard'
import SortFilterButton from './SortFilterButton'
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu'

interface Data {
  skins: Skins[]
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
        updatedSkins.sort((a, b) => a.short_name.localeCompare(b.short_name))
        break
      case 'DESC':
        updatedSkins.sort((a, b) => b.short_name.localeCompare(a.short_name))
        break
      case 'Rarity':
        updatedSkins.sort((a, b) => (rarityOrder[a.rarity_id] || 999) - (rarityOrder[b.rarity_id] || 999))
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
