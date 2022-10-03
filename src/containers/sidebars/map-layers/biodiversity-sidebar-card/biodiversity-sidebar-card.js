/* eslint-disable max-len */
import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import metadataActions from 'redux_modules/metadata';

import { useLocale } from '@transifex/react';

import * as urlActions from 'actions/url-actions';

import {
  batchToggleLayers,
  layerManagerToggle,
  flyToLayerExtent,
} from 'utils/layer-manager-utils';

import isEmpty from 'lodash/isEmpty';

import usePrevious from 'hooks/use-previous';

import ContentfulService from 'services/contentful';

import {
  GROUPED_OPTIONS,
  getLayersResolution,
  getLayersToggleConfig,
  getResolutionOptions,
  LAYER_VARIANTS,
  TERRESTRIAL,
  MARINE,
  DEFAULT_RESOLUTIONS,
} from 'constants/biodiversity-layers-constants';
// import { ALL_TAXA_PRIORITY } from 'constants/layers-slugs';
import { LAYERS_CATEGORIES, layersConfig } from 'constants/mol-layers-configs';

import Component from './biodiversity-sidebar-card-component';
import mapStateToProps from './biodiversity-sidebar-card-selectors';

const actions = { ...metadataActions, ...urlActions };
function BiodiversitySidebarCard(props) {
  const locale = useLocale();
  const allLayersResolutions = useMemo(() => getLayersResolution(), [locale]);
  const layersToggleConfig = useMemo(() => getLayersToggleConfig(), [locale]);
  const layersResolution = useMemo(() => getLayersResolution(), [locale]);

  const {
    changeGlobe,
    changeUI,
    activeLayers,
    biodiversityLayerVariant,
    view,
  } = props;
  const { PRIORITY, RICHNESS, RARITY } = LAYER_VARIANTS;
  const previousBiodiversityLayerVariant = usePrevious(
    biodiversityLayerVariant
  );
  const [cardMetadata, setCardMetadata] = useState({
    [PRIORITY]: {},
    [RICHNESS]: {},
    [RARITY]: {},
  });

  const [showCard, setShowCard] = useState(true);

  const [selectedTerrestrialLayer, setSelectedTerrestrialLayer] = useState();
  const [selectedMarineLayer, setSelectedMarineLayer] = useState();

  const resolutionOptions = useMemo(() => getResolutionOptions(), [locale]);

  const [selectedResolutions, setSelectedResolutions] =
    useState(DEFAULT_RESOLUTIONS);

  // Get biodiversity card metadata
  useEffect(() => {
    if (isEmpty(cardMetadata[biodiversityLayerVariant])) {
      ContentfulService.getMetadata(biodiversityLayerVariant, locale).then(
        (data) => {
          setCardMetadata({
            ...cardMetadata,
            [biodiversityLayerVariant]: {
              ...data,
            },
          });
        }
      );
    }
  }, [biodiversityLayerVariant, locale]);

  // Default to default resolution if we don't have terrestrial one
  useEffect(() => {
    const resolutionExists = (category) =>
      allLayersResolutions[biodiversityLayerVariant][category].some(
        (res) => res.slug === selectedResolutions[category]
      );
    if (!resolutionExists(TERRESTRIAL)) {
      setSelectedResolutions(DEFAULT_RESOLUTIONS);
    }
  }, [biodiversityLayerVariant, allLayersResolutions]);

  const handleLayerToggle = (option, category) => {
    const setSelectedLayer =
      category === TERRESTRIAL
        ? setSelectedTerrestrialLayer
        : setSelectedMarineLayer;
    const selectedLayer =
      category === TERRESTRIAL ? selectedTerrestrialLayer : selectedMarineLayer;
    const layer = layersConfig[option.layer];
    if (selectedLayer === option.layer) {
      layerManagerToggle(
        option.layer,
        activeLayers,
        changeGlobe,
        LAYERS_CATEGORIES.BIODIVERSITY
      );
      setSelectedLayer(null);
    } else if (selectedLayer) {
      if (layer.bbox) flyToLayerExtent(layer.bbox, view);
      batchToggleLayers(
        [selectedLayer, option.layer],
        activeLayers,
        changeGlobe,
        LAYERS_CATEGORIES.BIODIVERSITY
      );
      setSelectedLayer(option.layer);
    } else {
      if (layer.bbox) flyToLayerExtent(layer.bbox, view);
      layerManagerToggle(
        option.layer,
        activeLayers,
        changeGlobe,
        LAYERS_CATEGORIES.BIODIVERSITY
      );
      setSelectedLayer(option.layer);
    }
  };

  // Select layers when we change resolutions
  useEffect(() => {
    if (!previousBiodiversityLayerVariant) return;
    const activeBiodiversityLayers = activeLayers
      .filter((l) => l.category === LAYERS_CATEGORIES.BIODIVERSITY)
      .map((l) => l.title);
    const resolution = selectedResolutions[TERRESTRIAL];
    const defaultResolutionLayers =
      layersToggleConfig[biodiversityLayerVariant][TERRESTRIAL][
        DEFAULT_RESOLUTIONS[TERRESTRIAL]
      ];
    const availableLayers =
      layersToggleConfig[biodiversityLayerVariant][TERRESTRIAL][resolution];
    const layerTaxa = activeBiodiversityLayers.length
      ? activeBiodiversityLayers[0].slice(
          0,
          activeBiodiversityLayers[0].indexOf('-')
        )
      : '';
    const hasMatchingLayer =
      availableLayers &&
      availableLayers.find((layer) => layer.value.includes(layerTaxa));

    if (hasMatchingLayer) {
      // select matching layer on selected variant
      handleLayerToggle(hasMatchingLayer);
    } else if (availableLayers) {
      // select first element if there's no matching layer
      handleLayerToggle(availableLayers[0]);
    } else {
      // select first element if there's no maching resolution
      handleLayerToggle(defaultResolutionLayers[0]);
    }
  }, [
    biodiversityLayerVariant,
    selectedResolutions,
    previousBiodiversityLayerVariant,
    layersToggleConfig,
  ]);

  const handleTabSelection = (slug) => {
    const { onboardingStep, onboardingType } = props;
    changeUI({
      biodiversityLayerVariant: slug,
      onboardingStep: onboardingStep && onboardingStep + 1,
      waitingInteraction: onboardingType && false,
    });
  };

  const handleClearAndAddLayers = (bioLayerIds, layerIds) => {
    batchToggleLayers(
      bioLayerIds.concat(layerIds),
      activeLayers,
      changeGlobe,
      LAYERS_CATEGORIES.BIODIVERSITY
    );
  };

  const handleCloseCard = () => {
    setShowCard(false);
  };

  // TODO: Refactor
  const layerCategoryOptions = (category) => {
    const parsedGroupOptions = (layerOptions) => {
      const groupedOptions = GROUPED_OPTIONS(layerOptions);
      const groupedOptionsMultiple = groupedOptions
        .filter((o) => !!o.options.length)
        .find((o) => o.options.length > 1);

      if (!groupedOptionsMultiple) {
        return groupedOptions.map((go) => {
          return {
            ...go,
            label: null,
          };
        });
      }
      return groupedOptions;
    };

    const resolutionsForSelectedCategory =
      layersToggleConfig[biodiversityLayerVariant][category];
    const layersForSelectedResolution =
      resolutionsForSelectedCategory &&
      resolutionsForSelectedCategory[selectedResolutions[category]];

    if (resolutionsForSelectedCategory && layersForSelectedResolution) {
      const layerAll = layersForSelectedResolution.filter(
        (l) => l.name === 'All'
      );

      const layersStartingWithAll = layersForSelectedResolution
        .filter((l) => l.name.startsWith('All '))
        .sort((a, b) => a.name.localeCompare(b.name));

      const otherLayers = layersForSelectedResolution
        .filter((l) => l.name !== 'All')
        .filter((l) => !l.name.startsWith('All '))
        .sort((a, b) => a.name.localeCompare(b.name));

      const allLayersAlphabetically = layerAll.concat(
        layersStartingWithAll,
        otherLayers
      );

      return parsedGroupOptions(allLayersAlphabetically);
    }
    return [];
  };

  return (
    <Component
      handleLayerToggle={handleLayerToggle}
      selectedResolutionOptions={{
        [TERRESTRIAL]: resolutionOptions[selectedResolutions[TERRESTRIAL]],
        [MARINE]: resolutionOptions[selectedResolutions[MARINE]],
      }}
      setSelectedResolutions={setSelectedResolutions}
      handleClearAndAddLayers={handleClearAndAddLayers}
      handleTabSelection={handleTabSelection}
      cardMetadata={cardMetadata[biodiversityLayerVariant]}
      showCard={showCard}
      handleCloseCard={handleCloseCard}
      layerOptions={{
        [TERRESTRIAL]: layerCategoryOptions(TERRESTRIAL),
        [MARINE]: layerCategoryOptions(MARINE),
      }}
      layersResolutionsOptions={layersResolution[biodiversityLayerVariant]}
      {...props}
    />
  );
}
export default connect(mapStateToProps, actions)(BiodiversitySidebarCard);
