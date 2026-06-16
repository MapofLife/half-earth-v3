import React, { useEffect, useState, useContext } from 'react';

import { T, useT } from '@transifex/react';
import { tx } from '@transifex/native';
import { getCSSVariable } from 'utils/css-utils';

import cx from 'classnames';
import { LightModeContext } from 'context/light-mode';
import { Loading } from 'he-components';
import { DASHBOARD_URLS } from 'constants/layers-urls';
import DistributionsChartComponent from 'components/charts/distribution-chart/distribution-chart-component';
import shiScoreDistImg from 'images/dashboard/tutorials/tutorial_shi_scoreDist-en.png?react';
import shiScoreDistFRImg from 'images/dashboard/tutorials/tutorial_shi_scoreDist-fr.png?react';
import styles from '../../dashboard-trends-sidebar-styles.module.scss';
import {
  NATIONAL_TREND,
  PROVINCE_TREND,
} from '../../dashboard-trends-sidebar-component';
import {
  NAVIGATION,
  SPECIES_SELECTED_COOKIE,
} from 'constants/dashboard-constants.js';
import compStyles from './score-distributions-sii-styles.module.scss';
import ChartInfoComponent from 'components/chart-info-popup/chart-info-component';
import TaxaImageComponent from 'components/taxa-image';
import { useLocale } from '@transifex/react';
import { SECTION_INFO } from '../../../dashboard-sidebar/tutorials/sections/sections-info';
import SpeciesRichnessComponent from '../../../../../components/species-richness/species-richness-component';

