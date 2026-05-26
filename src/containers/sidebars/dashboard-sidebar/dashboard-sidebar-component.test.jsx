import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import { NAVIGATION } from 'constants/dashboard-constants';
import DashboardSidebar from './dashboard-sidebar-component';
import { removeRegionLayers } from 'utils/dashboard-utils';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

vi.mock('utils/dashboard-utils', () => ({
  removeRegionLayers: vi.fn(),
}));

vi.mock('components/dashboard-nav', () => ({
  default: () => <div data-testid="dashboard-nav" />,
}));
vi.mock('./dashboard-home', () => ({
  default: () => <div data-testid="dashboard-home" />,
}));
vi.mock('./species-filter', () => ({
  default: () => <div data-testid="species-filter" />,
}));
vi.mock('./regions-analysis', () => ({
  default: () => <div data-testid="regions-analysis" />,
}));
vi.mock('./species-home', () => ({
  default: () => <div data-testid="species-home" />,
}));
vi.mock('./data-layers', () => ({
  default: () => <div data-testid="data-layers" />,
}));
vi.mock('./biodiversity-indicators', () => ({
  default: () => <div data-testid="biodiversity" />,
}));
vi.mock('containers/sidebars/dashboard-trends-sidebar', () => ({
  default: () => <div data-testid="trends-sidebar" />,
}));
vi.mock('./planning', () => ({
  default: () => <div data-testid="planning" />,
}));
vi.mock('./tutorials', () => ({
  default: () => <div data-testid="tutorials" />,
}));

function renderSidebar(overrides = {}, contextValue = null) {
  const props = {
    countryName: 'Peru',
    countryISO: 'PER',
    selectedIndex: NAVIGATION.HOME,
    map: { id: 'map' },
    regionLayers: { a: 1 },
    setRegionLayers: vi.fn(),
    setRegionName: vi.fn(),
    setHash: vi.fn(),
    setSelectedRegionOption: vi.fn(),
    ...overrides,
  };

  const providerValue = contextValue || {
    lightMode: false,
    toggleLightMode: vi.fn(),
  };

  render(
    <LightModeContext.Provider value={providerValue}>
      <DashboardSidebar {...props} />
    </LightModeContext.Provider>
  );

  return { props, providerValue };
}

describe('DashboardSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resets region state on non-trends screens and toggles light mode', () => {
    const { props, providerValue } = renderSidebar({
      selectedIndex: NAVIGATION.HOME,
      countryISO: 'SLE',
      countryName: 'Sierra Leone',
    });

    expect(removeRegionLayers).toHaveBeenCalledWith(
      props.map,
      props.regionLayers
    );
    expect(props.setHash).toHaveBeenCalledWith(null);
    expect(props.setRegionName).toHaveBeenCalledWith(null);
    expect(props.setRegionLayers).toHaveBeenCalledWith({});
    expect(screen.getByTestId('dashboard-home')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Switch to Light mode'));
    expect(providerValue.toggleLightMode).toHaveBeenCalledTimes(1);
  });

  it('does not clear region layers on trends and renders organization title for EE', () => {
    renderSidebar({
      selectedIndex: NAVIGATION.TRENDS,
      countryISO: 'EE',
    });

    expect(removeRegionLayers).not.toHaveBeenCalled();
    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.getByTestId('trends-sidebar')).toBeInTheDocument();
  });

  it('renders each section component for every navigation tab', () => {
    const indexes = [
      [NAVIGATION.EXPLORE_SPECIES, 'species-filter'],
      [NAVIGATION.REGION, 'regions-analysis'],
      [NAVIGATION.SPECIES, 'species-home'],
      [NAVIGATION.DATA_LAYER, 'data-layers'],
      [NAVIGATION.BIO_IND, 'biodiversity'],
      [NAVIGATION.PLANNING, 'planning'],
      [NAVIGATION.INFO, 'tutorials'],
    ];

    indexes.forEach(([selectedIndex, testId]) => {
      const { unmount } = render(
        <LightModeContext.Provider
          value={{ lightMode: true, toggleLightMode: vi.fn() }}
        >
          <DashboardSidebar
            countryName="Peru"
            countryISO="PER"
            selectedIndex={selectedIndex}
            map={{ id: 'map' }}
            regionLayers={{}}
            setRegionLayers={vi.fn()}
            setRegionName={vi.fn()}
            setHash={vi.fn()}
            setSelectedRegionOption={vi.fn()}
          />
        </LightModeContext.Provider>
      );

      expect(screen.getByTestId(testId)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles all logo country variants', () => {
    ['GIN', 'GUY-FM', 'GUY'].forEach((countryISO) => {
      const { unmount } = render(
        <LightModeContext.Provider
          value={{ lightMode: false, toggleLightMode: vi.fn() }}
        >
          <DashboardSidebar
            countryName="Country"
            countryISO={countryISO}
            selectedIndex={NAVIGATION.HOME}
            map={{ id: 'map' }}
            regionLayers={{}}
            setRegionLayers={vi.fn()}
            setRegionName={vi.fn()}
            setHash={vi.fn()}
            setSelectedRegionOption={vi.fn()}
          />
        </LightModeContext.Provider>
      );

      expect(screen.getByTestId('dashboard-nav')).toBeInTheDocument();
      unmount();
    });
  });
});
