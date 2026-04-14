import React, { useContext, useEffect } from 'react';

import DashboardLogin from '../../components/dashboard-login';
import DashboardView from '../../containers/views/dashboard-view/dashboard-view';
import { AuthorizationContext } from 'context/authorization'

function DashboardComponent(props) {
  const { activeLayers, handleMapLoad, countryISO } = props;
  // const { isAuthorized } = useContext(AuthorizationContext);

  const countriesRequiringLogin = ['EE', 'GUY', 'COD', 'GIN'];

  // useEffect(() => {
  //   // setCountryISO(countryISO);
  //   if (!countriesRequiringLogin.includes(countryISO.toUpperCase())) {
  //     setIsAuthorized(true);
  //   }
  // }, []);

  return (
    <>
      {/* {!isAuthorized && countriesRequiringLogin.includes(countryISO.toUpperCase()) && (
        <DashboardLogin {...props} />
      )}
      {isAuthorized && ( */}
        <DashboardView
          onMapLoad={(map) => handleMapLoad(map, activeLayers)}
          {...props}
        />
      {/* )} */}
    </>
  );
}

export default DashboardComponent;
