'use client'

import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowUpDown, ArrowUp, ArrowDown, Star, X } from 'lucide-react'

type SortOption = 'ASC' | 'DESC' | 'Rarity' | null
type Checked = DropdownMenuCheckboxItemProps['checked']

interface FilterButtonProps {
  onSortChange: (sort: SortOption) => void
  showStatTrak: Checked
  setShowStatTrak: (value: boolean) => void
  showSouvenir: Checked
  setShowSouvenir: (value: boolean) => void
}

export default function SortFilterButton({
  onSortChange,
  showStatTrak,
  setShowStatTrak,
  showSouvenir,
  setShowSouvenir,
}: FilterButtonProps) {
  const [currentSort, setCurrentSort] = useState<SortOption>(null)

  const handleSort = (option: SortOption) => {
    setCurrentSort(option)
    onSortChange(option)
  }

  const clearFilter = () => {
    setCurrentSort(null)
    onSortChange(null)
    setShowStatTrak(true)
    setShowSouvenir(true)
  }

  const getSortIcon = () => {
    switch (currentSort) {
      case 'ASC':
        return <ArrowUp className="mr-2 h-4 w-4" />
      case 'DESC':
        return <ArrowDown className="mr-2 h-4 w-4" />
      case 'Rarity':
        return <Star className="mr-2 h-4 w-4" />
      default:
        return <ArrowUpDown className="mr-2 h-4 w-4" />
    }
  }

  return (
    <div className="flex justify-end md:absolute md:right-0 md:-top-4 lg:-top-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1">
            {getSortIcon()}
            Sort & Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuLabel>Sort</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleSort('ASC')}>
            <ArrowUp className="mr-2 h-4 w-4" /> Ascending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort('DESC')}>
            <ArrowDown className="mr-2 h-4 w-4" /> Descending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort('Rarity')}>
            <Star className="mr-2 h-4 w-4" /> Rarity
          </DropdownMenuItem>
          {currentSort && (
            <DropdownMenuItem onClick={clearFilter}>
              <X className="mr-2 h-4 w-4" /> Clear Filter
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={showSouvenir} onCheckedChange={(checked) => setShowSouvenir(!!checked)}>
            Souvenir
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showStatTrak} onCheckedChange={(checked) => setShowStatTrak(!!checked)}>
            StatTrak™
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
