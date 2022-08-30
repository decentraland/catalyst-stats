import { HandlerContextWithPath, PeerData, IslandData } from '../../types'
import { toParcel } from '../../logic/utils'

type PeerResult = {
  id: string
  address: string
  lastPing: number
  parcel: [number, number]
  position: [number, number, number]
}

type IslandResult = {
  id: string
  peers: PeerResult[]
  maxPeers: number
  center: [number, number, number]
  radius: number
}

function processIsland(data: IslandData, peers: Map<string, PeerData>): IslandResult {
  const { id, peers: peerIds, maxPeers, center, radius } = data
  const peersResult: PeerResult[] = []
  for (const peerId of peerIds) {
    const peer = peers.get(peerId)
    if (peer) {
      const { address, time, x, y, z } = peer
      const [parcelX, parcelY] = toParcel(x, z)
      peersResult.push({
        id: address,
        address: address,
        lastPing: time,
        parcel: [parcelX, parcelY],
        position: [x, y, z]
      })
    }
  }

  return {
    id,
    maxPeers,
    center,
    radius,
    peers: peersResult
  }
}

export async function islandsHandler(
  context: Pick<HandlerContextWithPath<'stats', '/islands'>, 'url' | 'components'>
): Promise<{
  body: {
    ok: boolean
    islands: IslandResult[]
  }
}> {
  const {
    components: { stats }
  } = context

  const peers = stats.getPeers()
  const islands = stats.getIslands().map((i) => processIsland(i, peers))
  return {
    body: {
      ok: true,
      islands
    }
  }
}

export async function islandHandler(
  context: Pick<HandlerContextWithPath<'stats', '/islands/:id'>, 'url' | 'params' | 'components'>
): Promise<{ body?: IslandResult; status: number }> {
  const {
    components: { stats }
  } = context

  const peers = stats.getPeers()
  const islands = stats.getIslands()

  const islandId = context.params.id

  let body: IslandResult | undefined = undefined
  for (const island of islands) {
    if (island.id === islandId) {
      body = processIsland(island, peers)
      break
    }
  }

  return {
    status: body ? 200 : 404,
    body
  }
}
