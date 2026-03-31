import React, { useEffect } from 'react';

import DashboardLogin from '../../components/dashboard-login';
import DashboardView from '../../containers/views/dashboard-view/dashboard-view';

function DashboardComponent(props) {
  const { activeLayers, handleMapLoad, loggedIn, setLoggedIn, countryISO } =
    props;

  const countriesRequiringLogin = ['EE', 'GUY', 'COD', 'GIN'];

  useEffect(() => {
    if (!countriesRequiringLogin.includes(countryISO.toUpperCase())) {
      setLoggedIn(true);
    }
  }, []);

  return (
    <>
      {!loggedIn && countriesRequiringLogin.includes(countryISO.toUpperCase()) && (
        <DashboardLogin setLoggedIn={setLoggedIn} {...props} />
      )}
      {loggedIn && (
        <DashboardView
          onMapLoad={(map) => handleMapLoad(map, activeLayers)}
          {...props}
        />
      )}
    </>
  );
}

export default DashboardComponent;
