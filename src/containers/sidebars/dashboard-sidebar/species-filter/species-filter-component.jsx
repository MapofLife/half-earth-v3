import React, { useContext, useEffect, useState } from 'react';

import { useT } from '@transifex/react';

import {
  PROVINCE_FEATURE_GLOBAL_OUTLINE_ID,
  DRC_REGION_FEATURE_ID,
  NBS_OP_INTERVENTIONS_FEATURE_ID,
  INDIGENOUS_LANDS_FEATURE_ID,
  IUCNStatusTypes,
} from 'utils/dashboard-utils';
import { Modal } from 'he-components';

import cx from 'classnames';
import { LightModeContext } from 'context/light-mode';

import Button from 'components/button';
import FilterContainer from 'components/filters';
import SpeciesListContainer from 'components/species-list';

import EsriFeatureService from 'services/esri-feature-service';

import {
  LAYER_OPTIONS,
  NAVIGATION,
  REGION_OPTIONS,
  LAYER_TITLE_TYPES,
  DATA_POINT_TYPE,
} from 'constants/dashboard-constants.js';

import styles from '../dashboard-sidebar-styles.module.scss';
import filterStyles from './species-filter-styles.module.scss';

import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Graphic from '@arcgis/core/Graphic'
import { FormControlLabel, Input } from '@mui/material'
import { DASHBOARD_URLS } from 'constants/layers-urls';
import useJWTToken from 'hooks/useJWTToken';

