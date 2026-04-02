import { useState, useRef, useEffect } from 'react'
import { railwayAPI } from '../api'
import { useDebounce } from '../hooks/useDebounce'

export default function StationSearch({ onStationSelected, placeholder, value: propValue }) {
  const [inputValue, setInputValue] = useState(propValue || '')
  const [searchResults, setSearchResults] = useState([])
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef(null)
  
  const debouncedSearch = useDebounce(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSearchResults([])
      setIsDropdownVisible(false)
      return
    }
    
    setIsLoading(true)
    try {
      const results = await railwayAPI.findStations(searchTerm, 10)
      setSearchResults(results)
      setIsDropdownVisible(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, 300)
  
  useEffect(() => {
    debouncedSearch(inputValue)
  }, [inputValue])

  useEffect(() => {
    if (propValue !== undefined && propValue !== inputValue) {
      setInputValue(propValue)
    }
  }, [propValue])
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsDropdownVisible(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleInputChange = (event) => {
    setInputValue(event.target.value)
  }
  
  const handleKeyDown = (event) => {
    if (!isDropdownVisible || searchResults.length === 0) return
    
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex(prev => prev < searchResults.length - 1 ? prev + 1 : prev)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
    } else if (event.key === 'Enter' && selectedIndex >= 0) {
      event.preventDefault()
      selectStation(searchResults[selectedIndex])
    } else if (event.key === 'Escape') {
      setIsDropdownVisible(false)
    }
  }
  
  const selectStation = (station) => {
    setInputValue(station.title)
    setIsDropdownVisible(false)
    if (onStationSelected) {
      onStationSelected(station)
    }
  }
  
  return (
    <div className="search-container" ref={containerRef}>
      <input
        type="text"
        className="search-input-field"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => searchResults.length > 0 && setIsDropdownVisible(true)}
        placeholder={placeholder}
        autoComplete="off"
        readOnly={!!propValue}
      />
      
      {isLoading && <span className="loading-indicator">Загрузка...</span>}
      
      {isDropdownVisible && searchResults.length > 0 && (
        <div className="autocomplete-dropdown">
          {searchResults.map((station, index) => (
            <div
              key={`${station.code}-${index}`}
              className={`dropdown-option ${index === selectedIndex ? 'selected' : ''}`}
              onMouseDown={() => selectStation(station)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="station-title">{station.title}</span>
              {station.stationType && <span className="station-type-badge">{station.stationType}</span>}
            </div>
          ))}
        </div>
      )}
      
      {isDropdownVisible && inputValue.trim().length >= 2 && searchResults.length === 0 && !isLoading && (
        <div className="autocomplete-dropdown">
          <div className="dropdown-option no-results">Станции не найдены</div>
        </div>
      )}
    </div>
  )
}