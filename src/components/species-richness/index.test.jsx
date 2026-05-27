import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from '../../context/light-mode';
import SpeciesRichness from './index';

const spiArcChartSpy = vi.fn();
const NATIONAL_TREND = 'NATIONAL';
const PROVINCE_TREND = 'PROVINCE';
const ZONE_5 = 'ZONE_5';

const getLatestArcProps = (species) => {
  const matchingCalls = spiArcChartSpy.mock.calls.filter(
    ([props]) => props.species === species
  );

  return matchingCalls.at(-1)?.[0];
};

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

vi.mock('utils/css-utils', () => ({
  getCSSVariable: (value) => value,
}));

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: {},
  LinearScale: {},
  ArcElement: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

vi.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="mock-doughnut" />,
}));

vi.mock(
  '../../containers/sidebars/dashboard-trends-sidebar/dashboard-trends-sidebar-component',
  () => ({
    NATIONAL_TREND: 'NATIONAL',
    PROVINCE_TREND: 'PROVINCE',
    ZONE_3: 'ZONE_3',
    ZONE_5: 'ZONE_5',
  })
);

vi.mock('images/dashboard/amphibian_icon_black.png?react', () => ({
  default: 'amphibian-black',
}));
vi.mock('images/dashboard/amphibian_icon_white.png?react', () => ({
  default: 'amphibian-white',
}));
vi.mock('images/dashboard/bird_icon_black.png?react', () => ({
  default: 'bird-black',
}));
vi.mock('images/dashboard/bird_icon_white.png?react', () => ({
  default: 'bird-white',
}));
vi.mock('images/dashboard/mammal_icon_black.png?react', () => ({
  default: 'mammal-black',
}));
vi.mock('images/dashboard/mammal_icon_white.png?react', () => ({
  default: 'mammal-white',
}));
vi.mock('images/dashboard/reptile_icon_black.png?react', () => ({
  default: 'reptile-black',
}));
vi.mock('images/dashboard/reptile_icon_white.png?react', () => ({
  default: 'reptile-white',
}));

vi.mock('../charts/spi-arc-chart/spi-arc-chart-component', () => ({
  default: (props) => {
    spiArcChartSpy(props);
    return <div data-testid={`spi-arc-${props.species}`} />;
  },
}));

const createProps = (overrides = {}) => ({
  selectedProvince: null,
  activeTrend: NATIONAL_TREND,
  provinces: [
    {
      year: 2023,
      name: 'Loreto',
      richness_taxa_spi: {
        birds: '50',
        mammals: '30',
        reptiles: '20',
        amphibians: '10',
      },
      spi_taxa: {
        birds: '25',
        mammals: '15',
        reptiles: '10',
        amphibians: '5',
      },
      richness_taxa_shi: {
        birds: '60',
        mammals: '40',
        reptiles: '20',
        amphibians: '10',
      },
      habitat_index_taxa: {
        birds: '0.4',
        mammals: '0.5',
        reptiles: '0.2',
        amphibians: '0.1',
      },
      richness_taxa_sii: {
        birds: '70',
        mammals: '50',
        reptiles: '30',
        amphibians: '20',
      },
      sii_taxa: {
        birds: '12',
        mammals: '22',
        reptiles: '8',
        amphibians: '4',
      },
    },
  ],
  countryData: [
    {
      richness_taxa_spi: {
        birds: '100',
        mammals: '80',
        reptiles: '60',
        amphibians: '40',
      },
      spi_taxa: {
        birds: '40',
        mammals: '20',
        reptiles: '10',
        amphibians: '5',
      },
    },
  ],
  zoneData: [
    {
      region_key: 'zone-1',
      iso3: 'ECU',
      year: 2022,
      richness_taxa_spi: {
        birds: '90',
        mammals: '70',
        reptiles: '50',
        amphibians: '30',
      },
      spi_taxa: {
        birds: '35',
        mammals: '25',
        reptiles: '15',
        amphibians: '10',
      },
      richness_taxa_shi: JSON.stringify([
        {
          birds: '90',
          mammals: '70',
          reptiles: '50',
          amphibians: '30',
        },
      ]),
      habitat_index_taxa: JSON.stringify([
        {
          birds: '0.45',
          mammals: '0.35',
          reptiles: '0.25',
          amphibians: '0.15',
        },
      ]),
    },
  ],
  shiActiveTrend: NATIONAL_TREND,
  shiCountryData: [
    {
      year: 2023,
      richness_taxa_shi: {
        birds: '100',
        mammals: '80',
        reptiles: '60',
        amphibians: '40',
      },
      habitat_index_taxa: {
        birds: '0.4',
        mammals: '0.2',
        reptiles: '0.1',
        amphibians: '0.05',
      },
    },
  ],
  siiCountryData: [
    {
      year: 2023,
      richness_taxa_sii: {
        birds: '100',
        mammals: '80',
        reptiles: '60',
        amphibians: '40',
      },
      sii_taxa: {
        birds: '14',
        mammals: '10',
        reptiles: '6',
        amphibians: '3',
      },
    },
  ],
  siiActiveTrend: NATIONAL_TREND,
  countryISO: 'PER',
  shi: false,
  sii: false,
  ...overrides,
});

