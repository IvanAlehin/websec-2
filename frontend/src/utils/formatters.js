export function formatTime(timeValue) {
  if (!timeValue) return '—'
  
  if (typeof timeValue === 'string') {
    const parts = timeValue.split(':')
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`
    }
    return timeValue
  }
  
  return '—'
}

export function formatDate(timeValue) {
  if (!timeValue) return ''
  return ''
}

export function getStatusInfo(timeStatus) {
  switch (timeStatus) {
    case 'soon': return { className: 'status-soon', label: 'Скоро' }
    case 'departed': return { className: 'status-departed', label: 'Ушёл' }
    default: return { className: 'status-scheduled', label: 'По расписанию' }
  }
}