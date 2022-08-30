import { HandlerContextWithPath } from '../../types'
import { toParcel } from '../../logic/utils'

type PeerResult = {
  id: string
  address: string
  lastPing: number
  parcel: [number, number]
  position: [number, number, number]
}

type Result = {
  body: {
    ok: boolean
    peers: PeerResult[]
  }
}

export async function peersHandler(
  context: Pick<HandlerContextWithPath<'stats', '/peers'>, 'url' | 'components'>
): Promise<Result> {
  const {
    components: { stats }
  } = context

  const peers = stats.getPeers()
  const result: PeerResult[] = []

  for (const { address, time, x, y, z } of peers.values()) {
    const [parcelX, parcelY] = toParcel(x, z)
    result.push({
      id: address,
      address: address,
      lastPing: time,
      parcel: [parcelX, parcelY],
      position: [x, y, z]
    })
  }

  return {
    body: { ok: true, peers: result }
  }
}
