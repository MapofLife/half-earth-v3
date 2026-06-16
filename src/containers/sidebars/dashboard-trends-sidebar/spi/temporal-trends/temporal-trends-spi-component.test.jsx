import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import TemporalTrendsSpiComponent from './temporal-trends-spi-component';

const INT = 'INT';
const LND = 'LND';
const MEX = 'MEX';
const NATIONAL_TREND = 'NATIONAL';
const PROVINCE_TREND = 'PROVINCE';
const ZONE_3 = 'ZONE_3';
const ZONE_5 = 'ZONE_5';

vi.mock('../../dashboard-trends-sidebar-component', () => ({
  MEX: 'MEX',
  PER: 'PER',
  BRA: 'BRA',
  MDG: 'MDG',
  VNM: 'VNM',
  LND: 'LND',
  INT: 'INT',
  NATIONAL_TREND: 'NATIONAL',
  PROVINCE_TREND: 'PROVINCE',
  TERRISTRIAL: 'TERRESTRIAL',
  MARINE: 'MARINE',
  ZONE_3: 'ZONE_3',
  ZONE_5: 'ZONE_5',
}));

const getFeaturesMock = vi.fn();
const nationalChartMock = vi.fn(() => <div data-testid="spi-national-chart" />);
const provinceChartMock = vi.fn(() => <div data-testid="spi-province-chart" />);
const zoneChartMock = vi.fn(() => <div data-testid="spi-zone-chart" />);
const trendTableMock = vi.fn(() => <div data-testid="spi-trend-table" />);

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
  T: ({ _str }) => <span>{_str}</span>,
}));

vi.mock('components/button', () => ({
  default: ({ label, handleClick }) => (
    <button type="button" onClick={handleClick}>
      {label}
    </button>
  ),
}));

vi.mock('components/DownloadGbifReport', () => ({
  default: ({ type }) => <div data-testid={`download-${type}`} />,
}));

vi.mock('services/esri-feature-service', () => ({
  default: {
    getFeatures: (...args) => getFeaturesMock(...args),
  },
}));

vi.mock('./national-chart', () => ({
  default: (props) => nationalChartMock(props),
}));

vi.mock('./province-chart', () => ({
  default: (props) => provinceChartMock(props),
}));

vi.mock('./zone-chart', () => ({
  default: (props) => zoneChartMock(props),
}));

vi.mock('./trend-table/trend-table-component', () => ({
  default: (props) => trendTableMock(props),
}));

function renderComponent(overrides = {}) {
  const props = {
    countryName: 'Peru',
    activeTrend: NATIONAL_TREND,
    setActiveTrend: vi.fn(),
    countryData: [
      {
        level: 'country',
        year: 2000,
        spi: 10,
        area_protected: 50,
        area_km2: 100,
      },
      {
        level: 'country',
        year: 2005,
        spi: 20,
        area_protected: 150,
        area_km2: 100,
      },
      {
        level: 'province',
        year: 2005,
        spi: 30,
        area_protected: 150,
        area_km2: 100,
      },
    ],
    countryISO: 'PER',
    clickedRegion: null,
    setClickedRegion: vi.fn(),
    handleRegionSelected: vi.fn(),
    view: { goTo: vi.fn() },
    ...overrides,
  };

  render(
    <LightModeContext.Provider value={{ lightMode: false }}>
      <TemporalTrendsSpiComponent {...props} />
    </LightModeContext.Provider>
  );

  return props;
}

