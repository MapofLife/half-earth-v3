import React, { useState } from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import {
  LAYER_OPTIONS,
  NAVIGATION,
  REGION_OPTIONS,
} from 'constants/dashboard-constants';

import AreaHighlightManagerComponent from './area-highlight-manager-component';

const mockPopupRender = vi.fn();
const mockWebMercatorToGeographic = vi.fn();

vi.mock('router', () => ({
  DASHBOARD: 'dashboard',
}));

vi.mock('@arcgis/core/geometry/support/webMercatorUtils.js', () => ({
  webMercatorToGeographic: (...args) => mockWebMercatorToGeographic(...args),
}));

vi.mock('@arcgis/core/core/promiseUtils.js', () => ({
  debounce: (callback) => callback,
}));

vi.mock('react-dom', () => ({
  default: {
    render: (...args) => mockPopupRender(...args),
  },
}));

vi.mock('components/dashboard-popup/dashboard-popup-component', () => ({
  default: (props) => <div data-testid="dashboard-popup">{props.DESIG}</div>,
}));

vi.mock(
  '../../containers/sidebars/dashboard-trends-sidebar/dashboard-trends-sidebar-component',
  () => ({
    NATIONAL_TREND: 'NATIONAL',
    PROVINCE_TREND: 'PROVINCE',
    MARINE: 'MARINE',
    TABS: {
      SHI: 1,
      SPI: 2,
      SII: 3,
    },
  })
);

function Harness({ setLayerViewSpy, ...props }) {
  const [layerView, setLayerView] = useState(props.layerView ?? null);

  const handleSetLayerView = (value) => {
    setLayerViewSpy?.(value);
    setLayerView(value);
  };

  return (
    <AreaHighlightManagerComponent
      {...props}
      layerView={layerView}
      setLayerView={handleSetLayerView}
    />
  );
}

const createView = (layerViewObject, hitTestResult) => {
  const handlers = {
    click: [],
    'pointer-move': [],
  };

  const view = {
    handlers,
    whenLayerView: vi.fn(async () => layerViewObject),
    on: vi.fn((eventName, callback) => {
      handlers[eventName].push(callback);
      return { remove: vi.fn() };
    }),
    hitTest: vi.fn(async () => ({
      results: hitTestResult ? [hitTestResult] : [],
    })),
    popup: {
      dockEnabled: true,
      dockOptions: {},
      content: null,
    },
    openPopup: vi.fn(),
    closePopup: vi.fn(),
    toMap: vi.fn(({ x, y }) => ({ x, y })),
  };

  return view;
};

const baseProps = (overrides = {}) => ({
  setSelectedIndex: vi.fn(),
  setSelectedRegion: vi.fn(),
  setSelectedGeometryRings: vi.fn(),
  setExploreAllSpecies: vi.fn(),
  selectedRegionOption: REGION_OPTIONS.PROTECTED_AREAS,
  setTaxaList: vi.fn(),
  mapLegendLayers: [],
  browsePage: vi.fn(),
  scientificName: 'Panthera onca',
  setSelectedProvince: vi.fn(),
  selectedIndex: NAVIGATION.REGION,
  tabOption: 2,
  regionLayers: {
    [LAYER_OPTIONS.PROTECTED_AREAS]: { id: LAYER_OPTIONS.PROTECTED_AREAS },
    [LAYER_OPTIONS.PROVINCES]: { id: LAYER_OPTIONS.PROVINCES },
    GUY: { id: 'GUY' },
    'GUY-outline': { id: 'GUY-outline' },
  },
  countryISO: 'GUY',
  activeTrend: 'PROVINCE',
  shiActiveTrend: 'PROVINCE',
  siiActiveTrend: 'PROVINCE',
  setRegionName: vi.fn(),
  setClickedRegion: vi.fn(),
  handleRegionSelected: vi.fn(),
  showHover: true,
  ...overrides,
});

