import type { Route } from './+types/root'
import { AlertTriangle, Loader2 } from 'lucide-react'
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router'
import { ThemeProvider } from '~/components/ThemeProvider'
import { AnchoredToastProvider, ToastProvider } from '~/components/ui/toast'
import stylesheet from './app.css?url'
import { ProgressBar } from './components/progress-bar'
import { Button } from './components/ui/button'
import { useNonce } from './hooks/use-nonce'
import { getLocale } from './i18n/server'

export const links: Route.LinksFunction = () => [
  { rel: 'icon', type: 'image/jpeg', href: '/icon.webp' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans+TC:wght@400;500;700&display=swap',
  },
  { rel: 'stylesheet', href: stylesheet, precedence: 'high' },
]

export function loader({ request }: Route.LoaderArgs) {
  const locale = getLocale(request)
  return { locale }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const nonce = useNonce()
  const loaderData = useLoaderData<{ locale?: string }>()

  return (
    <html
      lang="zh"
      className="touch-manipulation overflow-x-hidden"
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/webp" href="/icon.webp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {loaderData?.locale && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__LOCALE__ = ${JSON.stringify(loaderData.locale)}`,
            }}
          />
        )}
        <ProgressBar />

        <ToastProvider>
          <AnchoredToastProvider>
            {children}
          </AnchoredToastProvider>
        </ToastProvider>

        <ScrollRestoration getKey={location => location.pathname} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  )
}

export function HydrateFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">載入中...</p>
    </div>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = '哎呀，出了點問題。'
  let details = '發生意外錯誤，請稍後再試。'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '找不到頁面' : '發生錯誤'
    details
      = error.status === 404
        ? '你要找的頁面不存在。'
        : error.data?.message || error.statusText
  }
  else if (error && error instanceof Error) {
    message = error.message
    details = '出了點問題。'
    stack = error.stack
  }

  console.error('ErrorBoundary caught an error:', error)

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:max-w-3xl max-w-full mx-auto text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-2">
          {message}
        </h1>
        <p className="text-muted-foreground mb-6">{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto bg-muted text-muted-foreground rounded text-left text-sm">
            <code>{stack}</code>
          </pre>
        )}
        <div className="mt-8 flex items-center gap-4">
          <Button variant="link" render={<Link to="/" />}>
            返回首頁
          </Button>
          <Button onClick={() => window.location.reload()}>
            刷新重試
          </Button>
        </div>
      </div>
    </Layout>
  )
}
