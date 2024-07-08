import React, { useState } from 'react';

import cx from 'classnames';

import AnalyticsIcon from 'icons/analytics.svg?react';
import StacksIcon from 'icons/stacks.svg?react';
import TimeLineIcon from 'icons/timeline.svg?react';

import BioDiversityContainer from './biodiversity-indicators';
import styles from './dashboard-sidebar-styles.module.scss';
import DataLayerContainer from './data-layers';
import RegionsAnalysisComponent from './regions-analysis/regions-analysis-component';
import SpeciesInfoContainer from './species-info';

function DashboardSidebar(props) {
  const { activeLayers, map, view } = props;
  const [selectedIndex, setSelectedIndex] = useState(1);

  return (
    <div className={styles.container}>
      <SpeciesInfoContainer />

      <section className={styles.sidenav}>
        <div className={styles.icons}>
          <button
            type="button"
            aria-label="Data Analysis"
            className={cx({
              [styles.selected]: selectedIndex === 1,
            })}
            onClick={() => setSelectedIndex(1)}
          >
            <StacksIcon className={styles.icon} />
          </button>
          <button
            type="button"
            aria-label="Biodiversit Indicators"
            className={cx({
              [styles.selected]: selectedIndex === 2,
            })}
            onClick={() => setSelectedIndex(2)}
          >
            <TimeLineIcon className={styles.icon} />
          </button>
          <button
            type="button"
            aria-label="Regions Analysis"
            className={cx({
              [styles.selected]: selectedIndex === 3,
            })}
            onClick={() => setSelectedIndex(3)}
          >
            <AnalyticsIcon className={styles.icon} />
          </button>
        </div>
        {selectedIndex === 1 && (
          <DataLayerContainer
            activeLayers={activeLayers}
            map={map}
            view={view}
          />
        )}
        {selectedIndex === 2 && <BioDiversityContainer map={map} />}
        {selectedIndex === 3 && <RegionsAnalysisComponent map={map} />}
      </section>
    </div>
  );
}

export default DashboardSidebar;