const renderComponent = (props) =>
  render(
    <LightModeContext.Provider value={{ lightMode: false }}>
      <SpeciesRichness {...props} />
    </LightModeContext.Provider>
  );

const renderComponentWithLightMode = (props, lightMode = false) =>
  render(
    <LightModeContext.Provider value={{ lightMode }}>
      <SpeciesRichness {...props} />
    </LightModeContext.Provider>
  );

describe('SpeciesRichness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the national SPI title and passes country scores to all arc charts', async () => {
    renderComponent(createProps());

    await waitFor(() => {
      expect(
        screen.getByText('NATIONAL SPI POR GRUPO TAXONÓMICO')
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId('spi-arc-birds')).toBeInTheDocument();
    expect(screen.getByTestId('spi-arc-mammals')).toBeInTheDocument();
    expect(screen.getByTestId('spi-arc-reptiles')).toBeInTheDocument();
    expect(screen.getByTestId('spi-arc-amphibians')).toBeInTheDocument();

    await waitFor(() => {
      expect(getLatestArcProps('birds').value).toBe(40);
      expect(getLatestArcProps('birds').scores.birds.total).toBe(100);
    });
  });

  it('renders province SHI title and uses province habitat index values', async () => {
    renderComponent(
      createProps({
        shi: true,
        shiActiveTrend: PROVINCE_TREND,
        selectedProvince: { name: 'Loreto', region_key: 'zone-1' },
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText('Loreto SHI POR GRUPO TAXONÓMICO')
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getLatestArcProps('mammals').value).toBe(0.5);
      expect(getLatestArcProps('mammals').scores.mammals.total).toBe(40);
    });
  });

  it('renders province SII title and uses the selected province latest year data', async () => {
    renderComponent(
      createProps({
        countryISO: 'COL',
        sii: true,
        siiActiveTrend: PROVINCE_TREND,
        selectedProvince: { name: 'Loreto' },
        provinces: [
          {
            year: 2024,
            name: 'Loreto',
            richness_taxa_sii: {
              birds: '70',
              mammals: '50',
              reptiles: '30',
              amphibians: '20',
            },
            sii_taxa: {
              birds: '12',
              mammals: '22',
              reptiles: '8',
              amphibians: '4',
            },
          },
        ],
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText('Loreto SII BY TAXONOMIC GROUP')
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getLatestArcProps('amphibians').value).toBe(4);
      expect(getLatestArcProps('amphibians').scores.amphibians.total).toBe(20);
    });
  });

  it('uses zone data for accepted SPI zone trends when a province is selected', async () => {
    renderComponent(
      createProps({
        countryISO: 'COL',
        activeTrend: 'PER',
        selectedProvince: { name: 'Amazon Zone', region_key: 'zone-1' },
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText('Amazon Zone SPI BY TAXONOMIC GROUP')
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getLatestArcProps('reptiles').value).toBe(15);
      expect(getLatestArcProps('reptiles').scores.reptiles.total).toBe(50);
    });
  });

  it('uses EE WWF zone data on mount when country is EE', async () => {
    renderComponent(
      createProps({
        countryISO: 'EE',
        selectedProvince: {
          name: 'WWF Zone',
          region_key: 'zone-1',
          iso3: 'ECU',
        },
      })
    );

    await waitFor(() => {
      expect(getLatestArcProps('birds').value).toBe(35);
      expect(getLatestArcProps('birds').scores.birds.total).toBe(90);
    });
  });

  it('uses SHI zone values when SHI active trend is a zone trend', async () => {
    renderComponent(
      createProps({
        countryISO: 'COL',
        shi: true,
        activeTrend: 'PER',
        shiActiveTrend: ZONE_5,
        selectedProvince: { name: 'Amazon Zone', region_key: 'zone-1' },
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText('Amazon Zone SHI BY TAXONOMIC GROUP')
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getLatestArcProps('birds').value).toBe(45);
      expect(getLatestArcProps('birds').scores.birds.total).toBe(90);
    });
  });

  it('uses national SII data when no province is selected', async () => {
    renderComponent(
      createProps({
        countryISO: 'COL',
        sii: true,
        siiActiveTrend: NATIONAL_TREND,
        selectedProvince: null,
        siiCountryData: [
          {
            year: 2024,
            richness_taxa_sii: {
              birds: '100',
              mammals: '80',
              reptiles: '60',
              amphibians: '40',
            },
            sii_taxa: {
              birds: '14',
              mammals: '10',
              reptiles: '6',
              amphibians: '3',
            },
          },
        ],
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText('NATIONAL SII BY TAXONOMIC GROUP')
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getLatestArcProps('mammals').value).toBe(10);
      expect(getLatestArcProps('mammals').scores.mammals.total).toBe(80);
    });
  });

  it('uses default province SPI data when trend is province and no zone branch is active', async () => {
    renderComponent(
      createProps({
        countryISO: 'COL',
        activeTrend: PROVINCE_TREND,
        selectedProvince: { name: 'Loreto' },
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText('Loreto SPI BY TAXONOMIC GROUP')
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getLatestArcProps('birds').value).toBe(25);
      expect(getLatestArcProps('birds').scores.birds.total).toBe(50);
    });
  });

  it('uses the Guyana special-case SPI fields when country data is not taxa-shaped', async () => {
    renderComponent(
      createProps({
        countryISO: 'guy-fm',
        countryData: [
          {
            BirdSpeciesRichness: 120,
            BirdSPI: 55,
            MammalSpeciesRichness: 90,
            MammalSPI: 33,
            ReptileSpeciesRichness: 70,
            ReptileSPI: 22,
            AmphibianSpeciesRichness: 50,
            AmphibianSPI: 11,
          },
        ],
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText('NATIONAL SPI BY TAXONOMIC GROUP')
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getLatestArcProps('birds').value).toBe(55);
      expect(getLatestArcProps('birds').scores.birds.total).toBe(120);
      expect(getLatestArcProps('amphibians').value).toBe(11);
      expect(getLatestArcProps('amphibians').scores.amphibians.total).toBe(50);
    });
  });

  it('renders SHI national title when no province is selected', async () => {
    renderComponent(
      createProps({
        countryISO: 'COL',
        shi: true,
        shiActiveTrend: NATIONAL_TREND,
        selectedProvince: null,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText('NATIONAL SHI BY TAXONOMIC GROUP')
      ).toBeInTheDocument();
    });
  });

  it('renders SII zone title branch when a zone trend and province are selected', async () => {
    renderComponent(
      createProps({
        countryISO: 'COL',
        sii: true,
        activeTrend: 'PER',
        siiActiveTrend: ZONE_5,
        selectedProvince: { name: 'Amazon Zone', region_key: 'zone-1' },
        siiCountryData: [
          {
            year: 2024,
            richness_taxa_sii: {
              birds: '90',
              mammals: '70',
              reptiles: '50',
              amphibians: '30',
            },
            sii_taxa: {
              birds: '11',
              mammals: '9',
              reptiles: '7',
              amphibians: '5',
            },
          },
        ],
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText('Amazon Zone SII BY TAXONOMIC GROUP')
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getLatestArcProps('birds').value).toBe(11);
    });
  });

  it('passes dark icon variants when light mode is enabled', async () => {
    renderComponentWithLightMode(createProps(), true);

    await waitFor(() => {
      expect(getLatestArcProps('birds').img).toBe('bird-black');
      expect(getLatestArcProps('amphibians').img).toBe('amphibian-black');
    });
  });
});
