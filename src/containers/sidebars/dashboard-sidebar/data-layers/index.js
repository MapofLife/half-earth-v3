import React, { useState } from 'react';
import { connect } from 'react-redux';
import metadataActions from 'redux_modules/metadata';

import * as urlActions from 'actions/url-actions';

import { layerManagerToggle } from 'utils/layer-manager-utils';

import { LAYERS_CATEGORIES } from 'constants/mol-layers-configs';

import DataLayerComponent from './data-layers-component';

const actions = { ...metadataActions, ...urlActions };

function DataLayerContainer(props) {
  const { activeLayers, changeGlobe } = props;

  const [selectedLayers, setSelectedLayers] = useState([]);

  const handleLayerToggle = (option) => {
    if (selectedLayers.find((layer) => layer === option.value)) {
      setSelectedLayers(
        selectedLayers.filter((layer) => layer !== option.value)
      );
    } else {
      setSelectedLayers([...selectedLayers, option.value]);
    }

    layerManagerToggle(
      option.value,
      activeLayers,
      changeGlobe,
      LAYERS_CATEGORIES.PROTECTION
    );
  };

  return (
    <DataLayerComponent
      selectedLayers={selectedLayers}
      handleLayerToggle={handleLayerToggle}
      {...props}
    />
  );
}

export default connect(null, actions)(DataLayerContainer);
