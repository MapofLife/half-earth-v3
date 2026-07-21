import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LightModeContext } from 'context/light-mode';
import { NAVIGATION } from 'constants/dashboard-constants';
import ScoreDistributionsShiComponent from './score-distributions-shi-component';

let chartProps;

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
  useLocale: () => 'en',
  T: ({ _str }) => <span>{_str}</span>,
}));

vi.mock('@transifex/native', () => ({
  tx: { currentLocale: 'en' },
}));

vi.mock('utils/css-utils', () => ({
  getCSSVariable: (value) => value,
}));

vi.mock('he-components', () => ({
  Loading: () => <div data-testid="loading" />,
}));

vi.mock('components/button', () => ({
  default: ({ label, handleClick }) => (
    <button type="button" onClick={handleClick}>
      {label}
    </button>
  ),
}));

vi.mock('components/chart-info-popup/chart-info-component', () => ({
  default: ({ children }) => <div data-testid="chart-info">{children}</div>,
}));

vi.mock(
  'components/charts/distribution-chart/distribution-chart-component',
  () => ({
    default: (props) => {
      chartProps = props;
      return (
        <button
          type="button"
          data-testid="distribution-chart"
          onClick={() =>
            props.options?.onClick?.(
              null,
              [
                {
                  datasetIndex: 0,
                  index: 0,
                  label: '0',
                },
              ],
              {}
            )
          }
        >
          chart
        </button>
      );
    },
  })
);

vi.mock('components/species-richness/species-richness-component', () => ({
  default: () => <div data-testid="species-richness" />,
}));

vi.mock('components/taxa-image', () => ({
  default: ({ taxa }) => <div data-testid={`taxa-${taxa}`} />,
}));

vi.mock('./distributions-table', () => ({
  default: () => <div data-testid="distributions-table" />,
}));

vi.mock('../../../dashboard-sidebar/tutorials/sections/sections-info', () => ({
  SECTION_INFO: { SHI_SCORE_DISTRIBUTIONS: 'shi info' },
}));

vi.mock('../../dashboard-trends-sidebar-component', () => ({
  NATIONAL_TREND: 'NATIONAL',
  PROVINCE_TREND: 'PROVINCE',
  ZONE_3: 'ZONE_3',
  ZONE_5: 'ZONE_5',
}));

vi.mock(
  'images/dashboard/tutorials/tutorial_shi_scoreDist-en.png?react',
  () => ({
    default: 'shi-en',
  })
);

vi.mock(
  'images/dashboard/tutorials/tutorial_shi_scoreDist-fr.png?react',
  () => ({
    default: 'shi-fr',
  })
);

