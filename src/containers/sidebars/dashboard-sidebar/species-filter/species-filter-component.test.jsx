import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { LightModeContext } from 'context/light-mode';
import {
  LAYER_OPTIONS,
  NAVIGATION,
  REGION_OPTIONS,
} from 'constants/dashboard-constants';
import { DASHBOARD_URLS } from 'constants/layers-urls';

import SpeciesFilterComponent from './species-filter-component';

const mockGetToken = vi.fn();
const mockAddProtectedAreaLayer = vi.fn();
const mockGetFeatureLayer = vi.fn();
const graphicsLayerAddSpy = vi.fn();
const graphicSpy = vi.fn();
const filterRenderSpy = vi.fn();

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

vi.mock('he-components', () => ({
  Modal: ({ isOpen, children }) => (isOpen ? <div>{children}</div> : null),
}));

vi.mock('components/button', () => ({
  default: ({ label, handleClick, className }) => (
    <button className={className} onClick={handleClick} type="button">
      {label}
    </button>
  ),
}));

vi.mock('components/filters', () => ({
  default: (props) => {
    filterRenderSpy(props);
    return (
      <button
        type="button"
        onClick={() => props.updateActiveFilter(props.filters[0].filters[0])}
      >
        toggle filter
      </button>
    );
  },
}));

vi.mock('components/species-list', () => ({
  default: () => <div data-testid="species-list" />,
}));

vi.mock('services/esri-feature-service', () => ({
  default: {
    addProtectedAreaLayer: (...args) => mockAddProtectedAreaLayer(...args),
    getFeatureLayer: (...args) => mockGetFeatureLayer(...args),
  },
}));

vi.mock('@arcgis/core/layers/GraphicsLayer', () => ({
  default: function GraphicsLayer(config) {
    return {
      ...config,
      add: (...args) => graphicsLayerAddSpy(...args),
      graphics: [],
    };
  },
}));

vi.mock('@arcgis/core/Graphic', () => ({
  default: function Graphic(config) {
    graphicSpy(config);
    return config;
  },
}));

vi.mock('hooks/useJWTToken', () => ({
  default: () => ({ getToken: mockGetToken }),
}));

const buildLayer = (id) => ({
  id,
  renderer: { symbol: { url: 'legend-icon' } },
});

const createProps = (overrides = {}) => ({
  selectedRegionOption: REGION_OPTIONS.PROTECTED_AREAS,
  setSelectedRegionOption: vi.fn(),
  setSelectedIndex: vi.fn(),
  setSelectedTaxa: vi.fn(),
  setExploreAllSpecies: vi.fn(),
  speciesListLoading: false,
  setSelectedGeometryRings: vi.fn(),
  selectedRegion: { id: 1 },
  setRegionName: vi.fn(),
  exploreAllSpecies: false,
  setSelectedRegion: vi.fn(),
  regionName: 'Kaieteur',
  setMapLegendLayers: vi.fn((updater) =>
    typeof updater === 'function' ? updater([]) : updater
  ),
  setRegionLayers: vi.fn((updater) =>
    typeof updater === 'function' ? updater({}) : updater
  ),
  regionLayers: {},
  geometry: null,
  view: {
    whenLayerView: vi.fn(() => Promise.resolve({})),
    goTo: vi.fn(() => Promise.resolve()),
    zoom: 7,
  },
  map: { add: vi.fn() },
  countryISO: 'GUY',
  ...overrides,
});

const renderComponent = (overrides = {}) => {
  const props = createProps(overrides);
  const result = render(
    <LightModeContext.Provider value={{ lightMode: false }}>
      <SpeciesFilterComponent {...props} />
    </LightModeContext.Provider>
  );

  return { ...result, props };
};

