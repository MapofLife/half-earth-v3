import React from 'react';
import { DASHBOARD_SPECIES_NAME } from 'router';
import { LightModeProvider } from '../../../context/light-mode';
import styles from './dashboard-species-view-styles.module.scss';
import Button from 'components/button';

function DashboardSpeciesViewComponent(props) {
  const {
    countryISO,
    browsePage
  } = props;

  return (
    <LightModeProvider>
      <div className={styles.container}>
        The Species of {countryISO}
        <Button
          type="rectangular"
          label="Afrixalus Dorsalis"
          handleClick={() => browsePage({
            type: DASHBOARD_SPECIES_NAME,
            payload: { iso: countryISO.toLowerCase(), scientificname: 'Afrixalus Dorsalis' }
          })}
        />
      </div>

    </LightModeProvider>

  );
}

export default DashboardSpeciesViewComponent;
