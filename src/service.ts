import { Lifecycle } from '@well-known-components/interfaces'
import { setupCatalystStatus } from './controllers/catalysts-status'
import { setupCommsStatus } from './controllers/comms-status'
import { setupRouter } from './controllers/routes'
import { AppComponents, GlobalContext, TestComponents } from './types'

const PARCELS_UPDATE_INTERVAL = 1000 * 60 * 2 // 2 min

// this function wires the business logic (adapters & controllers) with the components (ports)
export async function main(program: Lifecycle.EntryPointParameters<AppComponents | TestComponents>) {
  const { components, startComponents } = program
  const globalContext: GlobalContext = {
    components
  }

  // wire the HTTP router (make it automatic? TBD)
  const router = await setupRouter(globalContext)
  // register routes middleware
  components.server.use(router.middleware())
  // register not implemented/method not allowed/cors responses middleware
  components.server.use(router.allowedMethods())
  // set the context to be passed to the handlers
  components.server.setContext(globalContext)

  // start ports: db, listeners, synchronizations, etc
  await startComponents()

  const { logs } = components
  setupCommsStatus(components)
  const { updateParcels } = await setupCatalystStatus(components)

  await updateParcels()
  const logger = logs.getLogger('update parcel interval')
  setInterval(async () => {
    try {
      await updateParcels()
    } catch (err: any) {
      logger.error(err)
    }
  }, PARCELS_UPDATE_INTERVAL)
}
