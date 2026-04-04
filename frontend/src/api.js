const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Границы фильтрации станций (Самарская область + соседние регионы)
// Самара: ~53.2°N, 50.1°E
const MAP_BOUNDS = {
  minLat: 51.0,
  maxLat: 54.0,
  minLon: 47.0,
  maxLon: 52.0
}

let cachedStations = null

export const railwayAPI = {
  async requestData(url, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const fullUrl = `${API_BASE}${url}${queryString ? '?' + queryString : ''}`
    
    const response = await fetch(fullUrl)
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }
    
    return await response.json()
  },

  async getStationsData() {
    if (cachedStations) return cachedStations
    
    const rawData = await this.requestData('/stations')
    cachedStations = this.extractStations(rawData)
    return cachedStations
  },

  extractStations(data) {
    const stationsList = []
    if (!data || !data.countries) return stationsList
    
    for (const country of data.countries) {
      if (country.code && country.code.toUpperCase() !== 'RU') continue
      
      for (const region of country.regions || []) {
        for (const settlement of region.settlements || []) {
          for (const station of settlement.stations || []) {
            if (station.transport_type && 
                !['train', 'suburban'].includes(station.transport_type)) continue
            
            if (station.station_type && 
                station.station_type.toLowerCase().includes('bus')) continue
            
            const code = station.codes?.yandex_code || 
                        station.codes?.code || 
                        station.code
            
            if (!code) continue
            
            stationsList.push({
              code: code,
              title: station.title || '',
              latitude: station.latitude,
              longitude: station.longitude,
              stationType: station.station_type
            })
          }
        }
      }
    }

    return stationsList
  },

  async findStations(query, maxResults = 12) {
    if (!query || query.trim().length < 2) return []
    const allStations = await this.getStationsData()
    if (!allStations) return []
    
    const searchQuery = query.toLowerCase().trim()
    
    return allStations
      .filter(station => station.title?.toLowerCase().includes(searchQuery))
      .slice(0, maxResults)
  },

  async getStationSchedule(stationCode) {
    const data = await this.requestData('/schedule', {
      station: stationCode,
      transport_types: 'suburban'
    })
    return data.schedule || []
  },

  async findRoute(fromCode, toCode) {
    const data = await this.requestData('/route', {
      from: fromCode,
      to: toCode
    })
    return data
  },

  async getMapStations() {
    const allStations = await this.getStationsData()
    if (!allStations) return []
    
    return allStations.filter(station => 
      station.latitude && 
      station.longitude &&
      station.latitude >= MAP_BOUNDS.minLat && 
      station.latitude <= MAP_BOUNDS.maxLat &&
      station.longitude >= MAP_BOUNDS.minLon &&
      station.longitude <= MAP_BOUNDS.maxLon
    )
  }
}