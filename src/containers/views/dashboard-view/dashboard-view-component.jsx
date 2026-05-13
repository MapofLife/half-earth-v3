import React, { useEffect, useState } from 'react';

import loadable from '@loadable/component';

import { LightModeProvider } from 'context/light-mode';
import { Loading } from 'he-components';
import * as shapefile from 'shapefile';
import CountryLabelsLayer from 'containers/layers/country-labels-layer';
import RegionsLabelsLayer from 'containers/layers/regions-labels-layer';
import SideMenu from 'containers/menus/sidemenu';
import DashboardSidebarContainer from 'containers/sidebars/dashboard-sidebar';

import AreaHighlightManagerComponent from 'components/AreaHighlightManager/area-highlight-manager-component';
import popUpStyles from 'components/image-popup/image-popup-component-styles.module.scss';
import LayerInfoModalContainer from 'components/layer-info-modal';
import MapLegendContainer from 'components/map-legend';
import MapView from 'components/map-view';

import { NAVIGATION } from 'constants/dashboard-constants.js';

// import TopMenuContainer from 'components/top-menu';

import MinimizeIcon from 'icons/closes.svg?react';

import LayerLegendContainer from '../../../components/layer-legend';
import {
  MEX,
  PROVINCE_TREND,
} from '../../sidebars/dashboard-trends-sidebar/dashboard-trends-sidebar-component';
import { Snackbar } from '@mui/material';

const { VITE_APP_ARGISJS_API_VERSION: API_VERSION } = import.meta.env;
const LabelsLayer = loadable(() => import('containers/layers/labels-layer'));

let highlight;

