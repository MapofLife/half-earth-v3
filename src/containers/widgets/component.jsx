import React from 'react';

import cx from 'classnames';

import MinimapWidget from 'containers/widgets/minimap-widget';
import ZoomWidget from 'containers/widgets/zoom-widget';

import { useMobile } from 'constants/responsive';

import uiStyles from 'styles/ui.module.scss';

function WidgetsComponent({
  map,
  view,
  hideZoom = false,
  hideMiniMap = false,
  openedModal = null,
  isNotMapsList = true,
  hidden = false,
  onboardingStep,
}) {
  const isOnMobile = useMobile();
  const hiddenWidget = hidden || isOnMobile;
  return (
    <div
      className={cx({
        [uiStyles.onboardingOverlay]: typeof onboardingStep === 'number',
      })}
    >
      {!hideZoom && (onboardingStep === null || onboardingStep === undefined) && (
        <ZoomWidget
          map={map}
          view={view}
          isNotMapsList={isNotMapsList}
          hidden={hiddenWidget}
        />
      )}
      {!hideMiniMap && (
        <MinimapWidget
          map={map}
          view={view}
          hidden={hiddenWidget}
          openedModal={openedModal}
        />
      )}
    </div>
  );
}

export default WidgetsComponent;