import { AgentWithDetails, RarityId } from '@/types/custom'
import Image from 'next/image'
import Link from 'next/link'
import { CardContent, Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  agent: AgentWithDetails
}

export default function MiniAgentCard({ agent }: Props) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      style={{ borderTopColor: agent.rarityColor ? agent.rarityColor : '' }}
      className="card group w-full"
      target="_self"
      prefetch={false}
    >
      <Card>
        <CardContent className="flex flex-col h-full p-4">
          <h3 className="text-sm font-medium transition-colors group-hover:text-white">
            {agent.shortName}{' '}
            <span className="block text-xs text-accent-foreground  font-normal">{agent.subName}</span>
          </h3>
          <div className="my-4 mx-auto transition-transform group-hover:scale-110">
            {agent.image && (
              <Image
                src={agent.image}
                width="170"
                height="98"
                className="aspect-video object-contain"
                alt={`${agent.name} - skin modal`}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-auto">
            {agent.rarityId && (
              <Badge variant={agent.rarityId as RarityId} className="text-[10px]">
                {agent.rarityName}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
