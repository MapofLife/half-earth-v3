import React from 'react';
import { render, screen } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import IndicatorsSectionComponent from './indicators-section-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
  useLocale: () => 'en',
}));

vi.mock('utils/dashboard-utils.js', () => ({
  tutorialSections: {
    INDICATORS: 'indicators',
    SPI: 'spi',
    SHI: 'shi',
    SII: 'sii',
  },
}));

vi.mock('components/image-popup/image-popup-component', () => ({
  default: ({ children }) => <div data-testid="image-popup">{children}</div>,
}));

vi.mock('icons/timeline.svg?react', () => ({ default: () => <svg /> }));
vi.mock('./sections-info', () => ({
  SECTION_INFO: {
    SPI: 'spi',
    SPI_TWO: 'spi two',
    SPI_THREE: 'spi three',
    SPI_FOUR: 'spi four',
    SPI_FIVE: 'spi five',
    SPI_TEMPORAL_TREND: 'spi temporal',
    SPI_PROVINCE_VIEW: 'spi province',
    SPI_SCORE_DISTRIBUTIONS: 'spi distribution',
    SHI: 'shi',
    SHI_TWO: 'shi two',
    SHI_THREE: 'shi three',
    SHI_FOUR: 'shi four',
    SHI_TEMPORAL_TREND: 'shi temporal',
    SHI_PROVINCE_VIEW: 'shi province',
    SHI_SCORE_DISTRIBUTIONS: 'shi distribution',
    SII: 'sii',
    SII_TWO: 'sii two',
    SII_THREE: 'sii three',
    SII_FOUR: 'sii four',
    SII_TEMPORAL_TREND: 'sii temporal',
  },
}));

describe('IndicatorsSectionComponent', () => {
  it('renders indicator tutorial sections and images', () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <IndicatorsSectionComponent />
      </LightModeContext.Provider>
    );

    expect(
      screen.getByRole('heading', { name: 'Indicators' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Species Protection Index' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Species Habitat Index' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Species Information Index' })
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('image-popup')).toHaveLength(5);
  });

  it('renders all indicator tutorial images in light mode', () => {
    render(
      <LightModeContext.Provider value={{ lightMode: true }}>
        <IndicatorsSectionComponent />
      </LightModeContext.Provider>
    );

    expect(screen.getAllByRole('img')).toHaveLength(5);
  });
});
