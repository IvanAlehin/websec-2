import { useEffect, useRef } from 'react'
import { Map, View } from 'ol'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { OSM, Vector as VectorSource } from 'ol/source'
import { fromLonLat } from 'ol/proj'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style'
import { railwayAPI } from '../api'

export default function StationMap({ onStationClick }) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const vectorSourceRef = useRef(null)
  const onStationClickRef = useRef(onStationClick)

  // Обновляем ref при изменении callback
  useEffect(() => {
    onStationClickRef.current = onStationClick
  }, [onStationClick])

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return
    
    const vectorSource = new VectorSource({ features: [] })
    vectorSourceRef.current = vectorSource
    
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: '#059669' }),
          stroke: new Stroke({ color: '#ffffff', width: 2 })
        })
      })
    })
    
    const mapInstance = new Map({
      target: mapContainerRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([50.1, 53.2]),
        zoom: 9,
        minZoom: 7,
        maxZoom: 16
      }),
      controls: []
    })
    
    mapInstance.on('click', (event) => {
      const clickedFeatures = []
      mapInstance.forEachFeatureAtPixel(event.pixel, (feature) => {
        clickedFeatures.push(feature)
      })
      
      if (clickedFeatures.length > 0) {
        const stationData = clickedFeatures[0].get('stationInfo')
        if (stationData && onStationClickRef.current) {
          onStationClickRef.current(stationData)
        }
      }
    })
    
    mapInstance.on('pointermove', (event) => {
      const features = []
      mapInstance.forEachFeatureAtPixel(event.pixel, (feature) => {
        features.push(feature)
      })
      event.map.getTargetElement().style.cursor = features.length > 0 ? 'pointer' : ''
    })
    
    mapInstanceRef.current = mapInstance
    
    railwayAPI.getMapStations().then(stationsList => {
      if (vectorSourceRef.current) {
        const features = stationsList.map(station => {
          const feature = new Feature({
            geometry: new Point(fromLonLat([station.longitude, station.latitude]))
          })
          feature.set('stationInfo', station)
          return feature
        })
        vectorSourceRef.current.addFeatures(features)
      }
    })
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null)
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className="map-section">
      <div className="map-header">Карта станций (нажмите для выбора)</div>
      <div className="map-wrapper" ref={mapContainerRef} />
    </div>
  )
}