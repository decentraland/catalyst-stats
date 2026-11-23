import { Entity } from '@dcl/schemas'
import { createContentClient } from 'dcl-catalyst-client'
import { IBaseComponent } from '@well-known-components/interfaces'
import { BaseComponents } from '../types'

export type IContentComponent = IBaseComponent & {
  fetchScenes: (tiles: string[]) => Promise<Entity[]>
  calculateThumbnail: (scene: Entity) => string | undefined
}

export async function createContentComponent(
  components: Pick<BaseComponents, 'config' | 'fetch'>
): Promise<IContentComponent> {
  const { config, fetch } = components
  const url = (await config.getString('CONTENT_URL')) || 'https://peer.decentraland.org/content/'
  const contentClient = createContentClient({ url, fetcher: fetch })
  const contentsBaseUrl = url.replace(/\/+$/, '')

  function fetchScenes(tiles: string[]): Promise<Entity[]> {
    if (tiles.length === 0) {
      return Promise.resolve([])
    }
    return contentClient.fetchEntitiesByPointers(tiles)
  }

  function calculateThumbnail(scene: Entity): string | undefined {
    const thumbnail: unknown = scene.metadata?.display?.navmapThumbnail
    if (typeof thumbnail !== 'string') {
      return undefined
    }
    // Only serve thumbnails stored with the scene
    const thumbnailHash = scene.content?.find(({ file }) => file === thumbnail)?.hash
    return thumbnailHash ? `${contentsBaseUrl}/contents/${thumbnailHash}` : undefined
  }

  return {
    fetchScenes,
    calculateThumbnail
  }
}
