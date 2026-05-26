import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import SpeciesInfoComponent from './species-info-component';

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
  useLocale: () => 'en',
}));

vi.mock('@transifex/native', () => ({
  tx: { currentLocale: 'en' },
}));

vi.mock('utils/dashboard-utils.js', () => ({
  IUCNStatusTypes: { CR: 'Critically Endangered' },
}));

vi.mock('components/button', () => ({
  default: ({ label, handleClick }) => (
    <button type="button" onClick={handleClick}>
      {label}
    </button>
  ),
}));

vi.mock('components/taxa-image', () => ({
  default: ({ taxa }) => <div data-testid={`taxa-${taxa}`} />,
}));

describe('SpeciesInfoComponent', () => {
  it('renders species metadata and expands long localized content', async () => {
    const longText = 'A'.repeat(401);

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <SpeciesInfoComponent
          speciesInfo={{
            commonname: 'Wolf Monkey',
            scientificname: 'Cercopithecus wolfi',
            taxa: 'mammals',
            image: { url: 'wolfi.jpg' },
            redlist: 'CR',
            info: [{ lang: 'en', content: longText }],
          }}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Wolf Monkey')).toBeInTheDocument();
    });

    expect(screen.getByTestId('taxa-mammals')).toBeInTheDocument();
    expect(screen.getByText('Critically Endangered')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Wikipedia' })).toHaveAttribute(
      'href',
      'https://en.wikipedia.org/wiki/Cercopithecus_wolfi'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show more' }));
    expect(
      screen.getByRole('button', { name: 'Show less' })
    ).toBeInTheDocument();
  });

  it('covers image overrides, fallback content language, and hides the show more button for short text', async () => {
    const { rerender } = render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <SpeciesInfoComponent
          speciesInfo={{
            commonname: 'Red Parrot',
            scientificname: 'Psittacus erithacus',
            taxa: 'birds',
            image: { url: null },
            info: [
              { lang: 'fr', content: 'Texte court' },
              { lang: 'es', content: 'Texto corto' },
            ],
          }}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Red Parrot')).toBeInTheDocument();
    });

    expect(screen.getByText('Texte court')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show more' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'species' })).toHaveAttribute(
      'src',
      'https://inaturalist-open-data.s3.amazonaws.com/photos/47367883/medium.jpg'
    );

    rerender(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <SpeciesInfoComponent
          speciesInfo={{
            commonname: 'Viper',
            scientificname: 'Bitis nasicornis',
            taxa: 'reptiles',
            image: { url: null },
            info: [{ lang: 'en', content: 'Short description' }],
          }}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'species' })).toHaveAttribute(
        'src',
        'https://inaturalist-open-data.s3.amazonaws.com/photos/395167898/original.jpeg'
      );
    });

    rerender(
      <LightModeContext.Provider value={{ lightMode: true }}>
        <SpeciesInfoComponent
          speciesInfo={{
            commonname: 'Reed Frog',
            scientificname: 'Chiromantis rufescens',
            taxa: 'amphibians',
            image: { url: null },
            info: [{ lang: 'en', content: 'Short description' }],
          }}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'species' })).toHaveAttribute(
        'src',
        'https://inaturalist-open-data.s3.amazonaws.com/photos/81338343/large.jpeg'
      );
    });

    rerender(
      <LightModeContext.Provider value={{ lightMode: true }}>
        <SpeciesInfoComponent
          speciesInfo={{
            commonname: 'Generic Bat',
            scientificname: 'Myotis nigricans',
            taxa: 'mammals',
            image: { url: null },
            info: [{ lang: 'en', content: 'Short description' }],
          }}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'species' })).toHaveAttribute(
        'src',
        'dashboard/default_photo_mammals.png'
      );
    });
  });
});
