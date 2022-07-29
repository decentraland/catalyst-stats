import { createConfigComponent } from '@well-known-components/env-config-provider'
import { createLogComponent } from '@well-known-components/logger'
import { createLocalNatsComponent } from '@well-known-components/nats-component'
import { createCommsStatsComponent } from '../../src/ports/comms-stats'
import { HeartbeatMessage } from '../../src/proto/archipelago.gen'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('comms-stats component', () => {
  describe('getParcels', () => {
    it('should listener to heartbeats', async () => {
      const logs = createLogComponent({})
      const config = createConfigComponent({})
      const nats = await createLocalNatsComponent({ config, logs })
      const stats = await createCommsStatsComponent({ logs, nats, config })
      await stats.init()

      nats.publish(
        'client-proto.peer.peer1.heartbeat',
        HeartbeatMessage.encode({
          position: {
            x: 0,
            y: 0,
            z: 0
          }
        }).finish()
      )

      nats.publish(
        'client-proto.peer.peer2.heartbeat',
        HeartbeatMessage.encode({
          position: {
            x: 0,
            y: 0,
            z: 0
          }
        }).finish()
      )

      nats.publish(
        'client-proto.peer.peer3.heartbeat',
        HeartbeatMessage.encode({
          position: {
            x: 1600,
            y: 0,
            z: 1600
          }
        }).finish()
      )

      await delay(100)

      const parcels = await stats.getParcels()
      expect(parcels).toHaveLength(2)
      expect(parcels).toEqual(
        expect.arrayContaining([
          {
            peersCount: 2,
            parcel: { x: 0, y: 0 }
          },
          {
            peersCount: 1,
            parcel: { x: 100, y: 100 }
          }
        ])
      )
    })

    it('should expire peer information', async () => {
      const logs = createLogComponent({})
      const config = createConfigComponent({
        PEER_EXPIRATION_TIME: '1'
      })
      const nats = await createLocalNatsComponent({ config, logs })
      const stats = await createCommsStatsComponent({ logs, nats, config })
      await stats.init()

      nats.publish(
        'client-proto.peer.peer1.heartbeat',
        HeartbeatMessage.encode({
          position: {
            x: 0,
            y: 0,
            z: 0
          }
        }).finish()
      )

      await delay(100)

      const parcels = await stats.getParcels()
      expect(parcels).toHaveLength(0)
    })
  })
})
