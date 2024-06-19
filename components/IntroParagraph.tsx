interface Props {
  content: string
}

export default function IntroParagraph({ content }: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto py-4">
      <p className="text-sm md:text-base text-center font-light">{content}</p>
    </div>
  )
}
