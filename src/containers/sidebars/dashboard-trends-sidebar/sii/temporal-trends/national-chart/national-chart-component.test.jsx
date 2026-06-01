import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import NationalChartComponent from './national-chart-component';

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

vi.mock('he-components', () => ({
  Loading: () => <div data-testid="loading" />,
}));

vi.mock('components/chart-info-popup/chart-info-component', () => ({
  default: ({ children }) => <div data-testid="chart-info">{children}</div>,
}));

vi.mock('components/charts/spi-arc-chart/spi-arc-chart-component', () => ({
  default: ({ value }) => <div data-testid="arc-chart">{value}</div>,
}));

vi.mock(
  '../../../../dashboard-sidebar/tutorials/sections/sections-info',
  () => ({
    SECTION_INFO: { SII_TEMPORAL_TREND: 'sii trend' },
  })
);

describe('Sii NationalChartComponent', () => {
  it('renders SII national trend summary and line chart', async () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <NationalChartComponent
          lang="en"
          nationalChartData={[
            { year: 2020, sii: 18, globalRanking: 9 },
            { year: 2024, sii: 28, globalRanking: 3 },
          ]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    expect(screen.getByText('Global Ranking')).toBeInTheDocument();
    expect(screen.getByTestId('arc-chart')).toHaveTextContent('28');
  });
});
