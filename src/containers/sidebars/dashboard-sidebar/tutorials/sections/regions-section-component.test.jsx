import React from 'react';
import { render, screen } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import RegionsSectionComponent from './regions-section-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
  useLocale: () => 'en',
}));

vi.mock('utils/dashboard-utils.js', () => ({
  tutorialSections: { REGIONS: 'regions' },
}));

vi.mock('@mui/icons-material/SouthAmerica', () => ({ default: () => <svg /> }));
vi.mock('components/image-popup/image-popup-component', () => ({
  default: ({ children }) => <div data-testid="image-popup">{children}</div>,
}));
vi.mock('./sections-info', () => ({
  SECTION_INFO: {
    REGIONS: 'Regions intro',
    REGIONS_TWO: 'Regions follow-up',
  },
}));

describe('RegionsSectionComponent', () => {
  it('renders region tutorial content', () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <RegionsSectionComponent />
      </LightModeContext.Provider>
    );

    expect(
      screen.getByRole('heading', { name: 'Regions' })
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('image-popup')).toHaveLength(2);
  });

  it('renders the same tutorial assets in light mode', () => {
    render(
      <LightModeContext.Provider value={{ lightMode: true }}>
        <RegionsSectionComponent />
      </LightModeContext.Provider>
    );

    expect(screen.getAllByRole('img')).toHaveLength(2);
  });
});
