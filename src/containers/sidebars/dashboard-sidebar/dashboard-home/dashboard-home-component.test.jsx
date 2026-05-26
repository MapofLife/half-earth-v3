import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import { NAVIGATION } from 'constants/dashboard-constants';
import DashboardHomeComponent from './dashboard-home-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

describe('DashboardHomeComponent', () => {
  it('renders content and routes clicks to section ids', () => {
    const setSelectedIndex = vi.fn();

    render(
      <LightModeContext.Provider value={{ lightMode: true }}>
        <DashboardHomeComponent setSelectedIndex={setSelectedIndex} />
      </LightModeContext.Provider>
    );

    fireEvent.click(screen.getByText('species'));
    fireEvent.click(screen.getByText('regions'));
    fireEvent.click(screen.getByText('indicators'));
    fireEvent.click(screen.getByText('tutorials'));

    expect(setSelectedIndex).toHaveBeenNthCalledWith(1, NAVIGATION.SPECIES);
    expect(setSelectedIndex).toHaveBeenNthCalledWith(2, NAVIGATION.REGION);
    expect(setSelectedIndex).toHaveBeenNthCalledWith(3, NAVIGATION.TRENDS);
    expect(setSelectedIndex).toHaveBeenNthCalledWith(4, NAVIGATION.INFO);
  });

  it('renders in dark mode context as well', () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <DashboardHomeComponent setSelectedIndex={vi.fn()} />
      </LightModeContext.Provider>
    );

    expect(
      screen.getByText('National Biodiversity Information System')
    ).toBeInTheDocument();
  });
});
