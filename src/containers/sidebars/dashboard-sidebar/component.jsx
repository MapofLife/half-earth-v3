import React from 'react';

import styles from './styles.module.scss';

import DataLayerContainer from './data-layers';
import SpeciesInfoContainer from './species-info';

function DashboardSidebar() {
  return (
    <div className={styles.sidebarContainer}>
      <SpeciesInfoContainer />

      <section className={styles.sidenav}>
        <div className={styles.icons}>
          <span>DL</span>
          <span>BI</span>
          <span>RA</span>
        </div>
        <DataLayerContainer />
      </section>
    </div>
  );
}

export default DashboardSidebar;
