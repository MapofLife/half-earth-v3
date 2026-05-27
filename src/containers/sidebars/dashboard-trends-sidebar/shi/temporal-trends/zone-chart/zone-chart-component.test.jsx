import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import ZoneChartComponent from './zone-chart-component';

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
  LineElement: {},
  Tooltip: {},
  Legend: {},
}));

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
}));

vi.mock('components/chart-info-popup/chart-info-component', () => ({
  default: ({ children }) => <div data-testid="chart-info">{children}</div>,
}));

describe('Shi ZoneChartComponent', () => {
  it('renders a zone chart and updates selected province from clicked region', async () => {
    const setSelectedProvince = vi.fn();

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ZoneChartComponent
          zone="ZONE_3"
          zoneData={[
            {
              region_key: 'ACC_3_A',
              year: 2020,
              habitat_index: 0.2,
              name: 'Zone A',
              iso3: 'PER',
            },
            {
              region_key: 'ACC_3_A',
              year: 2021,
              habitat_index: 0.4,
              name: 'Zone A',
              iso3: 'PER',
            },
          ]}
          setSelectedProvince={setSelectedProvince}
          clickedRegion={{ name: 'Clicked' }}
          countryISO="PER"
          shiActiveTrend="ZONE_3"
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
    expect(setSelectedProvince).toHaveBeenCalledWith({ name: 'Clicked' });
  });
});
