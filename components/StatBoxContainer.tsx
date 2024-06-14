interface Props {
  title: string
  children: React.ReactNode
}

export default function StatBoxContainer({ title, children }: Props) {
  return (
    <div className="flex-1 bg-muted p-4 space-y-4 rounded-lg">
      <h3 className="text-white text-center">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}
