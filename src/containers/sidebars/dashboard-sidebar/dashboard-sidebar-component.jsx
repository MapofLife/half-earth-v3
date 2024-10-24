import React, { useContext, useEffect } from 'react';
import { useT } from '@transifex/react';
import cx from 'classnames';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

import BioDiversityContainer from './biodiversity-indicators';
import styles from './dashboard-sidebar-styles.module.scss';
import DataLayerContainer from './data-layers';
import { LightModeContext } from '../../../context/light-mode';
import DashboardNav from '../../../components/dashboard-nav';
import DashboardHomeContainer from './dashboard-home';
import DashboardTrendsSidebarContainer from 'containers/sidebars/dashboard-trends-sidebar';
import { NAVIGATION } from '../../../utils/dashboard-utils';
import SpeciesFilterContainer from './species-filter';
import RegionsAnalysisContainer from './regions-analysis';

function DashboardSidebar(props) {
  const t = useT();
  const { countryName,
    selectedIndex,
    map,
    regionLayers,
    setRegionLayers,
    scientificName } = props;

  const { lightMode, toggleLightMode } = useContext(LightModeContext);

  useEffect(() => {
    // TODO: find out why this doesn't work
    if (selectedIndex !== NAVIGATION.TRENDS && selectedIndex !== NAVIGATION.EXPLORE_SPECIES) {
      removeRegionLayers();
      setRegionLayers({});
    }
  }, [selectedIndex]);

  const removeRegionLayers = () => {
    let layers = regionLayers;
    Object.keys(layers).map(region => {
      const foundLayer = map.layers.items.find(item => item.id === region);
      if (foundLayer) {
        map.remove(foundLayer);
      }
    });
  }

  return (
    <div className={cx(lightMode ? styles.light : '', selectedIndex === NAVIGATION.TRENDS ? styles.trends : '', styles.container)}>
      <button type="button" className={styles.darkMode} title={lightMode ? t('Switch to Dark mode') : t('Switch to Light mode')} onClick={() => toggleLightMode()}>
        {!lightMode && <LightModeIcon className={styles.icon} />}
        {lightMode && <DarkModeIcon className={styles.icon} />}
      </button>
      <h1>{countryName}</h1>

      <div className={styles.regionFilter}>
        <DashboardNav {...props} />
        {selectedIndex === NAVIGATION.HOME && <DashboardHomeContainer {...props} />}
        {selectedIndex === NAVIGATION.EXPLORE_SPECIES && <SpeciesFilterContainer {...props} />}
        {selectedIndex === NAVIGATION.REGION && <RegionsAnalysisContainer {...props} />}
        {!scientificName &&
          selectedIndex === NAVIGATION.DATA_LAYER &&
          <DashboardHomeContainer {...props} />}
        {scientificName &&
          (selectedIndex === NAVIGATION.SPECIES ||
            selectedIndex === NAVIGATION.DATA_LAYER) &&
          <DataLayerContainer {...props} />}
        {selectedIndex === NAVIGATION.BIO_IND && <BioDiversityContainer {...props} />}
        {selectedIndex === NAVIGATION.TRENDS && <DashboardTrendsSidebarContainer {...props} />}
      </div>
    </div>
  );
}

export default DashboardSidebar;
