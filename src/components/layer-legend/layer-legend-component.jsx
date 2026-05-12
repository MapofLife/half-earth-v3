import React, { useEffect, useState } from 'react';

import { useT } from '@transifex/react';

import {
  APURIMAC_LANDCOVER_FEATURE_ID,
  INDIGENOUS_LANDS_FEATURE_ID,
  PERU_CROPS_FEATURE_ID,
} from 'utils/dashboard-utils';

import TileLayer from '@arcgis/core/layers/TileLayer';
import Switch from '@mui/material/Switch';
import cx from 'classnames';

import SidebarLegend from 'containers/sidebars/sidebar-legend';

import EsriFeatureService from 'services/esri-feature-service';

import {
  BIODIVERSITY_SLUG,
  LAND_HUMAN_PRESSURES_SLUG,
  MARINE_HUMAN_PRESSURES_SLUG,
  LAND_COVER_SLUG,
  SOCIO_ECONOMIC_SLUG,
} from 'constants/analyze-areas-constants';
import { LAYER_OPTIONS } from 'constants/dashboard-constants.js';
import {
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
  LAND_HUMAN_PRESSURES,
  TRANSPORTATION_HUMAN_PRESSURES_TILE_LAYER,
  AGRICULTURE_HUMAN_PRESSURES_TILE_LAYER,
  BUILTUP_HUMAN_PRESSURES_TILE_LAYER,
  INTRUSION_HUMAN_PRESSURES_TILE_LAYER,
  MARINE_LAND_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
  MARINE_OCEAN_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
  COMMERCIAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
  ARTISANAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
  ENERGY_HUMAN_PRESSURES_TILE_LAYER,
  LAND_COVER_LAYER,
  APURIMAC_SPECIES_GAIN_HABITY_SUITABILITY_LAYER,
  APURIMAC_SPECIES_LOSS_HABITY_SUITABILITY_LAYER,
  APURIMAC_LANDCOVER_LAYER,
  PERU_CROPS_LAYER,
  POVERTY_AND_DEPRIVATION_LAYER,
} from 'constants/layers-slugs';
import { LAYERS_URLS } from 'constants/layers-urls';

import ArrowIcon from 'icons/arrow_right.svg?react';

import styles from './layer-legend-styles.module.scss';

