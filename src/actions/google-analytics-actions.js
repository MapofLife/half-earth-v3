
import { createAction } from 'redux-tools';
import { VIEW_MODE } from  'constants/google-analytics-constants';

export const addLayerAnalyticsEvent = createAction('addLayer', null, ({ slug, query }) => {
  const viewMode = query && query.viewMode || VIEW_MODE.GLOBE;
  return { analytics: [ viewMode, 'Add layer', `${slug}` ] };
});

export const removeLayerAnalyticsEvent = createAction('removeLayer', null, ({ slug, query }) => {
  const viewMode = query && query.viewMode || VIEW_MODE.GLOBE;
  return { analytics: [ viewMode, 'Remove layer', `${slug}` ] };
});

export const changeLayerOpacityAnalyticsEvent = createAction('changeOpacity', null, ({ slug, query }) => {
  const opacity = query && query.opacity;
  return { analytics: [ VIEW_MODE.LEGEND, 'Change layer opacity', `${slug}`, opacity ] };
});

export const openLayerInfoModalAnalyticsEvent = createAction('openLayerInfoModal', null, ({ slug, query }) => {
  const viewMode = query && query.viewMode || VIEW_MODE.GLOBE;
  return { analytics: [ viewMode, 'Open layer info modal', `${slug}`] };
});

export const openHalfEarthMeterAnalyticsEvent = createAction('openHalfEarthMeter', null, () => {
  return { analytics: [ VIEW_MODE.GLOBE, 'Open half earth meter'] };
});

export const openAboutPageAnalyticsEvent = createAction('openAboutPage', null, () => {
  return { analytics: [ VIEW_MODE.GLOBE, 'Open about page'] };
});

export const clickFindMyPositionAnalyticsEvent = createAction('findMyPosition', null, () => {
  return { analytics: [ VIEW_MODE.GLOBE, 'Click find my position'] };
});

export const toggleFullScreenAnalyticsEvent = createAction('enableFullScreen', null, ({ isFullscreenActive }) => {
  const fullscreenState = isFullscreenActive ? 'enabled' : 'disabled';
  return {analytics: [ VIEW_MODE.GLOBE, 'Toggle fullscreen mode', fullscreenState] };
});


export default {
  addLayerAnalyticsEvent,
  removeLayerAnalyticsEvent,
  changeLayerOpacityAnalyticsEvent,
  openLayerInfoModalAnalyticsEvent,
  openHalfEarthMeterAnalyticsEvent,
  openAboutPageAnalyticsEvent,
  clickFindMyPositionAnalyticsEvent,
  toggleFullScreenAnalyticsEvent
}