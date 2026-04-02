export function getVectorLayerByName(mapObject, layerName) {

  if (!mapObject) return null;
  
  return mapObject.getAllLayers().find(l => l.get('name') === layerName);
}

export function getSourceOfVectorLayerByName(mapObject, layerName) {

  const layer = getVectorLayerByName(mapObject, layerName);

  return layer?.getSource() || null;
}