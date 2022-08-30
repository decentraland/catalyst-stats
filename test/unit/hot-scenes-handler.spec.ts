import { Entity } from '@dcl/schemas'
import { HotSceneInfo, hotScenesHandler } from '../../src/controllers/handlers/hot-scenes-handler'
import { createStatsComponent } from '../../src/ports/stats'
import { CatalystParcelsInfo } from '../../src/types'

describe('hot-scenes-handler-unit', () => {
  it('ok', async () => {
    const parcels: CatalystParcelsInfo[] = [
      {
        realmName: 'catalyst-1',
        url: 'https://catalyst-1',
        parcels: [
          {
            peersCount: 10,
            parcel: {
              x: 10,
              y: 10
            }
          },
          {
            peersCount: 12,
            parcel: {
              x: 11,
              y: 10
            }
          }
        ]
      },
      {
        realmName: 'catalyst-2',
        url: 'https://catalyst-2',
        parcels: [
          {
            peersCount: 5,
            parcel: {
              x: 10,
              y: 10
            }
          }
        ]
      }
    ]

    const scenes = {
      '10,10': {
        id: 1,
        metadata: {
          contact: {
            name: 'creator'
          },
          source: {
            projectId: 'project-id'
          },
          scene: {
            base: '10,10',
            parcels: ['10,10', '10,11']
          },
          display: {
            title: 'test',
            description: 'a test'
          }
        }
      }
    }

    const stats = createStatsComponent()
    stats.onCatalystsParcelsInfo({ time: 0, info: parcels })
    const content = {
      fetchScenes: async (tiles: string[]) => {
        const result: Entity[] = []
        for (const tile of tiles) {
          if (scenes[tile]) {
            result.push(scenes[tile])
          }
        }
        return result
      },
      calculateThumbnail: (_: Entity) => 'thumb.jpg'
    }

    const url = new URL('https://aggregator.com/hot-scenes')
    const { headers, body } = await hotScenesHandler({ url, components: { stats, content } })

    const result: HotSceneInfo[] = body
    expect(headers['Last-Modified']).toEqual('Thu, 01 Jan 1970 00:00:00 GMT')

    expect(result).toHaveLength(1)
    expect(result[0].id).toEqual(1)
    expect(result[0].name).toEqual('test')
    expect(result[0].baseCoords).toEqual([10, 10])
    expect(result[0].usersTotalCount).toEqual(15)
    expect(result[0].parcels).toEqual([
      [10, 10],
      [10, 11]
    ])
    expect(result[0].thumbnail).toEqual('thumb.jpg')
    expect(result[0].projectId).toEqual('project-id')
    expect(result[0].creator).toEqual('creator')
    expect(result[0].description).toEqual('a test')
    expect(result[0].realms).toEqual([
      {
        serverName: 'catalyst-1',
        url: 'https://catalyst-1',
        usersCount: 22,
        userParcels: [
          [10, 10],
          [10, 10],
          [10, 10],
          [10, 10],
          [10, 10],
          [10, 10],
          [10, 10],
          [10, 10],
          [10, 10],
          [10, 10]
        ]
      },
      {
        serverName: 'catalyst-2',
        url: 'https://catalyst-2',
        usersCount: 5,
        userParcels: [
          [10, 10],
          [10, 10],
          [10, 10],
          [10, 10],
          [10, 10]
        ]
      }
    ])
  })
})
