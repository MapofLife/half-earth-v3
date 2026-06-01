import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

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
});
