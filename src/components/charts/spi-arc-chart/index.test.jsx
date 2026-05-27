import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from '../../../context/light-mode';
import SpiArcChart from './index';

const doughnutSpy = vi.fn();

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: {},
  LinearScale: {},
  ArcElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

vi.mock('react-chartjs-2', () => ({
  Doughnut: (props) => {
    doughnutSpy(props);
    return <div data-testid="doughnut-chart" />;
  },
}));

const renderComponent = (props) =>
  render(
    <LightModeContext.Provider value={{ lightMode: false }}>
      <SpiArcChart {...props} />
    </LightModeContext.Provider>
  );

describe('SpiArcChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders species percentage scores and default chart sizing through the index export', () => {
    renderComponent({
      scores: {
        Panthera: {
          count: 25,
          total: 50,
        },
      },
      species: 'Panthera',
      img: 'panthera.png',
      data: { datasets: [{ data: [50, 50] }] },
    });

    expect(screen.getByText('50.0')).toBeInTheDocument();
    expect(screen.getByAltText('Panthera')).toHaveAttribute(
      'src',
      'panthera.png'
    );
    expect(screen.getByText('50 Panthera')).toBeInTheDocument();
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    expect(doughnutSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { datasets: [{ data: [50, 50] }] },
        width: 120,
        height: 100,
      })
    );
  });

  it('uses the raw count when value is provided and forwards custom chart dimensions', () => {
    renderComponent({
      scores: {
        Panthera: {
          count: 25,
          total: 50,
        },
      },
      species: 'Panthera',
      img: 'panthera.png',
      data: { datasets: [{ data: [25, 75] }] },
      value: 25.19,
      width: 180,
      height: 140,
    });

    expect(screen.getByText('25.0')).toBeInTheDocument();
    expect(doughnutSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 180,
        height: 140,
      })
    );
  });

  it('renders the formatted global percent score when no species scores are provided', async () => {
    renderComponent({
      data: { datasets: [{ data: [12.3, 87.7] }] },
      value: 12.34,
      isPercent: true,
    });

    await waitFor(() => {
      expect(screen.getByText('12.3%')).toBeInTheDocument();
    });
  });

  it('falls back to zero for the global score when value is missing', async () => {
    renderComponent({
      data: { datasets: [{ data: [0, 100] }] },
      isPercent: false,
    });

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});
