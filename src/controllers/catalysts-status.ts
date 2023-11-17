import { BaseComponents, CatalystStatus, CatalystParcelsInfo } from '../types'
import { getCatalystServersFromCache } from 'dcl-catalyst-client/dist/contracts-snapshots'

const CATALYST_STATUS_EXPIRATION_TIME = 1000 * 60 * 15 // 15 mins

export async function setupCatalystStatus(components: Pick<BaseComponents, 'logs' | 'fetch' | 'config' | 'stats'>) {
  const { logs, fetch, config, stats } = components

  const ethNetwork = (await config.getString('ETH_NETWORK')) ?? 'sepolia'
  const logger = logs.getLogger('catalysts-status')

  async function fetchCatalystsStatus(): Promise<CatalystStatus[]> {
    const servers = getCatalystServersFromCache(ethNetwork as any)
    const result: CatalystStatus[] = []
    await Promise.all(
      servers.map(async ({ address }) => {
        try {
          const statusResponse = await fetch.fetch(`${address}/about`)
          const data = await statusResponse.json()

          if (data && data.configurations) {
            result.push({ baseUrl: address, name: data.configurations.realmName })
          }
        } catch (e: any) {
          logger.warn(`Error fetching ${address}/about: ${e.toString()}`)
        }
      })
    )

    return result
  }

  async function fetchParcels(catalysts: CatalystStatus[]): Promise<CatalystParcelsInfo[]> {
    const result: CatalystParcelsInfo[] = []
    await Promise.all(
      catalysts.map(async ({ baseUrl, name }) => {
        try {
          const response = await fetch.fetch(`${baseUrl}/stats/parcels`)
          const data = await response.json()
          if (data && data.parcels) {
            result.push({ url: baseUrl, realmName: name, parcels: data.parcels })
          }
        } catch (e: any) {
          logger.warn(`Error fetching ${baseUrl}/stats/parcel: ${e.toString()}`)
        }
      })
    )

    return result
  }

  let lastCatalystsStatusTime = 0
  let lastCatalystsStatus: CatalystStatus[] | undefined = undefined
  let lastParcelsTime = 0
  let lastParcels: CatalystParcelsInfo[] | undefined = undefined

  async function updateParcels() {
    if (!lastCatalystsStatus || Date.now() - lastCatalystsStatusTime > CATALYST_STATUS_EXPIRATION_TIME) {
      lastCatalystsStatus = await fetchCatalystsStatus()
      lastCatalystsStatusTime = Date.now()
    }

    lastParcels = await fetchParcels(lastCatalystsStatus)
    lastParcelsTime = Date.now()

    stats.onCatalystsParcelsInfo({ time: lastParcelsTime, info: lastParcels })
  }

  return { fetchCatalystsStatus, fetchParcels, updateParcels }
}
