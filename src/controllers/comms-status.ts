import { BaseComponents, IslandData } from '../types'
import { Heartbeat, IslandStatusMessage } from '@dcl/protocol/out-js/decentraland/kernel/comms/v3/archipelago.gen'

export function setupCommsStatus({ logs, nats, stats }: Pick<BaseComponents, 'logs' | 'nats' | 'stats'>) {
  const logger = logs.getLogger('comm-stats-controller')

  nats.subscribe('peer.*.disconnect', (err, message) => {
    if (err) {
      logger.error(err)
      return
    }

    const id = message.subject.split('.')[1]
    stats.onPeerDisconnected(id)
  })

  nats.subscribe('peer.*.heartbeat', (err, message) => {
    if (err) {
      logger.error(err)
      return
    }

    const id = message.subject.split('.')[1]
    const decodedMessage = Heartbeat.decode(message.data)
    const position = decodedMessage.position!
    stats.onPeerUpdated(id, {
      address: id,
      time: Date.now(),
      ...position
    })
  })

  nats.subscribe('engine.islands', (err, message) => {
    if (err) {
      logger.error(err)
      return
    }

    const decodedMessage = IslandStatusMessage.decode(message.data)
    const report: IslandData[] = []
    for (const { id, peers, maxPeers, center, radius } of decodedMessage.data) {
      report.push({
        id,
        peers,
        maxPeers,
        radius,
        center: [center!.x, center!.y, center!.z]
      })
    }
    stats.onIslandsDataReceived(report)
  })
}
