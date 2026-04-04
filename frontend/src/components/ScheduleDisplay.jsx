import TrainCard from './TrainCard'

export default function ScheduleDisplay({ scheduleItems, stationInfo }) {
  if (!scheduleItems || scheduleItems.length === 0) {
    return (
      <div className="empty-schedule">
        Расписание отсутствует. Попробуйте выбрать другую станцию.
      </div>
    )
  }

  const getCurrentTimeStatus = (departureTime) => {
    if (!departureTime) return 'scheduled'
    
    let depDate
    if (typeof departureTime === 'string') {
      depDate = new Date(departureTime)
    } else if (typeof departureTime === 'object' && departureTime !== null) {
      depDate = new Date()
      depDate.setHours(departureTime.hours || departureTime.h || 0)
      depDate.setMinutes(departureTime.minutes || departureTime.m || 0)
    } else {
      return 'scheduled'
    }
    
    if (isNaN(depDate.getTime())) return 'scheduled'
    
    const now = new Date()
    const diffMinutes = (depDate - now) / 1000 / 60
    
    if (diffMinutes < 0) return 'departed'
    if (diffMinutes < 10) return 'soon'
    return 'scheduled'
  }

  return (
    <div className="schedule-container">
      {scheduleItems.map((train, index) => {
        const uniqueKey = `${train.thread?.uid || train.number || 'train'}-${train.departure || index}-${index}`
        return (
          <TrainCard
            key={uniqueKey}
            trainData={train}
            timeStatus={getCurrentTimeStatus(train.departure)}
            stationInfo={stationInfo}
          />
        )
      })}
    </div>
  )
}