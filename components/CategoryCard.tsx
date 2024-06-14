import Image from 'next/image'

interface Props {
  weaponName: string
  knifeName?: string | null
  subTitle: string
}

export default function CategoryCard({ weaponName, knifeName, subTitle }: Props) {
  return (
    <div className="flex-1 bg-muted p-4 space-y-4 rounded-lg">
      <Image
        alt={`Default ${weaponName} skin modal`}
        className="h-[180px] w-full aspect-video object-contain"
        src={`/${weaponName.replace(' ', '_')}.webp`}
        width="290"
        height="180"
        priority
      />
      <div>
        <h2 className="text-white text-lg font-medium text-center">{knifeName ? knifeName : weaponName}</h2>
        <p className="text-xs text-accent-foreground text-center">{subTitle}</p>
      </div>
    </div>
  )
}
