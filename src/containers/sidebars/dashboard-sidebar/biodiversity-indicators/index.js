import React, { useContext, useEffect, useState } from 'react';

import { useT } from '@transifex/react';

import { EEWWF_COUNTRY_LINES_FEATURE_ID } from 'utils/dashboard-utils';

import { LightModeContext } from 'context/light-mode';
import last from 'lodash/last';

import EsriFeatureService from 'services/esri-feature-service';

import {
  INITIAL_LAYERS,
  LAYER_OPTIONS,
  LAYER_TITLE_TYPES,
  DATA_POINT_TYPE,
} from 'constants/dashboard-constants';

import BioDiversityComponent from './biodiversity-indicators-component';

const roundUpNumber = (val) => {
  if (val > 10000) {
    return Math.round(val / 1000) * 1000;
  }
  if (val > 1000) {
    return Math.round(val / 100) * 100;
  }
  return val;
};

function BioDiversityContainer(props) {
  const {
    data,
    countryName,
    dataByCountry,
    regionLayers,
    map,
    speciesInfo,
    setRegionLayers,
    countryISO,
    setMapLegendLayers,
    view,
    setIsLoading,
  } = props;

  const t = useT();

  const { lightMode } = useContext(LightModeContext);
  const [selectedTab, setSelectedTab] = useState(2);
  const [habitatScore, setHabitatScore] = useState('0.00');
  const [habitatTableData, setHabitatTableData] = useState([]);
  const [globalHabitatScore, setGlobalHabitatScore] = useState(0);
  const [protectionScore, setProtectionScore] = useState();
  const [globalProtectionScore, setGlobalProtectionScore] = useState('0.00');
  const [protectionTableData, setProtectionTableData] = useState([]);
  const [startYear, setStartYear] = useState(1950);

  const removeRegionLayers = () => {
    const layersToRemove = INITIAL_LAYERS;

    if (countryISO.toLowerCase() === 'guy') {
      layersToRemove.push('GUY-RIVER');
      layersToRemove.push('GUY-RIVER-NAME');
    }

    map.layers.items.forEach((layer) => {
      if (!layersToRemove.includes(layer.id)) {
        map.remove(layer);
      }
    });
  };

  const getCountryScores = (country, lastCountryYearValue, startYearValue) => {
    let countryAreaScore = 0;
    let countryConnectivityScore = 0;

    if (countryISO.toLowerCase() === 'ee') {
      countryAreaScore = country?.shs[lastCountryYearValue].area_score;
      countryConnectivityScore =
        country?.shs[lastCountryYearValue].connectivity_score;
      return { countryAreaScore, countryConnectivityScore };
    }

    if (country?.shs[lastCountryYearValue]) {
      countryAreaScore = country?.shs[lastCountryYearValue].shs;
      if (
        country?.connectivity_score[lastCountryYearValue].connectivity_score
      ) {
        countryConnectivityScore =
          // eslint-disable-next-line no-unsafe-optional-chaining
          country?.connectivity_score[lastCountryYearValue].connectivity_score /
          startYearValue;
      }

      return { countryAreaScore, countryConnectivityScore };
    }
    return { countryAreaScore: 0, countryConnectivityScore: 0 };
  };

  const getHabitatScore = () => {
    let country;

    if (countryISO.toLowerCase() === 'ee') {
      country = dataByCountry.Global;
    } else {
      country = dataByCountry[countryName];
    }

    // TODO: handle no frag values
    const connectivityStartYearValue = country?.connectivity_score.find(
      (item) => item.year === 2001
    );
    const startYearValue = connectivityStartYearValue?.connectivity_score ?? 0;
    setStartYear(2001);
    // eslint-disable-next-line no-unsafe-optional-chaining
    const lastCountryYearValue = country?.shs.length - 1;
    let globalAreaScore = 0;
    let globalConnectivityScore = 0;

    const { countryAreaScore, countryConnectivityScore } = getCountryScores(
      country,
      lastCountryYearValue,
      startYearValue
    );

    if (dataByCountry.Global?.shs[lastCountryYearValue]) {
      if (countryISO.toLowerCase() === 'ee') {
        globalAreaScore =
          dataByCountry.Global?.shs[lastCountryYearValue].area_score;
        globalConnectivityScore =
          dataByCountry.Global?.shs[lastCountryYearValue].connectivity_score;
      } else {
        globalAreaScore = dataByCountry.Global?.shs[lastCountryYearValue].shs;

        if (
          dataByCountry.Global?.connectivity_score[lastCountryYearValue]
            .connectivity_score?.area_score
        ) {
          globalConnectivityScore =
            // eslint-disable-next-line no-unsafe-optional-chaining
            dataByCountry.Global?.connectivity_score[lastCountryYearValue]
              .connectivity_score / startYearValue;
        }
      }
    }

    const scores = {
      habitat: country?.shs[lastCountryYearValue - 1].shs.toFixed(1),
      globalHabitat: ((globalAreaScore + globalConnectivityScore) / 2) * 100,
    };

    return scores;
  };

  const getHabitatTableData = () => {
    const tableData = [];

    if (countryISO.toLowerCase() === 'ee') {
      Object.keys(dataByCountry).forEach((country) => {
        const item = dataByCountry[country].shs;
        const lastItem = last(item);

        tableData.push({
          country: lastItem.name,
          stewardship: lastItem.shs_stewardship * 100,
          countryAreaScore: lastItem.area_score,
          countryConnectivityScore: lastItem.connectivity_score,
          shs: lastItem.shs * 100,
        });
      });
    } else {
      Object.keys(dataByCountry).forEach((country) => {
        let stewardship = 100;
        const habitatCountry = dataByCountry[country];
        const lastHabitatItem = habitatCountry?.shs
          ?.slice()
          .reverse()
          .find((item) => item?.shs !== undefined && item?.shs !== null);

        if (!lastHabitatItem) {
          return;
        }

        // const countrySHS = country?.shs;
        const startYearValue =
          habitatCountry?.connectivity_score[0]?.connectivity_score ?? 0;

        const countryData = dataByCountry[country];
        const global2001 =
          dataByCountry.Global?.shs.find((item) => item.year === 2001) || 0;
        const country2001 = roundUpNumber(
          countryData.shs.find((item) => item.year === 2001) || 0
        );
        if (country.toUpperCase() === 'GLOBAL') {
          stewardship = 100;
        } else {
          stewardship = country2001 / global2001;
        }

        // if (!Number.isNaN(shs)) {
        tableData.push({
          country,
          stewardship: lastHabitatItem.shs_stewardship,
          countryAreaScore: lastHabitatItem.area_score,
          countryConnectivityScore: lastHabitatItem.connectivity_score,
          shs: lastHabitatItem.shs,
        });
        // }
      });
    }

    setHabitatTableData(tableData);
  };

  const getProtectionTableData = (spiData) => {
    const tableData = [];

    Object.keys(dataByCountry).forEach((country) => {
      const currentCountryData = last(
        spiData.filter((row) => row.country === country)
      );
      // grab stewardship value from habitat table data
      if (currentCountryData && currentCountryData.sps_stewardship) {
        tableData.push({
          country: currentCountryData.country,
          stewardship: currentCountryData.sps_stewardship,
          rangeProtected: currentCountryData.range_protected?.toFixed(1),
          targetProtected: currentCountryData.target_protected?.toFixed(1),
          sps: currentCountryData.sps?.toFixed(1),
        });
      }
    });

    setProtectionTableData(tableData);
  };

  const getLayerIcon = (layer, item) => {
    view.whenLayerView(layer).then(() => {
      const { renderer } = layer; // Get the renderer

      if (renderer) {
        const { symbol, uniqueValueGroups } = renderer;

        if (symbol) {
          const { url, outline } = symbol;

          if (url) {
            item.imageUrl = url;
          }

          if (outline) {
            item.outline = outline;
          }
        } else if (uniqueValueGroups) {
          item.classes = uniqueValueGroups[0].classes;
        }
      }

      setMapLegendLayers((ml) => [...ml, item]);
    });
  };

  const addBioDiversityLayers = async () => {
    setIsLoading(true);
    const protectedLayers = await EsriFeatureService.addProtectedAreaLayer(
      null,
      countryISO
    );

    const layerName = LAYER_OPTIONS.HABITAT;
    const webTileLayer = await EsriFeatureService.getXYZLayer(
      speciesInfo.scientificname.replace(' ', '_'),
      layerName,
      LAYER_TITLE_TYPES.TREND,
      speciesInfo.taxa
    );

    map.add(webTileLayer);
    await view.whenLayerView(webTileLayer);

    map.add(protectedLayers);
    await view.whenLayerView(protectedLayers);

    // Add layers to Map Legend
    const protectedAreaLayer = {
      label: t(LAYER_TITLE_TYPES.PROTECTED_AREAS),
      id: LAYER_OPTIONS.PROTECTED_AREAS,
      showChildren: false,
      type: DATA_POINT_TYPE.PUBLIC,
    };

    const habitatLayer = {
      label: t(LAYER_TITLE_TYPES.HABITAT),
      id: LAYER_OPTIONS.HABITAT,
      showChildren: false,
      type: DATA_POINT_TYPE.PUBLIC,
    };

    getLayerIcon(protectedLayers, protectedAreaLayer);
    getLayerIcon(webTileLayer, habitatLayer);

    if (countryISO.toLowerCase() === 'ee') {
      const layer = await EsriFeatureService.getFeatureLayer(
        EEWWF_COUNTRY_LINES_FEATURE_ID,
        countryISO,
        LAYER_OPTIONS.EEWWF_COUNTRY_LINES
      );

      setRegionLayers({
        ...regionLayers,
        [layerName]: webTileLayer,
        [LAYER_OPTIONS.PROTECTED_AREAS]: protectedLayers,
        [LAYER_OPTIONS.EEWWF_COUNTRY_LINES]: layer,
      });
      map.add(layer);
    } else {
      setRegionLayers({
        ...regionLayers,
        [layerName]: webTileLayer,
        [LAYER_OPTIONS.PROTECTED_AREAS]: protectedLayers,
      });
    }

    setIsLoading(false);
  };

  // get habitat score information
  useEffect(() => {
    if (dataByCountry && data) {
      const { habitat, globalHabitat } = getHabitatScore();
      setHabitatScore(habitat);
      setGlobalHabitatScore(globalHabitat);

      getHabitatTableData();
      const tableData = [];
      // if (data?.spiScoreData) {
      //   const tableData = [];
      //   const { spiScoreData } = data;

      //   if (Array.isArray(spiScoreData)) {
      //     spiScoreData.forEach((item) => {
      //       const lastItem = item;
      //       tableData.push({
      //         country: lastItem.country,
      //         stewardship: lastItem.sps_stewardship,
      //         rangeProtected: lastItem.range_protected,
      //         targetProtected: lastItem.target_protected,
      //         sps: lastItem.sps,
      //       });
      //     });

      //     const global = spiScoreData.filter(
      //       (country) => country.country.toUpperCase() === 'GLOBAL'
      //     );
      //     const globalValues = last(global).sps;
      //     setGlobalProtectionScore(globalValues);

      //     setProtectionScore(parseFloat(globalValues.toFixed(1)));
      //   } else {
      // Object.keys(spiScoreData).forEach((key) => {
      Object.keys(dataByCountry).forEach((key) => {
        const item = dataByCountry[key];
        const lastItem = last(item.spi);

        if (lastItem.sps) {
          tableData.push({
            country: lastItem.country,
            stewardship: lastItem.sps_stewardship,
            rangeProtected: lastItem.range_protected,
            targetProtected: lastItem.target_protected,
            sps: lastItem.sps,
          });
        }
      });

      if (dataByCountry.Global) {
        const globalValues = last(dataByCountry.Global.spi).sps;
        setGlobalProtectionScore(globalValues);
        setProtectionScore(parseFloat(globalValues.toFixed(1)));
      } else {
        setGlobalProtectionScore(0);
        setProtectionScore(0);
      }
      // }
      setProtectionTableData(tableData);
      // }
    }
  }, [dataByCountry, data]);

  // get protection score information
  useEffect(() => {
    if (data && habitatTableData && dataByCountry) {
      if (data?.spiScoreData?.length > 0) {
        // getProtectionTableData(data.spiScoreData);

        const globalValues = data.spiScoreData.filter(
          (country) => country.country.toUpperCase() === 'GLOBAL'
        );

        const countryData = data.spiScoreData.filter((country) => {
          if (countryISO.toLowerCase() === 'ee') {
            return (
              country.country.toUpperCase() ===
              data.spiScoreData[0].country.toUpperCase()
            );
          }
          return country.country.toUpperCase() === countryName?.toUpperCase();
        });

        const scores = {
          protectionScore: last(countryData).sps?.toFixed(1) ?? 0,
          globalProtectionScore: last(globalValues).sps?.toFixed(1) ?? 0,
        };

        setProtectionScore(scores.protectionScore);
        setGlobalProtectionScore(scores.globalProtectionScore);
      }
    }
  }, [data, habitatTableData]);

  useEffect(() => {
    if (!speciesInfo) return;

    removeRegionLayers();
    addBioDiversityLayers();
  }, [speciesInfo]);

  return (
    <BioDiversityComponent
      lightMode={lightMode}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      habitatScore={habitatScore}
      habitatTableData={habitatTableData}
      globalHabitatScore={globalHabitatScore}
      protectionScore={protectionScore}
      globalProtectionScore={globalProtectionScore}
      protectionTableData={protectionTableData}
      startYear={startYear}
      {...props}
    />
  );
}

export default BioDiversityContainer;
