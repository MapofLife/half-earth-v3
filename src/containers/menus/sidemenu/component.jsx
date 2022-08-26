import React from 'react';

import cx from 'classnames';
import { ReactComponent as HelpIcon } from 'icons/help.svg';
import { ReactComponent as SearchIcon } from 'icons/search-menu.svg';
import { ReactComponent as ShareIcon } from 'icons/share.svg';

import MinimapWidget from 'containers/menus/sidemenu/minimap-widget';
import ZoomControls from 'containers/menus/sidemenu/zoom-controls';

import Button from 'components/button';

import { useMobile } from 'constants/responsive';

import uiStyles from 'styles/ui.module.scss';

import styles from './styles.module';

function SideMenuComponent({
  map,
  view,
  hideZoom = false,
  hideMiniMap = true,
  openedModal = null,
  isNotMapsList = true,
  hidden = false,
  onboardingStep,
}) {
  const isOnMobile = useMobile();
  const hiddenWidget = hidden || isOnMobile;
  return (
    <div
      className={cx(styles.menuContainer, {
        [uiStyles.onboardingOverlay]: typeof onboardingStep === 'number',
      })}
    >
      <Button
        Icon={SearchIcon}
        type="icon-square"
        className={styles.searchBtn}
        handleClick={() => console.info('search')}
      />
      {!hideZoom && (onboardingStep === null || onboardingStep === undefined) && (
        <ZoomControls
          map={map}
          view={view}
          isNotMapsList={isNotMapsList}
          hidden={hiddenWidget}
        />
      )}
      <Button
        Icon={HelpIcon}
        type="icon-square"
        className={styles.shareBtn}
        handleClick={() => console.info('help')}
      />
      <Button
        Icon={ShareIcon}
        type="icon-square"
        className={styles.shareBtn}
        // handleClick={() => handleAoiShareToggle(id)}
      />
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

export default SideMenuComponent;
