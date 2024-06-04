import React from 'react';

import MapView from '../../../components/map-view';
import DashboardSidebar from '../../sidebars/dashboard-sidebar/component';

const { REACT_APP_ARGISJS_API_VERSION: API_VERSION } = process.env;

function DashboardViewComponent() {
  return (
    <MapView
      mapName="dashboard"
      loaderOptions={{ url: `https://js.arcgis.com/${API_VERSION}` }}
    >
      <DashboardSidebar />
    </MapView>
  );
}

export default DashboardViewComponent;
