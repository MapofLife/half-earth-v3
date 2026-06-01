import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import DashboardView from './dashboard-view';

const dashboardViewComponentMock = vi.fn(() => (
  <div data-testid="dashboard-view-component" />
));

vi.mock('./dashboard-view-component', () => ({
  default: (props) => dashboardViewComponentMock(props),
}));

describe('DashboardView container', () => {
  it('renders component with all props', () => {
    const props = {
      countryISO: 'PER',
      selectedIndex: 1,
      extra: 'value',
    };

    render(<DashboardView {...props} />);

    expect(screen.getByTestId('dashboard-view-component')).toBeInTheDocument();
    expect(dashboardViewComponentMock).toHaveBeenCalledWith(
      expect.objectContaining(props)
    );
  });
});
