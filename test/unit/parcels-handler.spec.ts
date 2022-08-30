import { parcelsHandler } from '../../src/controllers/handlers/parcels-handler'
import { createStatsComponent } from '../../src/ports/stats'
import { PeerData } from '../../src/types'

describe('parcels-controller-unit', () => {
  it('ok', async () => {
    const url = new URL('https://localhost/parcels')
    const stats = createStatsComponent()

    const now = Date.now()
    stats.onPeerUpdated('0x0001', { time: now, address: '0x0001', x: 0, y: 0, z: 0 })
    stats.onPeerUpdated('0x0002', { time: now, address: '0x0002', x: 1600, y: 1, z: 1600 })
    stats.onPeerUpdated('0x0003', { time: now, address: '0x0003', x: 1600, y: 1, z: 1600 })

    const { body } = await parcelsHandler({ url, components: { stats } })
    expect(body.parcels).toHaveLength(2)
    expect(body.parcels).toEqual(
      expect.arrayContaining([
        {
          peersCount: 1,
          parcel: {
            x: 0,
            y: 0
          }
        },
        {
          peersCount: 2,
          parcel: {
            x: 100,
            y: 100
          }
        }
      ])
    )
  })
})
