import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import TemporalTrendsSiiComponent from './temporal-trends-sii-component';

const NATIONAL_TREND = 'NATIONAL';
const PROVINCE_TREND = 'PROVINCE';

vi.mock('../../dashboard-trends-sidebar-component', () => ({
  NATIONAL_TREND: 'NATIONAL',
  PROVINCE_TREND: 'PROVINCE',
}));

const nationalChartMock = vi.fn(() => <div data-testid="sii-national-chart" />);
const provinceChartMock = vi.fn(() => <div data-testid="sii-province-chart" />);

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

vi.mock('./national-chart', () => ({
  default: (props) => nationalChartMock(props),
}));

vi.mock('./province-chart', () => ({
  default: (props) => provinceChartMock(props),
}));

function renderComponent(overrides = {}) {
  const props = {
    countryName: 'Peru',
    countryData: [
      { level: 'country', year: 2000, sii: 22.2, sii_rank: 1 },
      { level: 'country', year: 2005, sii: 44.4, sii_rank: 2 },
      { level: 'country', year: 2024, sii: 33.3, sii_rank: 3 },
    ],
    countryISO: 'PER',
    siiActiveTrend: NATIONAL_TREND,
    setSiiActiveTrend: vi.fn(),
    setClickedRegion: vi.fn(),
    handleRegionSelected: vi.fn(),
    view: { goTo: vi.fn() },
    ...overrides,
  };

  render(
    <LightModeContext.Provider value={{ lightMode: false }}>
      <TemporalTrendsSiiComponent {...props} />
    </LightModeContext.Provider>
  );

  return props;
}

describe('TemporalTrendsSiiComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders national description and national chart for the default trend', async () => {
    renderComponent({ siiActiveTrend: NATIONAL_TREND });

    await waitFor(() => {
      expect(screen.getByTestId('sii-national-chart')).toBeInTheDocument();
    });
    expect(screen.getByTestId('download-sii')).toBeInTheDocument();
    expect(nationalChartMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nationalChartData: [
          { year: 2000, globalRanking: 1, sii: 22.2 },
          { year: 2005, globalRanking: 2, sii: 44.4 },
          { year: 2024, globalRanking: 3, sii: 33.3 },
        ],
      })
    );
  });

  it('renders province chart branch and handles trend toggle', () => {
    const props = renderComponent({ siiActiveTrend: PROVINCE_TREND });

    expect(screen.getByTestId('sii-province-chart')).toBeInTheDocument();

    fireEvent.click(screen.getByText('National'));
    expect(props.setClickedRegion).toHaveBeenCalledWith(null);
    expect(props.handleRegionSelected).toHaveBeenCalledWith(null);
    expect(props.setSiiActiveTrend).toHaveBeenCalledWith(NATIONAL_TREND);
  });

  it('omits non-EE controls for EE countries', () => {
    renderComponent({ countryISO: 'EE' });

    expect(screen.queryByText('Province')).not.toBeInTheDocument();
    expect(screen.queryByText('National')).not.toBeInTheDocument();
  });
});
