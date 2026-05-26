import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import TutorialsComponent from './tutorials-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

vi.mock('utils/dashboard-utils.js', () => ({
  tutorialSections: {
    SPECIES: 'species',
    DATA_LAYERS: 'data-layers',
    INDICATOR_SCORES: 'indicator-scores',
    REGIONS: 'regions',
    INDICATORS: 'indicators',
    SPI: 'spi',
    SHI: 'shi',
    SII: 'sii',
  },
}));

vi.mock('./sections/species-section-component', () => ({
  default: () => <section data-testid="species-section" />,
}));

vi.mock('./sections/regions-section-component', () => ({
  default: () => <section data-testid="regions-section" />,
}));

vi.mock('./sections/indicators-section-component', () => ({
  default: () => <section data-testid="indicators-section" />,
}));

describe('TutorialsComponent', () => {
  it('renders sections and jumps to a section button target', () => {
    const scrollIntoView = vi.fn();
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    vi.spyOn(document, 'getElementById').mockImplementation((id) => ({
      id,
      scrollIntoView,
      getBoundingClientRect: () => ({ top: 0 }),
    }));

    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1000);

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <TutorialsComponent />
      </LightModeContext.Provider>
    );

    const infoPane = screen.getByTestId('species-section').parentElement;
    infoPane.addEventListener = addEventListener;
    infoPane.removeEventListener = removeEventListener;

    expect(screen.getByTestId('species-section')).toBeInTheDocument();
    expect(screen.getByTestId('regions-section')).toBeInTheDocument();
    expect(screen.getByTestId('indicators-section')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Species' }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('renders all jump targets, including indicators', () => {
    const scrollIntoView = vi.fn();

    vi.spyOn(document, 'getElementById').mockImplementation((id) => ({
      id,
      scrollIntoView,
      getBoundingClientRect: () => ({ top: 400 }),
    }));

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <TutorialsComponent />
      </LightModeContext.Provider>
    );

    expect(screen.getByRole('button', { name: 'Regions' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Indicators' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Species Protection Index' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Species Habitat Index' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Species Informcation Index' })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Data Layers' }));
    fireEvent.click(screen.getByRole('button', { name: 'Indicator Scores' }));
    fireEvent.click(screen.getByRole('button', { name: 'Regions' }));
    fireEvent.click(screen.getByRole('button', { name: 'Indicators' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Species Protection Index' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Species Habitat Index' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Species Informcation Index' })
    );

    expect(scrollIntoView).toHaveBeenCalledTimes(7);
  });
});
