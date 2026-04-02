const API_BASE = '/api'
const CACHE_KEY = 'railway_stations_data_v3'
const CACHE_DURATION = 24 * 60 * 60 * 1000

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
    
    const data = await response.json()
    return data
  },

  async getStationsData() {
    if (cachedStations) return cachedStations
    
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { timestamp, data } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_DURATION) {
          cachedStations = data
          return data
        }
      }
    } catch (error) {
      console.error('Cache read error:', error)
    }
    
    const rawData = await this.requestData('/stations')
    cachedStations = this.extractStations(rawData)
    
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        cachedStations: cachedStations
      }))
    } catch (error) {
      console.error('Cache write error:', error)
      localStorage.removeItem(CACHE_KEY)
    }
    
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
      station?.latitude && 
      station?.longitude &&
      station.latitude >= MAP_BOUNDS.minLat && 
      station.latitude <= MAP_BOUNDS.maxLat &&
      station.longitude >= MAP_BOUNDS.minLon &&
      station.longitude <= MAP_BOUNDS.maxLon
    )
  }
}