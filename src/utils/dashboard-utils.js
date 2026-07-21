import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';

import { DASHBOARD_LAYER_SLUGS } from 'constants/dashboard-constants';
import { DASHBOARD_URLS } from 'constants/layers-urls';

export const tutorialSections = {
  SPECIES: 'species',
  DATA_LAYERS: 'data-layers',
  INDICATOR_SCORES: 'indicator-scores',
  REGIONS: 'regions',
  INDICATORS: 'indicators',
  SPI: 'spi',
  SHI: 'shi',
  SII: 'sii',
};

export const IUCNStatusTypes = {
  EX: 'Extinct',
  EW: 'Extinct in the wild',
  CR: 'Critically Endangered',
  EN: 'Endangered',
  VU: 'Vulnerable',
  NT: 'Near Threatened',
  LC: 'Least Concern',
  DD: 'Data Deficient',
  NE: 'Not evaluated',
  UN: 'Unknown',
};

// Global layers
export const PROVINCE_FEATURE_GLOBAL_SPI_LAYER_ID =
  'a2adcca9c4a4425582e29fb413df6a72';
export const PROVINCE_FEATURE_GLOBAL_OUTLINE_ID =
  'c6bc2248f053422da9d8d30ce591ca16';

export const GLOBAL_COUNTRY_OUTLINE_ID = 'dda66f1c1e9c4e62abcd043206c19e81';
export const SHI_LAYER_ID = '6f02cce2565b4d089565aaed6adb6ca2';
export const SII_LAYER_ID = 'e294958e1e1f4131ad594a3559d8afb6';
export const PROTECTED_AREA_FEATURE_URL = 'c20d4cbbed23410e9bfc48b5d1c1b483';
// Country specific layers
export const DRC_REGION_FEATURE_ID = 'b0109ce737f4495aa188826ef0601816';
export const ACC_REGION_FEATURE_ID = 'e5df85e300ca4604b893744fb8a29221';
export const GUY_FM_RAPID_INVENTORY_32_FEATURE_ID =
  'cc6b9e1c42c747a2bd220f82039cf0b0';
export const GUY_RIVER_ID = 'e7557c32f8a2475e95aab9471fc9b4c5';
export const GUY_RIVER_NAME_ID = '4182314c3f9c4b4db823618b501f914c';
export const GUY_RIVER_NAME_URL =
  'https://services1.arcgis.com/7uJv7I3kgh2y7Pe0/arcgis/rest/services/Rivers_Guyana/FeatureServer';

export const RAPID_INVENTORY_32_FEATURE_ID = 'e5a8033abb494173af8896d6ba6d0415';
export const INDIGENOUS_LANDS_FEATURE_ID = 'f02ae30f5a784e9e920729a5afef92c0';
export const PERU_CROPS_FEATURE_ID = 'a047064754ee46c78b54f22d99284024';
export const APURIMAC_LANDCOVER_FEATURE_ID = '78c6f87b51884e1d88872563ad01388d';

// MOL Api urls
export const EXPERT_RANGE_MAP_URL =
  'https://api.mol.org/2.x/species/drc_rangemap';
export const TREND_MAP_URL = 'https://api.mol.org/2.x/species/drc_trend';

export const REGION_RANGE_MAP_URL =
  'https://api.mol.org/2.x/species/indicators/habitat-trends/tile-urls';

export const createDefaultDashboardLayers = () => {
  const countries = new FeatureLayer({
    portalItem: {
      id: DASHBOARD_URLS.INITIAL_COUNTRY_LAYER,
    },
    id: DASHBOARD_LAYER_SLUGS.INITIAL_COUNTRY_LAYER,
  });

  const graphics = new GraphicsLayer({
    blendMode: 'destination-in',
    title: 'layer',
  });

  const tileLayer = new TileLayer({
    portalItem: {
      // bottom layer in the group layer
      id: '10df2279f9684e4a9f6a7f08febac2a9', // world imagery
    },
  });

  const group = new GroupLayer({
    id: DASHBOARD_LAYER_SLUGS.INITIAL_GROUP_LAYER,
    layers: [
      tileLayer,
      // world imagery layer will show where it overlaps with the graphicslayer
      graphics,
    ],
    opacity: 0, // initially this layer will be transparent
  });

  return {
    countries,
    graphics,
    group,
  };
};

export function numberToLocaleStringWithOneDecimal(number, fractionDigits = 1) {
  return number.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export const removeRegionLayers = (map, regionLayers) => {
  Object.keys(regionLayers).forEach((region) => {
    const foundLayers = map.layers.items.filter((item) => item.id === region);
    if (foundLayers) {
      foundLayers.forEach((remove) => {
        map.remove(remove);
      });
    }
  });
};
