import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ProtectionComponent from './protection-component';

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

describe('ProtectionComponent', () => {
  it('renders protection comparison controls, chart, and table interactions', async () => {
    const onCountryChange = vi.fn();
    const updateCountry = vi.fn();

    render(
      <ProtectionComponent
        protectionTableData={[
          {
            country: 'Colombia',
            stewardship: 11.1,
            rangeProtected: 22.2,
            targetProtected: 33.3,
            sps: 44.4,
          },
        ]}
        countryName="Peru"
        lightMode={false}
        defaultCountryName="Peru"
        selectedCountry="Colombia"
        updateCountry={updateCountry}
        onCountryChange={onCountryChange}
        shiCountries={['Peru', 'Colombia']}
        chartData={{ labels: ['2020'], datasets: [] }}
        chartOptions={{}}
        lang="en"
        countryISO="PER"
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
    expect(screen.getByText('11.1%')).toBeInTheDocument();
  });

  it('renders the EE region legend branch without the selected country chip', async () => {
    render(
      <ProtectionComponent
        protectionTableData={[]}
        countryName="Ecuador"
        lightMode={false}
        defaultCountryName="Ecuador"
        selectedCountry="Global"
        updateCountry={vi.fn()}
        onCountryChange={vi.fn()}
        shiCountries={['Ecuador']}
        chartData={{ labels: ['2020'], datasets: [] }}
        chartOptions={{}}
        lang="en"
        countryISO="EE"
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
      <ProtectionComponent
        protectionTableData={[
          {
            country: 'North Region',
            sps_stewardship: 0,
            rangeProtected: 22.2,
            targetProtected: 33.3,
            sps: 0,
          },
        ]}
        countryName="Ecuador"
        lightMode={false}
        defaultCountryName="Ecuador"
        selectedCountry="North Region"
        updateCountry={vi.fn()}
        onCountryChange={vi.fn()}
        shiCountries={['Ecuador', 'North Region']}
        chartData={{ labels: ['2020'], datasets: [] }}
        chartOptions={{}}
        lang="en"
        countryISO="EE"
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('North Region').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Region')).toBeInTheDocument();
  });
});
