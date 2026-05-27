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
    SECTION_INFO: { SHI_TEMPORAL_TREND: 'trend' },
  })
);

vi.mock(
  'images/dashboard/tutorials/tutorial_shi_temporalTrends-en.png?react',
  () => ({
    default: 'shi-trend-en',
  })
);

vi.mock(
  'images/dashboard/tutorials/tutorial_shi_temporalTrends-fr.png?react',
  () => ({
    default: 'shi-trend-fr',
  })
);

describe('NationalChartComponent', () => {
  it('renders national SHI chart data and summary values', async () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <NationalChartComponent
          lang="en"
          countryData={[
            {
              level: 'country',
              year: 2001,
              area_score: 20,
              connectivity_score: 30,
              habitat_index: 40,
              shi_rank: 8,
            },
            {
              level: 'country',
              year: 2023,
              area_score: 50,
              connectivity_score: 60,
              habitat_index: 70,
              shi_rank: 2,
            },
          ]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Area Score')).toHaveLength(2);
    expect(screen.getAllByText('Connectivity Score')).toHaveLength(2);
    expect(screen.getByText('Global Ranking')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
  });
});
