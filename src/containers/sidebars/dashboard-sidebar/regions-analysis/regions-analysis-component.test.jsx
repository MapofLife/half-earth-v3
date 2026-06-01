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

import RegionsAnalysisComponent, {
  getWarningMessages,
} from './regions-analysis-component';

const mockGetToken = vi.fn();
const mockBrowsePage = vi.fn();
const mockAddProtectedAreaLayer = vi.fn();
const mockGetFeatureLayer = vi.fn();
const mockWebMercatorToGeographic = vi.fn();
const mockHandleSketchToolActivation = vi.fn();
const mockHandleSketchToolDestroy = vi.fn();

vi.mock('@transifex/react', () => ({
  useT: () => (value, vars) => {
    if (!vars) return value;
    return value.replace('{number}', vars.number).replace('{sup}', '2');
  },
  useLocale: () => 'en',
}));

vi.mock('@arcgis/core/geometry/support/webMercatorUtils.js', () => ({
  webMercatorToGeographic: (...args) => mockWebMercatorToGeographic(...args),
}));

vi.mock('hooks/esri', () => ({
  useSketchWidget: () => ({
    sketchTool: null,
    handleSketchToolDestroy: mockHandleSketchToolDestroy,
    handleSketchToolActivation: mockHandleSketchToolActivation,
    updatedGeometry: null,
    setUpdatedGeometry: vi.fn(),
    sketchTooltipType: 'polygon',
    setSketchTooltipType: vi.fn(),
  }),
}));

vi.mock('containers/modals/prompt-modal', () => ({
  default: ({ isOpen, title }) => (isOpen ? <div>{title}</div> : null),
}));

vi.mock('components/button', () => ({
  default: ({ label, handleClick, className }) => (
    <button className={className} onClick={handleClick} type="button">
      {label}
    </button>
  ),
}));

vi.mock('services/esri-feature-service', () => ({
  default: {
    addProtectedAreaLayer: (...args) => mockAddProtectedAreaLayer(...args),
    getFeatureLayer: (...args) => mockGetFeatureLayer(...args),
  },
}));

vi.mock(
  '../../data-global-sidebar/analyze-areas-sidebar-card/sketch-tooltip/sketch-tooltip',
  () => ({
    default: ({ sketchTooltipType }) => <div>{sketchTooltipType}</div>,
  })
);

vi.mock(
  '../../data-global-sidebar/analyze-areas-sidebar-card/sketch-widget/sketch-widget-component',
  () => ({
    default: () => <div data-testid="sketch-widget" />,
  })
);