function ScoreDistributionsSiiComponent(props) {
  const {
    siiScoresData,
    siiSelectSpeciesData,
    setMapLegendLayers,
    setFromTrends,
    setSelectedIndex,
    setScientificName,
    setSpsSpecies,
    lang,
    selectedProvince,
    countryISO,
    siiActiveTrend,
  } = props;
  const t = useT();
  const bucketSize = 5;
  const locale = useLocale();
  const { lightMode } = useContext(LightModeContext);
  const taxas = ['birds', 'mammals', 'reptiles', 'amphibians'];
  const lowAvg = 'Amphibians';
  const highAvg = 'birds';

  const [siiSpecies, setSiiSpecies] = useState();
  const [chartData, setChartData] = useState();
  const [taxaData, setTaxaData] = useState();
  const [showTable, setShowTable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chartInfo, setChartInfo] = useState();
  const [lowDist, setLowDist] = useState(0);
  const [highDist, setHighDist] = useState(7);
  const threatStatuses = ['EXTINCT', 'EXTINCT IN THE WILD'];
  const [isSpeciesLoading, setIsSpeciesLoading] = useState(true);

  const getChartData = async () => {
    const data = siiScoresData;
    const taxaSet = { amphibians: {}, birds: {}, mammals: {}, reptiles: {} };

    // Loop through each number and place it in the appropriate bucket
    // data.forEach((a) => {
    //   const number = +a.protection_score;
    //   // Determine the bucket index based on the floor value of the number
    //   const bucketIndex = Math.floor(number / 5);

    //   if (!(bucketIndex in taxaSet)) {
    //     taxaSet[bucketIndex] = 1;
    //   } else {
    //     taxaSet[bucketIndex] += 1;
    //   }
    // });

    data?.forEach((a) => {
      const group = a.bin.split(',');
      const bin = group[0] ? group[0].replace(/ /gi, '') : a.bin;
      taxaSet.amphibians[bin] = a.amphibians_sii_count || a.amphibians;
      taxaSet.birds[bin] = a.birds_sii_count || a.birds;
      taxaSet.mammals[bin] = a.mammals_sii_count || a.mammals;
      taxaSet.reptiles[bin] = a.reptiles_sii_count || a.reptiles;
    });

    // const labels = Object.keys(taxaSet).map((key) => +key * 5);
    const uniqueKeys = new Set([
      ...Object.keys(taxaSet.birds),
      ...Object.keys(taxaSet.mammals),
      ...Object.keys(taxaSet.reptiles),
      ...Object.keys(taxaSet.amphibians),
    ]);

    setChartData({
      labels: [...uniqueKeys].map((key) => key),
      datasets: [
        {
          label: t('Birds'),
          data: Object.values(taxaSet.birds),
          backgroundColor: getCSSVariable('birds'),
        },
        {
          label: t('Mammals'),
          data: Object.values(taxaSet.mammals),
          backgroundColor: getCSSVariable('mammals'),
        },
        {
          label: t('Reptiles'),
          data: Object.values(taxaSet.reptiles),
          backgroundColor: getCSSVariable('reptiles'),
        },
        {
          label: t('Amphibians'),
          data: Object.values(taxaSet.amphibians),
          backgroundColor: getCSSVariable('amphibians'),
        },
      ],
    });
  };

  const toolTipTitle = (tooltipItems) => {
    const bucket = parseInt(tooltipItems[0].label, 10);
    if (bucket === 120) {
      return '> 120';
    }
    return `${bucket} - ${bucket + 5}`;
  };

  // TODO: Using hard coded region id for Congo
  const getTaxaData = async () => {
    const taxaCallsResponses = await Promise.all(
      taxas.map(async (taxa) => {
        const response = await fetch(
          `https://api.mol.org/2.x/indicators/nrc?region_id=90b03e87-3880-4164-a310-339994e3f919&taxa=${taxa}`
        );
        const data = await response.json();
        return data;
      })
    );

    const [birdData, mammalData, reptileData, amphibianData] =
      taxaCallsResponses;
    setTaxaData({ birdData, mammalData, reptileData, amphibianData });
  };

  const updateChartInfo = () => {
    setChartInfo({
      title: t('Score Distributions'),
      description: t(SECTION_INFO.SHI_SCORE_DISTRIBUTIONS),
      imgAlt: t('Species Protection Index - Trends'),
      image: locale === 'fr' ? shiScoreDistFRImg : shiScoreDistImg,
    });
  };

  const options = {
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: toolTipTitle,
        },
      },
    },
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        type: 'linear',
        offset: false,
        stacked: true,
        display: true,
        title: {
          display: true,
          text: t('Score'),
          color: lightMode ? getCSSVariable('black') : getCSSVariable('white'),
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          color: getCSSVariable('oslo-gray'),
          display: false,
          offset: false,
        },
        ticks: {
          color: getCSSVariable('oslo-gray'),
          stepSize: 5,
        },
      },
      y: {
        stacked: true,
        display: true,
        title: {
          display: true,
          text: t('Number of Species'),
          color: lightMode ? getCSSVariable('black') : getCSSVariable('white'),
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          color: getCSSVariable('oslo-gray'),
        },
        ticks: {
          color: getCSSVariable('oslo-gray'),
          stepSize: 10,
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const datasetIndex = elements[0].datasetIndex;
        const dataIndex = elements[0].index;
        const value = chartData.datasets[datasetIndex].data[dataIndex];

        getBucketSpecies(
          dataIndex * bucketSize,
          dataIndex * bucketSize + bucketSize
        );
      }
    },
  };

  const getBucketSpecies = (low, high) => {
    const regionKey =
      siiActiveTrend === PROVINCE_TREND
        ? selectedProvince.region_key
        : countryISO;

    const response = fetch(
      `${DASHBOARD_URLS.BUCKET_SPECIES_URL}?iso3=${countryISO}&region_key=${regionKey}&min_value=${low}&max_value=${high}&filter_by=sis_stewardship&lang=${tx.currentLocale}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            const species = data || [];
            const formattedSpecies = species.map((s) => ({
              species: s.species,
              commonname: s.commonname,
              species_url: s.species_url,
              sis_stewardship: s.sis_stewardship,
              taxa: s.taxa,
            }));
            setSiiSpecies(formattedSpecies);
          });
        }
      })
      .catch((error) => {
        console.error('Error submitting feedback:', error);
        alert(
          t(
            'There was an issue submitting your feedback. Please try again later.'
          )
        );
      });
  };

  const selectSpecies = (scientificname) => {
    setMapLegendLayers([]);
    setFromTrends(true);
    setSelectedIndex(NAVIGATION.DATA_LAYER);
    setScientificName(scientificname);
    localStorage.setItem(SPECIES_SELECTED_COOKIE, scientificname);
  };

  const loadSpecies = () => {
    const species = [];
    siiSelectSpeciesData.forEach((item) => {
      if (item.species_sii) {
        const values = item.species_sii;

        values.forEach((value) => {
          const val = value;
          if (
            !threatStatuses.includes(val.threat_status?.toUpperCase()) &&
            val.species_url
          ) {
            species.push({
              species: val.species,
              commonname: val.commonname,
              species_url: val.species_url,
              sis_stewardship: val.sis_stewardship,
              taxa: val.taxa,
            });
          }
        });

        if (species.length > 0) {
          const lastItem = species[species.length - 1];
          const low = species[0].sis_stewardship || 0;
          const high = lastItem.sis_stewardship || 0;

          setLowDist(low.toFixed(1));
          setHighDist(high.toFixed(1));
        } else {
          setLowDist(0);
          setHighDist(0);
        }
      }
    });

    if (
      countryISO.toLowerCase() === 'guy' &&
      siiActiveTrend === NATIONAL_TREND
    ) {
      setSpsSpecies([
        {
          species: 'Pipra aureola',
          commonname: 'Crimson-hooded Manakin',
          species_url:
            'https://storage.googleapis.com/mol-assets2/mid/712f124b5e3a4259890d2ed58bf49059.jpg',
          sis_stewardship: 84.6,
          taxa: 'birds',
        },
        {
          species: 'Glossophaga commissarisi',
          species_url:
            'https://storage.googleapis.com/mol-assets2/mid/46f5bcb2fce4455aae6964ea69c10342.jpg',
          sis_stewardship: 85,
          taxa: 'reptiles',
          commonname: "Commissaris's long-tongued bat",
        },
        {
          species: 'Boana sibleszi',
          species_url:
            'https://storage.googleapis.com/mol-assets2/mid/3cad5f2a725c41d19a9fa306edde5b7e.jpg',
          sis_stewardship: 90.6,
          commonname: 'La Escalera Tree Frog',
          taxa: 'amphibians',
        },
        {
          species: 'Gonatodes annularis',
          species_url:
            'https://storage.googleapis.com/mol-assets2/mid/7663ecebf87f45349d07dd8fc5eac210.jpg',
          sis_stewardship: 91.2,
          taxa: 'reptiles',
          commonname: 'Annulated Gecko',
        },
      ]);
    } else {
      const bird = species.find((item) => item.taxa === 'birds');
      const mammal = species.find((item) => item.taxa === 'mammals');
      const reptile = species.find((item) => item.taxa === 'reptiles');
      const amphibian = species.find((item) => item.taxa === 'amphibians');
      setSiiSpecies([bird, mammal, reptile, amphibian]);
    }

    setIsSpeciesLoading(false);
  };

  useEffect(() => {
    if (!siiScoresData.length) return;
    getChartData();
    getTaxaData();
    setIsLoading(false);
  }, [siiScoresData]);

  useEffect(() => {
    if (!siiSelectSpeciesData || !siiSelectSpeciesData.length) return;
    setIsSpeciesLoading(true);
    loadSpecies();
  }, [siiSelectSpeciesData]);

  useEffect(() => {
    if (!lang) return;
    updateChartInfo();
  }, [lang]);

  useEffect(() => {
    updateChartInfo();
  }, []);

  return (
    <div className={cx(lightMode ? styles.light : '', styles.trends)}>
      <div className={styles.info}>
        <span className={styles.title}>{t('Score Distributions')}</span>

        <p className={styles.description}>
          <T _str="View the distribution of the individual Species Information Scores for all terrestrial vertebrates." />
        </p>

        <span className={styles.spsSpeciesTitle}>
          {t('Species Highlights')}
        </span>
        <hr />
        <ul className={styles.spsSpecies}>
          {siiSpecies &&
            siiSpecies.map((s) => {
              if (s) {
                return (
                  <li key={`${s.species}`}>
                    <button
                      type="button"
                      onClick={() => selectSpecies(s.species)}
                    >
                      {s.species_url && (
                        <img src={s.species_url} alt="species" />
                      )}
                      {!s?.species_url && <TaxaImageComponent taxa={s?.taxa} />}
                      <div className={styles.spsInfo}>
                        <span className={styles.name}>{s.commonname}</span>
                        <span className={styles.scientificname}>
                          {s.species}
                        </span>
                      </div>
                      <span className={styles.spsScore}>
                        {s.sis_stewardship?.toFixed(1)}
                      </span>
                    </button>
                  </li>
                );
              }
            })}
        </ul>
        <div className={styles.options}>
          {/* {!showTable && <Button
            type="rectangular"
            className={cx(styles.saveButton, styles.notActive)}
            label={t('View full table')}
            handleClick={() => setShowTable(true)}
          />}
          {showTable && <Button
            type="rectangular"
            className={cx(styles.saveButton, styles.notActive)}
            label={t('Close full table')}
            handleClick={() => setShowTable(false)}
          />}
          <span className={styles.helpText}>
            {t('Open and download a full table of species SPS and relevant traits at national and province levels for a selected year.')}
          </span> */}
        </div>
      </div>
      <div
        className={cx(lightMode ? compStyles.light : '', compStyles.chartArea)}
      >
        <SpeciesRichnessComponent sii {...props} />
        {!showTable && (
          <>
            {isLoading && <Loading height={200} />}
            {!isLoading && (
              <ChartInfoComponent chartInfo={chartInfo} {...props}>
                <DistributionsChartComponent
                  data={chartData}
                  options={options}
                />
              </ChartInfoComponent>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ScoreDistributionsSiiComponent;