function SpeciesFilterComponent(props) {
  const t = useT();
  const { lightMode } = useContext(LightModeContext);

  const {
    selectedRegionOption,
    setSelectedRegionOption,
    setSelectedIndex,
    setSelectedTaxa,
    setExploreAllSpecies,
    speciesListLoading,
    setSelectedGeometryRings,
    selectedRegion,
    setRegionName,
    exploreAllSpecies,
    setSelectedRegion,
    regionName,
    setMapLegendLayers,
    setRegionLayers,
    regionLayers,
    geometry,
    view,
    map,
    countryISO,
  } = props;

  const { getToken } = useJWTToken(countryISO);

  const filterStart = [
    {
      name: 'dataset',
      title: t('Expected Sources'),
      filters: [
        {
          name: t('Expert Range Map'),
          active: false,
          test: (species) => {
            const {datasetList} = species;
            if(!datasetList || datasetList.length === 0) return false;
            return datasetList.map((d) => d.product_type).indexOf('range') >
              -1;
          },
          count: 0,
          type: 'and',
          result: false,
        },
        {
          name: t('Refined Range Map'),
          active: false,
          test: (species) => species.global_shi > 0,
          count: 0,
          type: 'and',
          result: false,
        },
      ],
    },
    {
      name: 'dataset',
      title: t('Recorded Sources'),
      filters: [
        {
          name: t('Occurrence'),
          active: false,
          test: (species) => {
            const {datasetList} = species;
            // if (selectedRegionOption === REGION_OPTIONS.RAPID_INVENTORY_32) {
            //   return species?.source.indexOf('Rapid') > -1;
            // }
            if(!datasetList || datasetList.length === 0) return false;
            return datasetList.map((d) => d.product_type).indexOf('points') >
              -1;
          },
          count: 0,
          result: false,
          type: 'and',
        },
        {
          name: t('Private Occurrence'),
          active: false,
          test: (species) => {
            const {product_type} = species;
            if (!product_type) return false;
            return product_type.indexOf('private') >
              -1;
          },
          count: 0,
          result: false,
          type: 'and',
        },
        {
          name: t('Rapid Inventory Assessment'),
          active: false,
          test: (species) => {
            const {datasetList} = species;
            if(!datasetList || datasetList.length === 0) return false;
            return datasetList.map((d) => d.product_type).indexOf('rapid_inventory') >
              -1;
          },
          count: 0,
          result: false,
          type: 'and',
        },
        // {
        //   name: 'Local Inventory',
        //   active: false,
        //   test: (species) =>
        //     species.datasetList.map((d) => d.product_type).indexOf('localinv') >
        //     -1,
        //   result: false,
        //   count: 0,
        //   type: 'and',
        // },
      ],
    },
    {
      name: 'threat',
      title: t('IUCN Status'),
      filters: [
        {
          name: t('Critically Endangered'),
          active: false,
          test: (species) =>
            species?.traits?.threat_status_code?.toUpperCase() === 'CR',
            // IUCNStatusTypes.CR.toUpperCase(),
          count: 0,
          result: false,
          type: 'or',
        },
        {
          name: t('Endangered'),
          result: false,
          active: false,
          test: (species) =>
            species?.traits?.threat_status_code?.toUpperCase() === 'EN',
            // IUCNStatusTypes.EN.toUpperCase(),
          count: 0,
          type: 'or',
        },
        {
          name: t('Vulnerable'),
          active: false,
          test: (species) =>
            species?.traits?.threat_status_code?.toUpperCase() === 'VU',
            // IUCNStatusTypes.VU.toUpperCase(),
          count: 0,
          type: 'or',
          result: false,
        },
        {
          name: t('Near Threatened'),
          active: false,
          test: (species) =>
            species?.traits?.threat_status_code?.toUpperCase() === 'NT',
            // IUCNStatusTypes.NT.toUpperCase(),
          count: 0,
          type: 'or',
          result: false,
        },
        {
          name: t('Least Concern'),
          active: false,
          test: (species) =>
            species?.traits?.threat_status_code?.toUpperCase() === 'LC',
            // IUCNStatusTypes.LC.toUpperCase(),
          count: 0,
          type: 'or',
          result: false,
        },
        {
          name: t('Data Deficient'),
          active: false,
          test: (species) =>
            species?.traits?.threat_status_code?.toUpperCase() === 'DD',
            // IUCNStatusTypes.DD.toUpperCase(),
          count: 0,
          type: 'or',
          result: false,
        },
        {
          name: t('Not Evaluated'),
          active: false,
          result: false,
          test: (species) =>
            species?.traits?.threat_status_code?.toUpperCase() === 'NE'
              // IUCNStatusTypes.NE.toUpperCase()
              ||
            species?.traits?.threat_status_code?.toUpperCase() === 'UN',
              // IUCNStatusTypes.UN.toUpperCase(),
          count: 0,
          type: 'or',
        },
      ],
    },
  ];

  const [filters, setFilters] = useState(filterStart);
  const [regionLabel, setRegionLabel] = useState();
  const [showCustomAreaModal, setShowCustomAreaModal] = useState(false);
  const [customAreaName, setCustomAreaName] = useState('');
  const [customAreaDescription, setCustomAreaDescription] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [customAreaPolygon, setCustomAreaPolygon] = useState(null);

  const layersToFind = [
    LAYER_OPTIONS.PROTECTED_AREAS,
    LAYER_OPTIONS.PROVINCES,
    LAYER_OPTIONS.FORESTS,
    LAYER_OPTIONS.DISSOLVED_NBS,
  ];

  const handleBack = () => {
    setSelectedTaxa(null);
    setSelectedRegion(null);
    setRegionName('');
    setSelectedGeometryRings(null);
    setSelectedRegionOption(null);
    setSelectedIndex(NAVIGATION.REGION);
  };

  const getLayerIcon = (layer, item) => {
    view.whenLayerView(layer).then(() => {
      const { renderer } = layer; // Get the renderer

      if (renderer) {
        const { symbol, uniqueValueGroups } = renderer;

        if (symbol) {
          const { url, outline } = symbol;

          if (url) {
            item.imageUrl = url;
          }

          if (outline) {
            item.outline = outline;
          }
        } else if (uniqueValueGroups) {
          item.classes = uniqueValueGroups[0].classes;
        }
      }

      setMapLegendLayers((ml) => [...ml, item]);
    });
  };

  const updateActiveFilter = (filter) => {
    const newFilters = filters.map((filterGroup) => {
      const newFilterGroup = { ...filterGroup };
      newFilterGroup.filters = filterGroup.filters.map((f) => {
        if (f.name === filter.name) {
          f.active = !f.active;
        }
        return f;
      });
      return newFilterGroup;
    });
    setFilters(newFilters);
  };

  const displayLayer = async (option) => {
    if (option !== REGION_OPTIONS.DRAW) {
      const foundLayer = Object.keys(regionLayers).find((rl) =>
        layersToFind.includes(rl)
      );

      if (!foundLayer) {
        let featureLayer;
        if (option === REGION_OPTIONS.PROTECTED_AREAS) {
          featureLayer = await EsriFeatureService.addProtectedAreaLayer(
            null,
            countryISO
          );

          setRegionLayers(() => ({
            [LAYER_OPTIONS.PROTECTED_AREAS]: featureLayer,
          }));
          map.add(featureLayer);

          const protectedAreaLayer = {
            label: t(LAYER_TITLE_TYPES.PROTECTED_AREAS),
            id: LAYER_OPTIONS.PROTECTED_AREAS,
            showChildren: false,
            type: DATA_POINT_TYPE.PUBLIC,
          };

          getLayerIcon(featureLayer, protectedAreaLayer);
        } else if (option === REGION_OPTIONS.PROVINCES) {
          featureLayer = await EsriFeatureService.getFeatureLayer(
            PROVINCE_FEATURE_GLOBAL_OUTLINE_ID,
            countryISO
          );

          setRegionLayers(() => ({
            [LAYER_OPTIONS.PROVINCES]: featureLayer,
          }));
          map.add(featureLayer);

          featureLayer = await EsriFeatureService.getFeatureLayer(
            INDIGENOUS_LANDS_FEATURE_ID,
            countryISO
          );

          setRegionLayers(() => ({
            [LAYER_OPTIONS.INDIGENOUS_LANDS]: featureLayer,
          }));
          map.add(featureLayer);
        } else if (option === REGION_OPTIONS.FORESTS) {
          featureLayer = await EsriFeatureService.getFeatureLayer(
            DRC_REGION_FEATURE_ID,
            null,
            LAYER_OPTIONS.FORESTS
          );

          setRegionLayers(() => ({
            [LAYER_OPTIONS.FORESTS]: featureLayer,
          }));
          map.add(featureLayer);
        } else if (option === REGION_OPTIONS.DISSOLVED_NBS) {
          featureLayer = await EsriFeatureService.getFeatureLayer(
            NBS_OP_INTERVENTIONS_FEATURE_ID,
            null,
            LAYER_OPTIONS.DISSOLVED_NBS
          );

          setRegionLayers(() => ({
            [LAYER_OPTIONS.DISSOLVED_NBS]: featureLayer,
          }));
          map.add(featureLayer);
        }
      }
    }
  };

  const handleSaveCustomArea = async () => {
    // Implement the logic to save the custom area, e.g., send the geometry and name to the backend
    // You can use the CREATE_CUSTOM_AREA_URL from your layers-urls.js for the API endpoint
    const token = await getToken();

    const customAreaData ={
      region_name: customAreaName,
      region_description: customAreaDescription,
      geojson: customAreaPolygon
    };

    const response = fetch(DASHBOARD_URLS.CREATE_CUSTOM_AREA_URL, {
      method: 'POST',
      headers: {
        ISO3: countryISO,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(customAreaData),
    }).then((res) => {
      if(res.ok){
      }
    });

    // After saving, you might want to refresh the list of regions or provide feedback to the user
    setShowCustomAreaModal(false);
  }

  useEffect(() => {
    if (!selectedRegion) return;

    switch (selectedRegionOption) {
      case REGION_OPTIONS.PROTECTED_AREAS:
        setRegionLabel(t('Protected Areas'));
        break;
      case REGION_OPTIONS.PROVINCES:
        setRegionLabel(t('Provinces'));
        break;
      case REGION_OPTIONS.FORESTS:
        setRegionLabel(t('Forest Titles'));
        break;
      case REGION_OPTIONS.DISSOLVED_NBS:
        setRegionLabel(t('NBS-OP Interventions'));
        break;
      case REGION_OPTIONS.ACC_REGION:
        setRegionLabel(t('Acarai-Corentyne Corridor'));
        break;
      case REGION_OPTIONS.DRAW:
        setRegionLabel(t('Custom Area'));
        setExploreAllSpecies(false);
        break;
      default:
        break;
    }

    if(selectedRegion.rings){
      if(selectedRegion.customName){
        setRegionName(selectedRegion.customName);
      }
      const polygon = {
        type: "polygon",
        rings: [...selectedRegion.rings]
      };

      setCustomAreaPolygon({
        type: 'polygon',
        coordinates: polygon.rings
      });

      const fillSymbol = {
        type: "simple-fill",
        color: [255,255,255, 0.2], // White, 80% opacity
        outline: { color: [255, 255, 255], width: 2 }
      };

      const polygonGraphic = new Graphic({
        geometry: polygon,
        symbol: fillSymbol
      });

      const graphicsLayer = new GraphicsLayer({
        id: 'custom-area'
      });
      graphicsLayer.add(polygonGraphic);
      setRegionLayers((rl) => ({
          ...rl,
          'custom-area': graphicsLayer,
        }));
      map.add(graphicsLayer);

      view.goTo(graphicsLayer.graphics).then(() => view.goTo({ zoom: view.zoom - 1 }, { duration: 500 }));
    }
  }, [selectedRegionOption, selectedRegion]);

  useEffect(() => {
    if(geometry && selectedRegionOption === REGION_OPTIONS.DRAW) {
      const graphic = new Graphic({
        geometry: geometry,
        symbol: {
          type: "simple-fill",
          color: [0, 255, 255, 0.5],
          style: "solid",
          outline: {
            color: [0, 255, 255, 0.5],
            width: 2,
          },
        },
      });

      const graphicsLayer = new GraphicsLayer({
        id: 'custom-area'
      });
      graphicsLayer.add(graphic);
      setRegionLayers((rl) => ({
          ...rl,
          'custom-area': graphicsLayer,
        }));
      map.add(graphicsLayer);
    }
  }, [geometry]);

  useEffect(() => {
    displayLayer(selectedRegionOption);
  }, []);

  return (
    <section
      className={cx(
        lightMode ? filterStyles.light : '',
        filterStyles.container
      )}
    >
      <div className={styles.wrapper}>
        {selectedRegionOption && !exploreAllSpecies && (
          <div className={filterStyles.selectedRegion}>
            <div className={filterStyles.regionInfo}>
              <h2>{regionName}</h2>
              <span>{regionLabel}</span>
            </div>
            {selectedRegionOption === REGION_OPTIONS.DRAW && !selectedRegion?.customName && (
              <Button
                className={styles.customAreaButton}
                type="rectangular"
                label={t('Save this custom area')}
                handleClick={() => setShowCustomAreaModal(true)} />
            )}
            <Button
              className={styles.back}
              handleClick={handleBack}
              label={t('Clear region selected')}
            />
          </div>
        )}
        <div className={styles.filters}>
          <FilterContainer
            filters={filters}
            setFilters={setFilters}
            isLoading={speciesListLoading}
            updateActiveFilter={updateActiveFilter}
            {...props}
          />
          <SpeciesListContainer isLoading={speciesListLoading} {...props} />
        </div>
      </div>
      <Modal
        isOpen={showCustomAreaModal}
        onRequestClose={() => setShowCustomAreaModal(false)}
        theme={filterStyles}>
          <article className={styles.feedbackContent}>
            <div className={styles.feedbackHeader}>
              <span className={styles.feedbackTitle}>{t('Save custom area')}</span>
            </div>
            <div className={styles.feedbackBody}>
              <span
              className={styles.feedbackLabel}
              >{t('Name of custom area to be used in the future')}</span>
              <input
                type="text"
                className={styles.searchInput}
                onChange={(e) => setCustomAreaName(e.target.value)}
                value={customAreaName}
              />
              <span
              className={styles.feedbackLabel}
              >{t('Description')}</span>
              <textarea
                className={styles.additionalComments}
                value={customAreaDescription}
                onChange={(e) => setCustomAreaDescription(e.target.value)}
                placeholder={t('Describe this custom area...')}
              ></textarea>
            </div>
            <div className={styles.feedbackFooter}>
              <Button className={styles.cancelButton} label={t('Cancel')} handleClick={() => setShowCustomAreaModal(false)} />
              <Button
                className={styles.submitButton}
                type="rectangular"
                label={t('Save')} handleClick={handleSaveCustomArea} />

            </div>
          </article>
      </Modal>
    </section>
  );
}

export default SpeciesFilterComponent;
