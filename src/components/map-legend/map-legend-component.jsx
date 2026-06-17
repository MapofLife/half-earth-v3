import React, { useEffect, useState } from 'react';

import { useT } from '@transifex/react';

import cx from 'classnames';

import ToggleOpacityContainer from 'components/toggle-opacity';

import {
  LAYER_OPTIONS,
  REGION_OPTIONS,
} from 'constants/dashboard-constants.js';

import ArrowIcon from 'icons/arrow_right.svg?react';
import ArrowUpIcon from 'icons/dashboard/arrow_icon.svg?react';

import SDMColorRamp from 'images/dashboard/colorramp.png';
import SHILegendImage from 'images/dashboard/shi_legend.png';
import SIILegendImage from 'images/dashboard/sii_legend.png';
import SPILegendImage from 'images/dashboard/spi_legend.png';
import HabitatLegendImage from 'images/hab_change_colorRamp.png';

import styles from './map-legend-component-styles.module.scss';
import pressureStyles from '../../containers/sidebars/sidebar-legend/styles.module.scss';
import {
  AGRICULTURE_HUMAN_PRESSURES_TILE_LAYER,
  ARTISANAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
  BUILTUP_HUMAN_PRESSURES_TILE_LAYER,
  COMMERCIAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
  ENERGY_HUMAN_PRESSURES_TILE_LAYER,
  INTRUSION_HUMAN_PRESSURES_TILE_LAYER,
  LAND_COVER_LAYER,
  MARINE_LAND_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
  MARINE_OCEAN_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
  PERU_CROPS_LAYER,
  TRANSPORTATION_HUMAN_PRESSURES_TILE_LAYER,
  APURIMAC_LANDCOVER_LAYER,
  BIRDS_RICHNESS_1KM,
  BIRDS_RARITY_1KM,
  AMPHIB_RARITY_1KM,
  AMPHIB_RICHNESS_1KM,
  HUMMINGBIRDS_RARITY,
  HUMMINGBIRDS_RICHNESS,
  MAMMALS_RICHNESS_1KM,
  MAMMALS_RARITY_1KM,
  ANTS_RICHNESS_1KM,
  ANTS_RARITY_1KM,
  REPTILES_RARITY_1KM,
  REPTILES_RICHNESS_1KM,
  POVERTY_AND_DEPRIVATION_LAYER,
  APURIMAC_SPECIES_GAIN_HABITY_SUITABILITY_LAYER,
  APURIMAC_SPECIES_LOSS_HABITY_SUITABILITY_LAYER,
} from 'constants/layers-slugs';

const richnessLayers = [
  LAYER_OPTIONS.INDIGENOUS_LANDS,
  BIRDS_RICHNESS_1KM,
  BIRDS_RARITY_1KM,
  AMPHIB_RARITY_1KM,
  AMPHIB_RICHNESS_1KM,
  HUMMINGBIRDS_RARITY,
  HUMMINGBIRDS_RICHNESS,
  MAMMALS_RICHNESS_1KM,
  MAMMALS_RARITY_1KM,
  ANTS_RICHNESS_1KM,
  ANTS_RARITY_1KM,
  REPTILES_RARITY_1KM,
  REPTILES_RICHNESS_1KM,
];

const landPressureLayers = [
  ENERGY_HUMAN_PRESSURES_TILE_LAYER,
  TRANSPORTATION_HUMAN_PRESSURES_TILE_LAYER,
  AGRICULTURE_HUMAN_PRESSURES_TILE_LAYER,
  BUILTUP_HUMAN_PRESSURES_TILE_LAYER,
  INTRUSION_HUMAN_PRESSURES_TILE_LAYER,
];

const marinePressureLayers = [
  MARINE_LAND_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
  MARINE_OCEAN_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
  COMMERCIAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
  ARTISANAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
];

const socioEconomicLayers = [POVERTY_AND_DEPRIVATION_LAYER];

