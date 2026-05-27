import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import { NAVIGATION } from 'constants/dashboard-constants';
import DashboardNavComponent from './dashboard-nav-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

function renderComponent(overrides = {}) {
  const props = {
    selectedIndex: NAVIGATION.HOME,
    setSelectedIndex: vi.fn(),
    scientificName: null,
    setSelectedRegion: vi.fn(),
    setScientificName: vi.fn(),
    setMapLegendLayers: vi.fn(),
    setDataLayerData: vi.fn(),
    setFromTrends: vi.fn(),
    speciesInfo: null,
    setSpeciesInfo: vi.fn(),
    speciesDataLoading: false,
    ...overrides,
  };

  render(
    <LightModeContext.Provider
      value={{ lightMode: false, toggleLightMode: vi.fn() }}
    >
      <DashboardNavComponent {...props} />
    </LightModeContext.Provider>
  );

  return props;
}

describe('DashboardNavComponent', () => {
  beforeEach(() => {
    vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('navigates to home and clears species context', () => {
    const props = renderComponent();

    fireEvent.click(screen.getByLabelText('Home'));

    expect(window.history.pushState).toHaveBeenCalled();
    expect(props.setFromTrends).toHaveBeenCalledWith(false);
    expect(props.setMapLegendLayers).toHaveBeenCalledWith([]);
    expect(props.setSelectedRegion).toHaveBeenCalledWith(null);
    expect(props.setScientificName).toHaveBeenCalledWith(null);
    expect(props.setDataLayerData).toHaveBeenCalledWith(null);
    expect(props.setSpeciesInfo).toHaveBeenCalledWith(null);
    expect(props.setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.HOME);
  });

  it('shows sub-navigation and keeps species context for species tabs', () => {
    const props = renderComponent({
      selectedIndex: NAVIGATION.SPECIES,
      scientificName: 'Panthera onca',
      speciesInfo: { id: 1 },
    });

    fireEvent.click(screen.getByLabelText('Data Layers'));
    fireEvent.click(screen.getByLabelText('Conservation Status'));

    expect(props.setSelectedRegion).not.toHaveBeenCalled();
    expect(props.setScientificName).not.toHaveBeenCalled();
    expect(props.setDataLayerData).not.toHaveBeenCalled();
    expect(props.setSpeciesInfo).not.toHaveBeenCalled();
    expect(props.setSelectedIndex).toHaveBeenNthCalledWith(
      1,
      NAVIGATION.DATA_LAYER
    );
    expect(props.setSelectedIndex).toHaveBeenNthCalledWith(
      2,
      NAVIGATION.BIO_IND
    );
  });

  it('navigates through species, regions, trends and tutorials buttons', () => {
    const props = renderComponent();

    fireEvent.click(screen.getByLabelText('Species'));
    fireEvent.click(screen.getByLabelText('Regions'));
    fireEvent.click(screen.getByLabelText('Trends'));
    fireEvent.click(screen.getByLabelText('Tutorials'));

    expect(props.setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.SPECIES);
    expect(props.setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.REGION);
    expect(props.setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.TRENDS);
    expect(props.setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.INFO);
  });

  it('hides sub-navigation when selected index is outside species range', () => {
    renderComponent({
      scientificName: 'Panthera onca',
      selectedIndex: NAVIGATION.TRENDS,
      speciesInfo: { id: 1 },
    });

    expect(screen.queryByLabelText('Data Layers')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Conservation Status')
    ).not.toBeInTheDocument();
  });

  it('renders with light mode enabled', () => {
    const props = {
      selectedIndex: NAVIGATION.HOME,
      setSelectedIndex: vi.fn(),
      scientificName: null,
      setSelectedRegion: vi.fn(),
      setScientificName: vi.fn(),
      setMapLegendLayers: vi.fn(),
      setDataLayerData: vi.fn(),
      setFromTrends: vi.fn(),
      speciesInfo: null,
      setSpeciesInfo: vi.fn(),
      speciesDataLoading: false,
    };

    render(
      <LightModeContext.Provider
        value={{ lightMode: true, toggleLightMode: vi.fn() }}
      >
        <DashboardNavComponent {...props} />
      </LightModeContext.Provider>
    );

    expect(screen.getByLabelText('Home')).toBeInTheDocument();
  });
});
