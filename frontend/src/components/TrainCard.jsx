import { formatTime, formatDate, getStatusInfo } from '../utils/formatters'

export default function TrainCard({ trainData, timeStatus, stationInfo }) {
  
  const statusInfo = getStatusInfo(timeStatus)
  
  const threadTitle = trainData.thread?.title || ''
  const trainNumber = trainData.number || trainData.thread?.number || ''
  const displayName = trainNumber ? `№ ${trainNumber}${threadTitle ? ' ' + threadTitle : ''}` : (threadTitle || 'Пригородный поезд')
  
  const trainType = trainData.type || trainData.transport_type || 'электричка'
  
  const departureTime = trainData.departure
  const arrivalTime = trainData.arrival
  
  const fromStation = trainData.from?.title || stationInfo?.title || '—'
  const toStation = trainData.to?.title || '—'
  
  const platform = trainData.platform || trainData.from_platform

  return (
    <div className="train-card-wrapper">
      <div className="train-card-header">
        <div className="train-number-display">{displayName}</div>
        <div className="train-badges">
          <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>
          <span className="train-type-label">{trainType}</span>
        </div>
      </div>
      
      <div className="train-route-display">
        <div className="route-point departure-point">
          <div className="point-time">{formatTime(departureTime)}</div>
          <div className="point-date">{formatDate(departureTime)}</div>
          <div className="point-station">{fromStation}</div>
        </div>
        
        <div className="route-arrow">→</div>
        
        <div className="route-point arrival-point">
          <div className="point-time">{formatTime(arrivalTime)}</div>
          <div className="point-date">{formatDate(arrivalTime)}</div>
          <div className="point-station">{toStation}</div>
        </div>
      </div>
      
      {platform && (
        <div className="train-platform-info">
          Платформа: <strong>{platform}</strong>
        </div>
      )}
    </div>
  )
}