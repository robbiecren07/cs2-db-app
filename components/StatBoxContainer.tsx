interface Props {
  title: string
  children: React.ReactNode
}

export default function StatBoxContainer({ title, children }: Props) {
  return (
    <div className="flex-1 bg-muted p-4 space-y-3 rounded-lg border border-[#1a1c2e]">
      <div className="border-b border-[#1a1c2e] pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-accent-foreground">{title}</h3>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}