function DashboardViewComponent(props) {
  const {
    activeLayers,
    onMapLoad,
    sceneMode,
    viewSettings,
    countryISO,
    countryName,
    isFullscreenActive,
    openedModal,
    geometry,
    setSelectedIndex,
    selectedIndex,
    setSelectedRegion,
    selectedRegion,
    browsePage,
    regionLayers,
    setRegionLayers,
    tabOption,
    setSelectedProvince,
    mapLegendLayers,
    regionName,
    setRegionName,
  } = props;

  const [map, setMap] = useState(null);
  const [view, setView] = useState(null);
  const [mapViewSettings, setMapViewSettings] = useState(viewSettings);
  const [clickedRegion, setClickedRegion] = useState();
  const [layerView, setLayerView] = useState();
  const [imagePopup, setImagePopup] = useState();

  const [uploadedShape, setUploadedShape] = useState(null);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [layerInfo, setLayerInfo] = useState();
  const [showLegend, setShowLegend] = useState(false);
  const [activeTrend, setActiveTrend] = useState(PROVINCE_TREND);
  const [shiActiveTrend, setShiActiveTrend] = useState(PROVINCE_TREND);
  const [siiActiveTrend, setSiiActiveTrend] = useState(PROVINCE_TREND);
  // const [showTopNav, setShowTopNav] = useState(true);

  const [snackBar, setSnackBar] = useState({
    open: false,
    message: '',
  });

  const handleSnackBarClose = () => {
    setSnackBar({
      open: false,
      message: '',
    });
  };

  const handleRegionSelected = (foundRegion) => {
    highlight?.remove();
    if (foundRegion) {
      highlight = layerView?.highlight(foundRegion.graphic);
    }
  };

  const previewFile = (event) => {
    const reader = new FileReader();
    const filename = event.target.files[0].name;
    // geojson
    if (filename.match(/\.geojson$/)) {
      reader.onload = (e) => {
        // this.uploaded = atob(e.target.result)
        const result = JSON.parse(e.target.result);
        if (result.features.length > 1) {
          result.features = [result.features[0]];
        }
        setUploadedShape(result);
      };

      reader.readAsText(event.target.files[0]);
    }

    if (filename.match(/\.shp$/)) {
      reader.onload = (e) => {
        shapefile.read(e.target.result).then((source) => {
          if (source.features.length > 1) {
            source.features = [source.features[0]];
          }
          setUploadedShape(source);
        });
      };
      reader.readAsArrayBuffer(event.target.files[0]);
    }
  };

  const closeModal = () => {
    setImagePopup(null);
  };

  const closeUploadModal = () => {
    setShowUploadPopup(false);
  };

  useEffect(() => {
    if (Object.values(mapLegendLayers).length > 0) {
      setShowLegend(true);
    } else {
      setShowLegend(false);
    }
  }, [mapLegendLayers]);

  useEffect(() => {
    if (countryISO.toLowerCase() === 'ee') {
      setActiveTrend(MEX);
      setShiActiveTrend(MEX);
    }
  }, []);

  return (
    <MapView
      onMapLoad={onMapLoad}
      mapName="dashboard"
      viewSettings={mapViewSettings}
      map={map}
      setMap={setMap}
      view={view}
      setView={setView}
      geometry={geometry}
      countryISO={countryISO}
      loaderOptions={{
        url: `https://js.arcgis.com/${API_VERSION}`,
      }}
    >
      {layerInfo && (
        <LayerInfoModalContainer
          layerInfo={layerInfo}
          setLayerInfo={setLayerInfo}
        />
      )}

      {isLoading && (
        <div
          style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 4 }}
        >
          <Loading height={200} />
        </div>
      )}

      {imagePopup && (
        <>
          <div
            className={popUpStyles.overlay}
            role="button"
            aria-label="overlay"
            onClick={closeModal}
            onKeyDown={closeModal}
            tabIndex={0}
          />
          <div className={popUpStyles.popUp}>
            <button
              type="button"
              onClick={() => closeModal()}
              aria-label="Close popup"
            >
              <MinimizeIcon />
            </button>
            {imagePopup}
          </div>
        </>
      )}
      {showUploadPopup && (
        <>
          <div
            className={popUpStyles.overlay}
            role="button"
            aria-label="overlay"
            onClick={closeUploadModal}
            onKeyDown={closeUploadModal}
            tabIndex={0}
          />
          <div className={popUpStyles.popUp}>
            <button
              type="button"
              onClick={() => closeUploadModal()}
              aria-label="Close popup"
            >
              <MinimizeIcon />
            </button>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <b>Upload an Area</b>
              <span>
                Select a <b>.geojson</b> or a <b>.shp</b> file to get a species
                list.
              </span>

              <span>
                If the file contains multiple features, only the first feature
                will be used. If multiple features are required, please dissolve
                them into a single feature.
              </span>

              <span>
                Please ensure your shapefile is in{' '}
                <b>WGS84 EPSG:4326 (latitude, longitude) projection</b>.
              </span>

              <span>The area must be less than 25,000km2.</span>
            </div>
            <input
              type="file"
              onChange={(e) => previewFile(e)}
              accept=".geojson, .shp"
            />
          </div>
        </>
      )}
      <AreaHighlightManagerComponent
        layerView={layerView}
        setLayerView={setLayerView}
        regionLayers={regionLayers}
        setRegionLayers={setRegionLayers}
        view={view}
        setRegionName={setRegionName}
        setSelectedIndex={setSelectedIndex}
        setSelectedRegion={setSelectedRegion}
        browsePage={browsePage}
        setClickedRegion={setClickedRegion}
        tabOption={tabOption}
        setSelectedProvince={setSelectedProvince}
        activeTrend={activeTrend}
        shiActiveTrend={shiActiveTrend}
        siiActiveTrend={siiActiveTrend}
        handleRegionSelected={handleRegionSelected}
        {...props}
      />
      <LightModeProvider>
        {/* <TopMenuContainer {...props} /> */}
        {showLegend && <MapLegendContainer map={map} {...props} />}
        {(selectedIndex === NAVIGATION.REGION ||
          selectedIndex === NAVIGATION.EXPLORE_SPECIES) && (
          <LayerLegendContainer map={map} view={view} {...props} />
        )}
        <DashboardSidebarContainer
          map={map}
          view={view}
          setMapViewSettings={setMapViewSettings}
          regionLayers={regionLayers}
          setRegionLayers={setRegionLayers}
          clickedRegion={clickedRegion}
          setClickedRegion={setClickedRegion}
          handleRegionSelected={handleRegionSelected}
          layerView={layerView}
          selectedRegion={selectedRegion}
          setLayerInfo={setLayerInfo}
          regionName={regionName}
          setRegionName={setRegionName}
          setImagePopup={setImagePopup}
          setIsLoading={setIsLoading}
          activeTrend={activeTrend}
          setActiveTrend={setActiveTrend}
          shiActiveTrend={shiActiveTrend}
          setShiActiveTrend={setShiActiveTrend}
          siiActiveTrend={siiActiveTrend}
          setSiiActiveTrend={setSiiActiveTrend}
          showUploadPopup={showUploadPopup}
          setShowUploadPopup={setShowUploadPopup}
          closeUploadModal={closeUploadModal}
          uploadedShape={uploadedShape}
          setUploadedShape={setUploadedShape}
          setSnackBar={setSnackBar}
          {...props}
        />
      </LightModeProvider>
      <CountryLabelsLayer
        sceneMode={sceneMode}
        countryISO={countryISO}
        countryName={countryName}
        activeLayers={activeLayers}
      />

      <RegionsLabelsLayer sceneMode={sceneMode} activeLayers={activeLayers} />

      <SideMenu
        openedModal={openedModal}
        activeLayers={activeLayers}
        isFullscreenActive={isFullscreenActive}
      />

      <LabelsLayer activeLayers={activeLayers} />
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackBar.open}
        onClose={handleSnackBarClose}
        autoHideDuration={3000}
        message={snackBar.message}
        key={'bottomcenter'}
      />
    </MapView>
  );
}

export default DashboardViewComponent;
