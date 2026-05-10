import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { getClientLocale } from '~/i18n/client'
import { uiStrings } from '~/i18n/ui'

export default function NotFound() {
  const locale = getClientLocale()
  const ui = uiStrings[locale]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
      <p className="text-lg text-muted-foreground mb-8">
        {ui.notFoundTitle}
      </p>
      <Button variant="link" render={<Link to="/" />}>
        {ui.backToHome}
      </Button>
    </div>
  )
}
