import { HandlerContextWithPath } from '../../types'
import { toParcel } from '../../logic/utils'

type PeerResult = {
  id: string
  address: string
  lastPing: number
  parcel: {
    x: number
    y: number
  }
  position: {
    x: number
    y: number
    z: number
  }
}

type Result = {
  body: PeerResult[]
}

export async function peersHandler(
  context: Pick<HandlerContextWithPath<'commsStats', '/peers'>, 'url' | 'components'>
): Promise<Result> {
  const {
    components: { commsStats }
  } = context

  const peers = await commsStats.getPeers()
  const result: PeerResult[] = []

  for (const { address, time, x, y, z } of peers.values()) {
    const [parcelX, parcelY] = toParcel(x, z)
    result.push({
      id: address,
      address: address,
      lastPing: time,
      parcel: {
        x: parcelX,
        y: parcelY
      },
      position: {
        x: x,
        y: y,
        z: z
      }
    })
  }

  return {
    body: result
  }
}
