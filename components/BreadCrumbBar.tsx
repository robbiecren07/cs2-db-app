import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import Link from 'next/link'

interface Props {
  active: string
  parent?: string
  parentHref?: string
  grandparent?: string
  grandparentHref?: string
  greatGrandparent?: string
  greatGrandparentHref?: string
}

export function BreadCrumbBar({
  active,
  parent,
  parentHref,
  grandparent,
  grandparentHref,
  greatGrandparent,
  greatGrandparentHref,
}: Props) {
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    ...(greatGrandparent && greatGrandparentHref ? [{ name: greatGrandparent, href: greatGrandparentHref }] : []),
    ...(grandparent && grandparentHref ? [{ name: grandparent, href: grandparentHref }] : []),
    ...(parent && parentHref ? [{ name: parent, href: parentHref }] : []),
    { name: active, href: '#' },
  ]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_SITE_URL}${item.href}`,
    })),
  }

  return (
    <div className="pt-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" target="_self">
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {greatGrandparent && greatGrandparentHref && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={greatGrandparentHref} target="_self">
                    {greatGrandparent}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          {grandparent && grandparentHref && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={grandparentHref} target="_self">
                    {grandparent}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          {parent && parentHref && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={parentHref} target="_self">
                    {parent}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          {active && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{active}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </div>
  )
}
