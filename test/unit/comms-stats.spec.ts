import { createConfigComponent } from '@well-known-components/env-config-provider'
import { createLogComponent } from '@well-known-components/logger'
import { createLocalNatsComponent } from '@well-known-components/nats-component'
import { createCommsStatsComponent } from '../../src/ports/comms-stats'
import { HeartbeatMessage, IslandData, IslandStatusMessage } from '../../src/proto/archipelago.gen'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('comms-stats component', () => {
  it('should build a list of peers using archipelago heartbeats', async () => {
    const logs = await createLogComponent({})
    const config = createConfigComponent({})
    const nats = await createLocalNatsComponent({ config, logs })
    const stats = await createCommsStatsComponent({ logs, nats })
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
    const peers = await stats.getPeers()
    expect(peers.size).toEqual(3)

    expect(peers.has('peer1')).toEqual(true)
    expect(peers.get('peer1').address).toEqual('peer1')
    expect(peers.get('peer1').x).toEqual(0)
    expect(peers.get('peer1').y).toEqual(0)
    expect(peers.get('peer1').z).toEqual(0)

    expect(peers.has('peer2')).toEqual(true)
    expect(peers.get('peer2').address).toEqual('peer2')
    expect(peers.get('peer2').x).toEqual(0)
    expect(peers.get('peer2').y).toEqual(0)
    expect(peers.get('peer2').z).toEqual(0)

    expect(peers.has('peer3')).toEqual(true)
    expect(peers.get('peer3').address).toEqual('peer3')
    expect(peers.get('peer3').x).toEqual(1600)
    expect(peers.get('peer3').y).toEqual(0)
    expect(peers.get('peer3').z).toEqual(1600)
  })

  it('should keep a list of islands based on archipelago island status', async () => {
    const logs = await createLogComponent({})
    const config = createConfigComponent({})
    const nats = await createLocalNatsComponent({ config, logs })
    const stats = await createCommsStatsComponent({ logs, nats })
    await stats.init()

    const i1: IslandData = {
      id: 'I1',
      peers: ['peer1', 'peer2'],
      maxPeers: 100,
      center: { x: 10, y: 10, z: 10 },
      radius: 10
    }

    const i2: IslandData = {
      id: 'I2',
      peers: ['peer3', 'peer4'],
      maxPeers: 100,
      center: { x: 10, y: 10, z: 10 },
      radius: 10
    }

    nats.publish(
      'archipelago.islands',
      IslandStatusMessage.encode({
        data: [i1, i2]
      }).finish()
    )
    await delay(100)
    const islands = await stats.getIslands()
    expect(islands).toEqual(
      expect.arrayContaining([
        {
          id: 'I1',
          peers: ['peer1', 'peer2'],
          maxPeers: 100,
          center: [10, 10, 10],
          radius: 10
        },
        {
          id: 'I2',
          peers: ['peer3', 'peer4'],
          maxPeers: 100,
          center: [10, 10, 10],
          radius: 10
        }
      ])
    )
  })
})
