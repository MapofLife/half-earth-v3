import React, { useState } from 'react';

import NationalReportCardLandingScene from 'scenes/mobile/nrc-landing-scene-mobile';

function NationalReportCardLandingMobile({
  countryISO,
  countryName,
  activeLayers,
  sceneSettings,
  handleMapLoad,
  isFullscreenActive,
}) {
  const [map, setMap] = useState();

  return (
    <NationalReportCardLandingScene
      map={map}
      countryISO={countryISO}
      countryName={countryName}
      activeLayers={activeLayers}
      sceneSettings={sceneSettings}
      isFullscreenActive={isFullscreenActive}
      onMapLoad={(loadedMap) => {
        setMap(loadedMap);
        handleMapLoad(loadedMap, activeLayers);
      }}
    />
  );
}

export default NationalReportCardLandingMobile;