describe('ScoreDistributionsShiComponent', () => {
  beforeEach(() => {
    chartProps = undefined;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders score distributions and allows selecting a highlighted species', async () => {
    const setScientificName = vi.fn();
    const setSelectedIndex = vi.fn();
    const setMapLegendLayers = vi.fn();
    const setFromTrends = vi.fn();
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsShiComponent
          setScientificName={setScientificName}
          setSelectedIndex={setSelectedIndex}
          shiScoresData={[
            {
              bin: '0, habitat',
              amphibians: 1,
              birds: 2,
              mammals: 3,
              reptiles: 4,
            },
          ]}
          shiSelectSpeciesData={[
            {
              species_shs: [
                {
                  species: 'Pipra aureola',
                  commonname: 'Crimson-hooded Manakin',
                  species_url: 'image',
                  shs_score: 84.6,
                  taxa: 'birds',
                },
              ],
            },
          ]}
          shiActiveTrend="NATIONAL"
          setMapLegendLayers={setMapLegendLayers}
          selectedProvince={{ region_name: 'Cusco', region_key: 'cusco' }}
          setFromTrends={setFromTrends}
          lang="en"
          countryISO="PER"
          zoneHistrogramData={[]}
        />
      </LightModeContext.Provider>
    );

    expect(screen.getByText('Score Distributions')).toBeInTheDocument();
    expect(screen.getByTestId('species-richness')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Crimson-hooded Manakin')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Crimson-hooded Manakin'));

    expect(setMapLegendLayers).toHaveBeenCalledWith([]);
    expect(setFromTrends).toHaveBeenCalledWith(true);
    expect(setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.DATA_LAYER);
    expect(setScientificName).toHaveBeenCalledWith('Pipra aureola');
    expect(setItemSpy).toHaveBeenCalledWith(
      'species_selected',
      'Pipra aureola'
    );
  });

  it('uses curated GUY species highlights for national trend', async () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsShiComponent
          setScientificName={vi.fn()}
          setSelectedIndex={vi.fn()}
          shiScoresData={[
            {
              bin: '0, habitat',
              amphibians: 1,
              birds: 2,
              mammals: 3,
              reptiles: 4,
            },
          ]}
          shiSelectSpeciesData={[{ species_shs: [] }]}
          shiActiveTrend="NATIONAL"
          setMapLegendLayers={vi.fn()}
          selectedProvince={{ region_name: 'Region', region_key: 'region' }}
          setFromTrends={vi.fn()}
          lang="en"
          countryISO="GUY"
          zoneHistrogramData={[]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Crimson-hooded Manakin')).toBeInTheDocument();
    });
  });

  it('loads species from zone histogram data and allows selecting a zone species', async () => {
    const setScientificName = vi.fn();
    const setSelectedIndex = vi.fn();
    const setMapLegendLayers = vi.fn();
    const setFromTrends = vi.fn();

    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsShiComponent
          setScientificName={setScientificName}
          setSelectedIndex={setSelectedIndex}
          shiScoresData={[
            {
              bin: '0, habitat',
              amphibians: 1,
              birds: 2,
              mammals: 3,
              reptiles: 4,
            },
          ]}
          shiSelectSpeciesData={[]}
          shiActiveTrend="ZONE_3"
          setMapLegendLayers={setMapLegendLayers}
          selectedProvince={{ region_name: 'Cusco', region_key: 'ACC_3_CUSCO' }}
          setFromTrends={setFromTrends}
          lang="en"
          countryISO="PER"
          zoneHistrogramData={[
            {
              region_key: 'ACC_3_CUSCO',
              project: 'per',
              bin: '0, habitat',
              amphibians: 1,
              birds: 2,
              mammals: 3,
              reptiles: 4,
              species_shs: [
                {
                  '': {
                    species: 'Testus zonus',
                    commonname: 'Zone Species',
                    species_url: 'zone-image',
                    shs_score: 12.3,
                    stewardship: 0.3,
                    taxa: 'birds',
                    threat_status: 'Least Concern',
                  },
                },
              ],
            },
          ]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Zone Species')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Zone Species'));
    expect(setMapLegendLayers).toHaveBeenCalledWith([]);
    expect(setFromTrends).toHaveBeenCalledWith(true);
    expect(setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.DATA_LAYER);
    expect(setScientificName).toHaveBeenCalledWith('Testus zonus');
  });

  it('requests bucket species when chart bars are clicked', async () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsShiComponent
          setScientificName={vi.fn()}
          setSelectedIndex={vi.fn()}
          shiScoresData={[
            {
              bin: '0, habitat',
              amphibians: 1,
              birds: 2,
              mammals: 3,
              reptiles: 4,
            },
          ]}
          shiSelectSpeciesData={[]}
          shiActiveTrend="NATIONAL"
          setMapLegendLayers={vi.fn()}
          selectedProvince={{ region_name: 'Cusco', region_key: 'cusco' }}
          setFromTrends={vi.fn()}
          lang="en"
          countryISO="PER"
          zoneHistrogramData={[]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('distribution-chart')).toBeInTheDocument();
      expect(chartProps).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('distribution-chart'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('formats SHI tooltip title for regular and top buckets', async () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsShiComponent
          setScientificName={vi.fn()}
          setSelectedIndex={vi.fn()}
          shiScoresData={[
            {
              bin: '0, habitat',
              amphibians: 1,
              birds: 2,
              mammals: 3,
              reptiles: 4,
            },
          ]}
          shiSelectSpeciesData={[
            {
              species_shs: [
                {
                  species: 'Pipra aureola',
                  commonname: 'Crimson-hooded Manakin',
                  species_url: 'image',
                  shs_score: 84.6,
                  taxa: 'birds',
                },
              ],
            },
          ]}
          shiActiveTrend="NATIONAL"
          setMapLegendLayers={vi.fn()}
          selectedProvince={{ region_name: 'Cusco', region_key: 'cusco' }}
          setFromTrends={vi.fn()}
          lang="en"
          countryISO="PER"
          zoneHistrogramData={[]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(chartProps).toBeDefined();
    });

    expect(
      chartProps.options.plugins.tooltip.callbacks.title([{ label: '120' }])
    ).toBe('> 120');
    expect(
      chartProps.options.plugins.tooltip.callbacks.title([{ label: '20' }])
    ).toBe('20 - 25');
  });

  it('uses EE zone histogram data when active trend is zone and country is EE', async () => {
    render(
      <LightModeContext.Provider value={{ lightMode: false }}>
        <ScoreDistributionsShiComponent
          setScientificName={vi.fn()}
          setSelectedIndex={vi.fn()}
          shiScoresData={[
            {
              bin: '0, habitat',
              amphibians: 0,
              birds: 0,
              mammals: 0,
              reptiles: 0,
            },
          ]}
          shiSelectSpeciesData={[]}
          shiActiveTrend="ZONE_5"
          setMapLegendLayers={vi.fn()}
          selectedProvince={{ region_name: 'MEX', region_key: 'MEX' }}
          setFromTrends={vi.fn()}
          lang="en"
          countryISO="EE"
          zoneHistrogramData={[
            {
              project: 'eewwf',
              region_key: 'MEX',
              bin: '0, habitat',
              birds_shi_count: 2,
              mammals_shi_count: 1,
              reptiles_shi_count: 1,
              amphibians_shi_count: 1,
              species_shs: [
                {
                  '': {
                    species: 'Zoneus ee',
                    commonname: 'EE Zone Species',
                    species_url: 'zone-image',
                    shs_score: 7.5,
                    stewardship: 0.2,
                    taxa: 'birds',
                    threat_status: 'Least Concern',
                  },
                },
              ],
            },
          ]}
        />
      </LightModeContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('EE Zone Species')).toBeInTheDocument();
      expect(screen.getByTestId('distribution-chart')).toBeInTheDocument();
    });
  });
});
