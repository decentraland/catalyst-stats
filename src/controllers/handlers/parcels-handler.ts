import { HandlerContextWithPath } from '../../types'
import { toParcel } from '../../logic/utils'

type ParcelResult = {
  peersCount: number
  parcel: {
    x: number
    y: number
  }
}

type Result = {
  body: {
    parcels: ParcelResult[]
  }
}

export async function parcelsHandler(
  context: Pick<HandlerContextWithPath<'stats', '/parcels'>, 'url' | 'components'>
): Promise<Result> {
  const {
    components: { stats }
  } = context

  const peers = stats.getPeers()

  const countPerParcel = new Map<string, ParcelResult>()
  for (const { x, z } of peers.values()) {
    const [parcelX, parcelY] = toParcel(x, z)

    const key = `${parcelX}:${parcelY}`
    const info = countPerParcel.get(key) || { peersCount: 0, parcel: { x: parcelX, y: parcelY } }
    info.peersCount += 1
    countPerParcel.set(key, info)
  }

  const parcels = Array.from(countPerParcel.values())

  return {
    body: { parcels }
  }
}
