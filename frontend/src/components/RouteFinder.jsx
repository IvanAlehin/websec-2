import { useState } from 'react'
import StationSearch from './StationSearch'
import StationMap from './StationMap'
import TrainCard from './TrainCard'
import { railwayAPI } from '../api'

export default function RouteFinder() {
  const [departureStation, setDepartureStation] = useState(null)
  const [arrivalStation, setArrivalStation] = useState(null)
  const [routeResults, setRouteResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [selectionStep, setSelectionStep] = useState(1)
  const [fromInputValue, setFromInputValue] = useState('')
  const [toInputValue, setToInputValue] = useState('')

  const handleSearchRoute = async () => {
    if (!departureStation || !arrivalStation) {
      setErrorMessage('Выберите обе станции')
      return
    }
    
    if (departureStation.code === arrivalStation.code) {
      setErrorMessage('Станции не могут совпадать')
      return
    }
    
    setIsSearching(true)
    setErrorMessage(null)
    
    try {
      const responseData = await railwayAPI.findRoute(departureStation.code, arrivalStation.code)
      
      if (responseData && responseData.segments && responseData.segments.length > 0) {
        setRouteResults(responseData.segments)
      } else {
        setRouteResults([])
      }
    } catch (error) {
      console.error('Route search error:', error)
      setErrorMessage(error.message || 'Ошибка при поиске маршрута')
    } finally {
      setIsSearching(false)
    }
  }

  const handleReset = () => {
    setDepartureStation(null)
    setArrivalStation(null)
    setRouteResults([])
    setErrorMessage(null)
    setSelectionStep(1)
    setFromInputValue('')
    setToInputValue('')
  }

  const handleMapStationClick = (station) => {
    if (selectionStep === 1) {
      setDepartureStation(station)
      setFromInputValue(station.title)
      setSelectionStep(2)
    } else {
      setArrivalStation(station)
      setToInputValue(station.title)
    }
  }

  return (
    <div className="route-finder-wrapper">
      <div className="search-form-section">
        <h3 className="section-title">Поиск маршрута</h3>
        
        <div className="form-group">
          <label className="form-label">Откуда</label>
          <StationSearch
            value={fromInputValue}
            onStationSelected={(station) => {
              setDepartureStation(station)
              if (station) {
                setFromInputValue(station.title)
                setSelectionStep(2)
              } else {
                setFromInputValue('')
              }
            }}
            placeholder="Выберите станцию..."
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Куда</label>
          <StationSearch
            value={toInputValue}
            onStationSelected={(station) => {
              setArrivalStation(station)
              if (station) {
                setToInputValue(station.title)
              } else {
                setToInputValue('')
              }
            }}
            placeholder="Выберите станцию..."
          />
        </div>
        
        {errorMessage && <div className="error-message-box">{errorMessage}</div>}
        
        <div className="form-buttons">
          <button
            className="btn-primary"
            onClick={handleSearchRoute}
            disabled={isSearching || !departureStation || !arrivalStation}
          >
            {isSearching ? 'Поиск...' : 'Найти поезда'}
          </button>
          
          {(departureStation || arrivalStation) && (
            <button className="btn-secondary" onClick={handleReset}>Сбросить</button>
          )}
        </div>
      </div>
      
      <div className="map-section-wrapper">
        <StationMap onStationClick={handleMapStationClick} />
        <div className="map-instruction">
          {selectionStep === 1 
            ? 'Шаг 1: Нажмите на карту, чтобы выбрать станцию отправления' 
            : 'Шаг 2: Теперь нажмите на карту, чтобы выбрать станцию назначения'}
        </div>
      </div>
      
      {routeResults.length > 0 && (
        <div className="search-results-section">
          <h3 className="results-title">Найдено маршрутов: {routeResults.length}</h3>
          <div className="schedule-container">
            {routeResults.map((route, index) => {
              const uniqueKey = `${route.number || 'train'}-${route.departure || index}-${index}`
              return (
                <TrainCard
                  key={uniqueKey}
                  trainData={route}
                  timeStatus="scheduled"
                  stationInfo={departureStation}
                />
              )
            })}
          </div>
        </div>
      )}
      
      {routeResults.length === 0 && !isSearching && !errorMessage && departureStation && arrivalStation && (
        <div className="search-results-section">
          <div className="empty-schedule">
            Маршруты не найдены
          </div>
        </div>
      )}
    </div>
  )
}