import React, { useEffect, useState } from 'react';

import { useT } from '@transifex/react';

import { getCSSVariable } from 'utils/css-utils';

import ArrowDownward from 'icons/arrow-down-solid.svg?react';
import ArrowUpward from 'icons/arrow-up-solid.svg?react';
import Stable from 'icons/minus-solid.svg?react';

import HabitatComponent from './habitat-component';

function HabitatContainer(props) {
  const t = useT();
  const {
    lightMode,
    habitatTableData,
    dataByCountry,
    countryName,
    habitatScore,
    countryISO,
    globalHabitatScore,
  } = props;

  const [selectedCountry, setSelectedCountry] = useState('Global');
  const [shiCountries, setShiCountries] = useState([]);
  const [chartData, setChartData] = useState();
  const [globalTrend, setGlobalTrend] = useState('');
  const [countryTrend, setCountryTrend] = useState('');
  const [globalTrendIcon, setGlobalTrendIcon] = useState(<Stable />);
  const [countryTrendIcon, setCountryTrendIcon] = useState(<Stable />);
  const [defaultCountryName, setDefaultCountryName] = useState('Global');

  const TRENDS = {
    UPWARD: 'arrow_upward',
    DOWNWARD: 'arrow_downward',
    STABLE: '',
  };

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
          text: t('Species Habitat Score'),
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

  const getChartData = (countrySelected) => {
    const dates = [];
    let currentCountry = dataByCountry.Global;
    // const globalCountry = dataByCountry.Global;

    const defaultCountryScores = { area: [], connectivity: [], total: [] };
    const selectedCountryScores = { area: [], connectivity: [], total: [] };

    if (countryISO === 'EE') {
      setDefaultCountryName('Global');
      currentCountry = dataByCountry.Global;

      if (currentCountry) {
        if (countrySelected !== 'Global') {
          currentCountry.shs?.forEach((row) => {
            defaultCountryScores.area.push(row.area_score);
            defaultCountryScores.connectivity.push(
              row.connectivity_score * 100
            );
            defaultCountryScores.total.push(row.shs);
          });
        }

        dataByCountry[countrySelected]?.shs.forEach((row) => {
          dates.push(row.year);
          selectedCountryScores.area.push(row.area_score);
          selectedCountryScores.connectivity.push(row.connectivity_score);
          selectedCountryScores.total.push(row.shs);
        });
      }
    } else if (currentCountry) {
      setDefaultCountryName(countryName);
      currentCountry = dataByCountry[countryName];

      const currentCountryShs = currentCountry.shs?.filter(
        (item) => item.year >= 2001
      );
      const currentCountryConn = currentCountry.connectivity_score?.filter(
        (item) => item.year >= 2001
      );

      const selectedCountrySHS = dataByCountry[countrySelected]?.shs?.filter(
        (item) => item.year >= 2001
      );
      const selectedCountryConn = dataByCountry[
        countrySelected
      ]?.connectivity_score?.filter((item) => item.year >= 2001);

      currentCountryShs?.forEach((row) => {
        if (row.shs) {
          defaultCountryScores.area.push(row.shs);
        }
      });

      selectedCountrySHS?.forEach((row) => {
        if (row.shs) {
          dates.push(row.year);
          selectedCountryScores.area.push(row.shs);
        }
      });

      if (currentCountryConn.length > 0) {
        const fragYear = currentCountryConn?.[0];
        currentCountryConn?.forEach((row) => {
          if (row.connectivity_score !== null) {
            defaultCountryScores.connectivity.push(row.connectivity_score);
          }
        });

        const selectedFragYear = selectedCountryConn?.[0];
        selectedCountryConn?.forEach((row) => {
          if (row.connectivity_score !== null) {
            selectedCountryScores.connectivity.push(row.connectivity_score);
          }
        });
      }

      for (let index = 0; index < dates.length; index += 1) {
        const dcTotal =
          (defaultCountryScores.area[index] +
            defaultCountryScores.connectivity[index]) /
          2;
        defaultCountryScores.total.push(dcTotal);

        const scTotal =
          (selectedCountryScores.area[index] +
            selectedCountryScores.connectivity[index]) /
          2;
        selectedCountryScores.total.push(scTotal);
      }
    }

    setChartData({
      labels: dates,
      datasets: [
        {
          label: `${countrySelected} Area`,
          fill: false,
          borderDash: [5, 5],
          backgroundColor: getCSSVariable('habitat-country'),
          borderColor: getCSSVariable('habitat-country'),
          pointBackgroundColor: getCSSVariable('habitat-country'),
          pointBorderColor: getCSSVariable('habitat-country'),
          pointStyle: false,
          data: defaultCountryScores.area,
        },
        {
          label: `${countrySelected} Connectivity`,
          fill: false,
          borderDash: [3, 3],
          backgroundColor: getCSSVariable('habitat-country'),
          borderColor: getCSSVariable('habitat-country'),
          pointBackgroundColor: getCSSVariable('habitat-country'),
          pointBorderColor: getCSSVariable('habitat-country'),
          pointStyle: false,
          data: defaultCountryScores.connectivity,
        },
        {
          label: `${countrySelected} Total`,
          fill: false,
          backgroundColor: getCSSVariable('habitat-country'),
          borderColor: getCSSVariable('habitat-country'),
          pointBackgroundColor: getCSSVariable('habitat-country'),
          pointBorderColor: getCSSVariable('habitat-country'),
          pointStyle: false,
          data: defaultCountryScores.total,
        },
        {
          label: `${defaultCountryName} Area`,
          fill: false,
          backgroundColor: getCSSVariable('habitat-country-compare'),
          borderColor: getCSSVariable('habitat-country-compare'),
          pointBackgroundColor: getCSSVariable('habitat-country-compare'),
          pointBorderColor: getCSSVariable('habitat-country-compare'),
          borderDash: [5, 5],
          pointStyle: false,
          data: selectedCountryScores.area,
        },
        {
          label: `${defaultCountryName} Connectivity`,
          fill: false,
          backgroundColor: getCSSVariable('habitat-country-compare'),
          borderColor: getCSSVariable('habitat-country-compare'),
          pointBackgroundColor: getCSSVariable('habitat-country-compare'),
          pointBorderColor: getCSSVariable('habitat-country-compare'),
          borderDash: [3, 3],
          pointStyle: false,
          data: selectedCountryScores.connectivity,
        },
        {
          label: `${defaultCountryName} Total`,
          fill: false,
          backgroundColor: getCSSVariable('habitat-country-compare'),
          borderColor: getCSSVariable('habitat-country-compare'),
          pointBackgroundColor: getCSSVariable('habitat-country-compare'),
          pointBorderColor: getCSSVariable('habitat-country-compare'),
          pointStyle: false,
          data: selectedCountryScores.total,
        },
      ],
    });
  };

  const onCountryChange = (event) => {
    setSelectedCountry(event.currentTarget.value);
    getChartData(event.currentTarget.value);
  };

  const updateCountry = (country) => {
    setSelectedCountry(country.value);
    getChartData(country.value);
  };

  const setTrendArrows = () => {
    const hs = habitatScore;
    const gs = globalHabitatScore;

    if (hs < 100) {
      setCountryTrend(TRENDS.DOWNWARD);
      setCountryTrendIcon(<ArrowDownward />);
    } else if (hs > 100) {
      setCountryTrend(TRENDS.UPWARD);
      setCountryTrendIcon(<ArrowUpward />);
    } else {
      setCountryTrend(TRENDS.STABLE);
      setCountryTrendIcon(<Stable />);
    }

    if (gs < 100) {
      setGlobalTrend(TRENDS.DOWNWARD);
      setGlobalTrendIcon(<ArrowDownward />);
    } else if (gs > 100) {
      setGlobalTrend(TRENDS.DOWNWARD);
      setGlobalTrendIcon(<ArrowUpward />);
    } else {
      setGlobalTrend(TRENDS.DOWNWARD);
      setGlobalTrendIcon(<Stable />);
    }
  };

  useEffect(() => {
    if (habitatTableData.length) {
      const countries = habitatTableData.map((item) => item.country);

      const sortedCountries = countries.sort((a, b) => {
        const nameA = a.toUpperCase();
        const nameB = b.toUpperCase();
        if (nameA === 'GLOBAL' || nameB === 'GLOBAL') {
          return -2;
        }
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

      setShiCountries(sortedCountries);

      getChartData('Global');

      setTrendArrows();
    }
  }, [habitatTableData]);

  return (
    <HabitatComponent
      selectedCountry={selectedCountry}
      shiCountries={shiCountries}
      chartData={chartData}
      globalTrend={globalTrend}
      countryTrend={countryTrend}
      globalTrendIcon={globalTrendIcon}
      countryTrendIcon={countryTrendIcon}
      chartOptions={chartOptions}
      defaultCountryName={defaultCountryName}
      updateCountry={updateCountry}
      onCountryChange={onCountryChange}
      {...props}
    />
  );
}

export default HabitatContainer;