describe('AreaHighlightManagerComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebMercatorToGeographic.mockReturnValue({
      rings: [
        [
          [10, 20],
          [30, 40],
          [50, 60],
        ],
      ],
    });
  });

  it('selects a protected area region from a click hit test', async () => {
    const highlightHandle = { remove: vi.fn() };
    const layerViewObject = {
      highlight: vi.fn(() => highlightHandle),
    };
    const hitGraphic = {
      attributes: {
        NAME: 'Kaieteur National Park',
        WDPA_PID: 'wdpa-123',
      },
      geometry: {
        rings: [
          [
            [1, 1],
            [2, 2],
            [3, 3],
          ],
        ],
      },
    };
    const view = createView(layerViewObject, {
      layer: { id: LAYER_OPTIONS.PROTECTED_AREAS },
      graphic: hitGraphic,
    });
    const props = baseProps({ view });

    render(<Harness {...props} />);

    await waitFor(() => {
      expect(view.whenLayerView).toHaveBeenCalledWith(
        props.regionLayers[LAYER_OPTIONS.PROVINCES]
      );
    });

    await waitFor(() => {
      expect(view.handlers.click.length).toBeGreaterThan(1);
      expect(view.handlers['pointer-move'].length).toBeGreaterThan(0);
    });

    const event = { stopPropagation: vi.fn() };
    await view.handlers.click.at(-1)(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(props.setSelectedProvince).toHaveBeenCalledWith(null);
    expect(props.setTaxaList).toHaveBeenCalledWith([]);
    expect(props.setExploreAllSpecies).toHaveBeenCalledWith(false);
    expect(props.setSelectedGeometryRings).toHaveBeenCalledWith([
      [
        [10, 20],
        [30, 40],
        [50, 60],
      ],
    ]);
    expect(props.setSelectedIndex).toHaveBeenCalledWith(
      NAVIGATION.EXPLORE_SPECIES
    );
    expect(props.setSelectedRegion).toHaveBeenCalledWith({
      WDPA_PID: 'wdpa-123',
    });
    expect(props.setRegionName).toHaveBeenCalledWith('Kaieteur National Park');
    expect(props.handleRegionSelected).toHaveBeenCalledWith({
      graphic: hitGraphic,
      attributes: hitGraphic.attributes,
    });
  });

  it('opens a hover popup with dashboard popup content for designated areas', async () => {
    const hoverHandle = { remove: vi.fn() };
    const layerViewObject = {
      highlight: vi.fn(() => hoverHandle),
    };
    const hitGraphic = {
      attributes: {
        NAME: 'Iwokrama',
        DESIG: 'Protected Area',
        ISO3: 'GUY',
      },
      geometry: {},
    };
    const view = createView(layerViewObject, {
      layer: { id: LAYER_OPTIONS.PROTECTED_AREAS },
      graphic: hitGraphic,
    });
    const props = baseProps({ view });

    render(<Harness {...props} />);

    await waitFor(() => {
      expect(view.handlers['pointer-move'].length).toBeGreaterThan(0);
    });

    await view.handlers['pointer-move'].at(-1)({ x: 100, y: 200 });

    expect(view.closePopup).toHaveBeenCalled();
    expect(layerViewObject.highlight).toHaveBeenCalledWith(hitGraphic);
    expect(mockPopupRender).toHaveBeenCalled();
    expect(view.openPopup).toHaveBeenCalledWith({
      title: 'Iwokrama',
      location: { x: 100, y: 200 },
      includeDefaultActions: false,
    });
    expect(view.popup.dockEnabled).toBe(false);
    expect(view.popup.content).toBeInstanceOf(HTMLDivElement);
  });

  it('uses province trend clicks to browse the dashboard and store clicked region', async () => {
    const layerViewObject = {
      highlight: vi.fn(() => ({ remove: vi.fn() })),
    };
    const hitGraphic = {
      attributes: {
        NAME_1: 'Region Four',
      },
      geometry: {},
    };
    const view = createView(layerViewObject, {
      layer: { id: LAYER_OPTIONS.PROVINCES },
      graphic: hitGraphic,
    });
    const props = baseProps({
      view,
      selectedIndex: NAVIGATION.TRENDS,
      selectedRegionOption: REGION_OPTIONS.PROVINCES,
      regionLayers: {
        [LAYER_OPTIONS.PROVINCES]: { id: LAYER_OPTIONS.PROVINCES },
        'GUY-zone3-spi': { id: 'GUY-zone3-spi' },
      },
    });

    render(<Harness {...props} />);

    await waitFor(() => {
      expect(view.whenLayerView).toHaveBeenCalledWith(
        props.regionLayers[LAYER_OPTIONS.PROVINCES]
      );
    });

    await waitFor(() => {
      expect(view.handlers.click.length).toBeGreaterThan(1);
    });

    await view.handlers.click.at(-1)({ stopPropagation: vi.fn() });

    expect(props.browsePage).toHaveBeenCalledWith({
      type: 'dashboard',
      payload: { iso: 'guy' },
      query: {
        scientificName: 'Panthera onca',
        selectedIndex: NAVIGATION.TRENDS,
        regionLayers: Object.keys(props.regionLayers),
        selectedRegion: 'Region Four',
      },
    });
    expect(props.setClickedRegion).toHaveBeenCalledWith(hitGraphic.attributes);
    expect(props.handleRegionSelected).toHaveBeenCalledWith({
      graphic: hitGraphic,
      attributes: hitGraphic.attributes,
    });
  });
});
