import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import TemporalTrendsShiComponent from './temporal-trends-shi-component';

const INT = 'INT';
const LND = 'LND';
const MEX = 'MEX';
const NATIONAL_TREND = 'NATIONAL';
const PROVINCE_TREND = 'PROVINCE';
const ZONE_3 = 'ZONE_3';

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
  ZONE_3: 'ZONE_3',
  ZONE_5: 'ZONE_5',
}));

const getFeaturesMock = vi.fn();
const zoneChartMock = vi.fn(() => <div data-testid="shi-zone-chart" />);
const nationalChartMock = vi.fn(() => <div data-testid="shi-national-chart" />);
const provinceChartMock = vi.fn(() => <div data-testid="shi-province-chart" />);

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

function renderComponent(overrides = {}) {
  const props = {
    shiValue: 12.5,
    countryName: 'Peru',
    countryISO: 'PER',
    shiActiveTrend: NATIONAL_TREND,
    setShiActiveTrend: vi.fn(),
    setClickedRegion: vi.fn(),
    clickedRegion: null,
    handleRegionSelected: vi.fn(),
    view: { goTo: vi.fn() },
    ...overrides,
  };

  render(
    <LightModeContext.Provider value={{ lightMode: false }}>
      <TemporalTrendsShiComponent {...props} />
    </LightModeContext.Provider>
  );

  return props;
}

describe('TemporalTrendsShiComponent', () => {
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

  it('renders national content for regular countries and handles province toggle', () => {
    const props = renderComponent({ countryISO: 'PER' });

    expect(screen.getByText('Temporal Trends')).toBeInTheDocument();
    expect(screen.getByTestId('shi-national-chart')).toBeInTheDocument();
    expect(screen.getByTestId('download-shi')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Departamento'));

    expect(props.setClickedRegion).toHaveBeenCalledWith(null);
    expect(props.handleRegionSelected).toHaveBeenCalledWith(null);
    expect(props.setShiActiveTrend).toHaveBeenCalledWith(PROVINCE_TREND);
  });

  it('renders zone controls for GUY-FM and zone charts for selected zones', () => {
    const props = renderComponent({
      countryISO: 'GUY-FM',
      shiActiveTrend: ZONE_3,
    });

    expect(screen.getByText('ZONE_3')).toBeInTheDocument();
    expect(screen.getByText('ZONE_5')).toBeInTheDocument();
    expect(screen.getByTestId('shi-zone-chart')).toBeInTheDocument();

    fireEvent.click(screen.getByText('ZONE_3'));
    expect(props.setShiActiveTrend).toHaveBeenCalledWith(ZONE_3);
  });

  it('handles EE clicked regions and map navigation for region and global buttons', async () => {
    const props = renderComponent({
      countryISO: 'EE',
      clickedRegion: { iso3: 'BRA' },
      shiActiveTrend: MEX,
    });

    await waitFor(() => {
      expect(props.setShiActiveTrend).toHaveBeenCalledWith('BRA');
    });

    fireEvent.click(screen.getByText('Mexico'));
    await waitFor(() => {
      expect(getFeaturesMock).toHaveBeenCalled();
      expect(props.view.goTo).toHaveBeenCalledWith(
        expect.objectContaining({ zoom: 5.5, extent: 'extent' })
      );
    });

    fireEvent.click(screen.getByText('Landscape'));
    expect(props.setShiActiveTrend).toHaveBeenCalledWith(LND);

    fireEvent.click(screen.getByText('Intervention'));
    expect(props.setShiActiveTrend).toHaveBeenCalledWith(INT);
    expect(props.view.goTo).toHaveBeenCalledWith({ zoom: 1 });
  });

  it('forces COD to national trend on mount and renders province chart branch', async () => {
    const props = renderComponent({
      countryISO: 'COD',
      shiActiveTrend: PROVINCE_TREND,
    });

    expect(screen.getByTestId('shi-province-chart')).toBeInTheDocument();
    await waitFor(() => {
      expect(props.setShiActiveTrend).toHaveBeenCalledWith(NATIONAL_TREND);
    });
  });
});
