import React, { useContext, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Modal } from 'he-components';
import { useT } from '@transifex/react';

import { getCSSVariable } from 'utils/css-utils';
import {
  PERU_CROPS_FEATURE_ID,
  REGION_RANGE_MAP_URL,
  APURIMAC_LANDCOVER_FEATURE_ID,
} from 'utils/dashboard-utils';

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  Filler,
} from 'chart.js';
import cx from 'classnames';
import { LightModeContext } from 'context/light-mode';
import { Loading } from 'he-components';

import Button from 'components/button';
import SpeciesSearch from 'components/species-search';

import {
  LAYER_OPTIONS,
  NAVIGATION,
  DATA_POINT_TYPE,
  LAYER_TITLE_TYPES,
} from 'constants/dashboard-constants.js';

import hrTheme from 'styles/themes/hr-theme.module.scss';

import SpeciesInfoContainer from '../species-info';

import styles from './data-layers-styles.module.scss';
import DataLayersGroupedList from './grouped-list';
import { key } from 'localforage';
import useJWTToken from 'hooks/useJWTToken';
import { update } from 'lodash';
import { DASHBOARD_URLS } from 'constants/layers-urls';
import {
  AGRICULTURE_HUMAN_PRESSURES_TILE_LAYER,
  ARTISANAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
  BUILTUP_HUMAN_PRESSURES_TILE_LAYER,
  COMMERCIAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
  ENERGY_HUMAN_PRESSURES_TILE_LAYER,
  INTRUSION_HUMAN_PRESSURES_TILE_LAYER,
  LAND_COVER_LAYER,
  MARINE_LAND_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
  MARINE_OCEAN_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
  PERU_CROPS_LAYER,
  TRANSPORTATION_HUMAN_PRESSURES_TILE_LAYER,
  APURIMAC_LANDCOVER_LAYER,
} from 'constants/layers-slugs';

ChartJS.register(
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
  Legend,
  CategoryScale
);