describe('SpeciesFilterComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue('jwt-token');
    mockAddProtectedAreaLayer.mockResolvedValue(buildLayer('protected-layer'));
    mockGetFeatureLayer.mockResolvedValue(buildLayer('feature-layer'));
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: vi.fn() });
  });

  it('clears the selected region workflow when back is clicked', async () => {
    const { props } = renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Clear region selected')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Clear region selected'));

    expect(props.setSelectedTaxa).toHaveBeenCalledWith(null);
    expect(props.setSelectedRegion).toHaveBeenCalledWith(null);
    expect(props.setRegionName).toHaveBeenCalledWith('');
    expect(props.setSelectedGeometryRings).toHaveBeenCalledWith(null);
    expect(props.setSelectedRegionOption).toHaveBeenCalledWith(null);
    expect(props.setSelectedIndex).toHaveBeenCalledWith(NAVIGATION.REGION);
  });

  it('loads the protected areas layer on mount', async () => {
    const { props } = renderComponent({ selectedRegion: null });

    await waitFor(() => {
      expect(mockAddProtectedAreaLayer).toHaveBeenCalledWith(null, 'GUY');
      expect(props.map.add).toHaveBeenCalled();
      expect(props.setRegionLayers).toHaveBeenCalled();
      expect(props.setMapLegendLayers).toHaveBeenCalled();
    });
  });

  it('creates a custom-area graphic and zooms when a drawn region is selected', async () => {
    const selectedRegion = {
      customName: 'Saved polygon',
      rings: [
        [
          [0, 0],
          [1, 1],
          [1, 0],
        ],
      ],
    };
    const { props } = renderComponent({
      selectedRegionOption: REGION_OPTIONS.DRAW,
      selectedRegion,
    });

    await waitFor(() => {
      expect(graphicSpy).toHaveBeenCalled();
      expect(graphicsLayerAddSpy).toHaveBeenCalled();
      expect(props.map.add).toHaveBeenCalled();
      expect(props.view.goTo).toHaveBeenCalled();
      expect(props.setRegionName).toHaveBeenCalledWith('Saved polygon');
      expect(props.setExploreAllSpecies).toHaveBeenCalledWith(false);
    });
  });

  it('saves a drawn custom area through the modal flow', async () => {
    const selectedRegion = {
      rings: [
        [
          [0, 0],
          [1, 1],
          [1, 0],
        ],
      ],
    };
    renderComponent({
      selectedRegionOption: REGION_OPTIONS.DRAW,
      selectedRegion,
    });

    await waitFor(() => {
      expect(screen.getByText('Save this custom area')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Save this custom area'));
    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'Custom AOI' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Describe this custom area...'),
      {
        target: { value: 'Notes' },
      }
    );
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockGetToken).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        DASHBOARD_URLS.CREATE_CUSTOM_AREA_URL,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            ISO3: 'GUY',
            Authorization: 'Bearer jwt-token',
          }),
          body: JSON.stringify({
            region_name: 'Custom AOI',
            region_description: 'Notes',
            geojson: {
              type: 'polygon',
              coordinates: selectedRegion.rings,
            },
          }),
        })
      );
    });
  });

  it('adds a new custom-area overlay when geometry changes in draw mode', async () => {
    const geometry = { rings: [[[0, 0]]] };
    const { props } = renderComponent({
      selectedRegionOption: REGION_OPTIONS.DRAW,
      selectedRegion: null,
      geometry,
    });

    await waitFor(() => {
      expect(graphicSpy).toHaveBeenCalledWith(
        expect.objectContaining({ geometry })
      );
      expect(props.map.add).toHaveBeenCalled();
      expect(props.setRegionLayers).toHaveBeenCalled();
    });
  });

  it('wires filter toggles back into parent state', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('toggle filter')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('toggle filter'));

    expect(filterRenderSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
    const latestFilters = filterRenderSpy.mock.calls.at(-1)[0].filters;
    expect(latestFilters[0].filters[0].active).toBe(true);
  });

  it('evaluates every filter predicate for matching and non-matching species data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(filterRenderSpy).toHaveBeenCalled();
    });

    const filters = filterRenderSpy.mock.calls.at(-1)[0].filters;
    const predicates = Object.fromEntries(
      filters.flatMap((group) =>
        group.filters.map((filter) => [filter.name, filter.test])
      )
    );

    expect(
      predicates['Expert Range Map']({
        datasetList: [{ product_type: 'range' }],
      })
    ).toBe(true);
    expect(predicates['Expert Range Map']({ datasetList: [] })).toBe(false);

    expect(predicates['Refined Range Map']({ global_shi: 1 })).toBe(true);
    expect(predicates['Refined Range Map']({ global_shi: 0 })).toBe(false);

    expect(
      predicates['Occurrence']({
        datasetList: [{ product_type: 'points' }],
      })
    ).toBe(true);
    expect(predicates['Occurrence']({ datasetList: [] })).toBe(false);

    expect(
      predicates['Private Occurrence']({ product_type: 'private_source' })
    ).toBe(true);
    expect(predicates['Private Occurrence']({})).toBe(false);

    expect(
      predicates['Rapid Inventory Assessment']({
        datasetList: [{ product_type: 'rapid_inventory' }],
      })
    ).toBe(true);
    expect(predicates['Rapid Inventory Assessment']({ datasetList: [] })).toBe(
      false
    );

    expect(
      predicates['Critically Endangered']({
        traits: { threat_status_code: 'cr' },
      })
    ).toBe(true);
    expect(
      predicates['Endangered']({ traits: { threat_status_code: 'EN' } })
    ).toBe(true);
    expect(
      predicates['Vulnerable']({ traits: { threat_status_code: 'VU' } })
    ).toBe(true);
    expect(
      predicates['Near Threatened']({
        traits: { threat_status_code: 'NT' },
      })
    ).toBe(true);
    expect(
      predicates['Least Concern']({ traits: { threat_status_code: 'LC' } })
    ).toBe(true);
    expect(
      predicates['Data Deficient']({ traits: { threat_status_code: 'DD' } })
    ).toBe(true);
    expect(
      predicates['Not Evaluated']({ traits: { threat_status_code: 'UN' } })
    ).toBe(true);
    expect(predicates['Not Evaluated']({ traits: {} })).toBe(false);
  });

  it('loads province and indigenous layers for province browsing', async () => {
    const { props } = renderComponent({
      selectedRegionOption: REGION_OPTIONS.PROVINCES,
      selectedRegion: null,
    });

    await waitFor(() => {
      expect(mockGetFeatureLayer).toHaveBeenCalledTimes(2);
      expect(props.map.add).toHaveBeenCalledTimes(2);
    });
  });

  it('renders Peru-specific save modal copy for drawn areas', async () => {
    renderComponent({
      countryISO: 'PER',
      selectedRegionOption: REGION_OPTIONS.DRAW,
      selectedRegion: {
        rings: [
          [
            [0, 0],
            [1, 1],
            [1, 0],
          ],
        ],
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText('Guardar esta área personalizada')
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Guardar esta área personalizada'));

    expect(screen.getByText('Guardar área personalizada')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Describe esta área personalizada...')
    ).toBeInTheDocument();
  });
});
