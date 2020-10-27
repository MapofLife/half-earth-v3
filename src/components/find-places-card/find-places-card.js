import React from 'react';
import { connect } from 'react-redux';
import { openPlacesSearchAnalyticsEvent, searchTermsAnalyticsEvent } from 'actions/google-analytics-actions';
import urlActions from 'actions/url-actions';
import Component from './find-places-card-component';
import { useSearchWidgetLogic } from 'hooks/esri';

const actions = { openPlacesSearchAnalyticsEvent, searchTermsAnalyticsEvent, ...urlActions };

const FindPlacesContainer = (props) => {
  const { view, openPlacesSearchAnalyticsEvent, searchTermsAnalyticsEvent, searchWidgetConfig } = props;

  const { handleOpenSearch, handleCloseSearch, searchWidget } = useSearchWidgetLogic(
    view,
    openPlacesSearchAnalyticsEvent,
    searchTermsAnalyticsEvent,
    searchWidgetConfig
  );

  return (
    <Component
      showCloseButton={!!searchWidget}
      handleOpenSearch={handleOpenSearch}
      handleCloseSearch={handleCloseSearch}
      {...props}
    />
  );
}

export default connect(null, actions)(FindPlacesContainer);
