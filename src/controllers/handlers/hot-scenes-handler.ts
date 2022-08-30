import { HandlerContextWithPath, RealmInfo, ParcelCoord } from '../../types'

// The maximum amount of hot scenes returned
const HOT_SCENES_LIMIT = 100

type CatalystInfo = {
  realmName: string
  url: string
  parcels: Map<string, number>
  usersCount: number
}

export type HotSceneInfo = {
  id: string
  name: string
  baseCoords: ParcelCoord
  usersTotalCount: number
  parcels: ParcelCoord[]
  thumbnail?: string
  projectId?: string
  creator?: string
  description?: string
  realms: RealmInfo[]
}

function getCoords(coordsAsString: string): ParcelCoord {
  return coordsAsString.split(',').map((part) => parseInt(part, 10)) as ParcelCoord
}

// handlers arguments only type what they need, to make unit testing easier
export async function hotScenesHandler(
  context: Pick<HandlerContextWithPath<'stats' | 'content', '/hot-scenes'>, 'url' | 'components'>
) {
  const {
    components: { stats, content }
  } = context
  const { time, info } = stats.getCatalystsParcels()

  const tiles = new Set<string>()
  const catalystsInfo: CatalystInfo[] = []

  for (const catalystParcelInfo of info) {
    if (!catalystParcelInfo) {
      continue
    }

    const { url, realmName } = catalystParcelInfo

    const parcels = new Map<string, number>()
    let usersCount = 0
    for (const {
      peersCount,
      parcel: { x, y }
    } of catalystParcelInfo.parcels) {
      usersCount += peersCount
      const tile = `${x},${y}`
      tiles.add(tile)
      parcels.set(tile, peersCount)
    }

    catalystsInfo.push({ realmName, url, parcels, usersCount })
  }

  const scenes = await content.fetchScenes(Array.from(tiles))

  const hotScenes: HotSceneInfo[] = scenes.map((scene) => {
    const result: HotSceneInfo = {
      id: scene.id,
      name: scene.metadata?.display?.title,
      baseCoords: getCoords(scene.metadata?.scene.base),
      usersTotalCount: 0,
      parcels: scene.metadata?.scene.parcels.map(getCoords),
      thumbnail: content.calculateThumbnail(scene),
      creator: scene.metadata?.contact?.name,
      projectId: scene.metadata?.source?.projectId,
      description: scene.metadata?.display?.description,
      realms: []
    }

    const realms = new Map<string, RealmInfo>()

    for (const sceneParcel of scene.metadata?.scene.parcels) {
      for (const { realmName, url, parcels, usersCount } of catalystsInfo) {
        if (parcels.has(sceneParcel)) {
          const usersInParcel = parcels.get(sceneParcel)!
          result.usersTotalCount += usersInParcel

          const userParcels: ParcelCoord[] = []
          const coord = getCoords(sceneParcel)
          for (let i = 0; i < usersInParcel; i++) {
            userParcels.push(coord)
          }
          realms.set(realmName, { serverName: realmName, url, usersCount, userParcels })
        }
      }
    }

    result.realms = Array.from(realms.values())

    return result
  })

  const value = hotScenes.sort((scene1, scene2) => scene2.usersTotalCount - scene1.usersTotalCount)

  return {
    headers: {
      'Last-Modified': new Date(time).toUTCString()
    },
    body: value.slice(0, HOT_SCENES_LIMIT)
  }
}
