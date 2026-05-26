import React from 'react';
import { render, screen } from '@testing-library/react';

import DashboardPopupComponent from './dashboard-popup-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

describe('DashboardPopupComponent', () => {
  it('renders all popup rows and values', () => {
    render(
      <DashboardPopupComponent
        DESIG="National Park"
        DESIG_TYPE="Protected"
        STATUS="Designated"
        STATUS_YR="2005"
      />
    );

    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('National Park')).toBeInTheDocument();
    expect(screen.getByText('Protected')).toBeInTheDocument();
    expect(screen.getByText('Designated')).toBeInTheDocument();
    expect(screen.getByText('2005')).toBeInTheDocument();
  });
});
