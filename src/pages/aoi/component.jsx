import React from 'react';
import cx from 'classnames';
import AreaOfInterestScene from 'scenes/aoi-scene';
import HalfEarthLogo from 'components/half-earth-logo';

import styles from './styles.module.scss';
import uiStyles from 'styles/ui.module.scss';

const NationalReportCard = ({
  userConfig,
  aoiGeometry,
  activeLayers,
  sceneSettings
}) => (
  <>
    <HalfEarthLogo className={cx(styles.hideOnPrint,uiStyles.halfEarthLogoTopLeft)}/> 
    <AreaOfInterestScene
      geometry={aoiGeometry}
      userConfig={userConfig}
      activeLayers={activeLayers}
      sceneSettings={sceneSettings}
    />
  </>
);

export default NationalReportCard;