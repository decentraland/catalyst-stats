import { IBaseComponent } from '@well-known-components/interfaces'
import { BaseComponents } from '../types'
import { HeartbeatMessage } from '../proto/archipelago.gen'
import { Reader } from 'protobufjs/minimal'

type PeerInfo = {
  time: number
  x: number
  z: number
}

type ParcelInfo = {
  peersCount: number
  parcel: {
    x: number
    y: number
  }
}
export type ICommStatsComponent = IBaseComponent & {
  init: () => Promise<void>
  getParcels: () => Promise<ParcelInfo[]>
}

const PARCEL_SIZE = 16
const DEFAULT_PEER_EXPIRATION_TIME_MS = 1000 * 60 // 1 min

export async function createCommsStatsComponent(
  components: Pick<BaseComponents, 'logs' | 'nats' | 'config'>
): Promise<ICommStatsComponent> {
  const { nats, logs, config } = components

  const peerExpirationTimeMs = (await config.getNumber('PEER_EXPIRATION_TIME')) || DEFAULT_PEER_EXPIRATION_TIME_MS

  const logger = logs.getLogger('comm-stats-component')

  const peers = new Map<string, PeerInfo>()

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
          time: Date.now(),
          x: position.x,
          z: position.z
        })
      }
    })().catch((err: any) => logger.error(`error processing subscription message; ${err.message}`))
  }

  async function getParcels(): Promise<ParcelInfo[]> {
    const countPerParcel = new Map<string, ParcelInfo>()
    for (const [id, { time, x, z }] of peers) {
      if (Date.now() - time > peerExpirationTimeMs) {
        peers.delete(id)
        continue
      }

      const parcelX = Math.floor(x / PARCEL_SIZE)
      const parcelY = Math.floor(z / PARCEL_SIZE)

      const key = `${parcelX}:${parcelY}`
      const info = countPerParcel.get(key) || { peersCount: 0, parcel: { x: parcelX, y: parcelY } }
      info.peersCount += 1
      countPerParcel.set(key, info)
    }

    return Array.from(countPerParcel.values())
  }

  return {
    init,
    getParcels
  }
}
