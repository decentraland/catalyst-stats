import { Router } from '@well-known-components/http-server'
import { GlobalContext } from '../types'
import { pingHandler } from './handlers/ping-handler'
import { parcelsHandler } from './handlers/parcels-handler'
import { peersHandler } from './handlers/peers-handler'
import { islandHandler, islandsHandler } from './handlers/islands-handler'
import { hotScenesHandler } from './handlers/hot-scenes-handler'
import { realmsHandler } from './handlers/realms-handler'

// We return the entire router because it will be easier to test than a whole server
export async function setupRouter(_: GlobalContext): Promise<Router<GlobalContext>> {
  const router = new Router<GlobalContext>()

  router.get('/ping', pingHandler)
  router.get('/parcels', parcelsHandler)
  router.get('/peers', peersHandler)
  router.get('/islands', islandsHandler)
  router.get('/islands/:id', islandHandler)

  router.get('/hot-scenes', hotScenesHandler)
  router.get('/realms', realmsHandler)

  return router
}
