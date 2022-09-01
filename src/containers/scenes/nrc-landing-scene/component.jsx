import React from 'react';

import loadable from '@loadable/component';

import cx from 'classnames';

import useIsCursorBottom from 'hooks/use-cursor-bottom';

import CountriesBordersLayer from 'containers/layers/countries-borders-layer';
import CountryLabelsLayer from 'containers/layers/country-labels-layer';
import ArcgisLayerManager from 'containers/managers/arcgis-layer-manager';
import GlobePageIndicator from 'containers/menus/globe-page-indicator';
import GlobesMenu from 'containers/menus/globes-menu';
import SideMenu from 'containers/menus/sidemenu';
import SoundButton from 'containers/onboarding/sound-btn';
import OnboardingTooltip from 'containers/onboarding/tooltip';
import NRCLandingSidebar from 'containers/sidebars/nrc-landing-sidebar';
import Widgets from 'containers/widgets';

import CountryEntryTooltip from 'components/country-entry-tooltip';
import Scene from 'components/scene';

import { LOCAL_SPATIAL_REFERENCE } from 'constants/scenes-constants';

import uiStyles from 'styles/ui.module';

import styles from './nrc-landing-scene-styles.module.scss';

const Spinner = loadable(() => import('components/spinner'));
const LabelsLayer = loadable(() => import('containers/layers/labels-layer'));

const {
  REACT_APP_ARGISJS_API_VERSION: API_VERSION,
  REACT_APP_FEATURE_NEW_MENUS: FEATURE_NEW_MENUS,
} = process.env;

function NrcLandingComponent({
  map,
  sceneMode,
  onMapLoad,
  countryISO,
  countryName,
  openedModal,
  activeLayers,
  sceneSettings,
  isLandscapeMode,
  isGlobeUpdating,
  onboardingType,
  onboardingStep,
  waitingInteraction,
  browsePage,
}) {
  const cursorBottom = useIsCursorBottom({ });
  return (
    <Scene
      sceneName="nrc-landing-scene"
      sceneSettings={sceneSettings}
      loaderOptions={{ url: `https://js.arcgis.com/${API_VERSION}` }}
      onMapLoad={onMapLoad}
      initialRotation
      disabled={
          !!onboardingType && onboardingStep !== 2 && onboardingStep !== 3
        }
      className={cx({
        [uiStyles.blurScene]: cursorBottom,
      })}
    >
      {onboardingType && <SoundButton />}
      <OnboardingTooltip className={styles.onboardingTooltip} />
      <ArcgisLayerManager activeLayers={activeLayers} />
      {isGlobeUpdating && <Spinner floating />}
      <CountryLabelsLayer
        activeLayers={activeLayers}
        countryISO={countryISO}
        isLandscapeMode={isLandscapeMode}
        countryName={countryName}
        sceneMode={sceneMode}
      />
      <CountriesBordersLayer
        countryISO={countryISO}
        isLandscapeMode={isLandscapeMode}
        spatialReference={LOCAL_SPATIAL_REFERENCE}
      />
      {FEATURE_NEW_MENUS && (
        <SideMenu
          activeLayers={activeLayers}
          openedModal={openedModal}
          onboardingStep={onboardingStep}
        />
      )}
      {FEATURE_NEW_MENUS && (
        <GlobePageIndicator />
      )}
      {!FEATURE_NEW_MENUS && (
        <Widgets
          activeLayers={activeLayers}
          openedModal={openedModal}
          onboardingStep={onboardingStep}
        />
      )}
      <CountryEntryTooltip
        countryISO={countryISO}
        countryName={countryName}
        onboardingStep={onboardingStep}
        onboardingType={onboardingType}
        waitingInteraction={waitingInteraction}
      />
      <NRCLandingSidebar
        activeLayers={activeLayers}
        map={map}
        onboardingStep={onboardingStep}
        onboardingType={onboardingType}
        waitingInteraction={waitingInteraction}
        className={cx({
          [uiStyles.blur]: cursorBottom,
        })}
      />
      <LabelsLayer activeLayers={activeLayers} />
      {FEATURE_NEW_MENUS && cursorBottom && (
        <GlobesMenu browsePage={browsePage} />
      )}
    </Scene>
  );
}

export default NrcLandingComponent;
