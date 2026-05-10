import type { RouteConfig } from '@react-router/dev/routes'
import {
  index,
  route,

} from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),

  // Not found
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
