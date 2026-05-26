import React from 'react';
import { render, screen } from '@testing-library/react';

import TrendTableComponent from './trend-table-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

vi.mock('utils/dashboard-utils.js', () => ({
  numberToLocaleStringWithOneDecimal: (value) => String(value),
}));

describe('TrendTableComponent', () => {
  it('renders latest province year rows', () => {
    render(
      <TrendTableComponent
        provinces={[
          {
            name: 'Cusco',
            year: 2023,
            spi: 10.1,
            area_km2: 20,
            area_protected: 5,
            richness_vert_spi: 15,
          },
          {
            name: 'Cusco',
            year: 2024,
            spi: 12.4,
            area_km2: 21,
            area_protected: 6,
            richness_vert_spi: 18,
          },
        ]}
      />
    );

    expect(screen.getByText('Province')).toBeInTheDocument();
    expect(screen.getByText('Cusco')).toBeInTheDocument();
    expect(screen.getByText('12.4')).toBeInTheDocument();
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });
});
