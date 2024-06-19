'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import Image from 'next/image'
import { ChevronDown, SquareMenu } from 'lucide-react'

const components: {
  title: string
  subItems: Array<{ title: string; slug: string; image: string }>
  subItemTitle: string
  subItemTitleSecondary: string
  subItemsSecondary: Array<{ title: string; slug: string; image: string }>
}[] = [
  {
    title: 'Pistols',
    subItems: [
      { title: 'USP-S', slug: 'usp-s', image: 'USP-S.webp' },
      { title: 'P2000', slug: 'p2000', image: 'P2000.webp' },
      { title: 'Glock-18', slug: 'glock-18', image: 'Glock-18.webp' },
      { title: 'Desert Eagle', slug: 'desert-eagle', image: 'Desert_Eagle.webp' },
      { title: 'P250', slug: 'p250', image: 'P250.webp' },
      { title: 'Five-Seven', slug: 'five-seven', image: 'Five-Seven.webp' },
      { title: 'CZ75-Auto', slug: 'cz75-auto', image: 'CZ75-Auto.webp' },
      { title: 'Tec-9', slug: 'tec-9', image: 'Tec-9.webp' },
      { title: 'R8 Revolver', slug: 'r8-revolver', image: 'R8_Revolver.webp' },
      { title: 'Dual Berettas', slug: 'dual-berettas', image: 'Dual_Berettas.webp' },
    ],
    subItemTitle: '',
    subItemTitleSecondary: '',
    subItemsSecondary: [],
  },
  {
    title: 'SMGs',
    subItems: [
      { title: 'P90', slug: 'p90', image: 'P90.webp' },
      { title: 'UMP-45', slug: 'ump-45', image: 'UMP-45.webp' },
      { title: 'MAC-10', slug: 'mac-10', image: 'MAC-10.webp' },
      { title: 'MP7', slug: 'mp7', image: 'MP7.webp' },
      { title: 'MP9', slug: 'mp9', image: 'MP9.webp' },
      { title: 'MP5-SD', slug: 'mp5-sd', image: 'MP5-SD.webp' },
      { title: 'PP-Bizon', slug: 'pp-bizon', image: 'PP-Bizon.webp' },
    ],
    subItemTitle: '',
    subItemTitleSecondary: '',
    subItemsSecondary: [],
  },
  {
    title: 'Rifles',
    subItemTitle: 'Assualt Rifles',
    subItems: [
      { title: 'AK-47', slug: 'ak-47', image: 'AK-47.webp' },
      { title: 'M4A4', slug: 'm4a4', image: 'M4A4.webp' },
      { title: 'M4A1-S', slug: 'm4a1-s', image: 'M4A1-S.webp' },
      { title: 'AUG', slug: 'aug', image: 'AUG.webp' },
      { title: 'SG 553', slug: 'sg-553', image: 'SG_553.webp' },
      { title: 'FAMAS', slug: 'famas', image: 'FAMAS.webp' },
      { title: 'Galil AR', slug: 'galil-ar', image: 'Galil_AR.webp' },
    ],
    subItemTitleSecondary: 'Sniper Rifles',
    subItemsSecondary: [
      { title: 'AWP', slug: 'awp', image: 'AWP.webp' },
      { title: 'SSG 08', slug: 'ssg-08', image: 'SSG_08.webp' },
      { title: 'SCAR-20', slug: 'scar-20', image: 'SCAR-20.webp' },
      { title: 'G3SG1', slug: 'g3sg1', image: 'G3SG1.webp' },
    ],
  },
  {
    title: 'Heavy',
    subItemTitle: 'Shotguns',
    subItems: [
      { title: 'XM1014', slug: 'xm1014', image: 'XM1014.webp' },
      { title: 'Sawed-Off', slug: 'sawed-off', image: 'Sawed-Off.webp' },
      { title: 'MAG-7', slug: 'mag-7', image: 'MAG-7.webp' },
      { title: 'Nova', slug: 'nova', image: 'Nova.webp' },
    ],
    subItemTitleSecondary: 'Machine Guns',
    subItemsSecondary: [
      { title: 'M249', slug: 'm249', image: 'M249.webp' },
      { title: 'Negev', slug: 'negev', image: 'Negev.webp' },
    ],
  },
  {
    title: 'Knives',
    subItems: [
      { title: 'Kukri Knife', slug: 'kukri-knife', image: 'Kukri_Knife.webp' },
      { title: 'Bayonet', slug: 'bayonet', image: 'Bayonet.webp' },
      { title: 'Bowie Knife', slug: 'bowie-knife', image: 'Bowie_Knife.webp' },
      { title: 'Butterfly Knife', slug: 'butterfly-knife', image: 'Butterfly_Knife.webp' },
      { title: 'Falchion Knife', slug: 'falchion-knife', image: 'Falchion_Knife.webp' },
      { title: 'Flip Knife', slug: 'flip-knife', image: 'Flip_Knife.webp' },
      { title: 'Gut Knife', slug: 'gut-knife', image: 'Gut_Knife.webp' },
      { title: 'Huntsman Knife', slug: 'huntsman-knife', image: 'Huntsman_Knife.webp' },
      { title: 'Karambit', slug: 'karambit', image: 'Karambit.webp' },
      { title: 'M9 Bayonet', slug: 'm9-bayonet', image: 'M9_Bayonet.webp' },
      { title: 'Navaja Knife', slug: 'navaja-knife', image: 'Navaja_Knife.webp' },
      { title: 'Nomad Knife', slug: 'nomad-knife', image: 'Nomad_Knife.webp' },
      { title: 'Paracord Knife', slug: 'paracord-knife', image: 'Paracord_Knife.webp' },
      { title: 'Shadow Daggers', slug: 'shadow-daggers', image: 'Shadow_Daggers.webp' },
      { title: 'Skeleton Knife', slug: 'skeleton-knife', image: 'Skeleton_Knife.webp' },
      { title: 'Stiletto Knife', slug: 'stiletto-knife', image: 'Stiletto_Knife.webp' },
      { title: 'Survival Knife', slug: 'survival-knife', image: 'Survival_Knife.webp' },
      { title: 'Talon Knife', slug: 'talon-knife', image: 'Talon_Knife.webp' },
      { title: 'Ursus Knife', slug: 'ursus-knife', image: 'Ursus_Knife.webp' },
      { title: 'Classic Knife', slug: 'classic-knife', image: 'Classic_Knife.webp' },
    ],
    subItemTitle: '',
    subItemTitleSecondary: '',
    subItemsSecondary: [],
  },
]

