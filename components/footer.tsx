export default function Footer() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="border-t border-border/40 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} Jason McElhenney. All rights reserved.</p>
        <p className="mt-1">Built with Next.js and Tailwind CSS. Inspired by the command line.</p>
      </div>
    </footer>
  )
}
