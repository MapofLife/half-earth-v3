import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LAYER_OPTIONS } from 'constants/dashboard-constants';
import { DASHBOARD_URLS } from 'constants/layers-urls';

import ToggleLayerInfo from './index';

const getFeaturesSpy = vi.fn();

vi.mock('@transifex/react', () => ({
  useT: () => (value) => value,
  T: ({ _str, link }) => (
    <span>
      {_str}
      {link}
    </span>
  ),
}));

vi.mock('services/esri-feature-service', () => ({
  default: {
    getFeatures: (...args) => getFeaturesSpy(...args),
  },
}));

vi.mock('icons/dashboard/info_icon.svg?react', () => ({
  default: () => <svg data-testid="info-icon" />,
}));

const renderComponent = (props) => render(<ToggleLayerInfo {...props} />);

describe('ToggleLayerInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('uses tooltip data directly when available', () => {
    const setLayerInfo = vi.fn();

    renderComponent({
      layer: {
        id: 'custom-layer',
        label: 'Tooltip Layer',
        tooltip: [{ label: 'Description', value: 'Tooltip info' }],
      },
      setLayerInfo,
      countryISO: 'PER',
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle info visibility' })
    );

    expect(setLayerInfo).toHaveBeenCalledWith({
      info: [{ label: 'Description', value: 'Tooltip info' }],
      title: 'Tooltip Layer',
    });
  });

  it('returns hardcoded private point observation metadata', () => {
    const setLayerInfo = vi.fn();

    renderComponent({
      layer: {
        id: LAYER_OPTIONS.POINT_OBSERVATIONS,
        label: 'Private observations',
        type: 'PRIVATE',
      },
      setLayerInfo,
      countryISO: 'COD',
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle info visibility' })
    );

    expect(setLayerInfo).toHaveBeenCalledWith({
      info: expect.arrayContaining([
        expect.objectContaining({
          label: 'Data type',
          value: 'Point Observations',
        }),
        expect.objectContaining({ label: 'Description' }),
      ]),
      title: 'Private observations',
    });
  });

  it('loads private study metadata from the country-specific service', async () => {
    const setLayerInfo = vi.fn();
    getFeaturesSpy.mockResolvedValue([
      {
        attributes: {
          description: 'Survey description',
          region: 'North Kivu',
          taxa: 'Birds',
        },
      },
    ]);

    renderComponent({
      layer: {
        id: 'private-study',
        label: 'My Private Study',
        type: 'PRIVATE',
      },
      setLayerInfo,
      countryISO: 'GIN',
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle info visibility' })
    );

    await waitFor(() => {
      expect(getFeaturesSpy).toHaveBeenCalledWith({
        url: DASHBOARD_URLS.PRIVATE_GIN_OCCURENCE_METADATA_LAYER,
        whereClause: "study_name = 'My Private Study'",
        outFields: ['description, region, taxa'],
        returnGeometr: false,
      });
      expect(setLayerInfo).toHaveBeenCalledWith({
        info: [
          { label: 'description', value: 'Survey description' },
          { label: 'region', value: 'North Kivu' },
          { label: 'taxa', value: 'Birds' },
        ],
        title: 'My Private Study',
      });
    });
  });

  it('fetches parent layer group metadata for expert range maps', async () => {
    const setLayerInfo = vi.fn();
    global.fetch.mockResolvedValue({
      json: vi
        .fn()
        .mockResolvedValue([{ label: 'Description', value: 'Range map info' }]),
    });

    renderComponent({
      layer: {
        id: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
        label: 'Expert range maps',
      },
      setLayerInfo,
      countryISO: 'PER',
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle info visibility' })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${DASHBOARD_URLS.DATASET_LAYER_GROUP_INFO}?id=range`
      );
      expect(setLayerInfo).toHaveBeenCalledWith({
        info: [{ label: 'Description', value: 'Range map info' }],
        title: 'Expert range maps',
      });
    });
  });

  it('fetches dataset metadata for regular layers', async () => {
    const setLayerInfo = vi.fn();
    global.fetch.mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        metadata: [{ label: 'Description', value: 'Dataset metadata' }],
      }),
    });

    renderComponent({
      layer: {
        id: 'dataset-layer',
        label: 'Dataset Layer',
        dataset_id: 'dataset-123',
      },
      setLayerInfo,
      countryISO: 'PER',
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle info visibility' })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${DASHBOARD_URLS.DATASET_LAYER_INFO}dataset-123`
      );
      expect(setLayerInfo).toHaveBeenCalledWith({
        info: [{ label: 'Description', value: 'Dataset metadata' }],
        title: 'Dataset Layer',
      });
    });
  });
});