function MapLegendComponent(props) {
  const { mapLegendLayers, map, setMapLegendLayers, countryISO } = props;
  const t = useT();
  const [leftPosition, setLeftPosition] = useState(0);
  const [collapse, setCollapse] = useState(false);
  const [layersToShow, setLayersToShow] = useState([]);
  const [layersLegend, setLayersLegend] = useState([]);
  const spiLow = 0;
  const spiHigh = 100;
  const shiLow = 95;
  const shiHigh = 100;
  const siiLow = 0;
  const siiHigh = 50;

  const lowText = t('Low');
  const highText = t('High');
  const lossText = t('Loss');
  const stableText = t('Stable');
  const gainText = t('Gain');

  const getLayerIcon = (layer) => {
    if (layer.parentId === LAYER_OPTIONS.EXPERT_RANGE_MAPS) {
      return (
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
          <div
            className={styles.box}
            style={{
              backgroundColor: 'rgb(23, 40, 135)',
            }}
          />
        </div>
      );
    }

    if (layer.id === APURIMAC_SPECIES_LOSS_HABITY_SUITABILITY_LAYER) {
      return (
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
          <div className={cx(styles.box, pressureStyles['apurimac-loss'])} />
        </div>
      );
    }

    if (layer.id === APURIMAC_SPECIES_GAIN_HABITY_SUITABILITY_LAYER) {
      return (
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
          <div className={cx(styles.box, pressureStyles['apurimac-gain'])} />
        </div>
      );
    }

    if (socioEconomicLayers.includes(layer.id)) {
      return (
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
          <div className={cx(styles.box, pressureStyles['socio-economic'])} />
        </div>
      );
    }

    if (richnessLayers.includes(layer.id)) {
      return (
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
          <div className={cx(styles.box, pressureStyles['biodiversity'])} />
        </div>
      );
    }

    if (landPressureLayers.includes(layer.id)) {
      return (
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
          <div
            className={cx(styles.box, pressureStyles['land-human-pressures'])}
          />
        </div>
      );
    }

    if (marinePressureLayers.includes(layer.id)) {
      return (
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
          <div
            className={cx(styles.box, pressureStyles['marine-human-pressures'])}
          />
        </div>
      );
    }

    if (layer.id === LAYER_OPTIONS.PREDICTION_MAPS) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            marginTop: '5px',
          }}
        >
          <div className={cx(styles.box, styles.predictionGradient)} />
          <span>Likelihood</span>
          <div className={styles.legendValues}>
            <span>{lowText}</span>
            <span>{highText}</span>
          </div>
        </div>
      );
    }

    if (layer.imageUrl) {
      // Use layer image, (Point observations)
      return <img src={layer.imageUrl} width={20} height={20} alt="Point" />;
    }

    if (layer.color) {
      const { color } = layer;
      const backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
      return (
        <div className={styles.wrapper}>
          <div
            className={layer.style === 'circle' ? styles.circle : styles.box}
            style={{
              backgroundColor,
            }}
          />
        </div>
      );
    }

    // Use layer outline styles (Administrative Layers)
    if (layer.outline) {
      const { color } = layer.outline;
      const outline = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
      return (
        <div className={styles.wrapper}>
          <div
            className={styles.box}
            style={{
              borderColor: outline,
            }}
          />
        </div>
      );
    }

    // Use layer styling classes (Protected Areas)
    if (layer.classes) {
      return (
        <div className={cx(styles.wrapper, styles.column)}>
          {layer.classes.map((item) => {
            const { color, data } = item.symbol;

            let backgroundColor = 'transparent';
            if (color.r === 0 && color.g === 0 && color.b === 0) {
              const symbolColors =
                layer.id === APURIMAC_LANDCOVER_LAYER ||
                layer.id === LAYER_OPTIONS.PROTECTED_AREAS
                  ? data.symbol.symbolLayers[1]
                  : data.symbol.symbolLayers[0];
              const [red, green, blue, alpha] = symbolColors.color
                ? symbolColors.color
                : symbolColors.markerGraphics[0].symbol.symbolLayers[1].color;

              // const [red, blue, green, alpha] =
              //   data.symbol.symbolLayers[0].markerGraphics[0].symbol
              //     .symbolLayers[1].color;
              backgroundColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            } else {
              backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
            }
            return (
              <div
                style={{ display: 'flex', gap: '5px' }}
                key={`${item.label}-${item.symbol}`}
              >
                <div className={styles.box} style={{ backgroundColor }} />
                {t(item.label)}
              </div>
            );
          })}
        </div>
      );
    }

    if (layer.id === LAYER_OPTIONS.HABITAT) {
      return (
        <img src={HabitatLegendImage} width="100%" height={20} alt="Habitat" />
      );
    }

    if (layer.id === LAYER_OPTIONS.SDM) {
      return <img src={SDMColorRamp} width="100%" height={20} alt="SDM" />;
    }

    if (layer.id === REGION_OPTIONS.PROVINCES) {
      return (
        <div className={styles.mapLegend}>
          <img src={SPILegendImage} width="100%" height={20} alt="SPI" />
          <div className={styles.legendValues}>
            <span>{spiLow}</span>
            <span>{spiHigh}</span>
          </div>
        </div>
      );
    }
    if (layer.id === `${countryISO}-outline`) {
      return (
        <div className={styles.mapLegend}>
          <img src={SHILegendImage} width="100%" height={20} alt="SHI" />
          <div className={styles.legendValues}>
            <span>{shiLow}</span>
            <span>{shiHigh}</span>
          </div>
        </div>
      );
    }

    if (layer.id === `${countryISO}-sii`) {
      return (
        <div className={styles.mapLegend}>
          <img src={SIILegendImage} width="100%" height={20} alt="SII" />
          <div className={styles.legendValues}>
            <span>{siiLow}</span>
            <span>
              {'>'} {siiHigh}
            </span>
          </div>
        </div>
      );
    }

    if (layer.id === REGION_OPTIONS.PROTECTED_AREAS) {
      return (
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
          <div
            className={styles.box}
            style={{
              backgroundColor: 'rgb(58, 135, 19)',
            }}
          />
        </div>
      );
    }
    return '❓'; // Default icon for unknown layer types
  };

  const getLayerLegend = (layer) => {
    if (layer.id === LAYER_OPTIONS.HABITAT) {
      return (
        <div
          style={{
            display: 'flex',
            gap: '5px',
            justifyContent: 'space-between',
            width: '100%',
          }}
          className={styles.legendValues}
        >
          <span>{lossText}</span>
          <span>{stableText}</span>
          <span>{gainText}</span>
        </div>
      );
    }

    if (
      socioEconomicLayers.includes(layer.id) ||
      richnessLayers.includes(layer.id) ||
      landPressureLayers.includes(layer.id) ||
      marinePressureLayers.includes(layer.id)
    ) {
      return (
        <div className={styles.legendValues}>
          <span>{lowText}</span>
          <span>{highText}</span>
        </div>
      );
    }
  };

  const moveItem = (arr, fromIndex, toIndex) => {
    const removedItem = arr.splice(fromIndex, 1)[0];
    arr.splice(toIndex, 0, removedItem);
    return arr;
  };

  const findLayerOnMap = (layer) => {
    // find layer to move on map
    const layerIndex = map.layers.items.findIndex(
      (l) => l.id.toUpperCase() === layer.id.toUpperCase()
    );
    const foundObject = map.layers.items[layerIndex];

    return { layerIndex, foundObject };
  };

  const findLayerInLegend = (layer) => {
    const newLayers = [...layersToShow];
    const newLayerIndex = newLayers.findIndex(
      (l) => l.label.toUpperCase() === layer.label.toUpperCase()
    );
    return { newLayerIndex, newLayers };
  };

  const moveLayerUp = (layer) => {
    const { foundObject, layerIndex } = findLayerOnMap(layer);
    map.layers.reorder(foundObject, layerIndex + 1);

    // find layer to move in legend
    const { newLayerIndex, newLayers } = findLayerInLegend(layer);
    const updateLayers = moveItem(newLayers, newLayerIndex, newLayerIndex - 1);
    setMapLegendLayers(updateLayers);
  };

  const moveLayerDown = (layer) => {
    const { foundObject, layerIndex } = findLayerOnMap(layer);
    map.layers.reorder(foundObject, layerIndex - 1);

    const { newLayerIndex, newLayers } = findLayerInLegend(layer);
    const updateLayers = moveItem(newLayers, newLayerIndex, newLayerIndex + 1);
    setMapLegendLayers(updateLayers);
  };

  const hideArrows = (layer) => {
    if (
      layer.id === REGION_OPTIONS.PROVINCES ||
      layer.id === `${countryISO}-outline`
    ) {
      return true;
    }
    return false;
  };

  const reorderArrayAByReverseB = (A, B) => {
    // Create a Map for case-insensitive lookup: lowercased item → original index in B
    const indexMap = new Map();

    B.forEach((item, index) => {
      if (item !== undefined && item !== null) {
        indexMap.set(item.toString().toLowerCase().trim(), index);
      }
    });

    // Sort A so that items appearing LATER in B come FIRST (reverse order)
    return A.slice().sort((a, b) => {
      const aStr = a?.id.toString().toLowerCase().trim();
      const bStr = b?.id.toString().toLowerCase().trim();

      const idxA = indexMap.get(aStr);
      const idxB = indexMap.get(bStr);

      // Items not found in B go to the end
      if (idxA === undefined) return 1;
      if (idxB === undefined) return -1;

      // Higher index in B = should come first (reverse order)
      return idxB - idxA;
    });
  };

  useEffect(() => {
    const sidebar = document.getElementById('dashboard-sidebar');

    const rect = sidebar.getBoundingClientRect();
    const style = window.getComputedStyle(sidebar);
    const left = style.getPropertyValue('left');

    setLeftPosition(`${rect.width + parseInt(left, 10) + 10}px`);

    // setLayersLegend(Array.from(new Set(mapLegendLayers)));
    const uniqueLayers = Array.from(
      new Map(mapLegendLayers.map((item) => [item.id, item])).values()
    );
    setLayersLegend(uniqueLayers);
  }, [mapLegendLayers]);

  useEffect(() => {
    if (layersLegend.length > 0) {
      const orderedLayers = reorderArrayAByReverseB(
        layersLegend,
        map.layers.items.map((item) => item.id)
      );
      setLayersToShow(orderedLayers);
    }
  }, [layersLegend]);

  return (
    <div
      className={cx(styles.container, {
        [styles.collapse]: collapse,
      })}
      style={{ left: leftPosition }}
    >
      <div className={styles.titleWrapper}>
        <span className={styles.title}>{t('Map Legend')}</span>
        <button
          type="button"
          onClick={() => setCollapse(!collapse)}
          aria-label="Collapse legend"
        >
          <ArrowIcon
            className={cx(styles.arrowIcon, {
              [styles.isOpened]: collapse,
            })}
          />
        </button>
      </div>
      <ul className={styles.layers}>
        {Object.values(layersToShow).map((layer, index) => (
          <li key={`${layer.id}-${layer.label}`}>
            <div className={styles.info}>
              <b>{t(layer.label?.toUpperCase())}</b>
              {layer.parent && <span>{t(layer.parent)}</span>}
              {getLayerIcon(layer)}
              {getLayerLegend(layer)}
            </div>
            <ToggleOpacityContainer layer={layer} {...props} />
            {!hideArrows(layer) && (
              <>
                <button
                  type="button"
                  className={cx(styles.arrows, {
                    [styles.disabled]: index === 0,
                  })}
                  aria-label={t('Move layer up')}
                  onClick={() => moveLayerUp(layer)}
                  disabled={index === 0}
                >
                  <ArrowUpIcon />
                </button>
                <button
                  type="button"
                  className={cx(styles.arrows, styles.down, {
                    [styles.disabled]: index === layersToShow.length - 1,
                  })}
                  aria-label={t('Move layer down')}
                  onClick={() => moveLayerDown(layer)}
                  disabled={index === layersToShow.length - 1}
                >
                  <ArrowUpIcon />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MapLegendComponent;