function LayerLegendComponent(props) {
  const {
    map,
    view,
    countryISO,
    setRegionLayers,
    richnessRarityLegendInfo,
    setMapLegendLayers,
  } = props;
  const t = useT();
  const layerIndex = 2;

  const PERU_LAYERS = [
    {
      type: 'landCover',
      id: PERU_CROPS_LAYER,
      label:
        countryISO.toUpperCase() === 'PER'
          ? t('Cultivos de Perú')
          : t('Peru Crops'),
      heatMapImage: '',
      details: ``,
      showDetails: false,
      showLayer: false,
      portalId: PERU_CROPS_FEATURE_ID,
      speciesCount: 0,
    },
    {
      type: 'landCover',
      id: APURIMAC_LANDCOVER_LAYER,
      label:
        countryISO.toUpperCase() === 'PER'
          ? t('Cambio en la cubierta del suelo de Apurímac')
          : t('Apurimac Landcover change'),
      heatMapImage: '',
      details: ``,
      showDetails: false,
      showLayer: false,
      portalId: APURIMAC_LANDCOVER_FEATURE_ID,
      speciesCount: 0,
    },
    {
      type: 'landCover',
      id: APURIMAC_SPECIES_LOSS_HABITY_SUITABILITY_LAYER,
      label:
        countryISO.toUpperCase() === 'PER'
          ? t('Especies de Apurímac con pérdida en la adecuación del hábitat')
          : t('Apurímac species with a loss in habitat suitability'),
      heatMapImage: '',
      details: ``,
      showDetails: false,
      showLayer: false,
      url: APURIMAC_SPECIES_LOSS_HABITY_SUITABILITY_LAYER,
      speciesCount: 0,
    },
    {
      type: 'landCover',
      id: APURIMAC_SPECIES_GAIN_HABITY_SUITABILITY_LAYER,
      label:
        countryISO.toUpperCase() === 'PER'
          ? t('Especies de Apurímac con ganancia en la adecuación del hábitat')
          : t('Apurímac species with a gain in habitat suitability'),
      heatMapImage: '',
      details: ``,
      showDetails: false,
      showLayer: false,
      url: APURIMAC_SPECIES_GAIN_HABITY_SUITABILITY_LAYER,
      speciesCount: 0,
    },
  ];

  // const [leftPosition, setLeftPosition] = useState(0);
  const [collapse, setCollapse] = useState(true);
  const [richnessLayers, setRichnessLayers] = useState([
    {
      id: LAYER_OPTIONS.INDIGENOUS_LANDS,
      label: t('Indigenous Territories'),
      heatMapImage: '',
      details: `Publication date: 2012-12-04 <br/>Responsible party<br/>Organization's name: RAISG - Red Amazónica de Información Socioambiental Georreferenciada<br/>Contact's role: point of contact<br/>Delivery point: <a href="http://raisg.socioambiental.org/contact" target="_blank" rel="noopener noreferrer">http://raisg.socioambiental.org/contact</a>`,
      showDetails: false,
      showLayer: false,
      portalId: INDIGENOUS_LANDS_FEATURE_ID,
      speciesCount: 0,
    },
    {
      id: BIRDS_RICHNESS_1KM,
      label: t('Birds Richness'),
      heatMapImage: '',
      details: `Species richness is the count of species predicted to occur in each 1 km x 1 km cell. Predictions were developed species by species, integrating a range of data inputs including local biodiversity occurrence data and bioclimatic and remote-sensing-supported information.`,
      showDetails: false,
      showLayer: false,
      url: BIRDS_RICHNESS_1KM,
      speciesCount: 0,
    },
    {
      id: BIRDS_RARITY_1KM,
      label: t('Birds Rarity'),
      heatMapImage: '',
      details: `Species rarity measures how geographically restricted the species occurring on average are in each 1km x 1km cell. High values indicate high levels of endemism and thus importance for conservation.`,
      showDetails: false,
      showLayer: false,
      url: BIRDS_RARITY_1KM,
      speciesCount: 0,
    },
    {
      id: AMPHIB_RARITY_1KM,
      label: t('Amphibians Rarity'),
      heatMapImage: '',
      details: `Species rarity measures how geographically restricted the species occurring on average are in each 1km x 1km cell. High values indicate high levels of endemism and thus importance for conservation.`,
      showDetails: false,
      showLayer: false,
      url: AMPHIB_RARITY_1KM,
      speciesCount: 0,
    },
    {
      id: AMPHIB_RICHNESS_1KM,
      label: t('Amphibians Richness'),
      heatMapImage: '',
      details: `Species richness is the count of species predicted to occur in each 1 km x 1 km cell. Predictions were developed species by species, integrating a range of data inputs including local biodiversity occurrence data and bioclimatic and remote-sensing-supported information.`,
      showDetails: false,
      showLayer: false,
      url: AMPHIB_RICHNESS_1KM,
      speciesCount: 0,
    },
    {
      id: HUMMINGBIRDS_RARITY,
      label: t('Hummingbirds Rarity'),
      heatMapImage: '',
      details: `Species rarity measures how geographically restricted the species occurring on average are in each 1km x 1km cell. High values indicate high levels of endemism and thus importance for conservation.`,
      showDetails: false,
      showLayer: false,
      url: HUMMINGBIRDS_RARITY,
      speciesCount: 0,
    },
    {
      id: HUMMINGBIRDS_RICHNESS,
      label: t('Hummingbirds Richness'),
      heatMapImage: '',
      details: `Species richness is the count of species predicted to occur in each 1 km x 1 km cell. Predictions were developed species by species, integrating a range of data inputs including local biodiversity occurrence data and bioclimatic and remote-sensing-supported information.`,
      showDetails: false,
      showLayer: false,
      url: HUMMINGBIRDS_RICHNESS,
      speciesCount: 0,
    },
    {
      id: MAMMALS_RICHNESS_1KM,
      label: t('Mammals Richness'),
      heatMapImage: '',
      details: `Species richness is the count of species predicted to occur in each 1 km x 1 km cell. Predictions were developed species by species, integrating a range of data inputs including local biodiversity occurrence data and bioclimatic and remote-sensing-supported information.`,
      showDetails: false,
      showLayer: false,
      url: MAMMALS_RICHNESS_1KM,
      speciesCount: 0,
    },
    {
      id: MAMMALS_RARITY_1KM,
      label: t('Mammals Rarity'),
      heatMapImage: '',
      details: `Species rarity measures how geographically restricted the species occurring on average are in each 1km x 1km cell. High values indicate high levels of endemism and thus importance for conservation.`,
      showDetails: false,
      showLayer: false,
      url: MAMMALS_RARITY_1KM,
      speciesCount: 0,
    },
    {
      id: ANTS_RICHNESS_1KM,
      label: t('Ants Richness'),
      heatMapImage: '',
      details: `Species richness is the count of species predicted to occur in each 1 km x 1 km cell. Predictions were developed species by species, integrating a range of data inputs including local biodiversity occurrence data and bioclimatic and remote-sensing-supported information.`,
      showDetails: false,
      showLayer: false,
      url: ANTS_RICHNESS_1KM,
      speciesCount: 0,
    },
    {
      id: ANTS_RARITY_1KM,
      label: t('Ants Rarity'),
      heatMapImage: '',
      details: `Species rarity measures how geographically restricted the species occurring on average are in each 1km x 1km cell. High values indicate high levels of endemism and thus importance for conservation.`,
      showDetails: false,
      showLayer: false,
      url: ANTS_RARITY_1KM,
      speciesCount: 0,
    },
    {
      id: REPTILES_RARITY_1KM,
      label: t('Reptiles Rarity'),
      heatMapImage: '',
      details: `Species rarity measures how geographically restricted the species occurring on average are in each 1km x 1km cell. High values indicate high levels of endemism and thus importance for conservation.`,
      showDetails: false,
      showLayer: false,
      url: REPTILES_RARITY_1KM,
      speciesCount: 0,
    },
    {
      id: REPTILES_RICHNESS_1KM,
      label: t('Reptiles Richness'),
      heatMapImage: '',
      details: `Species richness is the count of species predicted to occur in each 1 km x 1 km cell. Predictions were developed species by species, integrating a range of data inputs including local biodiversity occurrence data and bioclimatic and remote-sensing-supported information.`,
      showDetails: false,
      showLayer: false,
      url: REPTILES_RICHNESS_1KM,
      speciesCount: 0,
    },
  ]);

  const [landUsePressureLayers, setLandUsePressureLayers] = useState([
    {
      type: 'landUsePressure',
      id: ENERGY_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Energy and extractive resources'),
      heatMapImage: '',
      // details: `Publication date: 2012-12-04 <br/>Responsible party<br/>Organization's name: RAISG - Red Amazónica de Información Socioambiental Georreferenciada<br/>Contact's role: point of contact<br/>Delivery point: <a href="http://raisg.socioambiental.org/contact" target="_blank" rel="noopener noreferrer">http://raisg.socioambiental.org/contact</a>`,
      details: `<p>Source: (1) <a href="https://onlinelibrary.wiley.com/doi/abs/10.1111/gcb.14549" target="_blank" rel="noopener noreferrer">Kennedy et al., 2019</a>
(2) <a href="https://www.mdpi.com/2072-4292/9/1/36" target="_blank" rel="noopener noreferrer">Lamarche et al., 2017</a>
(3) <a href="https://essd.copernicus.org/articles/12/1953/2020/" target="_blank" rel="noopener noreferrer">Theobald et al., 2020</a>
(4) <a href="https://zenodo.org/record/5338803#.ZCP2texBzJ8" target="_blank" rel="noopener noreferrer">Theobald et al., 2021 - Data set</a>. Data are available on <a href="https://www.arcgis.com/home/item.html?id=68d51c21d04a4046aa0b51dc39423c31" target="_blank" rel="noopener noreferrer">ArcGIS Online</a>.</p>`,
      showDetails: false,
      showLayer: false,
      url: ENERGY_HUMAN_PRESSURES_TILE_LAYER,
      speciesCount: 0,
    },
    {
      type: 'landUsePressure',
      id: TRANSPORTATION_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Transportation'),
      heatMapImage: '',
      details: `<p>Source: (1) <a href="https://onlinelibrary.wiley.com/doi/abs/10.1111/gcb.14549" target="_blank" rel="noopener noreferrer">Kennedy et al., 2019</a>
(2) <a href="https://www.mdpi.com/2072-4292/9/1/36" target="_blank" rel="noopener noreferrer">Lamarche et al., 2017</a>
(3) <a href="https://essd.copernicus.org/articles/12/1953/2020/" target="_blank" rel="noopener noreferrer">Theobald et al., 2020</a>
(4) <a href="https://zenodo.org/record/5338803#.ZCP2texBzJ8" target="_blank" rel="noopener noreferrer">Theobald et al., 2021 - Data set</a>. Data are available on <a href="https://www.arcgis.com/home/item.html?id=68d51c21d04a4046aa0b51dc39423c31" target="_blank" rel="noopener noreferrer">ArcGIS Online</a>.</p>`,
      showDetails: false,
      showLayer: false,
      url: TRANSPORTATION_HUMAN_PRESSURES_TILE_LAYER,
      speciesCount: 0,
    },
    {
      type: 'landUsePressure',
      id: AGRICULTURE_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Agriculture pressures'),
      heatMapImage: '',
      details: `<p>Source: (1) <a href="https://onlinelibrary.wiley.com/doi/abs/10.1111/gcb.14549" target="_blank" rel="noopener noreferrer">Kennedy et al., 2019</a>
(2) <a href="https://www.mdpi.com/2072-4292/9/1/36" target="_blank" rel="noopener noreferrer">Lamarche et al., 2017</a>
(3) <a href="https://essd.copernicus.org/articles/12/1953/2020/" target="_blank" rel="noopener noreferrer">Theobald et al., 2020</a>
(4) <a href="https://zenodo.org/record/5338803#.ZCP2texBzJ8" target="_blank" rel="noopener noreferrer">Theobald et al., 2021 - Data set</a>. Data are available on <a href="https://www.arcgis.com/home/item.html?id=68d51c21d04a4046aa0b51dc39423c31" target="_blank" rel="noopener noreferrer">ArcGIS Online</a>.</p>`,
      showDetails: false,
      showLayer: false,
      url: AGRICULTURE_HUMAN_PRESSURES_TILE_LAYER,
      speciesCount: 0,
    },
    {
      type: 'landUsePressure',
      id: BUILTUP_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Urban and Built up'),
      heatMapImage: '',
      details: `<p>Source: (1) <a href="https://onlinelibrary.wiley.com/doi/abs/10.1111/gcb.14549" target="_blank" rel="noopener noreferrer">Kennedy et al., 2019</a>
(2) <a href="https://www.mdpi.com/2072-4292/9/1/36" target="_blank" rel="noopener noreferrer">Lamarche et al., 2017</a>
(3) <a href="https://essd.copernicus.org/articles/12/1953/2020/" target="_blank" rel="noopener noreferrer">Theobald et al., 2020</a>
(4) <a href="https://zenodo.org/record/5338803#.ZCP2texBzJ8" target="_blank" rel="noopener noreferrer">Theobald et al., 2021 - Data set</a>. Data are available on <a href="https://www.arcgis.com/home/item.html?id=68d51c21d04a4046aa0b51dc39423c31" target="_blank" rel="noopener noreferrer">ArcGIS Online</a>.</p>`,
      showDetails: false,
      showLayer: false,
      url: BUILTUP_HUMAN_PRESSURES_TILE_LAYER,
      speciesCount: 0,
    },
    {
      type: 'landUsePressure',
      id: INTRUSION_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Human Intrusion'),
      heatMapImage: '',
      details: `<p>Source: (1) <a href="https://onlinelibrary.wiley.com/doi/abs/10.1111/gcb.14549" target="_blank" rel="noopener noreferrer">Kennedy et al., 2019</a>
(2) <a href="https://www.mdpi.com/2072-4292/9/1/36" target="_blank" rel="noopener noreferrer">Lamarche et al., 2017</a>
(3) <a href="https://essd.copernicus.org/articles/12/1953/2020/" target="_blank" rel="noopener noreferrer">Theobald et al., 2020</a>
(4) <a href="https://zenodo.org/record/5338803#.ZCP2texBzJ8" target="_blank" rel="noopener noreferrer">Theobald et al., 2021 - Data set</a>. Data are available on <a href="https://www.arcgis.com/home/item.html?id=68d51c21d04a4046aa0b51dc39423c31" target="_blank" rel="noopener noreferrer">ArcGIS Online</a>.</p>`,
      showDetails: false,
      showLayer: false,
      url: INTRUSION_HUMAN_PRESSURES_TILE_LAYER,
      speciesCount: 0,
    },
  ]);

  const [marineUsePressureLayers, setMarineUsePressureLayers] = useState([
    {
      type: 'marineUsePressure',
      id: MARINE_LAND_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Land-based drivers'),
      heatMapImage: '',
      details: `<p>Source: (1) <a href="https://www.nature.com/articles/ncomms8615" target="_blank" rel="noopener noreferrer">Halpern, Benjamin S., et al., 2015</a> (2) <a href="https://onlinelibrary.wiley.com/doi/abs/10.1111/gcb.14549" target="_blank" rel="noopener noreferrer">Kennedy, Christina M., et al., 2019</a></p>`,
      showDetails: false,
      showLayer: false,
      url: MARINE_LAND_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
      speciesCount: 0,
    },
    {
      type: 'marineUsePressure',
      id: MARINE_OCEAN_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Ocean-based drivers'),
      heatMapImage: '',
      details: `<p>Source: (1) <a href="https://www.nature.com/articles/ncomms8615" target="_blank" rel="noopener noreferrer">Halpern, Benjamin S., et al., 2015</a> (2) <a href="https://onlinelibrary.wiley.com/doi/abs/10.1111/gcb.14549" target="_blank" rel="noopener noreferrer">Kennedy, Christina M., et al., 2019</a></p>`,
      showDetails: false,
      showLayer: false,
      url: MARINE_OCEAN_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
      speciesCount: 0,
    },
    {
      type: 'marineUsePressure',
      id: COMMERCIAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Commercial fishing'),
      heatMapImage: '',
      details: `<p>Source: (1) <a href="https://www.nature.com/articles/ncomms8615" target="_blank" rel="noopener noreferrer">Halpern, Benjamin S., et al., 2015</a> (2) <a href="https://onlinelibrary.wiley.com/doi/abs/10.1111/gcb.14549" target="_blank" rel="noopener noreferrer">Kennedy, Christina M., et al., 2019</a></p>`,
      showDetails: false,
      showLayer: false,
      url: COMMERCIAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
      speciesCount: 0,
    },
    {
      type: 'marineUsePressure',
      id: ARTISANAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Artisnal fishing'),
      heatMapImage: '',
      details: `<p>Source: (1) <a href="https://www.nature.com/articles/ncomms8615" target="_blank" rel="noopener noreferrer">Halpern, Benjamin S., et al., 2015</a> (2) <a href="https://onlinelibrary.wiley.com/doi/abs/10.1111/gcb.14549" target="_blank" rel="noopener noreferrer">Kennedy, Christina M., et al., 2019</a></p>`,
      showDetails: false,
      showLayer: false,
      url: ARTISANAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
      speciesCount: 0,
    },
  ]);

  const [socioEconomicLayers, setSocioEconomicLayers] = useState([
    {
      type: 'socioEconomic',
      id: POVERTY_AND_DEPRIVATION_LAYER,
      label:
        countryISO.toUpperCase() === 'PER'
          ? t('Pobreza y privación')
          : t('Poverty and Deprivation'),
      heatMapImage: '',
      details: ``,
      showDetails: false,
      showLayer: false,
      url: POVERTY_AND_DEPRIVATION_LAYER,
      speciesCount: 0,
    },
  ]);

  const [landCoverLayers, setLandCoverLayers] = useState([
    {
      type: 'landCover',
      id: LAND_COVER_LAYER,
      label:
        countryISO.toUpperCase() === 'PER'
          ? t('Capas de cubierta del suelo (2022)')
          : t('Land cover (2022)'),
      heatMapImage: '',
      details: ``,
      showDetails: false,
      showLayer: false,
      url: LAND_COVER_LAYER,
      speciesCount: 0,
    },
  ]);

  const displayLayer = async (layer) => {
    if (!layer.showLayer) {
      if (layer.portalId) {
        const classType = countryISO === 'PER' ? 'PER_LAYER' : '';
        const featureLayer = await EsriFeatureService.getFeatureLayer(
          layer.portalId,
          countryISO,
          layer.id,
          classType
        );
        setRegionLayers((rl) => ({
          ...rl,
          [layer.id]: featureLayer,
        }));

        map.add(featureLayer, map.layers.length - layerIndex);

        view.whenLayerView(featureLayer).then(() => {
          const { renderer } = featureLayer;
          const { uniqueValueGroups } = renderer;
          const layerInfo = {
            ...layer,
            classes: uniqueValueGroups[0].classes,
          };

          setMapLegendLayers((ml) => [layerInfo, ...ml]);
        });
      } else if (layer.url) {
        const mapLayers = LAYERS_URLS[layer.url];
        let promises;
        if (Array.isArray(mapLayers)) {
          promises = mapLayers.map(
            async (mapLayer) =>
              new TileLayer({
                url: mapLayer,
                id: layer.id,
                outFields: ['*'],
              })
          );
        } else {
          promises = [
            new TileLayer({
              url: mapLayers,
              id: layer.id,
              outFields: ['*'],
            }),
          ];
        }

        const newLayers = await Promise.all(promises);

        newLayers.forEach((newLayer) => {
          setRegionLayers((rl) => ({
            ...rl,
            [layer.id]: newLayer,
          }));

          map.add(newLayer, map.layers.length - layerIndex);
        });

        setMapLegendLayers((ml) => [layer, ...ml]);
      }
    } else {
      const layerToRemove = map.layers.items.filter(
        (mapLayer) => mapLayer.id === layer.id
      );

      setMapLegendLayers((ml) => {
        const filtered = ml.filter(
          (l) => l.id !== layer.id || l.parentId !== layer.parentId
        );
        return filtered;
      });

      setRegionLayers((rl) => {
        const { [layer.id]: name, ...rest } = rl;
        return rest;
      });

      layerToRemove.forEach((remove) => {
        map.remove(remove);
      });
    }

    if (layer.type === 'landUsePressure') {
      setLandUsePressureLayers((prevLayers) =>
        prevLayers.map((l) =>
          l.id === layer.id ? { ...l, showLayer: !layer.showLayer } : l
        )
      );
    } else if (layer.type === 'marineUsePressure') {
      setMarineUsePressureLayers((prevLayers) =>
        prevLayers.map((l) =>
          l.id === layer.id ? { ...l, showLayer: !layer.showLayer } : l
        )
      );
    } else if (layer.type === 'landCover') {
      setLandCoverLayers((prevLayers) =>
        prevLayers.map((l) =>
          l.id === layer.id ? { ...l, showLayer: !layer.showLayer } : l
        )
      );
    } else if (layer.type === 'socioEconomic') {
      setSocioEconomicLayers((prevLayers) =>
        prevLayers.map((l) =>
          l.id === layer.id ? { ...l, showLayer: !layer.showLayer } : l
        )
      );
    } else {
      setRichnessLayers((prevLayers) =>
        prevLayers.map((l) =>
          l.id === layer.id ? { ...l, showLayer: !layer.showLayer } : l
        )
      );
    }
  };

  const showDetails = (layer) => {
    if (layer.type === 'landUsePressure') {
      setLandUsePressureLayers((prevLayers) =>
        prevLayers.map((l) =>
          l.id === layer.id ? { ...l, showDetails: !l.showDetails } : l
        )
      );
    } else if (layer.type === 'marineUsePressure') {
      setMarineUsePressureLayers((prevLayers) =>
        prevLayers.map((l) =>
          l.id === layer.id ? { ...l, showDetails: !l.showDetails } : l
        )
      );
    } else if (layer.type === 'landCover') {
      setLandCoverLayers((prevLayers) =>
        prevLayers.map((l) =>
          l.id === layer.id ? { ...l, showDetails: !l.showDetails } : l
        )
      );
    } else if (layer.type === 'socioEconomic') {
      setSocioEconomicLayers((prevLayers) =>
        prevLayers.map((l) =>
          l.id === layer.id ? { ...l, showDetails: !l.showDetails } : l
        )
      );
    } else {
      setRichnessLayers((prevLayers) =>
        prevLayers.map((l) =>
          l.id === layer.id ? { ...l, showDetails: !l.showDetails } : l
        )
      );
    }
  };

  const getSidebarLegend = (layer) => {
    if (layer.type === 'landUsePressure') {
      return (
        <SidebarLegend
          legendItem={LAND_HUMAN_PRESSURES_SLUG}
          className={styles.legendContainer}
        />
      );
    } else if (layer.type === 'marineUsePressure') {
      return (
        <SidebarLegend
          legendItem={MARINE_HUMAN_PRESSURES_SLUG}
          className={styles.legendContainer}
        />
      );
    } else if (layer.type === 'landCover') {
      return (
        <SidebarLegend
          legendItem={LAND_COVER_SLUG}
          className={styles.legendContainer}
        />
      );
    } else if (layer.type === 'socioEconomic') {
      return (
        <SidebarLegend
          legendItem={SOCIO_ECONOMIC_SLUG}
          className={styles.legendContainer}
        />
      );
    } else {
      return (
        <SidebarLegend
          legendItem={BIODIVERSITY_SLUG}
          className={styles.legendContainer}
        />
      );
    }
  };

  useEffect(() => {
    if (countryISO.toLowerCase() === 'per') {
      setLandCoverLayers((prevLayers) => [...prevLayers, ...PERU_LAYERS]);
    }
  }, [countryISO]);

  useEffect(() => {
    setRichnessLayers((prevLayers) =>
      prevLayers.map((layer) => {
        const legendInfo = richnessRarityLegendInfo?.find(
          (info) => info.layerslug === layer.id
        );
        if (legendInfo) {
          return {
            ...layer,
            details: `${legendInfo.description}<br/> ${legendInfo.disclaimer}`,
          };
        }
        return layer;
      })
    );
  }, [richnessRarityLegendInfo]);

  return (
    <div
      className={cx(styles.container, {
        [styles.collapse]: collapse,
      })}
    >
      <button
        type="button"
        className={styles.titleWrapper}
        aria-label={collapse ? t('Expand legend') : t('Collapse legend')}
        onClick={() => setCollapse(!collapse)}
      >
        <span className={styles.title}>{t('Data Layers')}</span>
        <ArrowIcon
          className={cx(styles.arrowIcon, {
            [styles.isOpened]: collapse,
          })}
        />
      </button>
      <ul className={styles.layers}>
        <li>
          <div className={styles.dataLayer}>
            <div className={styles.layer}>
              <div className={styles.title}>
                <span className={styles.label}>
                  {countryISO.toUpperCase() === 'PER' ? (
                    <b>{t('Capas de biodiversidad')}</b>
                  ) : (
                    <b>{t('Biodiversity Layers')}</b>
                  )}
                </span>
              </div>
            </div>
          </div>
        </li>
        {richnessLayers &&
          Object.values(richnessLayers).map((layer) => (
            <li key={`${layer.id}-${layer.label}`}>
              <div className={styles.dataLayer}>
                <div className={styles.layer}>
                  <div className={styles.title}>
                    <span className={styles.label}>{layer.label}</span>
                    <ArrowIcon className={styles.arrowIcon} />
                  </div>
                  <Switch onChange={() => displayLayer(layer)} />
                </div>
                {layer.id !== LAYER_OPTIONS.INDIGENOUS_LANDS &&
                  getSidebarLegend(layer)}
                {layer.details && (
                  <div className={styles.details}>
                    <button
                      className={styles.view}
                      type="button"
                      onClick={() => showDetails(layer)}
                      aria-label="Collapse details"
                    >
                      <span>{t('View details')}</span>
                      <ArrowIcon
                        className={cx(styles.arrowIcon, {
                          [styles.isOpened]: !layer.showDetails,
                        })}
                      />
                    </button>
                    {layer.showDetails && (
                      <p dangerouslySetInnerHTML={{ __html: layer.details }} />
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        <li>
          <div className={styles.dataLayer}>
            <div className={styles.layer}>
              <div className={styles.title}>
                <span className={styles.label}>
                  {countryISO.toUpperCase() === 'PER' ? (
                    <b>{t('Capas de presión por uso del suelo')}</b>
                  ) : (
                    <b>{t('Land Use Pressure Layers')}</b>
                  )}
                </span>
              </div>
            </div>
          </div>
        </li>
        {landUsePressureLayers &&
          Object.values(landUsePressureLayers).map((layer) => (
            <li key={`${layer.id}-${layer.label}`}>
              <div className={styles.dataLayer}>
                <div className={styles.layer}>
                  <div className={styles.title}>
                    <span className={styles.label}>{layer.label}</span>
                    <ArrowIcon className={styles.arrowIcon} />
                  </div>
                  <Switch onChange={() => displayLayer(layer)} />
                </div>
                {layer.id !== LAYER_OPTIONS.INDIGENOUS_LANDS &&
                  getSidebarLegend(layer)}
                {layer.details && (
                  <div className={styles.details}>
                    <button
                      className={styles.view}
                      type="button"
                      onClick={() => showDetails(layer)}
                      aria-label="Collapse details"
                    >
                      <span>{t('View details')}</span>
                      <ArrowIcon
                        className={cx(styles.arrowIcon, {
                          [styles.isOpened]: !layer.showDetails,
                        })}
                      />
                    </button>
                    {layer.showDetails && (
                      <p dangerouslySetInnerHTML={{ __html: layer.details }} />
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        <li>
          <div className={styles.dataLayer}>
            <div className={styles.layer}>
              <div className={styles.title}>
                <span className={styles.label}>
                  {countryISO.toUpperCase() === 'PER' ? (
                    <b>{t('Capas de presión para uso marino')}</b>
                  ) : (
                    <b>{t('Marine Use Pressure Layers')}</b>
                  )}
                </span>
              </div>
            </div>
          </div>
        </li>
        {marineUsePressureLayers &&
          Object.values(marineUsePressureLayers).map((layer) => (
            <li key={`${layer.id}-${layer.label}`}>
              <div className={styles.dataLayer}>
                <div className={styles.layer}>
                  <div className={styles.title}>
                    <span className={styles.label}>{layer.label}</span>
                    <ArrowIcon className={styles.arrowIcon} />
                  </div>
                  <Switch onChange={() => displayLayer(layer)} />
                </div>
                {layer.id !== LAYER_OPTIONS.INDIGENOUS_LANDS &&
                  getSidebarLegend(layer)}
                {layer.details && (
                  <div className={styles.details}>
                    <button
                      className={styles.view}
                      type="button"
                      onClick={() => showDetails(layer)}
                      aria-label="Collapse details"
                    >
                      <span>{t('View details')}</span>
                      <ArrowIcon
                        className={cx(styles.arrowIcon, {
                          [styles.isOpened]: !layer.showDetails,
                        })}
                      />
                    </button>
                    {layer.showDetails && (
                      <p dangerouslySetInnerHTML={{ __html: layer.details }} />
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        <li>
          <div className={styles.dataLayer}>
            <div className={styles.layer}>
              <div className={styles.title}>
                <span className={styles.label}>
                  {countryISO.toUpperCase() === 'PER' ? (
                    <b>{t('Capas de cubierta/uso del suelo')}</b>
                  ) : (
                    <b>{t('Land Cover/Use Layers')}</b>
                  )}
                </span>
              </div>
            </div>
          </div>
        </li>
        {landCoverLayers &&
          Object.values(landCoverLayers).map((layer) => (
            <li key={`${layer.id}-${layer.label}`}>
              <div className={styles.dataLayer}>
                <div className={styles.layer}>
                  <div className={styles.title}>
                    <span className={styles.label}>{layer.label}</span>
                    <ArrowIcon className={styles.arrowIcon} />
                  </div>
                  <Switch onChange={() => displayLayer(layer)} />
                </div>
              </div>
            </li>
          ))}
        {countryISO === 'PER' && (
          <li>
            <div className={styles.dataLayer}>
              <div className={styles.layer}>
                <div className={styles.title}>
                  <span className={styles.label}>
                    <b>{t('Socio-Economic')}</b>
                  </span>
                </div>
              </div>
            </div>
          </li>
        )}
        {countryISO === 'PER' &&
          socioEconomicLayers &&
          Object.values(socioEconomicLayers).map((layer) => (
            <li key={`${layer.id}-${layer.label}`}>
              <div className={styles.dataLayer}>
                <div className={styles.layer}>
                  <div className={styles.title}>
                    <span className={styles.label}>{layer.label}</span>
                    <ArrowIcon className={styles.arrowIcon} />
                  </div>
                  <Switch onChange={() => displayLayer(layer)} />
                </div>
                {getSidebarLegend(layer)}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default LayerLegendComponent;
