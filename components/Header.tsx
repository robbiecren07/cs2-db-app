import Link from 'next/link'
import { Menu } from './Menu'

export default function Header() {
  return (
    <header className="sticky top-0 w-full h-14 flex justify-center items-center gap-4 px-6 bg-transparent backdrop-blur-[160px] z-50">
      <Link className="lg:hidden" href="/">
        <span className="sr-only">Home</span>
      </Link>
      <Menu />
    </header>
  )
}