describe('TemporalTrendsSpiComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getFeaturesMock.mockResolvedValue([
      {
        geometry: {
          longitude: 10,
          latitude: 20,
          clone: () => 'extent',
        },
      },
    ]);
  });

  it('renders national content and province table toggles for non-EE countries', async () => {
    const props = renderComponent({ activeTrend: PROVINCE_TREND });

    await waitFor(() => {
      expect(screen.getByText('Temporal Trends')).toBeInTheDocument();
    });
    expect(screen.getByTestId('spi-province-chart')).toBeInTheDocument();
    expect(screen.getByTestId('download-spi')).toBeInTheDocument();

    fireEvent.click(screen.getByText('View Full Province table'));
    expect(screen.getByTestId('spi-trend-table')).toBeInTheDocument();

    fireEvent.click(screen.getByText('National'));
    expect(props.setClickedRegion).toHaveBeenCalledWith(null);
    expect(props.handleRegionSelected).toHaveBeenCalledWith(null);
    expect(props.setActiveTrend).toHaveBeenCalledWith(NATIONAL_TREND);
  });

  it('renders zone chart for GUY-FM branch', () => {
    const props = renderComponent({
      countryISO: 'GUY-FM',
      activeTrend: ZONE_3,
    });

    expect(screen.getByText('ZONE_3')).toBeInTheDocument();
    expect(screen.getByTestId('spi-zone-chart')).toBeInTheDocument();

    fireEvent.click(screen.getByText('ZONE_3'));
    expect(props.setActiveTrend).toHaveBeenCalledWith(ZONE_3);
  });

  it('handles EE clicked regions and map navigation buttons', async () => {
    const props = renderComponent({
      countryISO: 'EE',
      clickedRegion: { iso3: 'MDG' },
      activeTrend: MEX,
      countryData: [],
    });

    await waitFor(() => {
      expect(props.setActiveTrend).toHaveBeenCalledWith('MDG');
    });

    fireEvent.click(screen.getByText('Mexico'));
    await waitFor(() => {
      expect(getFeaturesMock).toHaveBeenCalled();
      expect(props.view.goTo).toHaveBeenCalledWith(
        expect.objectContaining({ zoom: 5.5, extent: 'extent' })
      );
    });

    fireEvent.click(screen.getByText('Landscape'));
    expect(props.setActiveTrend).toHaveBeenCalledWith(LND);

    fireEvent.click(screen.getByText('Intervention'));
    expect(props.setActiveTrend).toHaveBeenCalledWith(INT);
    expect(props.view.goTo).toHaveBeenCalledWith({ zoom: 1 });
  });

  it('renders national chart branch with filtered country data', async () => {
    renderComponent({ activeTrend: NATIONAL_TREND });

    await waitFor(() => {
      expect(screen.getByTestId('spi-national-chart')).toBeInTheDocument();
    });
    expect(nationalChartMock).toHaveBeenCalledWith(
      expect.objectContaining({
        countryData: [
          {
            level: 'country',
            year: 2000,
            spi: 10,
            area_protected: 50,
            area_km2: 100,
          },
          {
            level: 'country',
            year: 2005,
            spi: 20,
            area_protected: 150,
            area_km2: 100,
          },
        ],
      })
    );
  });

  it('renders ZONE_5 chart for GUY-FM branch', () => {
    renderComponent({
      countryISO: 'GUY-FM',
      activeTrend: ZONE_5,
    });

    expect(screen.getByText('ZONE_5')).toBeInTheDocument();
    expect(screen.getByTestId('spi-zone-chart')).toBeInTheDocument();
    expect(zoneChartMock).toHaveBeenCalledWith(
      expect.objectContaining({ zone: ZONE_5 })
    );
  });

  it('shows Departamento label and download button for PER', async () => {
    renderComponent({ countryISO: 'PER', activeTrend: PROVINCE_TREND });

    await waitFor(() => {
      expect(screen.getByText('Departamento')).toBeInTheDocument();
    });
    expect(screen.getByTestId('download-spi')).toBeInTheDocument();
  });

  it('closes full province table when Close full table is clicked', async () => {
    renderComponent({ activeTrend: PROVINCE_TREND });

    fireEvent.click(screen.getByText('View Full Province table'));
    expect(screen.getByTestId('spi-trend-table')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close full table'));
    expect(screen.queryByTestId('spi-trend-table')).not.toBeInTheDocument();
    expect(screen.getByTestId('spi-province-chart')).toBeInTheDocument();
  });

  it('clicks TERRESTRIAL and MARINE top buttons', async () => {
    const props = renderComponent({ activeTrend: NATIONAL_TREND });

    fireEvent.click(screen.getByText('TERRESTRIAL'));
    expect(props.setActiveTrend).toHaveBeenCalledWith(PROVINCE_TREND);

    fireEvent.click(screen.getByText('MARINE'));
    expect(props.setActiveTrend).toHaveBeenCalledWith(NATIONAL_TREND);
  });
});
