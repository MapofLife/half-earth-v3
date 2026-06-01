import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { vi } from 'vitest';

import { LAYER_OPTIONS, REGION_OPTIONS } from 'constants/dashboard-constants';

import MapLegendComponent from './map-legend-component';

const toggleOpacityMock = vi.fn(({ layer }) => (
  <div data-testid={`toggle-opacity-${layer.id}`} />
));

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
}));

vi.mock('components/toggle-opacity', () => ({
  default: (props) => toggleOpacityMock(props),
}));

vi.mock('icons/arrow_right.svg?react', () => ({
  default: (props) => <svg data-testid="collapse-arrow" {...props} />,
}));

vi.mock('icons/dashboard/arrow_icon.svg?react', () => ({
  default: () => <svg data-testid="move-arrow" />,
}));

describe('MapLegendComponent', () => {
  const originalGetElementById = document.getElementById;
  const originalGetComputedStyle = window.getComputedStyle;

  beforeEach(() => {
    vi.clearAllMocks();

    document.getElementById = vi.fn((id) => {
      if (id === 'dashboard-sidebar') {
        return {
          getBoundingClientRect: () => ({ width: 240 }),
        };
      }

      return originalGetElementById.call(document, id);
    });

    window.getComputedStyle = vi.fn(() => ({
      getPropertyValue: () => '20px',
    }));
  });

  afterAll(() => {
    document.getElementById = originalGetElementById;
    window.getComputedStyle = originalGetComputedStyle;
  });

  const createProps = (overrides = {}) => ({
    mapLegendLayers: [],
    map: {
      layers: {
        items: [],
        reorder: vi.fn(),
      },
    },
    setMapLegendLayers: vi.fn(),
    countryISO: 'GUY',
    ...overrides,
  });

  it('deduplicates and orders legend layers from the map, and hides province arrows', async () => {
    const duplicateHabitat = {
      id: LAYER_OPTIONS.HABITAT,
      label: 'Habitat Loss/Gain',
    };
    const finalHabitat = {
      id: LAYER_OPTIONS.HABITAT,
      label: 'Habitat Loss/Gain',
      parent: 'Public',
    };
    const provinceLayer = {
      id: REGION_OPTIONS.PROVINCES,
      label: 'Province legend',
    };
    const pointLayer = {
      id: 'POINT_LAYER',
      label: 'Point Layer',
      imageUrl: '/point.png',
    };

    const props = createProps({
      mapLegendLayers: [
        duplicateHabitat,
        provinceLayer,
        pointLayer,
        finalHabitat,
      ],
      map: {
        layers: {
          items: [
            { id: LAYER_OPTIONS.HABITAT },
            { id: 'POINT_LAYER' },
            { id: REGION_OPTIONS.PROVINCES },
          ],
          reorder: vi.fn(),
        },
      },
    });

    const { container } = render(<MapLegendComponent {...props} />);

    await waitFor(() => {
      expect(screen.getByText('Map Legend')).toBeInTheDocument();
    });

    const listItems = Array.from(container.querySelectorAll('li'));
    expect(listItems).toHaveLength(3);
    expect(
      within(listItems[0]).getByText('PROVINCE LEGEND')
    ).toBeInTheDocument();
    expect(within(listItems[1]).getByText('POINT LAYER')).toBeInTheDocument();
    expect(
      within(listItems[2]).getByText('HABITAT LOSS/GAIN')
    ).toBeInTheDocument();

    expect(screen.getByAltText('SPI')).toBeInTheDocument();
    expect(screen.getByAltText('Point')).toBeInTheDocument();
    expect(screen.getByAltText('Habitat')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();

    expect(
      screen.getByTestId(`toggle-opacity-${REGION_OPTIONS.PROVINCES}`)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('toggle-opacity-POINT_LAYER')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`toggle-opacity-${LAYER_OPTIONS.HABITAT}`)
    ).toBeInTheDocument();

    const provinceItem = listItems[0];
    expect(
      within(provinceItem).queryByRole('button', { name: 'Move layer up' })
    ).not.toBeInTheDocument();
    expect(
      within(provinceItem).queryByRole('button', { name: 'Move layer down' })
    ).not.toBeInTheDocument();
  });

  it('moves legend layers up and down and syncs reordered layers back to state', async () => {
    const firstLayer = {
      id: 'FIRST_LAYER',
      label: 'First layer',
      color: { r: 1, g: 2, b: 3, a: 1 },
    };
    const secondLayer = {
      id: 'SECOND_LAYER',
      label: 'Second layer',
      outline: { color: { r: 2, g: 3, b: 4, a: 1 } },
    };
    const thirdLayer = {
      id: 'THIRD_LAYER',
      label: 'Third layer',
      parentId: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
    };

    const reorder = vi.fn();
    const setMapLegendLayers = vi.fn();
    const props = createProps({
      mapLegendLayers: [firstLayer, secondLayer, thirdLayer],
      map: {
        layers: {
          items: [
            { id: 'FIRST_LAYER' },
            { id: 'SECOND_LAYER' },
            { id: 'THIRD_LAYER' },
          ],
          reorder,
        },
      },
      setMapLegendLayers,
    });

    const { container } = render(<MapLegendComponent {...props} />);

    await waitFor(() => {
      expect(screen.getByText('FIRST LAYER')).toBeInTheDocument();
    });

    const listItems = Array.from(container.querySelectorAll('li'));

    fireEvent.click(
      within(listItems[0]).getByRole('button', { name: 'Move layer down' })
    );

    expect(reorder).toHaveBeenCalledWith({ id: 'THIRD_LAYER' }, 1);
    expect(setMapLegendLayers).toHaveBeenCalledWith([
      secondLayer,
      thirdLayer,
      firstLayer,
    ]);

    fireEvent.click(
      within(listItems[2]).getByRole('button', { name: 'Move layer up' })
    );

    expect(reorder).toHaveBeenLastCalledWith({ id: 'FIRST_LAYER' }, 1);
    expect(setMapLegendLayers).toHaveBeenLastCalledWith([
      thirdLayer,
      firstLayer,
      secondLayer,
    ]);
  });
});
