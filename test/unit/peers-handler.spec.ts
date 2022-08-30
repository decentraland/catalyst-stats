import { peersHandler } from '../../src/controllers/handlers/peers-handler'
import { createStatsComponent } from '../../src/ports/stats'
import { PeerData } from '../../src/types'

describe('peers-controller-unit', () => {
  it('ok', async () => {
    const now = Date.now()
    const url = new URL('https://localhost/peers')
    const stats = createStatsComponent()
    stats.onPeerUpdated('0x0001', { time: now, address: '0x0001', x: 0, y: 0, z: 0 })
    stats.onPeerUpdated('0x0002', { time: now, address: '0x0002', x: 1600, y: 1, z: 1600 })

    const {
      body: { ok, peers }
    } = await peersHandler({ url, components: { stats } })
    expect(ok).toEqual(true)
    expect(peers).toHaveLength(2)
    expect(peers).toEqual(
      expect.arrayContaining([
        {
          id: '0x0001',
          address: '0x0001',
          lastPing: now,
          parcel: [0, 0],
          position: [0, 0, 0]
        },
        {
          id: '0x0002',
          address: '0x0002',
          lastPing: now,
          parcel: [100, 100],
          position: [1600, 1, 1600]
        }
      ])
    )
  })
})