const otherLinks: {
  title: string
  subItems: Array<{ title: string; slug: string; image: string }>
}[] = [
  {
    title: 'Other',
    subItems: [
      { title: 'Cases', slug: 'cases', image: 'crate_community_13_png.png' },
      { title: 'Collections', slug: 'collections', image: 'set_community_5_png.png' },
      { title: 'Souvenir Packages', slug: 'souvenir-packages', image: 'crate_atlanta2017_promo_de_cbble_png.png' },
      { title: 'Agents', slug: 'agents', image: 'customplayer_ctm_fbi_variantf_png.png' },
      { title: 'Pins', slug: 'pins', image: 'collectible_pin_guardian_2_png.png' },
      { title: 'Patches', slug: 'patches', image: 'patch_howl_png.png' },
    ],
  },
]

export function Menu() {
  return (
    <>
      {/* Desktop Navigation Menu */}
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          {components.map((component) => (
            <NavigationMenuItem key={component.title}>
              <NavigationMenuTrigger>{component.title}</NavigationMenuTrigger>
              <NavigationMenuContent>
                {component.subItemTitle || component.subItemTitleSecondary ? (
                  <div className="grid md:grid-cols-2 w-[300px] md:w-[400px] lg:w-[540px] gap-2 lg:gap-3 p-2 lg:p-3 lg:px-5">
                    {component.subItemTitle && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">{component.subItemTitle}</h3>
                        <ul>
                          {component.subItems.map((subItem) => (
                            <ListItem key={subItem.slug} title={subItem.title} href={`/weapons/${subItem.slug}`}>
                              <Image
                                src={`/${subItem.image}`}
                                width={53}
                                height={40}
                                className="h-10 aspect-video object-contain"
                                alt={`${subItem.title} - vanilla skin`}
                                priority
                              />
                            </ListItem>
                          ))}
                        </ul>
                      </div>
                    )}
                    {component.subItemTitleSecondary && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">{component.subItemTitleSecondary}</h3>
                        <ul>
                          {component.subItemsSecondary.map((subItem) => (
                            <ListItem key={subItem.slug} title={subItem.title} href={`/weapons/${subItem.slug}`}>
                              <Image
                                src={`/${subItem.image}`}
                                width={53}
                                height={40}
                                className="h-10 aspect-video object-contain"
                                alt={`${subItem.title} - vanilla skin`}
                                priority
                              />
                            </ListItem>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <ul className="grid md:grid-cols-2 w-[300px] md:w-[400px] lg:w-[540px] gap-2 lg:gap-3 p-2 lg:p-3 lg:px-5">
                    {component.subItems.map((subItem) => (
                      <ListItem key={subItem.slug} title={subItem.title} href={`/weapons/${subItem.slug}`}>
                        <Image
                          src={`/${subItem.image}`}
                          width={53}
                          height={40}
                          className="h-10 aspect-video object-contain"
                          alt={`${subItem.title} - vanilla skin`}
                          priority
                        />
                      </ListItem>
                    ))}
                  </ul>
                )}
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
          <NavigationMenuItem>
            <Link href="/gloves" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Gloves</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          {otherLinks.map((other) => (
            <NavigationMenuItem key={other.title}>
              <NavigationMenuTrigger>{other.title}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid md:grid-cols-2 w-[300px] md:w-[400px] lg:w-[540px] gap-2 lg:gap-3 p-2 lg:p-3 lg:px-5">
                  {other.subItems.map((subItem) => (
                    <ListItem key={subItem.slug} title={subItem.title} href={`/${subItem.slug}`}>
                      <Image
                        src={`/${subItem.image}`}
                        width={53}
                        height={40}
                        className="h-10 aspect-video object-contain"
                        alt={`${subItem.title} - vanilla skin`}
                        priority
                      />
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile Navigation Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <SquareMenu strokeWidth={1} size={36} className="text-accent-foreground lg:hidden" />
        </SheetTrigger>
        <SheetContent>
          <nav className="h-full pt-2 pr-3 text-sm overflow-y-auto">
            <ul>
              {components.map((component) => (
                <li key={component.title}>
                  <details>
                    <summary className="p-2 flex justify-between items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                      {component.title}
                      <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                    </summary>
                    <ul className="pl-4 pb-4">
                      {component.subItems.map((subItem) => (
                        <li key={subItem.slug}>
                          <Link
                            href={`/weapons/${subItem.slug}`}
                            className="block p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
              <li>
                <Link
                  href="/gloves"
                  className="block p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Gloves
                </Link>
              </li>
              {otherLinks.map((other) => (
                <li key={other.title}>
                  <details>
                    <summary className="p-2 flex justify-between items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                      {other.title}
                      <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                    </summary>
                    <ul className="pl-4 pb-2">
                      {other.subItems.map((subItem) => (
                        <li key={subItem.slug}>
                          <Link
                            href={`/${subItem.slug}`}
                            className="block p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Screen reader-only navigation for SEO */}
      <nav aria-label="Main Navigation" className="sr-only">
        <ul>
          {components.map((component) => (
            <li key={component.title}>
              <a href={`#${component.title}`}>{component.title}</a>
              <ul>
                {component.subItems.map((subItem) => (
                  <li key={subItem.slug}>
                    <a href={`/weapons/${subItem.slug}`}>{subItem.title}</a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
          <li>
            <a href="/gloves">Gloves</a>
          </li>
          {otherLinks.map((other) => (
            <li key={other.title}>
              <a href={`#${other.title}`}>{other.title}</a>
              <ul>
                {other.subItems.map((subItem) => (
                  <li key={subItem.slug}>
                    <a href={`/${subItem.slug}`}>{subItem.title}</a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

const ListItem = React.forwardRef<React.ElementRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              'flex gap-3 items-center select-none space-y-1 rounded-md p-1 lg:p-2 leading-none no-underline outline-none transition-colors hover:bg-primary hover:text-foreground focus:bg-accent focus:text-accent-foreground',
              className
            )}
            {...props}
          >
            {children}
            <div className="text-sm font-medium leading-none">{title}</div>
          </a>
        </NavigationMenuLink>
      </li>
    )
  }
)
ListItem.displayName = 'ListItem'
