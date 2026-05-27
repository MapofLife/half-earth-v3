import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

import DashboardComponent from './dashboard-component.jsx';

const dashboardViewMock = vi.fn(() => <div data-testid="dashboard-view" />);

vi.mock('../../containers/views/dashboard-view/dashboard-view', () => ({
  default: (props) => dashboardViewMock(props),
}));

vi.mock('../../components/dashboard-login', () => ({
  default: () => <div data-testid="dashboard-login" />,
}));

vi.mock('context/authorization', () => ({
  AuthorizationContext: {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children({}),
  },
}));

describe('DashboardComponent', () => {
  it('passes through props and wires onMapLoad with active layers', () => {
    const handleMapLoad = vi.fn();
    const activeLayers = [{ id: 'a1' }];

    render(
      <DashboardComponent
        activeLayers={activeLayers}
        handleMapLoad={handleMapLoad}
        countryISO="PER"
      />
    );

    expect(dashboardViewMock).toHaveBeenCalledTimes(1);
    const passedProps = dashboardViewMock.mock.calls[0][0];
    const mapRef = { id: 'map-1' };

    passedProps.onMapLoad(mapRef);

    expect(handleMapLoad).toHaveBeenCalledWith(mapRef, activeLayers);
    expect(passedProps.countryISO).toBe('PER');
  });
});
