import { Entity, EntityType } from '@dcl/schemas'
import { createConfigComponent } from '@well-known-components/env-config-provider'
import { IContentComponent, createContentComponent } from '../../src/ports/content'

describe('when calculating the thumbnail of a scene', () => {
  let content: IContentComponent
  let scene: Entity

  beforeEach(async () => {
    content = await createContentComponent({
      config: createConfigComponent({ CONTENT_URL: 'https://peer.example.org/content' }),
      fetch: { fetch: jest.fn() } as any
    })
    scene = {
      version: 'v3',
      id: 'bafkreiscene',
      type: EntityType.SCENE,
      pointers: ['0,0'],
      timestamp: 1,
      content: [{ file: 'thumbnail.png', hash: 'bafkreithumbnail' }],
      metadata: { display: {} }
    }
  })

  describe('and the scene has no navmap thumbnail', () => {
    it('should return undefined', () => {
      expect(content.calculateThumbnail(scene)).toBeUndefined()
    })
  })

  describe('and the scene has no metadata', () => {
    beforeEach(() => {
      scene.metadata = undefined
    })

    it('should return undefined', () => {
      expect(content.calculateThumbnail(scene)).toBeUndefined()
    })
  })

  describe('and the navmap thumbnail is a file included in the scene', () => {
    beforeEach(() => {
      scene.metadata.display.navmapThumbnail = 'thumbnail.png'
    })

    it('should return the content server URL of the file', () => {
      expect(content.calculateThumbnail(scene)).toEqual('https://peer.example.org/content/contents/bafkreithumbnail')
    })
  })

  describe('and the navmap thumbnail is not a file included in the scene', () => {
    beforeEach(() => {
      scene.metadata.display.navmapThumbnail = 'missing.png'
    })

    it('should return undefined', () => {
      expect(content.calculateThumbnail(scene)).toBeUndefined()
    })
  })

  describe('and the navmap thumbnail is an absolute URL', () => {
    beforeEach(() => {
      scene.metadata.display.navmapThumbnail = 'https://images.example.com/thumbnail.png'
    })

    it('should return undefined', () => {
      expect(content.calculateThumbnail(scene)).toBeUndefined()
    })
  })

  describe('and the navmap thumbnail is an empty string', () => {
    beforeEach(() => {
      scene.metadata.display.navmapThumbnail = ''
    })

    it('should return undefined', () => {
      expect(content.calculateThumbnail(scene)).toBeUndefined()
    })
  })

  describe('and the navmap thumbnail is not a string', () => {
    beforeEach(() => {
      scene.metadata.display.navmapThumbnail = { url: 'thumbnail.png' }
    })

    it('should return undefined', () => {
      expect(content.calculateThumbnail(scene)).toBeUndefined()
    })
  })

  describe('and the scene has no content', () => {
    beforeEach(() => {
      scene.metadata.display.navmapThumbnail = 'thumbnail.png'
      scene.content = undefined as any
    })

    it('should return undefined', () => {
      expect(content.calculateThumbnail(scene)).toBeUndefined()
    })
  })

  describe('and the content URL ends with a slash', () => {
    beforeEach(async () => {
      content = await createContentComponent({
        config: createConfigComponent({ CONTENT_URL: 'https://peer.example.org/content/' }),
        fetch: { fetch: jest.fn() } as any
      })
      scene.metadata.display.navmapThumbnail = 'thumbnail.png'
    })

    it('should return the content server URL of the file without a double slash', () => {
      expect(content.calculateThumbnail(scene)).toEqual('https://peer.example.org/content/contents/bafkreithumbnail')
    })
  })
})
