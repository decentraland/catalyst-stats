import { parcelsHandler } from '../../src/controllers/handlers/parcels-handler'
import { PeerData } from '../../src/ports/comms-stats'

describe('parcels-controller-unit', () => {
  it('ok', async () => {
    const peersData = new Map<string, PeerData>()
    const now = Date.now()
    peersData.set('0x0001', {
      time: now,
      address: '0x0001',
      x: 0,
      y: 0,
      z: 0
    })
    peersData.set('0x0002', {
      time: now,
      address: '0x0002',
      x: 1600,
      y: 1,
      z: 1600
    })
    peersData.set('0x0003', {
      time: now,
      address: '0x0003',
      x: 1600,
      y: 1,
      z: 1600
    })

    const url = new URL('https://localhost/parcels')
    const commsStats = {
      init: () => Promise.resolve(),
      getPeers: () => peersData,
      getIslands: () => []
    }

    const { body } = await parcelsHandler({ url, components: { commsStats } })
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
