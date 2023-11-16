import React from 'react';
import { connect } from 'react-redux';

import * as urlActions from 'actions/url-actions';

import { activateLayersOnLoad } from 'utils/layer-manager-utils';

import { layersConfig } from 'constants/mol-layers-configs';

import { setBasemap } from '../../utils/layer-manager-utils.js';

import LandingComponent from './landing-component.jsx';
import mapStateToProps from './landing-selectors';

const actions = { ...urlActions };

function LandingContainer(props) {
  const { changeGlobe } = props;
  const handleGlobeUpdating = (updating) =>
    changeGlobe({ isGlobeUpdating: updating });
  const handleMapLoad = (map, activeLayers) => {
    setBasemap({
      map,
      surfaceColor: '#070710',
      layersArray: [],
    });
    activateLayersOnLoad(map, activeLayers, layersConfig);
  };

  return (
    <LandingComponent
      handleMapLoad={handleMapLoad}
      handleGlobeUpdating={handleGlobeUpdating}
      {...props}
    />
  );
}

export default connect(mapStateToProps, actions)(LandingContainer);
