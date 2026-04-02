export function getSourceOfVectorLayerByName(mapObject, layerName) {
  if (!mapObject) return null;
  
  const layer = mapObject.getAllLayers().find(l => l.get('name') === layerName);
  
  if (!layer) return null;
  
  return layer.getSource();
}

export function getVectorLayerByName(mapObject, layerName) {
  if (!mapObject) return null;
  
  return mapObject.getAllLayers().find(l => l.get('name') === layerName);
}