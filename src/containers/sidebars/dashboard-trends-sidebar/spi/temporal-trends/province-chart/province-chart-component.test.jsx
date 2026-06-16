import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import ProvinceChartComponent from './province-chart-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
  useLocale: () => 'en',
}));

vi.mock('utils/css-utils', () => ({
  getCSSVariable: (value) => value,
}));

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  LinearScale: {},
  PointElement: {},
  ArcElement: {},
  Tooltip: {},
  Legend: {},
}));

vi.mock('react-chartjs-2', () => ({
  Bubble: () => <div data-testid="bubble-chart" />,
  Line: () => <div data-testid="line-chart" />,
}));

vi.mock('react-select', () => ({
  default: ({ placeholder }) => <div data-testid="select">{placeholder}</div>,
}));

vi.mock('he-components', () => ({
  Loading: () => <div data-testid="loading" />,
}));

vi.mock('components/chart-info-popup/chart-info-component', () => ({
  default: ({ children }) => <div data-testid="chart-info">{children}</div>,
}));

vi.mock('components/charts/spi-arc-chart/spi-arc-chart-component', () => ({
  default: ({ value }) => <div data-testid="arc-chart">{value}</div>,
}));

vi.mock('hooks/esri', () => ({
  useWatchUtils: () => ({
    watch: (callback) => {
      callback();
      return { remove: vi.fn() };
    },
  }),
}));

vi.mock(
  '../../../../dashboard-sidebar/tutorials/sections/sections-info',
  () => ({
    SECTION_INFO: { SPI_PROVINCE_VIEW: 'province view' },
  })
);

describe('Spi ProvinceChartComponent', () => {
  it('renders province ranking summary and line chart for non-bubble countries', async () => {
    const setSelectedProvince = vi.fn();
    const handleRegionSelected = vi.fn();

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ProvinceChartComponent
          setSelectedProvince={setSelectedProvince}
          selectedProvince={{
            name: 'Loreto',
            region_name: 'Loreto',
            region_key: 'loreto',
          }}
          clickedRegion={null}
          setClickedRegion={vi.fn()}
          provinces={[
            {
              name: 'Loreto',
              iso3: 'PER',
              region_key: 'loreto',
              region_name: 'Loreto',
              level: 'states',
              year: 2020,
              spi: 20,
              area_km2: 100,
              area_protected: 20,
              spi_rank: 12,
              size_rank: 4,
              richness_vert_spi_rank: 2,
            },
            {
              name: 'Loreto',
              iso3: 'PER',
              region_key: 'loreto',
              region_name: 'Loreto',
              level: 'states',
              year: 2024,
              spi: 23.4,
              area_km2: 100,
              area_protected: 25,
              spi_rank: 8,
              size_rank: 4,
              richness_vert_spi_rank: 2,
            },
          ]}
          provinceName=""
          setProvinceName={vi.fn()}
          handleRegionSelected={handleRegionSelected}
          layerView={{
            queryFeatures: vi.fn().mockResolvedValue({
              features: [{ attributes: { NAME_1: 'Loreto' } }],
            }),
          }}
          countryISO="PER"
          lang="en"
          view={{ map: { allLayers: [{ id: 'PROVINCES', visible: true }] } }}
          regionLayers={[{ id: 'region-layer' }]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    expect(screen.getByText('Select Region')).toBeInTheDocument();
    expect(screen.getByText(/#8/)).toBeInTheDocument();
    expect(screen.getByText('25.0%')).toBeInTheDocument();
    expect(handleRegionSelected).toHaveBeenCalled();
    expect(setSelectedProvince).toHaveBeenCalled();
  });

  it('renders bubble chart branch for EE countries', async () => {
    const setSelectedProvince = vi.fn();
    const handleRegionSelected = vi.fn();

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ProvinceChartComponent
          setSelectedProvince={setSelectedProvince}
          selectedProvince={{
            name: 'Madagascar',
            region_name: 'Madagascar',
            region_key: 'mdg',
            iso3_regional: 'MDG',
            level: 'states',
          }}
          clickedRegion={{ NAME_1: 'Madagascar' }}
          setClickedRegion={vi.fn()}
          provinces={[
            {
              name: 'Madagascar',
              iso3: 'EE',
              region_key: 'mdg',
              region_name: 'Madagascar',
              level: 'states',
              year: 2024,
              spi: 31.4,
              SPI: 31.4,
              area_km2: 100,
              area_protected: 36,
              AreaProtected: 36,
              spi_rank: 5,
              size_rank: 2,
              richness_vert_spi_rank: 3,
            },
          ]}
          provinceName="Madagascar"
          setProvinceName={vi.fn()}
          handleRegionSelected={handleRegionSelected}
          layerView={{
            queryFeatures: vi.fn().mockResolvedValue({
              features: [{ attributes: { region_nam: 'Madagascar' } }],
            }),
          }}
          countryISO="EE"
          lang="en"
          view={{ map: { allLayers: [{ id: 'PROVINCES', visible: true }] } }}
          regionLayers={[{ id: 'region-layer' }]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('bubble-chart')).toBeInTheDocument();
    });

    expect(screen.getByTestId('arc-chart')).toBeInTheDocument();
    await waitFor(() => {
      expect(setSelectedProvince).toHaveBeenCalled();
    });
  });
});
