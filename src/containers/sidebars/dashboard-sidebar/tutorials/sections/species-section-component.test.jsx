import React from 'react';
import { render, screen } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import SpeciesSectionComponent from './species-section-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
  useLocale: () => 'en',
}));

vi.mock('utils/dashboard-utils.js', () => ({
  tutorialSections: {
    SPECIES: 'species',
    DATA_LAYERS: 'data-layers',
    INDICATOR_SCORES: 'indicator-scores',
  },
}));

vi.mock('components/image-popup/image-popup-component', () => ({
  default: ({ children }) => <div data-testid="image-popup">{children}</div>,
}));

vi.mock('icons/bird_icon.svg?react', () => ({ default: () => <svg /> }));
vi.mock('icons/gauge_icon.svg?react', () => ({ default: () => <svg /> }));
vi.mock('icons/stacks.svg?react', () => ({ default: () => <svg /> }));
vi.mock('./sections-info', () => ({
  SECTION_INFO: {
    SPECIES: 'Species section',
    DATA_LAYER: 'Data layers section',
    INDICATOR_SCORES: 'Indicator scores section',
  },
}));

describe('SpeciesSectionComponent', () => {
  it('renders the species tutorial content', () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <SpeciesSectionComponent />
      </LightModeContext.Provider>
    );

    expect(
      screen.getByRole('heading', { name: 'Species' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Data Layers' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Indicator Scores' })
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('image-popup')).toHaveLength(3);
  });

  it('renders under light mode without changing the tutorial structure', () => {
    render(
      <LightModeContext.Provider value={{ lightMode: true }}>
        <SpeciesSectionComponent />
      </LightModeContext.Provider>
    );

    expect(screen.getAllByRole('img')).toHaveLength(3);
  });
});
