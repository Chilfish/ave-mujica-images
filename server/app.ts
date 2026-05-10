import { createRequestHandler, RouterContextProvider } from 'react-router'

// @ts-expect-error virtual module from react-router typegen
import * as build from 'virtual:react-router/server-build'

const handler = createRequestHandler(build)

export const config = {
  runtime: 'nodejs',
}

// @ts-expect-error RouterContextProvider may not fully satisfy AppLoadContext
export default (req: Request) => handler(req, new RouterContextProvider())
