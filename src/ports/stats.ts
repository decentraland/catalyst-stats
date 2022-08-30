import { IBaseComponent } from '@well-known-components/interfaces'
import { PeerData, IslandData, CatalystParcelsInfo } from '../types'

export type CatalystParcels = {
  time: number
  info: CatalystParcelsInfo[]
}

export type IStatsComponent = IBaseComponent & {
  onPeerDisconnected(peerId: string): void
  onPeerUpdated(peerId: string, data: PeerData): void
  onIslandsDataReceived(data: IslandData[]): void
  onCatalystsParcelsInfo(info: CatalystParcels): void

  getCatalystsParcels(): CatalystParcels
  getPeers(): Map<string, PeerData>
  getIslands(): IslandData[]
}

export function createStatsComponent(): IStatsComponent {
  const peers = new Map<string, PeerData>()
  let islands: IslandData[] = []
  let catalystsParcels: CatalystParcels = {
    time: 0,
    info: []
  }

  function onPeerDisconnected(peerId: string) {
    peers.delete(peerId)
  }

  function onPeerUpdated(peerId: string, data: PeerData) {
    peers.set(peerId, data)
  }

  function onIslandsDataReceived(data: IslandData[]) {
    islands = data
  }

  function onCatalystsParcelsInfo(info: CatalystParcels) {
    catalystsParcels = info
  }

  function getCatalystsParcels(): CatalystParcels {
    return catalystsParcels
  }

  return {
    onCatalystsParcelsInfo,
    getCatalystsParcels,
    onPeerDisconnected,
    onPeerUpdated,
    onIslandsDataReceived,
    getPeers: () => peers,
    getIslands: () => islands
  }
}
