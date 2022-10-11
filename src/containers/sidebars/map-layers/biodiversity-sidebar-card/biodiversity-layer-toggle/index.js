import React from 'react';
import { connect } from 'react-redux';
import metadataActions from 'redux_modules/metadata';

import { useLocale } from '@transifex/react';

import { layerToggleAnalytics } from 'actions/google-analytics-actions';

import { bringLayerToFront, bringLayerToBack } from 'utils/layer-manager-utils';

import mapStateToProps from './biodiversity-layer-toggle-selectors';
import Component from './component';

const actions = { ...metadataActions, layerToggleAnalytics };

function BiodiversityLayerToggle(props) {
  const { map, layerOptions } = props;
  const locale = useLocale();

  const handleInfoClick = (option) => {
    const { setModalMetadata } = props;
    setModalMetadata({
      slug: `${option.slug || option.value}`,
      locale,
      title: `${option.metadataTitle || option.name} metadata`,
      isOpen: true,
    });
  };

  const handleBringToBackClick = (e, layer) => {
    e.stopPropagation();
    bringLayerToBack(layer, map);
  };

  const handleBringToFrontClick = (e, layer) => {
    e.stopPropagation();
    bringLayerToFront(layer, map);
  };

  return (
    <Component
      handleInfoClick={handleInfoClick}
      handleBringToBackClick={handleBringToBackClick}
      handleBringToFrontClick={handleBringToFrontClick}
      groupedOptions={layerOptions}
      {...props}
    />
  );
}

export default connect(mapStateToProps, actions)(BiodiversityLayerToggle);