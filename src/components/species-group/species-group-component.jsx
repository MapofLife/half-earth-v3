import React, { useContext } from 'react';

import { useLocale } from '@transifex/react';

import cx from 'classnames';
import { LightModeContext } from 'context/light-mode';

import {
  NAVIGATION,
  SPECIES_SELECTED_COOKIE,
} from 'constants/dashboard-constants.js';

import TaxaImageComponent from '../taxa-image';

import styles from './species-group-component.module.scss';
import { MOL_IMAGES_THUMBS_BASE } from 'constants/dashboard-constants.js';
import { FlagOutlined, FlagSharp } from '@mui/icons-material'
import { DASHBOARD_URLS } from 'constants/layers-urls.js';
import useJWTToken from 'hooks/useJWTToken';

function SpeciesGroupComponent(props) {
  const locale = useLocale();

  const {
    species,
    selectedTaxaObj,
    setSelectedIndex,
    setScientificName,
    setMapLegendLayers,
    validateSpeciesList,
    countryISO,
    updateFlaggedSpecies,
    selectedRegion,
  } = props;
  const { getToken } = useJWTToken(countryISO);
  // eslint-disable-next-line camelcase
  const { asset_url, common, scientificname } = species;
  const { lightMode } = useContext(LightModeContext);

  const selectSpecies = (selectedSpecies) => {
    setMapLegendLayers([]);
    setSelectedIndex(NAVIGATION.DATA_LAYER);
    setScientificName(selectedSpecies.scientificname);
    localStorage.setItem(
      SPECIES_SELECTED_COOKIE,
      selectedSpecies.scientificname
    );
  };

  const getCommonName = (commonName, scientificName) => {
    if (commonName) {
      return commonName[0];
      // try {
      //   const parsedName = JSON.parse(commonName);

      //   if (parsedName[0]?.cmname) {
      //     const name = parsedName.find((pn) => pn.lang === locale);
      //     return name?.cmname || parsedName[0]?.cmname;
      //   }
      //   return scientificName;
      // } catch {
      //   return commonName[0];
      // }
    }
    return scientificName;
  };

  const flagSpecies = async (speciesToFlag) => {
    const token = await getToken();
    const flag = fetch(DASHBOARD_URLS.FLAG_SPECIES_URL, {
      method: 'POST',
      headers: {
        ISO3: countryISO,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        scientificname: speciesToFlag.scientificname,
        region_field: selectedRegion ? Object.keys(selectedRegion)?.[0] : 'iso3',
        region_code: selectedRegion ? Object.values(selectedRegion)?.[0] : countryISO,
        flag: !speciesToFlag.flagged,
        iso3: countryISO,
      })
    }).then((response) => {
      if (response.ok) {
        updateFlaggedSpecies(speciesToFlag);
      } else {
        alert(`Failed to flag ${speciesToFlag.scientificname}. Please try again later.`);
      }
    })
    .catch(() => {
      alert(`An error occurred while flagging ${speciesToFlag.scientificname}. Please try again later.`);
    });
  };

  return (
    <div style={{ display: 'flex',  alignItems: 'flex-start' }}>
      {validateSpeciesList && (
        <button className={cx(species.flagged ? styles.selected : '', styles.flagSpecies)} onClick={() => flagSpecies(species)}>
          {species.flagged ? <FlagSharp/> : <FlagOutlined/>}
        </button>
      )}
      {!validateSpeciesList && species.flagged && (
        <div className={cx(species.flagged ? styles.selected : '', styles.flagSpecies)}>
          <FlagSharp/>
        </div>
      )}
      <button
        type="button"
        className={cx(lightMode ? styles.light : '', styles.speciesBox)}
        onClick={() => !validateSpeciesList && selectSpecies(species)}
      >
        <div className={styles.imgBox}>
          {asset_url && asset_url !== 'NA' && (
            <img
              alt={`${selectedTaxaObj.taxa}`}
              loading="lazy"
              src={`${MOL_IMAGES_THUMBS_BASE}${asset_url}.jpg`}
            />
          )}
          {asset_url && asset_url === 'NA' && (
            <TaxaImageComponent taxa={selectedTaxaObj.taxa} />
          )}
          {!asset_url && <TaxaImageComponent taxa={selectedTaxaObj.taxa} />}
        </div>
        <div className={cx(styles.speciesText, styles.name)}>
          <div className={styles.common}>
            {getCommonName(common, scientificname)}
          </div>
          <div className={styles.sci}>{scientificname}</div>
        </div>
      </button>
    </div>
  );
}

export default SpeciesGroupComponent;
