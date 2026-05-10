import type { RouteConfig } from '@react-router/dev/routes'
import {
  index,
  route,
} from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),

  // API routes (resource routes — no default export)
  route('api/images', 'routes/api.images.ts'),
  route('api/image/*', 'routes/api.image.$.ts'),

  // Not found
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
