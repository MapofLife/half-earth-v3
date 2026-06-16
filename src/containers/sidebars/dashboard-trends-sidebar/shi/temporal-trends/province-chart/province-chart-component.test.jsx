import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import ProvinceChartComponent from './province-chart-component';

vi.mock('@transifex/react', () => {
  const t = (value) => value;
  return {
    useT: () => t,
    useLocale: () => 'en',
  };
});

vi.mock('utils/css-utils', () => ({
  getCSSVariable: (value) => value,
}));

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  LinearScale: {},
  PointElement: {},
  LineElement: {},
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

vi.mock('components/button', () => ({
  default: ({ label, handleClick }) => (
    <button type="button" onClick={handleClick}>
      {label}
    </button>
  ),
}));

vi.mock('components/chart-info-popup/chart-info-component', () => ({
  default: ({ children }) => <div data-testid="chart-info">{children}</div>,
}));

vi.mock('hooks/esri', () => ({
  useWatchUtils: () => ({
    watch: (callback) => {
      callback();
      return { remove: vi.fn() };
    },
  }),
}));

vi.mock('@arcgis/core/core/reactiveUtils', () => ({
  watch: vi.fn(),
}));

vi.mock(
  '../../../../dashboard-sidebar/tutorials/sections/sections-info',
  () => ({
    SECTION_INFO: { SHI_PROVINCE_VIEW: 'province view' },
  })
);

describe('Shi ProvinceChartComponent', () => {
  it('renders province summary and line chart for non-bubble countries', async () => {
    const setSelectedProvince = vi.fn();
    const handleRegionSelected = vi.fn();

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ProvinceChartComponent
          setSelectedProvince={setSelectedProvince}
          selectedProvince={{
            name: 'Cusco',
            region_name: 'Cusco',
            region_key: 'cusco',
          }}
          clickedRegion={null}
          provinces={[
            {
              name: 'Cusco',
              iso3: 'PER',
              region_key: 'cusco',
              region_name: 'Cusco',
            },
          ]}
          setClickedRegion={vi.fn()}
          shiProvinceTrendData={[
            {
              name: 'Cusco',
              year: 2023,
              area_score: 22.1,
              connectivity_score: 33.4,
              habitat_index: 44.5,
              shi_rank: 7,
              region_name: 'Cusco',
            },
            {
              name: 'Cusco',
              year: 2001,
              area_score: 11.1,
              connectivity_score: 20.2,
              habitat_index: 15.6,
              shi_rank: 12,
              region_name: 'Cusco',
            },
          ]}
          provinceName=""
          setProvinceName={vi.fn()}
          handleRegionSelected={handleRegionSelected}
          layerView={{
            queryFeatures: vi.fn().mockResolvedValue({
              features: [{ attributes: { NAME_1: 'Cusco' } }],
            }),
          }}
          lang="en"
          countryISO="PER"
          view={{ map: { allLayers: [{ id: 'PER-shi', visible: true }] } }}
          regionLayers={[{ id: 'region-layer' }]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    expect(screen.getByText('Select Region')).toBeInTheDocument();
    expect(screen.getByText('44.5')).toBeInTheDocument();
    expect(handleRegionSelected).toHaveBeenCalled();
    expect(setSelectedProvince).toHaveBeenCalled();
  });

  it('renders bubble chart controls for EE and updates score mode buttons', async () => {
    const handleRegionSelected = vi.fn();

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ProvinceChartComponent
          setSelectedProvince={vi.fn()}
          selectedProvince={{
            name: 'Madagascar',
            region_name: 'Madagascar',
            region_key: 'mdg',
            iso3_regional: 'MDG',
          }}
          clickedRegion={{ NAME_1: 'Madagascar' }}
          provinces={[
            {
              name: 'Mexico',
              iso3: 'EE',
              region_key: 'mex',
              region_name: 'Mexico',
              iso3_regional: 'MEX',
            },
            {
              name: 'Madagascar',
              iso3: 'EE',
              region_key: 'mdg',
              region_name: 'Madagascar',
              iso3_regional: 'MDG',
            },
          ]}
          setClickedRegion={vi.fn()}
          shiProvinceTrendData={[
            {
              name: 'Mexico',
              year: 2023,
              area_score: 22.1,
              connectivity_score: 33.4,
              habitat_index: 44.5,
              shi_rank: 7,
              region_name: 'Mexico',
              area_km2: 100,
              connectivity: 0.34,
            },
            {
              name: 'Madagascar',
              year: 2023,
              area_score: 25.1,
              connectivity_score: 28.2,
              habitat_index: 51.2,
              shi_rank: 8,
              region_name: 'Madagascar',
              area_km2: 120,
              connectivity: 0.28,
            },
          ]}
          provinceName=""
          setProvinceName={vi.fn()}
          handleRegionSelected={handleRegionSelected}
          layerView={{
            queryFeatures: vi.fn().mockResolvedValue({
              features: [{ attributes: { region_nam: 'Madagascar' } }],
            }),
          }}
          lang="en"
          countryISO="EE"
          view={{ map: { allLayers: [{ id: 'EE-shi', visible: true }] } }}
          regionLayers={[{ id: 'region-layer' }]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('bubble-chart')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Area Component' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Connectivity Component' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Habitat Index' }));

    expect(handleRegionSelected).toHaveBeenCalled();
  });
});
