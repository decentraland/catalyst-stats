import { HandlerContextWithPath } from '../../types'

export async function parcelsHandler(
  context: Pick<HandlerContextWithPath<'commsStats', '/parcels'>, 'url' | 'components'>
) {
  const {
    components: { commsStats }
  } = context

  const parcels = await commsStats.getParcels()

  return {
    body: { parcels }
  }
}
