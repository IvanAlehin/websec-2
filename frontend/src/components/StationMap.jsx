import { useEffect, useRef } from 'react'
import { Map, View } from 'ol'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { OSM, Vector as VectorSource } from 'ol/source'
import { fromLonLat } from 'ol/proj'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style'

function getSourceOfVectorLayerByName(mapObject, layerName) {
  if (!mapObject) return null
  const layer = mapObject.getAllLayers().find(l => l.get('name') === layerName)
  return layer?.getSource() || null
}

export default function StationMap({ onStationClick, stations }) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const onStationClickRef = useRef(onStationClick)

  useEffect(() => {
    onStationClickRef.current = onStationClick
  }, [onStationClick])

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return
    
    const vectorSource = new VectorSource({ features: [] })
    
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
    vectorLayer.set('name', 'stations-layer')
    
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
      mapInstance.forEachFeatureAtPixel(event.pixel, (feature) => {
        const stationData = feature.get('stationInfo')
        if (stationData && onStationClickRef.current) {
          onStationClickRef.current(stationData)
        }
      })
    })
    
    mapInstance.on('pointermove', (event) => {
      const features = []
      mapInstance.forEachFeatureAtPixel(event.pixel, (feature) => {
        features.push(feature)
      })
      event.map.getTargetElement().style.cursor = features.length > 0 ? 'pointer' : ''
    })
    
    mapInstanceRef.current = mapInstance
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !stations || stations.length === 0) return
    
    const source = getSourceOfVectorLayerByName(mapInstanceRef.current, 'stations-layer')
    if (source) {
      source.clear()
      const features = stations.map(station => {
        if (!station.longitude || !station.latitude) return null
        const feature = new Feature({
          geometry: new Point(fromLonLat([station.longitude, station.latitude]))
        })
        feature.set('stationInfo', station)
        return feature
      }).filter(f => f !== null)
      
      source.addFeatures(features)
    }
  }, [stations])

  return (
    <div className="map-section">
      <div className="map-header">Карта станций (нажмите для выбора)</div>
      <div className="map-wrapper" ref={mapContainerRef} />
    </div>
  )
}