vi.mock('react-select', () => ({
  default: ({ options, onChange, value, getOptionLabel }) => (
    <select
      aria-label="saved-custom-areas"
      value={value?.region_name || ''}
      onChange={(event) => {
        const next = options.find(
          (option) => option.region_name === event.target.value
        );
        onChange(next || null);
      }}
    >
      <option value="">None</option>
      {options.map((option) => (
        <option key={option.region_id} value={option.region_name}>
          {getOptionLabel(option)}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('hooks/useJWTToken', () => ({
  default: () => ({ getToken: mockGetToken }),
}));

vi.mock('@mui/material/FormControlLabel', () => ({
  default: ({ value, label, className, __radioGroupOnChange }) => (
    <label className={className}>
      <button
        type="button"
        data-testid={`radio-option-${value}`}
        onClick={() => __radioGroupOnChange?.({ currentTarget: { value } })}
      >
        select
      </button>
      {label}
    </label>
  ),
}));

vi.mock('@mui/material/Radio', () => ({
  default: () => <span data-testid="radio" />,
}));

vi.mock('@mui/material/RadioGroup', () => ({
  default: ({ children, onChange, value, className }) => {
    const injectOnChange = (node) => {
      if (!React.isValidElement(node)) return node;

      const nextChildren = node.props?.children
        ? React.Children.map(node.props.children, injectOnChange)
        : node.props?.children;

      return React.cloneElement(node, {
        __radioGroupOnChange: onChange,
        ...(nextChildren !== undefined ? { children: nextChildren } : {}),
      });
    };

    return (
      <div className={className} data-value={value}>
        {React.Children.map(children, injectOnChange)}
      </div>
    );
  },
}));

vi.mock('@mui/icons-material', () => ({
  Delete: (props) => <svg data-testid="delete-icon" {...props} />,
}));

vi.mock('he-components', () => ({
  Modal: ({ isOpen, children }) => (isOpen ? <div>{children}</div> : null),
}));

const buildLayer = (id) => ({ id, renderer: { symbol: { url: 'legend' } } });

const createProps = (overrides = {}) => ({
  map: {
    add: vi.fn(),
    remove: vi.fn(),
    layers: { items: [] },
  },
  regionLayers: {},
  browsePage: mockBrowsePage,
  setAoiGeometry: vi.fn(),
  shapeDrawTooBigAnalytics: vi.fn(),
  setRegionLayers: vi.fn((updater) =>
    typeof updater === 'function' ? updater({}) : updater
  ),
  view: { whenLayerView: vi.fn(() => Promise.resolve({})) },
  setSelectedIndex: vi.fn(),
  selectedRegion: null,
  setSelectedRegion: vi.fn(),
  selectedIndex: NAVIGATION.REGION,
  selectedRegionOption: null,
  setSelectedGeometryRings: vi.fn(),
  setMapLegendLayers: vi.fn((updater) =>
    typeof updater === 'function' ? updater([]) : updater
  ),
  setSelectedRegionOption: vi.fn(),
  setRegionName: vi.fn(),
  setSelectedTaxa: vi.fn(),
  countryISO: 'GUY',
  countryName: 'Guyana',
  setHash: vi.fn(),
  showUploadPopup: false,
  setShowUploadPopup: vi.fn(),
  closeUploadModal: vi.fn(),
  uploadedShape: null,
  setUploadedShape: vi.fn(),
  setShowHover: vi.fn(),
  showHover: true,
  ...overrides,
});

const renderComponent = (overrides = {}) => {
  const props = createProps(overrides);
  const result = render(
    <LightModeContext.Provider value={{ lightMode: false }}>
      <RegionsAnalysisComponent {...props} />
    </LightModeContext.Provider>
  );

  return { ...result, props };
};

describe('RegionsAnalysisComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue('jwt-token');
    mockAddProtectedAreaLayer.mockResolvedValue(
      buildLayer(LAYER_OPTIONS.PROTECTED_AREAS)
    );
    mockGetFeatureLayer.mockResolvedValue(buildLayer('feature-layer'));
    mockWebMercatorToGeographic.mockReturnValue({
      coordinates: [
        [
          [0, 0],
          [1, 1],
          [1, 0],
        ],
      ],
      rings: [
        [
          [0, 0],
          [1, 1],
          [1, 0],
        ],
      ],
    });
    global.fetch = vi.fn((url) => {
      if (`${url}`.includes(DASHBOARD_URLS.DELETE_CUSTOM_AREA_URL)) {
        return Promise.resolve({ ok: true, json: vi.fn() });
      }

      return Promise.resolve({
        ok: true,
        json: vi.fn().mockResolvedValue([
          {
            region_id: 'region-1',
            region_name: 'Saved Area',
            geojson: {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [1, 1],
                  [1, 0],
                ],
              ],
            },
          },
        ]),
      });
    });
  });

  it('builds warning messages with localized content', () => {
    const messages = getWarningMessages((value) => value, 'en');

    expect(messages.area.title).toBe('Area size too big');
    expect(messages.file.title).toBe('Something went wrong with your upload');
    expect(messages[400].title).toBe('File too big');
    expect(messages[500].title).toBe('Server error');

    render(
      <>
        <div>{messages.area.description(1234)}</div>
        <div>{messages.file.description()}</div>
        <div>{messages[400].description()}</div>
        <div>{messages[500].description()}</div>
      </>
    );

    expect(
      screen.getByText(/The maximum size for on the fly area analysis is/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Please verify that the .zip file contains at least/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/File exceeds the max size allowed of 2MB/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/An error ocurred during the file upload/)
    ).toBeInTheDocument();
  });

  it('sets the default region and fetches saved custom areas on mount', async () => {
    const { props } = renderComponent();

    await waitFor(() => {
      expect(mockGetFeatureLayer).toHaveBeenCalled();
      expect(mockAddProtectedAreaLayer).toHaveBeenCalledWith(null, 'GUY');
      expect(props.map.add).toHaveBeenCalled();
      expect(props.setSelectedRegionOption).toHaveBeenCalledWith(
        REGION_OPTIONS.PROTECTED_AREAS
      );
      expect(global.fetch).toHaveBeenCalledWith(
        DASHBOARD_URLS.GET_CUSTOM_AREA_URL,
        expect.objectContaining({
          headers: expect.objectContaining({
            ISO3: 'GUY',
            Authorization: 'Bearer jwt-token',
          }),
        })
      );
    });
  });

  it('defaults to dissolved NBS for EE and loads that layer on mount', async () => {
    const { props } = renderComponent({
      countryISO: 'EE',
      countryName: 'Ecuador',
    });

    await waitFor(() => {
      expect(props.setSelectedRegionOption).toHaveBeenCalledWith(
        REGION_OPTIONS.DISSOLVED_NBS
      );
      expect(mockGetFeatureLayer).toHaveBeenCalledWith(
        expect.anything(),
        null,
        LAYER_OPTIONS.DISSOLVED_NBS
      );
      expect(props.map.add).toHaveBeenCalled();
    });
  });

  it('activates draw mode from the custom area button', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Draw a custom area')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Draw a custom area'));

    await waitFor(() => {
      expect(mockHandleSketchToolActivation).toHaveBeenCalled();
    });
  });

  it('loads an uploaded shapefile into explore species flow', async () => {
    const uploadedShape = {
      features: [
        {
          geometry: {
            rings: [
              [
                [2, 2],
                [3, 3],
                [3, 2],
              ],
            ],
          },
        },
      ],
    };
    const { props } = renderComponent({ uploadedShape });

    await waitFor(() => {
      expect(mockWebMercatorToGeographic).toHaveBeenCalled();
      expect(props.setSelectedRegion).toHaveBeenCalledWith({
        rings: [
          [
            [0, 0],
            [1, 1],
            [1, 0],
          ],
        ],
      });
      expect(props.setRegionName).toHaveBeenCalledWith('Custom Area');
      expect(props.setSelectedIndex).toHaveBeenCalledWith(
        NAVIGATION.EXPLORE_SPECIES
      );
      expect(props.setShowUploadPopup).toHaveBeenCalledWith(false);
      expect(props.setUploadedShape).toHaveBeenCalledWith(null);
    });
  });

  it('loads a saved custom area into explore species flow', async () => {
    const { props } = renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText('saved-custom-areas')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('saved-custom-areas'), {
      target: { value: 'Saved Area' },
    });
    fireEvent.click(screen.getByText('Load selected area'));

    await waitFor(() => {
      expect(props.setSelectedRegion).toHaveBeenCalledWith({
        customName: 'Saved Area',
        rings: [
          [
            [0, 0],
            [1, 1],
            [1, 0],
          ],
        ],
      });
      expect(props.setSelectedGeometryRings).toHaveBeenCalledWith([
        [
          [0, 0],
          [1, 1],
          [1, 0],
        ],
      ]);
      expect(props.setSelectedRegionOption).toHaveBeenCalledWith(
        REGION_OPTIONS.DRAW
      );
      expect(props.setRegionName).toHaveBeenCalledWith('Custom Area');
      expect(props.setSelectedIndex).toHaveBeenCalledWith(
        NAVIGATION.EXPLORE_SPECIES
      );
    });
  });

  it('deletes a saved custom area after confirmation', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText('saved-custom-areas')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('saved-custom-areas'), {
      target: { value: 'Saved Area' },
    });
    fireEvent.click(screen.getByTestId('delete-icon'));

    await waitFor(() => {
      expect(screen.getByText('Delete custom area')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toBeDisabled();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'delete' },
    });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        DASHBOARD_URLS.DELETE_CUSTOM_AREA_URL,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            ISO3: 'GUY',
            Authorization: 'Bearer jwt-token',
          }),
          body: JSON.stringify({ region_id: 'region-1' }),
        })
      );
    });
  });

  it('renders COD forest titles and opens the upload flow button', async () => {
    const { props } = renderComponent({
      countryISO: 'COD',
      countryName: 'Congo',
    });

    await waitFor(() => {
      expect(screen.getByText('Forest Titles')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Upload a shapefile'));
    expect(props.setShowUploadPopup).toHaveBeenCalledWith(true);
  });

  it('toggles hover mode and renders draw helpers when draw mode is active', async () => {
    const { props } = renderComponent({
      selectedRegionOption: REGION_OPTIONS.DRAW,
    });

    await waitFor(() => {
      expect(screen.getByTestId('sketch-widget')).toBeInTheDocument();
    });

    expect(screen.getByText('polygon')).toBeInTheDocument();
    fireEvent.click(screen.getByText('enter explore mode'));
    expect(props.setShowHover).toHaveBeenCalled();
  });

  it('uses the existing selected region on mount and renders Peru explore-mode copy', async () => {
    const { props } = renderComponent({
      countryISO: 'PER',
      countryName: 'Peru',
      showHover: false,
      selectedRegionOption: REGION_OPTIONS.PROTECTED_AREAS,
      selectedRegion: { id: 'region-1' },
    });

    await waitFor(() => {
      expect(
        screen.getByText('Salir del modo de exploración')
      ).toBeInTheDocument();
    });

    expect(props.setSelectedIndex).toHaveBeenCalledWith(
      NAVIGATION.EXPLORE_SPECIES
    );
  });

  it('renders Guyana corridor options for GUY-FM', async () => {
    renderComponent({
      countryISO: 'GUY-FM',
      countryName: 'Guyana',
    });

    await waitFor(() => {
      expect(screen.getByText('Acarai-Corentyne Corridor')).toBeInTheDocument();
      expect(screen.getByText('Rapid Inventory 32')).toBeInTheDocument();
    });
  });

  it('switches to ACC and rapid inventory region layers for GUY-FM', async () => {
    const { props } = renderComponent({
      countryISO: 'GUY-FM',
      countryName: 'Guyana',
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(`radio-option-${REGION_OPTIONS.ACC_REGION}`)
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByTestId(`radio-option-${REGION_OPTIONS.ACC_REGION}`)
    );
    fireEvent.click(
      screen.getByTestId(`radio-option-${REGION_OPTIONS.RAPID_INVENTORY_32}`)
    );

    await waitFor(() => {
      expect(props.setSelectedRegionOption).toHaveBeenCalledWith(
        REGION_OPTIONS.ACC_REGION
      );
      expect(props.setSelectedRegionOption).toHaveBeenCalledWith(
        REGION_OPTIONS.RAPID_INVENTORY_32
      );
      expect(mockGetFeatureLayer).toHaveBeenCalledWith(
        expect.anything(),
        null,
        LAYER_OPTIONS.ACC_REGION
      );
      expect(mockGetFeatureLayer).toHaveBeenCalledWith(
        expect.anything(),
        null,
        LAYER_OPTIONS.RAPID_INVENTORY_32
      );
    });
  });

  it('switches to forest titles when the COD forest option is selected', async () => {
    const { props } = renderComponent({
      countryISO: 'COD',
      countryName: 'Congo',
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(`radio-option-${REGION_OPTIONS.FORESTS}`)
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByTestId(`radio-option-${REGION_OPTIONS.FORESTS}`)
    );

    await waitFor(() => {
      expect(props.setSelectedRegionOption).toHaveBeenCalledWith(
        REGION_OPTIONS.FORESTS
      );
      expect(mockGetFeatureLayer).toHaveBeenCalledWith(
        expect.anything(),
        null,
        LAYER_OPTIONS.FORESTS
      );
    });
  });
});
