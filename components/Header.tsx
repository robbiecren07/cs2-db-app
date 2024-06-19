import Link from 'next/link'
import { Menu } from './Menu'
import { FavIcon } from './Icons'

export default function Header() {
  return (
    <header className="sticky top-0 w-full h-14 flex justify-between lg:justify-center items-center gap-4 px-3 lg:px-6 bg-transparent backdrop-blur-[160px] z-50">
      <Link className="lg:absolute lg:left-0 flex justify-center items-center gap-1 lg:pl-6" href="/">
        <FavIcon className="w-6 h-6" />
        <span className="text-2xl font-mono font-bold text-purple-600 leading-none">CS2 Skins DB</span>
      </Link>
      <Menu />
    </header>
  )
}
