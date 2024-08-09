import React from 'react';

import cx from 'classnames';

import Logo from 'components/half-earth-logo';

import uiStyles from 'styles/ui.module.scss';

import DashboardView from '../../containers/views/dashboard-view/dashboard-view';

function DashboardComponent(props) {
  const {
    countryISO,
    countryName,
  } = props;
  return (
    <>
      <Logo className={cx(uiStyles.halfEarthLogoTopLeft)} />
      <DashboardView
        countryISO={countryISO}
        countryName={countryName}
        {...props}
      />
    </>
  );
}

export default DashboardComponent;
