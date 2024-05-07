import { BORDERS_LAYERS_RENDERER } from 'constants/graphic-styles';
import {
  COUNTRY_PRIORITY_LAYER,
  LAND_COUNTRY_PRIORITY_LAYER,
  MARINE_COUNTRY_PRIORITY_LAYER,
  COUNTRIES_LABELS_FEATURE_LAYER,
  COUNTRIES_DATA_FEATURE_LAYER,
  WDPA_OECM_FEATURE_LAYER,
  LANDSCAPE_FEATURES_LABELS_LAYER,
  GLOBAL_SPI_FEATURE_LAYER,
  MARINE_SPI_FEATURE_LAYER,
  CITIES_LABELS_LAYER,
  REGIONS_LABELS_LAYER,
  VIBRANT_BASEMAP_LAYER,
  SATELLITE_BASEMAP_LAYER,
  FIREFLY_BASEMAP_LAYER,
  CARBON_LAYER,
  MARINE_CARBON_LAYER,
  PRIORITY_PLACES_POLYGONS,
  PROTECTED_AREAS_VECTOR_TILE_LAYER,
  HALF_EARTH_FUTURE_WDPA_LAYER,
  HALF_EARTH_FUTURE_TILE_LAYER,
  SPECIFIC_REGIONS_TILE_LAYER,
  SPECIFIC_REGIONS_WDPA_LAYER,
  COMMUNITY_AREAS_VECTOR_TILE_LAYER,
  GRID_CELLS_PROTECTED_AREAS_PERCENTAGE,
  GRID_CELLS_FOCAL_SPECIES_FEATURE_LAYER,
  GRID_CELLS_LAND_HUMAN_PRESSURES_PERCENTAGE,
  FEATURED_PLACES_LAYER,
  ENERGY_HUMAN_PRESSURES_TILE_LAYER,
  BUILTUP_HUMAN_PRESSURES_TILE_LAYER,
  TRANSPORTATION_HUMAN_PRESSURES_TILE_LAYER,
  AGRICULTURE_HUMAN_PRESSURES_TILE_LAYER,
  INTRUSION_HUMAN_PRESSURES_TILE_LAYER,
  MARINE_LAND_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
  MARINE_OCEAN_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
  COMMERCIAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
  ARTISANAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
  AMPHIB_RARITY_1KM,
  AMPHIB_RICHNESS_1KM,
  DRAGONFLIES_RARITY_1KM,
  DRAGONFLIES_RICHNESS_1KM,
  BIRDS_RARITY_1KM,
  BIRDS_RICHNESS_1KM,
  RESTIO_RARITY_1KM,
  RESTIO_RICHNESS_1KM,
  PROTEA_RARITY_1KM,
  PROTEA_RICHNESS_1KM,
  REPTILES_RARITY_1KM,
  REPTILES_RICHNESS_1KM,
  BUTTERFLIES_RICHNESS_1KM,
  BUTTERFLIES_RARITY_1KM,
  MAMMALS_RICHNESS_1KM,
  SUMMER_BIRDS_RICHNESS_1KM,
  WINTER_BIRDS_RICHNESS_1KM,
  MAMMALS_RARITY_1KM,
  SUMMER_BIRDS_RARITY_1KM,
  WINTER_BIRDS_RARITY_1KM,
  RESIDENT_BIRDS_RICHNESS_1KM,
  RESIDENT_BIRDS_RARITY_1KM,
  ANTS_RARITY_1KM,
  ANTS_RICHNESS_1KM,
  ANTS_RICHNESS_GLOBAL,
  ANTS_RARITY_GLOBAL,
  AMPHIB_PRIORITY,
  AMPHIB_RARITY,
  AMPHIB_RICHNESS,
  FISHES_PRIORITY,
  FISHES_RARITY,
  FISHES_RICHNESS,
  MARINE_MAMMALS_PRIORITY,
  MARINE_MAMMALS_RICHNESS,
  MARINE_MAMMALS_RARITY,
  MAMMALS_PRIORITY,
  MAMMALS_RARITY,
  MAMMALS_RICHNESS,
  BIRDS_PRIORITY,
  BIRDS_RARITY,
  BIRDS_RICHNESS,
  ALL_TAXA_RARITY,
  ALL_TAXA_RICHNESS,
  ALL_TAXA_PRIORITY,
  ALL_VERTEBRATES_PRIORITY,
  ALL_MARINE_VERTEBRATES_PRIORITY,
  ALL_MARINE_VERTEBRATES_RICHNESS,
  ALL_MARINE_VERTEBRATES_RARITY,
  REPTILES_PRIORITY,
  REPTILES_RARITY,
  REPTILES_RICHNESS,
  ANTS_RICHNESS,
  BUTTERFLIES_RICHNESS,
  ODONATES_RICHNESS,
  SAPINDALES_RICHNESS,
  CACTI_RARITY,
  CACTI_RICHNESS,
  CONIFERS_RARITY,
  CONIFERS_RICHNESS,
  TREES_PRIORITY,
  TREES_RARITY,
  TREES_RICHNESS,
  HUMMINGBIRDS_RARITY,
  HUMMINGBIRDS_RICHNESS,
  BIRDS_SACA_RARITY_TOTAL,
  BIRDS_SACA_RICHNESS_TOTAL,
  MAMMALS_SACA_RARITY_TOTAL,
  MAMMALS_SACA_RICHNESS_TOTAL,
  EDUCATOR_AMBASSADORS_LAYER,
  PLEDGES_LAYER,
  ADMIN_AREAS_FEATURE_LAYER,
  GADM_0_ADMIN_AREAS_FEATURE_LAYER,
  GADM_1_ADMIN_AREAS_FEATURE_LAYER,
  EEZ_MARINE_AND_LAND_BORDERS,
} from 'constants/layers-slugs';
import { LAYERS_URLS } from 'constants/layers-urls';

