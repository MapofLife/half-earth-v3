import {
  BIRDS_LOOKUP,
  MAMMALS_LOOKUP,
  REPTILES_LOOKUP,
  AMPHIBIAN_LOOKUP,
  ELU_LOOKUP_TABLE,
  WDPA_LOOKUP_TABLE,
} from 'constants/layers-slugs';

export const CRF_NAMES = {
  BIRDS: 'birds',
  REPTILES: 'reptiles',
  AMPHIBIANS: 'amphibians',
  MAMMALS: 'mammals_for_greta',
  ECOLOGICAL_LAND_UNITS: 'ELU',
  POPULATION: 'population2020',
  PROTECTED_AREA_PERCENTAGE: 'wdpa_oecm_zeros',
  PROTECTED_AREAS_INSIDE_AOI: 'WDPA_OECM',
  HUMAN_PRESSURES: 'land_encroachment'
}

export const CRF_DATA_CATEGORIES = {
  CONTEXT: 'context',
  BIODIVERSITY: 'biodiversity'
}

export const { BIRDS, AMPHIBIANS, MAMMALS, ECOLOGICAL_LAND_UNITS, POPULATION, PROTECTED_AREA_PERCENTAGE, HUMAN_PRESSURES, REPTILES, PROTECTED_AREAS_INSIDE_AOI } = CRF_NAMES;


export const LOOKUP_TABLES = {
  [BIRDS]: BIRDS_LOOKUP,
  [MAMMALS]: MAMMALS_LOOKUP,
  [REPTILES]: REPTILES_LOOKUP,
  [AMPHIBIANS]: AMPHIBIAN_LOOKUP,
}

export const CRFS_CONFIG = {
  inputRasterKey: 'crf_name',
  inputGeometryKey: 'geometry',
  inputFeatureServiceNameKey: 'esri_out_feature_service_name',
  outputParamKey: 'output_table',
  basePath: '/cloudStores/HECloudstore_ds_fuwwtcoj9blciafm/'
}

export const BIODIVERSITY_CRFS_CONFIG = {
  ...CRFS_CONFIG,
  uniqueFieldID: 'unique_id_field',
}

export const GEOPROCESSING_SERVICES_URLS = {
  [BIRDS]: 'https://hepportal.arcgis.com/server/rest/services/SampleBirds/GPServer/SampleBirds',
  [REPTILES]: 'https://hepportal.arcgis.com/server/rest/services/SampleRept/GPServer/SampleRept',
  [MAMMALS]: 'https://hepportal.arcgis.com/server/rest/services/sampleUniqueSelectCalculate/GPServer/sampleUniqueSelectCalculate',
  [AMPHIBIANS]: 'https://hepportal.arcgis.com/server/rest/services/SampleAmph/GPServer/SampleAmph',
  [HUMAN_PRESSURES]: 'https://hepportal.arcgis.com/server/rest/services/LandEncroachmentPercentage/GPServer/LandEncroachmentPercentage',
  [PROTECTED_AREA_PERCENTAGE]: 'https://hepportal.arcgis.com/server/rest/services/ZsatMean/GPServer/ZsatMean',
  [PROTECTED_AREAS_INSIDE_AOI]: 'https://hepportal.arcgis.com/server/rest/services/clipSelect/GPServer/clipSelect',
  [ECOLOGICAL_LAND_UNITS]: 'https://hepportal.arcgis.com/server/rest/services/ZsatMajority/GPServer/ZsatMajority',
  [POPULATION]: 'https://hepportal.arcgis.com/server/rest/services/ZsatSum/GPServer/ZsatSum'
}



