import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import TemporalTrendsSpiNationalChartComponent from './national-chart-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
  useLocale: () => 'en',
}));

vi.mock('utils/css-utils', () => ({
  getCSSVariable: (value) => value,
}));

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: {},
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
  default: ({ value, isPercent }) => (
    <div data-testid={isPercent ? 'percent-arc' : 'spi-arc'}>{value}</div>
  ),
}));

vi.mock(
  '../../../../dashboard-sidebar/tutorials/sections/sections-info',
  () => ({
    SECTION_INFO: { SPI_TEMPORAL_TREND: 'spi trend' },
  })
);

vi.mock(
  'images/dashboard/tutorials/tutorial_spi_temporalTrends-en.png?react',
  () => ({
    default: 'spi-trend-en',
  })
);

vi.mock(
  'images/dashboard/tutorials/tutorial_spi_temporalTrends-fr.png?react',
  () => ({
    default: 'spi-trend-fr',
  })
);

describe('TemporalTrendsSpiNationalChartComponent', () => {
  it('renders SPI national trend summary and line chart', async () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <TemporalTrendsSpiNationalChartComponent
          lang="en"
          countryData={[
            {
              year: 2000,
              spi: 10,
              area_protected: 10,
              area_km2: 100,
              spi_rank: 8,
            },
            {
              year: 2024,
              spi: 25,
              area_protected: 30,
              area_km2: 100,
              spi_rank: 2,
            },
          ]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    expect(screen.getByText('Global Ranking')).toBeInTheDocument();
    expect(screen.getByTestId('spi-arc')).toBeInTheDocument();
    expect(screen.getByTestId('percent-arc')).toBeInTheDocument();
  });
});
