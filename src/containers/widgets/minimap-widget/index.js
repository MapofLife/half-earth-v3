import React from 'react';

import { createGraphic } from 'utils/graphic-layer-utils';
import { synchronizeWebScenes, updateMainViewExtentGraphic } from 'utils/minimap-utils';

import { loadModules } from 'esri-loader';

import { MINIMAP_EXTENT_GRAPHIC_STYLES, MINIMAP_BASE_LAYER_STYLES } from 'constants/graphic-styles';
import { useMobile } from 'constants/responsive';

import MinimapWidgetComponent from './component';

function MinimapWidget(props) {
  const isOnMobile = useMobile();

  const handleMapLoad = (map, view, globeView) => {
    map.basemap = null; // Avoid displaying the default satellite basemap
    map.ground.surfaceColor = '#0A212E'; // set surface color, before basemap is loaded
    loadModules(['esri/layers/VectorTileLayer', 'esri/Graphic']).then(([VectorTileLayer, Graphic]) => { // load two-colors vector-tile-layer into minimap globe
      const minimapLayer = new VectorTileLayer(MINIMAP_BASE_LAYER_STYLES);
      const extentGraphic = createGraphic(Graphic, MINIMAP_EXTENT_GRAPHIC_STYLES);
      view.graphics.add(extentGraphic);
      map.add(minimapLayer);
      // synchronize data-globe position, zoom etc. with minimap-globe
      synchronizeWebScenes(globeView, view);
      updateMainViewExtentGraphic(globeView, extentGraphic);
    });
  };

  const { hidden } = props;
  return (
    // eslint-disable-next-line react/jsx-filename-extension
    <div style={{ display: hidden ? 'none' : 'block' }}>
      {!isOnMobile && (
        <MinimapWidgetComponent handleMapLoad={handleMapLoad} {...props} />
      ) }
    </div>
  );
}

export default MinimapWidget;