import React from 'react';
import Component from './local-species-card-component';
import { connect } from 'react-redux';
import { MODALS } from 'constants/ui-params';
import * as urlActions from 'actions/url-actions';
import { openSpeciesListAnalyticsEvent } from 'actions/google-analytics-actions';

const actions = {...urlActions, openSpeciesListAnalyticsEvent };

const LocalSpeciesCardContainer = (props) => {

  const toggleModal = () => {
    const { openedModal, changeUI, openSpeciesListAnalyticsEvent } = props;
    changeUI({ openedModal: !openedModal ? MODALS.SPECIES : null });
    if (!openedModal) {
      openSpeciesListAnalyticsEvent()
    }
  }

  return (
    <Component
      {...props}
      toggleModal={toggleModal}
    />
  )
}

export default connect(null, actions)(LocalSpeciesCardContainer);