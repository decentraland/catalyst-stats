import { CatalystContract } from '@dcl/catalyst-contracts'
import type { IFetchComponent } from '@well-known-components/http-server'
import type {
  IConfigComponent,
  ILoggerComponent,
  IHttpServerComponent,
  IBaseComponent,
  IMetricsComponent
} from '@well-known-components/interfaces'
import { metricDeclarations } from './metrics'
import { INatsComponent } from '@well-known-components/nats-component/dist/types'
import { IContentComponent } from './ports/content'
import { IStatsComponent } from './ports/stats'

export type GlobalContext = {
  components: BaseComponents
}

// components used in every environment
export type BaseComponents = {
  config: IConfigComponent
  logs: ILoggerComponent
  server: IHttpServerComponent<GlobalContext>
  fetch: IFetchComponent
  metrics: IMetricsComponent<keyof typeof metricDeclarations>
  nats: INatsComponent
  contract: CatalystContract
  content: IContentComponent
  stats: IStatsComponent
}

// components used in runtime
export type AppComponents = BaseComponents & {
  statusChecks: IBaseComponent
}

// components used in tests
export type TestComponents = BaseComponents & {
  // A fetch component that only hits the test server
  localFetch: IFetchComponent
}

// this type simplifies the typings of http handlers
export type HandlerContextWithPath<
  ComponentNames extends keyof AppComponents,
  Path extends string = any
> = IHttpServerComponent.PathAwareContext<
  IHttpServerComponent.DefaultContext<{
    components: Pick<AppComponents, ComponentNames>
  }>,
  Path
>

export type Context<Path extends string = any> = IHttpServerComponent.PathAwareContext<GlobalContext, Path>

export type PeerData = {
  time: number
  address: string
  x: number
  y: number
  z: number
}

export type IslandData = {
  id: string
  peers: string[]
  maxPeers: number
  center: [number, number, number]
  radius: number
}

export type CatalystStatus = {
  name: string
  baseUrl: string
}

export type CatalystParcelsInfo = {
  realmName: string
  url: string
  parcels: {
    peersCount: number
    parcel: {
      x: number
      y: number
    }
  }[]
}

export type ParcelCoord = [number, number]

export type RealmInfo = {
  serverName: string
  url: string
  usersCount: number
  userParcels: ParcelCoord[]
}
