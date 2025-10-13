import Link from 'next/link'
import React from 'react'

interface FooterLinkProps {
  href: string
  children: React.ReactNode
}

export function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <Link href={href} className="text-gray-300 text-sm hover:text-white">
      {children}
    </Link>
  )
}
