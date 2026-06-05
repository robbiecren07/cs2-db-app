interface Props {
  title: string
}

export default function PageTitle({ title }: Props) {
  return (
    <h1 className="text-2xl md:text-3xl font-medium text-center py-8 lg:py-12 bg-linear-to-br from-foreground to-secondary-foreground bg-clip-text text-transparent">
      {title}
    </h1>
  )
}