const LAYER_TYPES = {
  FEATURE_LAYER: 'FeatureLayer',
  TILE_LAYER: 'TileLayer',
  VECTOR_TILE_LAYER: 'VectorTileLayer',
  IMAGERY_LAYER: 'ImageryTileLayer',
};

export const DEFAULT_OPACITY = 0.8;
export const BASEMAP_OPACITY = 1;

export const LAYERS_CATEGORIES = {
  BIODIVERSITY: 'Biodiversity',
  PROTECTION: 'Protection',
  LAND_PRESSURES: 'Human pressures',
  MARINE_HUMAN_PRESSURES: 'Marine use pressures',
};

const USCenteredBbox = [-176.3, 20.2, -46.3, 75.2];
const AmericaCenteredBbox = [-237.28, -59.58, 77.01, 66.81];
const SouthAfricaAndSouthEastAsiaBbox = [-31.2, -37, 151, 38.1];

export const layersConfig = {
  [PLEDGES_LAYER]: {
    title: PLEDGES_LAYER,
    slug: PLEDGES_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[PLEDGES_LAYER],
    bbox: null,
  },
  [EDUCATOR_AMBASSADORS_LAYER]: {
    title: EDUCATOR_AMBASSADORS_LAYER,
    slug: EDUCATOR_AMBASSADORS_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[EDUCATOR_AMBASSADORS_LAYER],
    bbox: null,
  },
  [ADMIN_AREAS_FEATURE_LAYER]: {
    title: ADMIN_AREAS_FEATURE_LAYER,
    slug: ADMIN_AREAS_FEATURE_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[ADMIN_AREAS_FEATURE_LAYER],
    renderer: BORDERS_LAYERS_RENDERER,
    bbox: null,
  },
  [GADM_0_ADMIN_AREAS_FEATURE_LAYER]: {
    title: GADM_0_ADMIN_AREAS_FEATURE_LAYER,
    slug: GADM_0_ADMIN_AREAS_FEATURE_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[GADM_0_ADMIN_AREAS_FEATURE_LAYER],
    renderer: BORDERS_LAYERS_RENDERER,
    bbox: null,
  },
  [GADM_1_ADMIN_AREAS_FEATURE_LAYER]: {
    title: GADM_1_ADMIN_AREAS_FEATURE_LAYER,
    slug: GADM_1_ADMIN_AREAS_FEATURE_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[GADM_1_ADMIN_AREAS_FEATURE_LAYER],
    renderer: BORDERS_LAYERS_RENDERER,
    bbox: null,
  },
  [WDPA_OECM_FEATURE_LAYER]: {
    title: WDPA_OECM_FEATURE_LAYER,
    slug: WDPA_OECM_FEATURE_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[WDPA_OECM_FEATURE_LAYER],
    renderer: BORDERS_LAYERS_RENDERER,
    bbox: null,
  },
  [SPECIFIC_REGIONS_TILE_LAYER]: {
    title: SPECIFIC_REGIONS_TILE_LAYER,
    slug: SPECIFIC_REGIONS_TILE_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[SPECIFIC_REGIONS_TILE_LAYER],
    bbox: null,
  },
  [SPECIFIC_REGIONS_WDPA_LAYER]: {
    title: SPECIFIC_REGIONS_WDPA_LAYER,
    slug: SPECIFIC_REGIONS_WDPA_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[SPECIFIC_REGIONS_WDPA_LAYER],
    bbox: null,
  },
  [HALF_EARTH_FUTURE_WDPA_LAYER]: {
    title: HALF_EARTH_FUTURE_WDPA_LAYER,
    slug: HALF_EARTH_FUTURE_WDPA_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[HALF_EARTH_FUTURE_WDPA_LAYER],
    bbox: null,
  },
  [HALF_EARTH_FUTURE_TILE_LAYER]: {
    title: HALF_EARTH_FUTURE_TILE_LAYER,
    slug: HALF_EARTH_FUTURE_TILE_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[HALF_EARTH_FUTURE_TILE_LAYER],
    bbox: null,
  },
  [GLOBAL_SPI_FEATURE_LAYER]: {
    title: GLOBAL_SPI_FEATURE_LAYER,
    slug: GLOBAL_SPI_FEATURE_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[GLOBAL_SPI_FEATURE_LAYER],
    bbox: null,
  },
  [MARINE_SPI_FEATURE_LAYER]: {
    title: MARINE_SPI_FEATURE_LAYER,
    slug: MARINE_SPI_FEATURE_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[MARINE_SPI_FEATURE_LAYER],
    bbox: null,
  },
  [COUNTRIES_LABELS_FEATURE_LAYER]: {
    title: COUNTRIES_LABELS_FEATURE_LAYER,
    slug: COUNTRIES_LABELS_FEATURE_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[COUNTRIES_LABELS_FEATURE_LAYER],
    bbox: null,
  },
  [COUNTRIES_DATA_FEATURE_LAYER]: {
    title: COUNTRIES_DATA_FEATURE_LAYER,
    slug: COUNTRIES_DATA_FEATURE_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[COUNTRIES_DATA_FEATURE_LAYER],
    bbox: null,
  },
  [LANDSCAPE_FEATURES_LABELS_LAYER]: {
    title: LANDSCAPE_FEATURES_LABELS_LAYER,
    slug: LANDSCAPE_FEATURES_LABELS_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[LANDSCAPE_FEATURES_LABELS_LAYER],
    bbox: null,
  },
  [CITIES_LABELS_LAYER]: {
    title: CITIES_LABELS_LAYER,
    slug: CITIES_LABELS_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[CITIES_LABELS_LAYER],
    bbox: null,
  },
  [REGIONS_LABELS_LAYER]: {
    title: REGIONS_LABELS_LAYER,
    slug: REGIONS_LABELS_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[REGIONS_LABELS_LAYER],
    bbox: null,
  },
  [VIBRANT_BASEMAP_LAYER]: {
    title: VIBRANT_BASEMAP_LAYER,
    slug: VIBRANT_BASEMAP_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[VIBRANT_BASEMAP_LAYER],
    opacity: BASEMAP_OPACITY,
    bbox: null,
  },
  [SATELLITE_BASEMAP_LAYER]: {
    title: SATELLITE_BASEMAP_LAYER,
    slug: SATELLITE_BASEMAP_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[SATELLITE_BASEMAP_LAYER],
    opacity: BASEMAP_OPACITY,
    bbox: null,
  },
  [FIREFLY_BASEMAP_LAYER]: {
    title: FIREFLY_BASEMAP_LAYER,
    slug: FIREFLY_BASEMAP_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[FIREFLY_BASEMAP_LAYER],
    opacity: BASEMAP_OPACITY,
    bbox: null,
  },
  [COUNTRY_PRIORITY_LAYER]: {
    title: COUNTRY_PRIORITY_LAYER,
    slug: COUNTRY_PRIORITY_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[COUNTRY_PRIORITY_LAYER],
    bbox: null,
  },
  [LAND_COUNTRY_PRIORITY_LAYER]: {
    title: LAND_COUNTRY_PRIORITY_LAYER,
    slug: LAND_COUNTRY_PRIORITY_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[LAND_COUNTRY_PRIORITY_LAYER],
    bbox: null,
  },
  [MARINE_COUNTRY_PRIORITY_LAYER]: {
    title: MARINE_COUNTRY_PRIORITY_LAYER,
    slug: MARINE_COUNTRY_PRIORITY_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[MARINE_COUNTRY_PRIORITY_LAYER],
    bbox: null,
  },
  [PRIORITY_PLACES_POLYGONS]: {
    title: PRIORITY_PLACES_POLYGONS,
    slug: PRIORITY_PLACES_POLYGONS,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[PRIORITY_PLACES_POLYGONS],
    bbox: null,
  },
  [FEATURED_PLACES_LAYER]: {
    title: FEATURED_PLACES_LAYER,
    slug: FEATURED_PLACES_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[FEATURED_PLACES_LAYER],
    bbox: null,
  },
  [PROTECTED_AREAS_VECTOR_TILE_LAYER]: {
    title: PROTECTED_AREAS_VECTOR_TILE_LAYER,
    slug: PROTECTED_AREAS_VECTOR_TILE_LAYER,
    type: LAYER_TYPES.VECTOR_TILE_LAYER,
    url: LAYERS_URLS[PROTECTED_AREAS_VECTOR_TILE_LAYER],
    bbox: null,
  },
  [COMMUNITY_AREAS_VECTOR_TILE_LAYER]: {
    title: COMMUNITY_AREAS_VECTOR_TILE_LAYER,
    slug: COMMUNITY_AREAS_VECTOR_TILE_LAYER,
    type: LAYER_TYPES.VECTOR_TILE_LAYER,
    url: LAYERS_URLS[COMMUNITY_AREAS_VECTOR_TILE_LAYER],
    bbox: null,
  },
  [GRID_CELLS_PROTECTED_AREAS_PERCENTAGE]: {
    title: GRID_CELLS_PROTECTED_AREAS_PERCENTAGE,
    slug: GRID_CELLS_PROTECTED_AREAS_PERCENTAGE,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[GRID_CELLS_PROTECTED_AREAS_PERCENTAGE],
    bbox: null,
  },
  [GRID_CELLS_FOCAL_SPECIES_FEATURE_LAYER]: {
    title: GRID_CELLS_FOCAL_SPECIES_FEATURE_LAYER,
    slug: GRID_CELLS_FOCAL_SPECIES_FEATURE_LAYER,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[GRID_CELLS_FOCAL_SPECIES_FEATURE_LAYER],
    bbox: null,
  },
  [GRID_CELLS_LAND_HUMAN_PRESSURES_PERCENTAGE]: {
    title: GRID_CELLS_LAND_HUMAN_PRESSURES_PERCENTAGE,
    slug: GRID_CELLS_LAND_HUMAN_PRESSURES_PERCENTAGE,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[GRID_CELLS_LAND_HUMAN_PRESSURES_PERCENTAGE],
    bbox: null,
  },
  [ENERGY_HUMAN_PRESSURES_TILE_LAYER]: {
    title: ENERGY_HUMAN_PRESSURES_TILE_LAYER,
    slug: ENERGY_HUMAN_PRESSURES_TILE_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ENERGY_HUMAN_PRESSURES_TILE_LAYER],
    bbox: null,
  },
  [BUILTUP_HUMAN_PRESSURES_TILE_LAYER]: {
    title: BUILTUP_HUMAN_PRESSURES_TILE_LAYER,
    slug: BUILTUP_HUMAN_PRESSURES_TILE_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[BUILTUP_HUMAN_PRESSURES_TILE_LAYER],
    bbox: null,
  },
  [TRANSPORTATION_HUMAN_PRESSURES_TILE_LAYER]: {
    title: TRANSPORTATION_HUMAN_PRESSURES_TILE_LAYER,
    slug: TRANSPORTATION_HUMAN_PRESSURES_TILE_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[TRANSPORTATION_HUMAN_PRESSURES_TILE_LAYER],
    bbox: null,
  },
  [AGRICULTURE_HUMAN_PRESSURES_TILE_LAYER]: {
    title: AGRICULTURE_HUMAN_PRESSURES_TILE_LAYER,
    slug: AGRICULTURE_HUMAN_PRESSURES_TILE_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[AGRICULTURE_HUMAN_PRESSURES_TILE_LAYER],
    bbox: null,
  },
  [INTRUSION_HUMAN_PRESSURES_TILE_LAYER]: {
    title: INTRUSION_HUMAN_PRESSURES_TILE_LAYER,
    slug: INTRUSION_HUMAN_PRESSURES_TILE_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[INTRUSION_HUMAN_PRESSURES_TILE_LAYER],
    bbox: null,
  },
  [MARINE_LAND_DRIVERS_HUMAN_PRESSURES_TILE_LAYER]: {
    title: MARINE_LAND_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
    slug: MARINE_LAND_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[MARINE_LAND_DRIVERS_HUMAN_PRESSURES_TILE_LAYER],
    bbox: null,
  },
  [MARINE_OCEAN_DRIVERS_HUMAN_PRESSURES_TILE_LAYER]: {
    title: MARINE_OCEAN_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
    slug: MARINE_OCEAN_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[MARINE_OCEAN_DRIVERS_HUMAN_PRESSURES_TILE_LAYER],
    bbox: null,
  },
  [COMMERCIAL_FISHING_HUMAN_PRESSURES_TILE_LAYER]: {
    title: COMMERCIAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
    slug: COMMERCIAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[COMMERCIAL_FISHING_HUMAN_PRESSURES_TILE_LAYER],
    bbox: null,
  },
  [ARTISANAL_FISHING_HUMAN_PRESSURES_TILE_LAYER]: {
    title: ARTISANAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
    slug: ARTISANAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ARTISANAL_FISHING_HUMAN_PRESSURES_TILE_LAYER],
    bbox: null,
  },
  [AMPHIB_RARITY_1KM]: {
    title: AMPHIB_RARITY_1KM,
    slug: AMPHIB_RARITY_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[AMPHIB_RARITY_1KM],
    bbox: USCenteredBbox,
  },
  [AMPHIB_RICHNESS_1KM]: {
    title: AMPHIB_RICHNESS_1KM,
    slug: AMPHIB_RICHNESS_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[AMPHIB_RICHNESS_1KM],
    bbox: USCenteredBbox,
  },
  [DRAGONFLIES_RARITY_1KM]: {
    title: DRAGONFLIES_RARITY_1KM,
    slug: DRAGONFLIES_RARITY_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[DRAGONFLIES_RARITY_1KM],
    bbox: USCenteredBbox,
  },
  [DRAGONFLIES_RICHNESS_1KM]: {
    title: DRAGONFLIES_RICHNESS_1KM,
    slug: DRAGONFLIES_RICHNESS_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[DRAGONFLIES_RICHNESS_1KM],
    bbox: USCenteredBbox,
  },
  [BIRDS_RARITY_1KM]: {
    title: BIRDS_RARITY_1KM,
    slug: BIRDS_RARITY_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[BIRDS_RARITY_1KM],
    bbox: SouthAfricaAndSouthEastAsiaBbox,
  },
  [BIRDS_RICHNESS_1KM]: {
    title: BIRDS_RICHNESS_1KM,
    slug: BIRDS_RICHNESS_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[BIRDS_RICHNESS_1KM],
    bbox: SouthAfricaAndSouthEastAsiaBbox,
  },
  [RESTIO_RARITY_1KM]: {
    title: RESTIO_RARITY_1KM,
    slug: RESTIO_RARITY_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[RESTIO_RARITY_1KM],
    bbox: [13, -37, 34, -27.7],
  },
  [RESTIO_RICHNESS_1KM]: {
    title: RESTIO_RICHNESS_1KM,
    slug: RESTIO_RICHNESS_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[RESTIO_RICHNESS_1KM],
    bbox: [13, -37, 34, -27.7],
  },
  [PROTEA_RARITY_1KM]: {
    title: PROTEA_RARITY_1KM,
    slug: PROTEA_RARITY_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[PROTEA_RARITY_1KM],
    bbox: [13, -37, 34, -27.7],
  },
  [PROTEA_RICHNESS_1KM]: {
    title: PROTEA_RICHNESS_1KM,
    slug: PROTEA_RICHNESS_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[PROTEA_RICHNESS_1KM],
    bbox: [13, -37, 34, -27.7],
  },
  [REPTILES_RARITY_1KM]: {
    title: REPTILES_RARITY_1KM,
    slug: REPTILES_RARITY_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[REPTILES_RARITY_1KM],
    bbox: USCenteredBbox,
  },
  [REPTILES_RICHNESS_1KM]: {
    title: REPTILES_RICHNESS_1KM,
    slug: REPTILES_RICHNESS_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[REPTILES_RICHNESS_1KM],
    bbox: USCenteredBbox,
  },
  [BUTTERFLIES_RICHNESS_1KM]: {
    title: BUTTERFLIES_RICHNESS_1KM,
    slug: BUTTERFLIES_RICHNESS_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[BUTTERFLIES_RICHNESS_1KM],
    bbox: USCenteredBbox,
  },
  [BUTTERFLIES_RARITY_1KM]: {
    title: BUTTERFLIES_RARITY_1KM,
    slug: BUTTERFLIES_RARITY_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[BUTTERFLIES_RARITY_1KM],
    bbox: USCenteredBbox,
  },
  [MAMMALS_RICHNESS_1KM]: {
    title: MAMMALS_RICHNESS_1KM,
    slug: MAMMALS_RICHNESS_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[MAMMALS_RICHNESS_1KM],
    bbox: USCenteredBbox,
  },
  [SUMMER_BIRDS_RICHNESS_1KM]: {
    title: SUMMER_BIRDS_RICHNESS_1KM,
    slug: SUMMER_BIRDS_RICHNESS_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[SUMMER_BIRDS_RICHNESS_1KM],
    bbox: USCenteredBbox,
  },
  [WINTER_BIRDS_RICHNESS_1KM]: {
    title: WINTER_BIRDS_RICHNESS_1KM,
    slug: WINTER_BIRDS_RICHNESS_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[WINTER_BIRDS_RICHNESS_1KM],
    bbox: USCenteredBbox,
  },
  [MAMMALS_RARITY_1KM]: {
    title: MAMMALS_RARITY_1KM,
    slug: MAMMALS_RARITY_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[MAMMALS_RARITY_1KM],
    bbox: USCenteredBbox,
  },
  [SUMMER_BIRDS_RARITY_1KM]: {
    title: SUMMER_BIRDS_RARITY_1KM,
    slug: SUMMER_BIRDS_RARITY_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[SUMMER_BIRDS_RARITY_1KM],
    bbox: USCenteredBbox,
  },
  [WINTER_BIRDS_RARITY_1KM]: {
    title: WINTER_BIRDS_RARITY_1KM,
    slug: WINTER_BIRDS_RARITY_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[WINTER_BIRDS_RARITY_1KM],
    bbox: USCenteredBbox,
  },
  [RESIDENT_BIRDS_RICHNESS_1KM]: {
    title: RESIDENT_BIRDS_RICHNESS_1KM,
    slug: RESIDENT_BIRDS_RICHNESS_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[RESIDENT_BIRDS_RICHNESS_1KM],
    bbox: USCenteredBbox,
  },
  [RESIDENT_BIRDS_RARITY_1KM]: {
    title: RESIDENT_BIRDS_RARITY_1KM,
    slug: RESIDENT_BIRDS_RARITY_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[RESIDENT_BIRDS_RARITY_1KM],
    bbox: USCenteredBbox,
  },
  [ANTS_RARITY_1KM]: {
    title: ANTS_RARITY_1KM,
    slug: ANTS_RARITY_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ANTS_RARITY_1KM],
    bbox: USCenteredBbox,
  },
  [ANTS_RICHNESS_1KM]: {
    title: ANTS_RICHNESS_1KM,
    slug: ANTS_RICHNESS_1KM,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ANTS_RICHNESS_1KM],
    bbox: USCenteredBbox,
  },
  [ANTS_RARITY_GLOBAL]: {
    title: ANTS_RARITY_GLOBAL,
    slug: ANTS_RARITY_GLOBAL,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ANTS_RARITY_GLOBAL],
    bbox: null,
  },
  [ANTS_RICHNESS_GLOBAL]: {
    title: ANTS_RICHNESS_GLOBAL,
    slug: ANTS_RICHNESS_GLOBAL,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ANTS_RICHNESS_GLOBAL],
    bbox: null,
  },
  [BIRDS_SACA_RICHNESS_TOTAL]: {
    title: BIRDS_SACA_RICHNESS_TOTAL,
    slug: BIRDS_SACA_RICHNESS_TOTAL,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[BIRDS_SACA_RICHNESS_TOTAL],
    bbox: AmericaCenteredBbox,
  },
  [BIRDS_SACA_RARITY_TOTAL]: {
    title: BIRDS_SACA_RARITY_TOTAL,
    slug: BIRDS_SACA_RARITY_TOTAL,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[BIRDS_SACA_RARITY_TOTAL],
    bbox: AmericaCenteredBbox,
  },
  [HUMMINGBIRDS_RARITY]: {
    title: HUMMINGBIRDS_RARITY,
    slug: HUMMINGBIRDS_RARITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[HUMMINGBIRDS_RARITY],
    bbox: AmericaCenteredBbox,
  },
  [HUMMINGBIRDS_RICHNESS]: {
    title: HUMMINGBIRDS_RICHNESS,
    slug: HUMMINGBIRDS_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[HUMMINGBIRDS_RICHNESS],
    bbox: AmericaCenteredBbox,
  },
  [FISHES_RARITY]: {
    title: FISHES_RARITY,
    slug: FISHES_RARITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[FISHES_RARITY],
    bbox: null,
  },
  [FISHES_RICHNESS]: {
    title: FISHES_RICHNESS,
    slug: FISHES_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[FISHES_RICHNESS],
    bbox: null,
  },
  [FISHES_PRIORITY]: {
    title: FISHES_PRIORITY,
    slug: FISHES_PRIORITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[FISHES_PRIORITY],
    bbox: null,
  },
  [ALL_MARINE_VERTEBRATES_PRIORITY]: {
    title: ALL_MARINE_VERTEBRATES_PRIORITY,
    slug: ALL_MARINE_VERTEBRATES_PRIORITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ALL_MARINE_VERTEBRATES_PRIORITY],
    bbox: null,
  },
  [ALL_MARINE_VERTEBRATES_RICHNESS]: {
    title: ALL_MARINE_VERTEBRATES_RICHNESS,
    slug: ALL_MARINE_VERTEBRATES_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ALL_MARINE_VERTEBRATES_RICHNESS],
    bbox: null,
  },
  [ALL_MARINE_VERTEBRATES_RARITY]: {
    title: ALL_MARINE_VERTEBRATES_RARITY,
    slug: ALL_MARINE_VERTEBRATES_RARITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ALL_MARINE_VERTEBRATES_RARITY],
    bbox: null,
  },
  [MARINE_MAMMALS_PRIORITY]: {
    title: MARINE_MAMMALS_PRIORITY,
    slug: MARINE_MAMMALS_PRIORITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[MARINE_MAMMALS_PRIORITY],
    bbox: null,
  },
  [MARINE_MAMMALS_RICHNESS]: {
    title: MARINE_MAMMALS_RICHNESS,
    slug: MARINE_MAMMALS_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[MARINE_MAMMALS_RICHNESS],
    bbox: null,
  },
  [MARINE_MAMMALS_RARITY]: {
    title: MARINE_MAMMALS_RARITY,
    slug: MARINE_MAMMALS_RARITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[MARINE_MAMMALS_RARITY],
    bbox: null,
  },
  [AMPHIB_PRIORITY]: {
    title: AMPHIB_PRIORITY,
    slug: AMPHIB_PRIORITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[AMPHIB_PRIORITY],
    bbox: null,
  },
  [AMPHIB_RARITY]: {
    title: AMPHIB_RARITY,
    slug: AMPHIB_RARITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[AMPHIB_RARITY],
    bbox: null,
  },
  [AMPHIB_RICHNESS]: {
    title: AMPHIB_RICHNESS,
    slug: AMPHIB_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[AMPHIB_RICHNESS],
    bbox: null,
  },
  [MAMMALS_PRIORITY]: {
    title: MAMMALS_PRIORITY,
    slug: MAMMALS_PRIORITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[MAMMALS_PRIORITY],
    bbox: null,
  },
  [MAMMALS_RARITY]: {
    title: MAMMALS_RARITY,
    slug: MAMMALS_RARITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[MAMMALS_RARITY],
    bbox: null,
  },
  [MAMMALS_RICHNESS]: {
    title: MAMMALS_RICHNESS,
    slug: MAMMALS_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[MAMMALS_RICHNESS],
    bbox: null,
  },
  [MAMMALS_SACA_RARITY_TOTAL]: {
    title: MAMMALS_SACA_RARITY_TOTAL,
    slug: MAMMALS_SACA_RARITY_TOTAL,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[MAMMALS_SACA_RARITY_TOTAL],
    bbox: AmericaCenteredBbox,
  },
  [MAMMALS_SACA_RICHNESS_TOTAL]: {
    title: MAMMALS_SACA_RICHNESS_TOTAL,
    slug: MAMMALS_SACA_RICHNESS_TOTAL,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[MAMMALS_SACA_RICHNESS_TOTAL],
    bbox: AmericaCenteredBbox,
  },
  [BIRDS_PRIORITY]: {
    title: BIRDS_PRIORITY,
    slug: BIRDS_PRIORITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[BIRDS_PRIORITY],
    bbox: null,
  },
  [BIRDS_RARITY]: {
    title: BIRDS_RARITY,
    slug: BIRDS_RARITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[BIRDS_RARITY],
    bbox: null,
  },
  [BIRDS_RICHNESS]: {
    title: BIRDS_RICHNESS,
    slug: BIRDS_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[BIRDS_RICHNESS],
    bbox: null,
  },
  [ALL_TAXA_PRIORITY]: {
    title: ALL_TAXA_PRIORITY,
    slug: ALL_TAXA_PRIORITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ALL_TAXA_PRIORITY],
    bbox: null,
  },
  [ALL_VERTEBRATES_PRIORITY]: {
    title: ALL_VERTEBRATES_PRIORITY,
    slug: ALL_VERTEBRATES_PRIORITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ALL_VERTEBRATES_PRIORITY],
    bbox: null,
  },
  [ALL_TAXA_RARITY]: {
    title: ALL_TAXA_RARITY,
    slug: ALL_TAXA_RARITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ALL_TAXA_RARITY],
    bbox: null,
  },
  [ALL_TAXA_RICHNESS]: {
    title: ALL_TAXA_RICHNESS,
    slug: ALL_TAXA_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ALL_TAXA_RICHNESS],
    bbox: null,
  },
  [REPTILES_PRIORITY]: {
    title: REPTILES_PRIORITY,
    slug: REPTILES_PRIORITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[REPTILES_PRIORITY],
    bbox: null,
  },
  [REPTILES_RARITY]: {
    title: REPTILES_RARITY,
    slug: REPTILES_RARITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[REPTILES_RARITY],
    bbox: null,
  },
  [REPTILES_RICHNESS]: {
    title: REPTILES_RICHNESS,
    slug: REPTILES_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[REPTILES_RICHNESS],
    bbox: null,
  },
  [ANTS_RICHNESS]: {
    title: ANTS_RICHNESS,
    slug: ANTS_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ANTS_RICHNESS],
    bbox: null,
  },
  [BUTTERFLIES_RICHNESS]: {
    title: BUTTERFLIES_RICHNESS,
    slug: BUTTERFLIES_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[BUTTERFLIES_RICHNESS],
    bbox: null,
  },
  [ODONATES_RICHNESS]: {
    title: ODONATES_RICHNESS,
    slug: ODONATES_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[ODONATES_RICHNESS],
    bbox: null,
  },
  [SAPINDALES_RICHNESS]: {
    title: SAPINDALES_RICHNESS,
    slug: SAPINDALES_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[SAPINDALES_RICHNESS],
    bbox: null,
  },
  [CACTI_RARITY]: {
    title: CACTI_RARITY,
    slug: CACTI_RARITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[CACTI_RARITY],
    bbox: null,
  },
  [CACTI_RICHNESS]: {
    title: CACTI_RICHNESS,
    slug: CACTI_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[CACTI_RICHNESS],
    bbox: null,
  },
  [CONIFERS_RARITY]: {
    title: CONIFERS_RARITY,
    slug: CONIFERS_RARITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[CONIFERS_RARITY],
    bbox: null,
  },
  [CONIFERS_RICHNESS]: {
    title: CONIFERS_RICHNESS,
    slug: CONIFERS_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[CONIFERS_RICHNESS],
    bbox: null,
  },
  [TREES_PRIORITY]: {
    title: TREES_PRIORITY,
    slug: TREES_PRIORITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[TREES_PRIORITY],
    bbox: null,
  },
  [TREES_RARITY]: {
    title: TREES_RARITY,
    slug: TREES_RARITY,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[TREES_RARITY],
    bbox: null,
  },
  [TREES_RICHNESS]: {
    title: TREES_RICHNESS,
    slug: TREES_RICHNESS,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[TREES_RICHNESS],
    bbox: null,
  },
  [EEZ_MARINE_AND_LAND_BORDERS]: {
    title: EEZ_MARINE_AND_LAND_BORDERS,
    slug: EEZ_MARINE_AND_LAND_BORDERS,
    type: LAYER_TYPES.FEATURE_LAYER,
    url: LAYERS_URLS[EEZ_MARINE_AND_LAND_BORDERS],
    bbox: null,
  },
  [CARBON_LAYER]: {
    title: CARBON_LAYER,
    slug: CARBON_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[CARBON_LAYER],
    bbox: null,
  },
  [MARINE_CARBON_LAYER]: {
    title: MARINE_CARBON_LAYER,
    slug: MARINE_CARBON_LAYER,
    type: LAYER_TYPES.TILE_LAYER,
    url: LAYERS_URLS[MARINE_CARBON_LAYER],
    bbox: null,
  },
};

export const BIODIVERSITY_LAYERS_COLOUR_RAMP = [
  'rgba(9, 0, 114, .25)',
  'rgba(9, 0, 114, .25)',
  'rgba(9, 0, 114, .25)',
  'rgba(9, 0, 114, .25)',
  'rgba(9, 0, 114, .25)',
  'rgba(0, 133, 170, .6)',
  'rgba(0, 133, 170, .6)',
  'rgba(0, 226, 136, .8)',
  'rgba(0, 226, 136, .8)',
  'rgb(236, 255, 26)',
];
