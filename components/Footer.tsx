export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="w-full bg-primary mt-auto py-8 border-t border-[#3A3A40]" aria-label="Footer">
      <div className="w-full max-w-3xl mx-auto px-4 flex flex-col gap-2 justify-center items-center">
        <p className="text-xs text-center" aria-label="Copyright Notice">
          &copy; {year} cs2skinsdb.com
        </p>
        <p className="text-xs text-center" aria-label="Disclaimer about affiliation with Valve Corporation">
          This site is not affiliated with Valve, Steam, or any of their partners. All copyrights are reserved to their
          respective owners. Counter-Strike 2 and all associated trademarks are property of Valve Corporation. Images
          and content used on this site are for informational and educational purposes only.
        </p>
      </div>
    </footer>
  )
}
