import { useState, useEffect } from 'react'
import StationSearch from './components/StationSearch'
import StationMap from './components/StationMap'
import ScheduleDisplay from './components/ScheduleDisplay'
import RouteFinder from './components/RouteFinder'
import { railwayAPI } from './api'

export default function App() {
  const [activeTab, setActiveTab] = useState('station')
  const [currentStation, setCurrentStation] = useState(null)
  const [scheduleData, setScheduleData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchInputValue, setSearchInputValue] = useState('')
  const [mapStations, setMapStations] = useState([])

  useEffect(() => {
    railwayAPI.getMapStations().then(stations => {
      setMapStations(stations)
    })
  }, [])

  const loadStationSchedule = async (station) => {
    if (!station) return
    
    setCurrentStation(station)
    setSearchInputValue(station.title)
    setIsLoading(true)
    setError(null)
    
    try {
      const schedule = await railwayAPI.getStationSchedule(station.code)
      setScheduleData(schedule)
    } catch (err) {
      setError(err.message || 'Ошибка загрузки расписания')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchButtonClick = () => {
    if (currentStation) {
      loadStationSchedule(currentStation)
    }
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="header-title">Расписание Электричек</h1>
      </header>
      
      <nav className="navigation-tabs">
        <button
          className={`nav-tab ${activeTab === 'station' ? 'active' : ''}`}
          onClick={() => setActiveTab('station')}
        >
          Поиск станции
        </button>
        <button
          className={`nav-tab ${activeTab === 'route' ? 'active' : ''}`}
          onClick={() => setActiveTab('route')}
        >
          Маршрут
        </button>
      </nav>
      
      <main className="main-content">
        {activeTab === 'station' ? (
          <>
            <div className="search-section-card">
              <div className="search-with-button">
                <div className="search-input-wrapper">
                  <StationSearch
                    value={searchInputValue}
                    onStationSelected={(station) => {
                      setCurrentStation(station)
                      if (station) {
                        setSearchInputValue(station.title)
                      }
                    }}
                    placeholder="Введите название станции..."
                  />
                </div>
                <button
                  className="search-button"
                  onClick={handleSearchButtonClick}
                  disabled={!currentStation || isLoading}
                >
                  {isLoading ? 'Загрузка...' : 'Найти'}
                </button>
              </div>
            </div>
            
            <div className="map-section-card">
              <StationMap 
                onStationClick={loadStationSchedule} 
                stations={mapStations}
              />
            </div>
            
            {currentStation && (
              <div className="schedule-section-card">
                <h2 className="schedule-title">Расписание: {currentStation.title}</h2>
                
                {isLoading && <div className="loading-state">Загрузка расписания...</div>}
                {error && <div className="error-state">{error}</div>}
                
                {!isLoading && !error && (
                  <ScheduleDisplay scheduleItems={scheduleData} stationInfo={currentStation} />
                )}
              </div>
            )}
          </>
        ) : (
          <RouteFinder stations={mapStations} />
        )}
      </main>
      
      <footer className="app-footer">API: Yandex.Rasp - {new Date().getFullYear()}</footer>
    </div>
  )
}