import React from 'react';
// Components
import Scene from 'components/scene';
import Widgets from 'components/widgets';
import LabelsLayer from 'components/labels-layer';
import CountryMaskLayer from 'components/country-mask-layer';
import ArcgisLayerManager from 'components/arcgis-layer-manager';
import CountryEntryTooltip from 'components/country-entry-tooltip';
import CountriesBordersLayer from 'components/countries-borders-layer';
import LocalSceneViewManager from 'components/local-scene-view-manager';
import CountryLabelsLayer from 'components/country-labels-layer';
import TerrainExaggerationLayer from 'components/terrain-exaggeration-layer';
import PdfNationalReport from 'components/pdf-reports/national-report-pdf';
// Constants
import { LOCAL_SPATIAL_REFERENCE } from 'constants/scenes-constants';

const { REACT_APP_ARGISJS_API_VERSION:API_VERSION } = process.env

const CountrySceneComponent = ({
  onMapLoad,
  isVisible,
  countryISO,
  userConfig,
  openedModal,
  activeLayers,
  countryBorder,
  sceneSettings,
  isFullscreenActive,
  countryTooltipDisplayFor,
}) => {

  return (
    <Scene
      sceneName={'nrc-scene'}
      sceneSettings={sceneSettings}
      loaderOptions={{ url: `https://js.arcgis.com/${API_VERSION}` }}
      onMapLoad={onMapLoad}
    >
      <LocalSceneViewManager localGeometry={countryBorder} />
      <ArcgisLayerManager
        activeLayers={activeLayers}
        userConfig={userConfig}
      />
      <CountryMaskLayer
        countryISO={countryISO}
        spatialReference={LOCAL_SPATIAL_REFERENCE}
      />
      <CountriesBordersLayer
        countryISO={countryISO}
        spatialReference={LOCAL_SPATIAL_REFERENCE}
      />
      <CountryEntryTooltip
        countryTooltipDisplayFor={countryTooltipDisplayFor}
        countryName="mocked country"
      />
      <CountryLabelsLayer
        activeLayers={activeLayers}
        countryISO={countryISO}
        countryName={"mocked country"}
      />
      <TerrainExaggerationLayer exaggeration={3} />
      <LabelsLayer activeLayers={activeLayers} countryISO={countryISO} />
      {isVisible && 
        <Widgets
          activeLayers={activeLayers}
          openedModal={openedModal}
          isFullscreenActive={isFullscreenActive}
        />
      }
      <PdfNationalReport
        onMapLoad={onMapLoad}
        countryISO={countryISO}
      />
    </Scene>
  );
};

export default CountrySceneComponent;
