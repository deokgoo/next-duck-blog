interface NavLink {
  href: string
  title: string
  adminOnly?: boolean
}

const headerNavLinks: NavLink[] = [
  { href: '/', title: 'Home' },
  { href: '/blog', title: 'Blog' },
  { href: '/admin/blog-ideas', title: 'Ideas', adminOnly: true },
  { href: '/search', title: 'Search' },
  { href: '/projects', title: 'Projects' },
  { href: '/about', title: 'About' },
]

export default headerNavLinks
export type { NavLink }
