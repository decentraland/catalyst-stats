import { IBaseComponent } from '@well-known-components/interfaces'
import { BaseComponents } from '../types'
import { HeartbeatMessage, IslandStatusMessage } from '../proto/archipelago.gen'
import { Reader } from 'protobufjs/minimal'

export type PeerData = {
  time: number
  address: string
  x: number
  y: number
  z: number
}

export type IslandData = {
  id: string
  peers: string[]
  maxPeers: number
  center: [number, number, number]
  radius: number
}

export type ICommStatsComponent = IBaseComponent & {
  init: () => Promise<void>
  getPeers: () => Map<string, PeerData>
  getIslands: () => IslandData[]
}

export async function createCommsStatsComponent(
  components: Pick<BaseComponents, 'logs' | 'nats'>
): Promise<ICommStatsComponent> {
  const { nats, logs } = components

  const logger = logs.getLogger('comm-stats-component')

  const peers = new Map<string, PeerData>()
  let islands: IslandData[] = []

  async function init(): Promise<void> {
    const disconnectSubscription = nats.subscribe('peer.*.disconnect')
    ;(async () => {
      for await (const message of disconnectSubscription.generator) {
        const id = message.subject.split('.')[1]
        peers.delete(id)
      }
    })().catch((err: any) => logger.error(`error processing subscription message; ${err.message}`))

    const heartbeatSubscription = nats.subscribe('client-proto.peer.*.heartbeat')
    ;(async () => {
      for await (const message of heartbeatSubscription.generator) {
        const id = message.subject.split('.')[2]
        const decodedMessage = HeartbeatMessage.decode(Reader.create(message.data))
        const position = decodedMessage.position!
        peers.set(id, {
          address: id,
          time: Date.now(),
          ...position
        })
      }
    })().catch((err: any) => logger.error(`error processing subscription message; ${err.message}`))

    const islandsSubscription = nats.subscribe('archipelago.islands')
    ;(async () => {
      for await (const message of islandsSubscription.generator) {
        const decodedMessage = IslandStatusMessage.decode(Reader.create(message.data))
        const report: IslandData[] = []
        for (const { id, peers, maxPeers, center, radius } of decodedMessage.data) {
          report.push({
            id,
            peers,
            maxPeers,
            radius,
            center: [center!.x, center!.y, center!.z]
          })
        }
        islands = report
      }
    })().catch((err: any) => logger.error(`error processing subscription message; ${err.message}`))
  }

  return {
    init,
    getPeers: () => peers,
    getIslands: () => islands
  }
}
