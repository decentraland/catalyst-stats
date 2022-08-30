import { islandsHandler, islandHandler } from '../../src/controllers/handlers/islands-handler'
import { createStatsComponent } from '../../src/ports/stats'
import { PeerData, IslandData } from '../../src/types'

describe('islands-controller-unit', () => {
  it('ok', async () => {
    const now = Date.now()
    const peer1 = {
      time: now,
      address: '0x0001',
      x: 0,
      y: 0,
      z: 0
    }
    const peer2 = {
      time: now,
      address: '0x0002',
      x: 1600,
      y: 1,
      z: 1600
    }
    const peer3 = {
      time: now,
      address: '0x0003',
      x: 1600,
      y: 1,
      z: 1600
    }

    const islands: IslandData[] = [
      {
        id: 'I1',
        peers: [peer1.address],
        maxPeers: 100,
        center: [0, 0, 0],
        radius: 0
      },
      {
        id: 'I2',
        peers: [peer2.address, peer3.address, 'fake'],
        maxPeers: 100,
        center: [1600, 1, 1599],
        radius: 100
      }
    ]

    const url = new URL('https://localhost/islands')
    const stats = createStatsComponent()
    stats.onPeerUpdated(peer1.address, peer1)
    stats.onPeerUpdated(peer2.address, peer2)
    stats.onPeerUpdated(peer3.address, peer3)
    stats.onIslandsDataReceived(islands)

    const { body } = await islandsHandler({ url, components: { stats } })
    expect(body.ok).toEqual(true)
    expect(body.islands).toHaveLength(2)
    expect(body.islands).toEqual(
      expect.arrayContaining([
        {
          id: 'I1',
          peers: [
            {
              id: peer1.address,
              address: peer1.address,
              lastPing: now,
              parcel: [0, 0],
              position: [peer1.x, peer1.y, peer1.z]
            }
          ],
          maxPeers: 100,
          center: [0, 0, 0],
          radius: 0
        },
        {
          id: 'I2',
          peers: [
            {
              id: peer2.address,
              address: peer2.address,
              lastPing: now,
              parcel: [100, 100],
              position: [peer2.x, peer2.y, peer2.z]
            },
            {
              id: peer3.address,
              address: peer3.address,
              lastPing: now,
              parcel: [100, 100],
              position: [peer3.x, peer3.y, peer3.z]
            }
          ],
          maxPeers: 100,
          center: [1600, 1, 1599],
          radius: 100
        }
      ])
    )
  })
})

describe('island-controller-unit', () => {
  it('ok', async () => {
    const now = Date.now()
    const peer1 = {
      time: now,
      address: '0x0001',
      x: 0,
      y: 0,
      z: 0
    }
    const peer2 = {
      time: now,
      address: '0x0002',
      x: 1600,
      y: 1,
      z: 1600
    }
    const peer3 = {
      time: now,
      address: '0x0003',
      x: 1600,
      y: 1,
      z: 1600
    }

    const islands: IslandData[] = [
      {
        id: 'I1',
        peers: [peer1.address],
        maxPeers: 100,
        center: [0, 0, 0],
        radius: 0
      },
      {
        id: 'I2',
        peers: [peer2.address, peer3.address, 'fake'],
        maxPeers: 100,
        center: [1600, 1, 1599],
        radius: 100
      }
    ]

    const url = new URL('https://localhost/islands/I1')
    const stats = createStatsComponent()
    stats.onPeerUpdated(peer1.address, peer1)
    stats.onPeerUpdated(peer2.address, peer2)
    stats.onPeerUpdated(peer3.address, peer3)
    stats.onIslandsDataReceived(islands)

    const { body } = await islandHandler({ url, components: { stats }, params: { id: 'I1' } })
    expect(body).toEqual({
      id: 'I1',
      peers: [
        {
          id: peer1.address,
          address: peer1.address,
          lastPing: now,
          parcel: [0, 0],
          position: [peer1.x, peer1.y, peer1.z]
        }
      ],
      maxPeers: 100,
      center: [0, 0, 0],
      radius: 0
    })
  })
})
