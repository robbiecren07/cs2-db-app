interface Props {
  title: string
}

export default function PageTitle({ title }: Props) {
  return <h1 className="text-2xl md:text-3xl font-medium text-center pt-8 lg:pt-12">{title}</h1>
}
