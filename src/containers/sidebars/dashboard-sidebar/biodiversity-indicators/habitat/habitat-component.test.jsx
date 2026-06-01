import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import HabitatComponent from './habitat-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
  useLocale: () => 'en',
}));

vi.mock('utils/dashboard-utils.js', () => ({
  numberToLocaleStringWithOneDecimal: (value) => Number(value).toFixed(1),
}));

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  Tooltip: {},
  Legend: {},
  CategoryScale: {},
}));

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
}));

vi.mock('components/chart-info-popup/chart-info-component', () => ({
  default: ({ children }) => <div data-testid="chart-info">{children}</div>,
}));

vi.mock('../../tutorials/sections/sections-info', () => ({
  SECTION_INFO: { INDICATOR_SCORES: 'indicator scores' },
}));

describe('HabitatComponent', () => {
  it('renders comparison controls, chart, and table interactions', async () => {
    const onCountryChange = vi.fn();
    const updateCountry = vi.fn();

    render(
      <HabitatComponent
        countryName="Peru"
        defaultCountryName="Peru"
        habitatTableData={[
          {
            country: 'Colombia',
            stewardship: 11.1,
            countryConnectivityScore: 22.2,
            countryAreaScore: 33.3,
            shs: 44.4,
          },
        ]}
        lightMode={false}
        selectedCountry="Colombia"
        shiCountries={['Peru', 'Colombia']}
        chartData={{ labels: ['2020'], datasets: [] }}
        onCountryChange={onCountryChange}
        chartOptions={{}}
        countryISO="PER"
        updateCountry={updateCountry}
        lang="en"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Colombia' },
    });
    expect(onCountryChange).toHaveBeenCalled();

    fireEvent.click(
      screen
        .getAllByText('Colombia')
        .find((element) => element.tagName.toLowerCase() === 'td')
    );
    expect(updateCountry).toHaveBeenCalledWith({ value: 'Colombia' });
  });

  it('renders the EE region legend branch without a comparison country chip', async () => {
    render(
      <HabitatComponent
        countryName="Ecuador"
        defaultCountryName="Ecuador"
        habitatTableData={[]}
        lightMode={false}
        selectedCountry="Global"
        shiCountries={['Ecuador']}
        chartData={{ labels: ['2020'], datasets: [] }}
        onCountryChange={vi.fn()}
        chartOptions={{}}
        countryISO="EE"
        updateCountry={vi.fn()}
        lang="en"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    expect(screen.getByText('Ecuador')).toBeInTheDocument();
    expect(screen.queryAllByText('Global')).toHaveLength(0);
  });

  it('renders the EE comparison legend and region table header when a region is selected', async () => {
    render(
      <HabitatComponent
        countryName="Ecuador"
        defaultCountryName="Ecuador"
        habitatTableData={[
          {
            country: 'North Region',
            stewardship: 0,
            countryConnectivityScore: 22.2,
            countryAreaScore: 33.3,
            shs: 0,
          },
        ]}
        lightMode={false}
        selectedCountry="North Region"
        shiCountries={['Ecuador', 'North Region']}
        chartData={{ labels: ['2020'], datasets: [] }}
        onCountryChange={vi.fn()}
        chartOptions={{}}
        countryISO="EE"
        updateCountry={vi.fn()}
        lang="en"
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('North Region').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Region')).toBeInTheDocument();
  });
});