function DataLayerComponent(props) {
  const t = useT();
  const {
    speciesInfo,
    dataLayerData,
    selectedRegion,
    setSelectedIndex,
    setSpeciesInfo,
    setScientificName,
    setDataLayerData,
    privateOccurrenceData,
    setMapLegendLayers,
    exploreAllSpecies,
    mapLegendLayers,
    regionLayers,
    fromTrends,
    dataByCountry,
    setSpeciesDataLoading,
    countryISO,
    countryName,
    map,
    setSnackBar,
  } = props;

  const { getToken } = useJWTToken(countryISO);

  const { lightMode } = useContext(LightModeContext);
  const [dataPoints, setDataPoints] = useState();
  const [valuesExists, setValuesExists] = useState(false);
  const [privateDataPoints, setPrivateDataPoints] = useState([
    {
      label: t('Point Observations'),
      items: [],
      total_no_rows: '',
      isActive: false,
      showChildren: false,
      type: DATA_POINT_TYPE.PRIVATE,
      id: LAYER_OPTIONS.POINT_OBSERVATIONS,
    },
  ]);
  const [regionsData, setRegionsData] = useState([
    {
      label: t('Protected Areas'),
      items: [],
      total_no_rows: '',
      isActive: false,
      showChildren: false,
      type: DATA_POINT_TYPE.REGIONS_DATA,
      id: LAYER_OPTIONS.PROTECTED_AREAS,
    },
    // 'Proposed Protection': {
    //   items: [],
    //   total_no_rows: '',
    //   isActive: false,
    //   showChildren: false,
    // },
    {
      label: t('Administrative Layers'),
      items: [],
      total_no_rows: '',
      isActive: false,
      showChildren: false,
      type: DATA_POINT_TYPE.REGIONS_DATA,
      id: LAYER_OPTIONS.ADMINISTRATIVE_LAYERS,
    },
    {
      id: LAND_COVER_LAYER,
      items: [],
      total_no_rows: '',
      isActive: false,
      showChildren: false,
      type: DATA_POINT_TYPE.REGIONS_DATA,
      label:
        countryISO.toUpperCase() === 'PER'
          ? t('Capas de cubierta del suelo (2022)')
          : t('Land cover (2022)'),
      url: LAND_COVER_LAYER,
    },
  ]);
  const [landUsePressureLayers, setLandUsePressureLayers] = useState([
    {
      id: ENERGY_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Energy and extractive resources'),
      url: ENERGY_HUMAN_PRESSURES_TILE_LAYER,
      items: [],
      total_no_rows: '',
      isActive: false,
      showChildren: false,
      type: DATA_POINT_TYPE.LAND_USE_PRESSURES,
    },
    {
      id: TRANSPORTATION_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Transportation'),
      url: TRANSPORTATION_HUMAN_PRESSURES_TILE_LAYER,
      items: [],
      total_no_rows: '',
      isActive: false,
      showChildren: false,
      type: DATA_POINT_TYPE.LAND_USE_PRESSURES,
    },
    {
      id: AGRICULTURE_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Agriculture pressures'),
      url: AGRICULTURE_HUMAN_PRESSURES_TILE_LAYER,
      items: [],
      total_no_rows: '',
      isActive: false,
      showChildren: false,
      type: DATA_POINT_TYPE.LAND_USE_PRESSURES,
    },
    {
      id: BUILTUP_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Urban and Built up'),
      url: BUILTUP_HUMAN_PRESSURES_TILE_LAYER,
      items: [],
      total_no_rows: '',
      isActive: false,
      showChildren: false,
      type: DATA_POINT_TYPE.LAND_USE_PRESSURES,
    },
    {
      id: INTRUSION_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Human Intrusion'),
      url: INTRUSION_HUMAN_PRESSURES_TILE_LAYER,
      items: [],
      total_no_rows: '',
      isActive: false,
      showChildren: false,
      type: DATA_POINT_TYPE.LAND_USE_PRESSURES,
    },
  ]);

  const [marineUsePressureLayers, setMarineUsePressureLayers] = useState([
    {
      id: MARINE_LAND_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Land-based drivers'),
      url: MARINE_LAND_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
      items: [],
      total_no_rows: '',
      isActive: false,
      showChildren: false,
      type: DATA_POINT_TYPE.MARINE_USE_PRESSURES,
    },
    {
      id: MARINE_OCEAN_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Ocean-based drivers'),
      url: MARINE_OCEAN_DRIVERS_HUMAN_PRESSURES_TILE_LAYER,
      items: [],
      total_no_rows: '',
      isActive: false,
      showChildren: false,
      type: DATA_POINT_TYPE.MARINE_USE_PRESSURES,
    },
    {
      id: COMMERCIAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Commercial fishing'),
      url: COMMERCIAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
      items: [],
      total_no_rows: '',
      isActive: false,
      showChildren: false,
      type: DATA_POINT_TYPE.MARINE_USE_PRESSURES,
    },
    {
      id: ARTISANAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
      label: t('Artisnal fishing'),
      url: ARTISANAL_FISHING_HUMAN_PRESSURES_TILE_LAYER,
      items: [],
      total_no_rows: '',
      isActive: false,
      showChildren: false,
      type: DATA_POINT_TYPE.MARINE_USE_PRESSURES,
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState();
  const [showHabitatChart, setShowHabitatChart] = useState(false);
  const [mapData, setMapData] = useState();
  const [showHabitatLayer, setShowHabitatLayer] = useState(false);
  const [showPredictionMap, setShowPredictionMap] = useState(false);
  const [isHabitatChartLoading, setIsHabitatChartLoading] = useState(false);
  const [showProvideFeedback, setShowProvideFeedback] = useState(false);
  const [feedbackOptions, setFeedbackOptions] = useState([
    {
      checked: false,
      label:
        countryISO.toUpperCase() === 'PER'
          ? t('Hay un problema con el mapa de rango experto.')
          : t('There is an issue with expert range map'),
      info: '',
      key: 'issue_expert_range_map',
    },
    {
      checked: false,
      label:
        countryISO.toUpperCase() === 'PER'
          ? t('Hay un problema con las observaciones de puntos.')
          : t('There is an issue with point observations.'),
      info: '',
      key: 'issue_point_observation',
    },
    {
      checked: false,
      label:
        countryISO.toUpperCase() === 'PER'
          ? t(
              'Este es un problema con otro tipo de datos de distribución espacial (por favor, especifique en el recuadro de abajo).'
            )
          : t(
              'This is an issue with other spatial distribution data type (please specify in the box below).'
            ),
      info: '',
      key: 'issue_other_spatial',
    },
    {
      checked: false,
      label:
        countryISO.toUpperCase() === 'PER'
          ? t('Hay un problema con la taxonomía.')
          : t('There is a taxonomic issue'),
      info: '',
      key: 'issue_taxonomic',
    },
    {
      checked: false,
      label:
        countryISO.toUpperCase() === 'PER'
          ? t(
              'Otras cuestiones (por favor, especifique en el recuadro de abajo)'
            )
          : t('Other issues (please specify in the box below)'),
      info: '',
      key: 'issue_other',
    },
  ]);
  const [additionalComments, setAdditionalComments] = useState('');

  const expertRangeMapIds = [
    'ec694c34-bddd-4111-ba99-926a5f7866e8',
    '0ed89f4f-3ed2-41c2-9792-7c7314a55455',
    '98f229de-6131-41ef-aff1-7a52212b5a15',
    'd542e050-2ae5-457e-8476-027741538965',
    // '83cfa8fb-dd6e-4031-8215-1079abddb8a7',
  ];

  const pointObservationIds = [
    '9905692e-6a28-4310-b01e-476a471e5bf8',
    '794adb49-7458-41c4-a1c0-56537fdbec1d',
  ];

  const chartOptions = {
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: false,
        display: true,
        title: {
          display: true,
          text: t('Year'),
          color: lightMode ? getCSSVariable('black') : getCSSVariable('white'),
        },
        grid: {
          color: getCSSVariable('oslo-gray'),
        },
        ticks: {
          color: getCSSVariable('oslo-gray'),
        },
      },
      y: {
        beginAtZero: false,
        display: true,
        title: {
          display: true,
          text: t('Habitat Suitable Range'),
          color: lightMode ? getCSSVariable('black') : getCSSVariable('white'),
        },
        grid: {
          color: getCSSVariable('oslo-gray'),
        },
        ticks: {
          color: getCSSVariable('oslo-gray'),
        },
      },
    },
  };

  const groupByTypeTitle = (objects) => {
    const grouped = {};

    objects.forEach((obj) => {
      const groupKey = obj.type_title;
      if (
        groupKey.toUpperCase() === 'EXPERT RANGE MAPS' ||
        groupKey.toUpperCase() === 'POINT OBSERVATIONS'
      ) {
        if (!grouped[groupKey]) {
          grouped[groupKey] = {
            label: obj.type_title,
            total_no_rows: 0,
            isActive: true,
            showChildren: false,
            items: [],
            type: DATA_POINT_TYPE.PUBLIC,
            id:
              groupKey.toUpperCase() === 'EXPERT RANGE MAPS'
                ? LAYER_OPTIONS.EXPERT_RANGE_MAPS
                : LAYER_OPTIONS.POINT_OBSERVATIONS,
          }; // Create a new object with the original object's properties and an empty 'item' array
        }
        obj.isActive = true;
        obj.parentId = grouped[groupKey].id;
        obj.id = obj.label.toUpperCase();
        // TODO: remove logic when not filtering out results
        const foundExpertRange = expertRangeMapIds.find(
          (id) => id === obj.dataset_id
        );
        const foundPointOb = pointObservationIds.find(
          (id) => id === obj.dataset_id
        );

        if (foundExpertRange || foundPointOb) {
          grouped[groupKey].items.push(obj); // Push the current object into the 'item' array of the matching group
          grouped[groupKey].total_no_rows += obj.no_rows || 0; // Summing the no_rows property
        }
      }
    });

    return Object.values(grouped);
  };

  const findMapLayersToRemove = () => {
    mapLegendLayers.forEach((ml) => {
      const layerToRemove = regionLayers[ml.id.toUpperCase()];
      map.remove(layerToRemove);
    });

    setMapLegendLayers([]);
  };

  const handleBack = () => {
    setDataLayerData(null);
    setSpeciesInfo(null);
    setScientificName(null);
    findMapLayersToRemove();

    if (fromTrends) {
      setSelectedIndex(NAVIGATION.TRENDS);
    } else if (selectedRegion || exploreAllSpecies) {
      setSelectedIndex(NAVIGATION.EXPLORE_SPECIES);
    } else {
      setSelectedIndex(NAVIGATION.SPECIES);
    }
  };

  const displayHabitatLayer = async () => {
    setShowHabitatLayer(true);
  };

  const displayPredictionMap = async () => {
    setShowPredictionMap(true);
  };

  const getExpertRangeMapInfo = (taxa) => {
    switch (taxa.toUpperCase()) {
      case 'MAMMALS':
        return {
          label: t('MDD Mammals 2021'),
          dataset_id: 'ec694c34-bddd-4111-ba99-926a5f7866e8',
          dataset_title: 'MDD Mammals 2021',
        };
      case 'REPTILES':
        return {
          label: t('GARD Reptiles 2022'),
          dataset_id: '0ed89f4f-3ed2-41c2-9792-7c7314a55455',
          dataset_title: 'GARD Reptiles 2022',
        };
      case 'AMPHIBIANS':
        return {
          label: t('IUCN Amphibians 2022'),
          dataset_id: '98f229de-6131-41ef-aff1-7a52212b5a15',
          dataset_title: 'IUCN Amphibians 2022',
        };
      case 'BIRDS':
        return {
          label: t('Jetzmap 2025'),
          dataset_id: 'd542e050-2ae5-457e-8476-027741538965',
          dataset_title: 'Jetzmap 2025',
        };
      default:
        return {
          label: t('Expert range maps'),
          dataset_id: '',
          dataset_title: '',
        };
    }
  };

  const getHabitatMapData = async () => {
    const habitatMapUrl = `${REGION_RANGE_MAP_URL}?species=${speciesInfo.scientificname}&taxa=${speciesInfo.taxa}`;
    const response = await fetch(habitatMapUrl);
    const d = await response.json();

    setMapData(d);
    const { trend_data, trend, data, prediction_map } = d;

    setDataPoints((prevDataPoints) => {
      const updatedDataPoints = prevDataPoints ? [...prevDataPoints] : [];
      if (d['range map'] && d['range map'].tile_url) {
        const rangeMapsExist = prevDataPoints?.find(
          (item) => item.id === LAYER_OPTIONS.EXPERT_RANGE_MAPS
        );

        if (!rangeMapsExist && Array.isArray(prevDataPoints)) {
          // const updatedDataPoints = [...prevDataPoints];

          const { label, dataset_id, dataset_title } = getExpertRangeMapInfo(
            speciesInfo.taxa
          );
          updatedDataPoints.push({
            label: t('Expert range maps'),
            items: [
              {
                type_title: LAYER_TITLE_TYPES.EXPERT_RANGE_MAPS,
                label,
                isActive: false,
                parentId: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
                id: 'JETZMAP 2025',
                dataset_id,
                dataset_title,
              },
            ],

            id: LAYER_OPTIONS.EXPERT_RANGE_MAPS,
            total_no_rows: 1,
            isActive: false,
            showChildren: false,
            type: DATA_POINT_TYPE.PUBLIC,
          });
        }
      }

      if (
        prediction_map &&
        prediction_map.tile_url &&
        Array.isArray(prevDataPoints)
      ) {
        updatedDataPoints.push({
          label:
            countryISO.toUpperCase() === 'PER'
              ? t('Modelo de Distribución de Especies (MDE)')
              : t('Species Distribution Model'),
          items: [],
          id: LAYER_OPTIONS.PREDICTION_MAPS,
          total_no_rows: 1,
          isActive: false,
          showChildren: false,
          type: DATA_POINT_TYPE.PUBLIC,
        });

        displayPredictionMap();
      }

      if (trend && trend.tile_url) {
        if (Array.isArray(prevDataPoints)) {
          updatedDataPoints.push({
            label: t('Habitat Loss/Gain'),
            items: [],
            id: LAYER_OPTIONS.HABITAT,
            total_no_rows: 1,
            isActive: false,
            showChildren: false,
            type: DATA_POINT_TYPE.PUBLIC,
          });

          const habitatLayer = updatedDataPoints.find(
            (dp) => dp.id === LAYER_OPTIONS.HABITAT
          );

          if (habitatLayer) {
            displayHabitatLayer();
          }
        }
      }

      return updatedDataPoints;
    });

    trend_data.shift();
    setValuesExists(true);

    setChartData({
      labels: trend_data.map((item) => item[0]),
      datasets: [
        {
          fill: false,
          backgroundColor: 'rgba(24, 186, 180, 1)',
          borderColor: 'rgba(24, 186, 180, 1)',
          pointStyle: false,
          data: trend_data.map((item) => item[2]),
        },
        {
          fill: '-1',
          backgroundColor: 'rgba(24, 186, 180, 0.7)',
          borderColor: 'rgba(24, 186, 180, 1)',
          pointStyle: false,
          data: trend_data.map((item) => item[3]),
        },
      ],
    });
    // } else
    if (data?.length > 1) {
      // remove Year row
      data.shift();
      setValuesExists(true);

      setChartData({
        labels: data.map((item) => item[0]),
        datasets: [
          {
            fill: false,
            backgroundColor: 'rgba(24, 186, 180, 1)',
            borderColor: 'rgba(24, 186, 180, 1)',
            pointStyle: false,
            data: data.map((item) => item[2]),
          },
          {
            fill: '-1',
            backgroundColor: 'rgba(24, 186, 180, 0.7)',
            borderColor: 'rgba(24, 186, 180, 1)',
            pointStyle: false,
            data: data.map((item) => item[3]),
          },
        ],
      });
    }
  };

  const showProvideFeedbackModal = () => {
    setShowProvideFeedback(true);
  };

  const handleProvideFeedback = async () => {
    const token = await getToken();

    const feedbackData = {
      additional_comments: additionalComments,
      app_id: 'species',
      problem_description: feedbackOptions
        .filter((option) => option.checked)
        .map((option) => option.key)
        .join('; '),
      region_id: null,
      scientificname: speciesInfo.scientificname,
      org: 'guyana_nbis',
    };

    const response = fetch(DASHBOARD_URLS.CREATE_FEEDBACK_URL, {
      method: 'POST',
      headers: {
        ISO3: countryISO,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(feedbackData),
    })
      .then((res) => {
        if (res.ok) {
          setAdditionalComments('');
          setFeedbackOptions((prev) =>
            prev.map((option) => ({ ...option, checked: false }))
          );
          setSnackBar({
            open: true,
            message: t('Thank you for your feedback!'),
          });
          setShowProvideFeedback(false);
        } else {
          setSnackBar({
            open: true,
            message: t(
              'There was an issue submitting your feedback. Please try again later.'
            ),
          });
        }
      })
      .catch((error) => {
        console.error('Error submitting feedback:', error);
        setSnackBar({
          open: true,
          message: t(
            'There was an issue submitting your feedback. Please try again later.'
          ),
        });
      });
  };

  useEffect(() => {
    if (!speciesInfo) return;
    getHabitatMapData();
  }, [speciesInfo]);

  useEffect(() => {
    if (!dataLayerData) return;
    const publicData = [...groupByTypeTitle(dataLayerData)];

    if (speciesInfo.scientificname.toUpperCase() === 'ATELES PANISCUS') {
      publicData.push({
        label: t('Species Distribution Model'),
        items: [],
        id: LAYER_OPTIONS.SDM,
        total_no_rows: '',
        isActive: false,
        showChildren: false,
        type: DATA_POINT_TYPE.PUBLIC,
      });
    }

    setDataPoints(publicData);

    if (countryISO.toUpperCase() === 'EE') {
      const regions = [
        ...regionsData,
        {
          label: t('NBS-OP Interventions'),
          items: [],
          id: LAYER_OPTIONS.EEWWF_COUNTRY_LINES,
          total_no_rows: '',
          isActive: false,
          showChildren: false,
          type: DATA_POINT_TYPE.PUBLIC,
        },
      ];
      setRegionsData(regions);
    }
  }, [dataLayerData]);

  useEffect(() => {
    if (privateOccurrenceData.length > 0) {
      const privateData = [];

      const studyNameSet = new Set(); // Use a Set for efficient tracking

      privateOccurrenceData.forEach((obj) => {
        if (obj) {
          const { study_name } = obj;

          if (!studyNameSet.has(study_name)) {
            studyNameSet.add(study_name);
            privateData.push({
              label: t(obj.study_name),
              items: [],
              no_rows: 1,
              isActive: false,
              type_title: LAYER_TITLE_TYPES.POINT_OBSERVATIONS,
              showChildren: false,
              type: DATA_POINT_TYPE.PRIVATE,
              id: obj.study_name,
              parent: `${t('Private: Point Observations')}`,
              dataset_title: obj.study_name,
            });
          } else {
            privateData.find((item) => item.id === obj.study_name).no_rows += 1;
          }
        }
      });

      privateDataPoints[0].items = privateData;
      privateDataPoints[0].showChildren = true;

      setPrivateDataPoints([privateDataPoints[0]]);
    }
  }, [privateOccurrenceData]);

  useEffect(() => {
    if (!dataPoints && !dataByCountry) return;
    if (dataByCountry && dataByCountry[countryName]) {
      setSpeciesDataLoading(false);
    }
    setIsLoading(false);
  }, [dataPoints, dataByCountry]);

  useEffect(() => {
    if (countryISO.toUpperCase() === 'GUY') {
      setRegionsData((prev) => [
        ...prev,
        {
          label: t('Indigenous Territories'),
          items: [],
          total_no_rows: '',
          isActive: false,
          showChildren: false,
          type: DATA_POINT_TYPE.REGIONS_DATA,
          id: LAYER_OPTIONS.INDIGENOUS_LANDS,
        },
      ]);
    } else if (countryISO.toUpperCase() === 'PER') {
      setRegionsData((prev) => [
        ...prev,
        {
          id: PERU_CROPS_LAYER,
          label:
            countryISO.toUpperCase() === 'PER'
              ? t('Cultivos de Perú')
              : t('Peru Crops'),
          items: [],
          total_no_rows: '',
          isActive: false,
          showChildren: false,
          type: DATA_POINT_TYPE.REGIONS_DATA,
        },
        {
          id: APURIMAC_LANDCOVER_LAYER,
          label:
            countryISO.toUpperCase() === 'PER'
              ? t('Cambio en la cubierta del suelo de Apurímac')
              : t('Apurimac Landcover change'),
          items: [],
          total_no_rows: '',
          isActive: false,
          showChildren: false,
          type: DATA_POINT_TYPE.REGIONS_DATA,
        },
      ]);
    }
    setSpeciesDataLoading(true);
  }, []);

  return (
    <section className={cx(lightMode ? styles.light : '', styles.container)}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span className={styles.sectionTitle}>{t('Data Layers')}</span>
        <Button
          className={styles.back}
          handleClick={handleBack}
          label={t('Back')}
        />
      </div>
      <hr className={hrTheme.dark} />
      {speciesInfo && (
        <>
          <SpeciesInfoContainer speciesInfo={speciesInfo} />
          <hr className={hrTheme.dark} />
          {isLoading && <Loading height={200} />}
          {!isLoading && dataPoints && (
            <>
              <button
                className={styles.distributionTitle}
                type="button"
                onClick={() => {}}
              >
                <span>{t('Species Data: Public')}</span>
              </button>
              <DataLayersGroupedList
                dataPoints={dataPoints}
                setDataPoints={setDataPoints}
                setShowHabitatChart={setShowHabitatChart}
                showHabitatLayer={showHabitatLayer}
                showPredictionMap={showPredictionMap}
                setIsHabitatChartLoading={setIsHabitatChartLoading}
                mapData={mapData}
                {...props}
              />
              {isHabitatChartLoading && <Loading height={200} />}
              {valuesExists && showHabitatChart && (
                <Line options={chartOptions} data={chartData} />
              )}
              <hr className={hrTheme.dark} />
              <button
                className={styles.distributionTitle}
                type="button"
                onClick={() => {}}
              >
                {countryISO.toUpperCase() === 'PER' ? (
                  <span>{t('Capas de presión por uso del suelo')}</span>
                ) : (
                  <span>{t('Land Use Pressure')}</span>
                )}
              </button>
              <DataLayersGroupedList
                dataPoints={landUsePressureLayers}
                setDataPoints={setLandUsePressureLayers}
                {...props}
              />
              <hr className={hrTheme.dark} />
              <button
                className={styles.distributionTitle}
                type="button"
                onClick={() => {}}
              >
                {countryISO.toUpperCase() === 'PER' ? (
                  <span>{t('Capas de presión para uso marino')}</span>
                ) : (
                  <span>{t('Marine Use Pressure')}</span>
                )}
              </button>
              <DataLayersGroupedList
                dataPoints={marineUsePressureLayers}
                setDataPoints={setMarineUsePressureLayers}
                {...props}
              />
              <hr className={hrTheme.dark} />
              {privateOccurrenceData.length > 0 && (
                <>
                  <button
                    className={styles.distributionTitle}
                    type="button"
                    onClick={() => {}}
                  >
                    <span>{t('Species Data: Private')}</span>
                  </button>
                  <DataLayersGroupedList
                    dataPoints={privateDataPoints}
                    setDataPoints={setPrivateDataPoints}
                    isPrivate
                    {...props}
                  />
                  <hr className={hrTheme.dark} />
                </>
              )}
              <button
                className={styles.distributionTitle}
                type="button"
                onClick={() => {}}
              >
                <span>{t('Other Data')}</span>
              </button>
              <DataLayersGroupedList
                dataPoints={regionsData}
                setDataPoints={setRegionsData}
                {...props}
              />
            </>
          )}
        </>
      )}
      {!speciesInfo && (
        <>
          <p>
            {t(
              "Couln't retrieve any data for this species. Please search for another species."
            )}
          </p>
          <SpeciesSearch {...props} />
        </>
      )}
      <Button
        className={styles.sendFeedbackButton}
        type="rectangular"
        label={
          countryISO.toUpperCase() === 'PER'
            ? t('Cultivos de Perú')
            : t('Enviar comentarios sobre los datos')
        }
        handleClick={showProvideFeedbackModal}
      />
      <Modal
        isOpen={showProvideFeedback}
        onRequestClose={() => setShowProvideFeedback(false)}
        theme={styles}
      >
        <article className={styles.feedbackContent}>
          <div className={styles.feedbackHeader}>
            <span className={styles.feedbackTitle}>
              {countryISO.toUpperCase() === 'PER'
                ? t('Cultivos de Perú')
                : t('Enviar comentarios sobre los datos')}
            </span>
            <span className={styles.feedbackSubtitle}>
              {countryISO.toUpperCase() === 'PER'
                ? t(
                    '¿Has detectado algún error en los datos de distribución o taxonómicos de las especies? Selecciona el problema a continuación y descríbelo en el cuadro de comentarios.'
                  )
                : t(
                    'Notice an error in the species distributional or taxonomic data? Select the data issue below and please describe the issue in the comment box.'
                  )}
            </span>
          </div>
          <span className={styles.feedbackLabel}>
            {countryISO.toUpperCase() === 'PER'
              ? t('Problemas con los datos')
              : t('Data Issues')}
          </span>
          <div className={styles.feedbackOption}>
            {feedbackOptions.map((option, index) => (
              <label className={styles.optionLabel} key={index}>
                <input
                  type="checkbox"
                  checked={option.checked}
                  onChange={() => {
                    const updatedOptions = [...feedbackOptions];
                    updatedOptions[index].checked =
                      !updatedOptions[index].checked;
                    setFeedbackOptions(updatedOptions);
                  }}
                />
                {t(option.label)}
              </label>
            ))}
          </div>
          <span className={styles.feedbackLabel}>
            {countryISO.toUpperCase() === 'PER'
              ? t('Comentarios adicionales')
              : t('Additional comments')}
          </span>

          <textarea
            className={styles.additionalComments}
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
            placeholder={
              countryISO.toUpperCase() === 'PER'
                ? t(
                    'Agrega comentarios adicionales sobre los problemas de datos...'
                  )
                : t('Add additional comments for data issues...')
            }
          ></textarea>
          <div className={styles.feedbackFooter}>
            <Button
              className={styles.cancelButton}
              label={t('Cancel')}
              handleClick={() => setShowProvideFeedback(false)}
            />

            <Button
              className={styles.submitButton}
              type="rectangular"
              label={
                countryISO.toUpperCase() === 'PER'
                  ? t('Enviar comentarios')
                  : t('Send Feedback')
              }
              handleClick={handleProvideFeedback}
            />
          </div>
        </article>
      </Modal>
    </section>
  );
}

export default DataLayerComponent;
