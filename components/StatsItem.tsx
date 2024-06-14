interface Props {
  title: string
  stat: string | null
  sup?: string
}
export default function StatsItem({ title, stat, sup }: Props) {
  return (
    <>
      {stat && (
        <p className="flex justify-between items-center text-sm">
          <span className="text-accent-foreground font-light">
            {title}:{sup && <sup>{sup}</sup>}
          </span>
          <span>{stat}</span>
        </p>
      )}
    </>
  )
}
