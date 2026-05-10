import { Link } from 'react-router'
import { Button } from '~/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
      <p className="text-lg text-muted-foreground mb-8">
        找不到頁面
      </p>
      <Button variant="link" render={<Link to="/" />}>
        返回首頁
      </Button>
    </div>
  )
}
