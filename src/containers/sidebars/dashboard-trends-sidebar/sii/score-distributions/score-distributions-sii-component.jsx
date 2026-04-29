import React, { useEffect, useState, useContext } from 'react';

import { T, useT } from '@transifex/react';

import { getCSSVariable } from 'utils/css-utils';

import cx from 'classnames';
import { LightModeContext } from 'context/light-mode';
import { Loading } from 'he-components';

import DistributionsChartComponent from 'components/charts/distribution-chart/distribution-chart-component';
import shiScoreDistImg from 'images/dashboard/tutorials/tutorial_shi_scoreDist-en.png?react';
import shiScoreDistFRImg from 'images/dashboard/tutorials/tutorial_shi_scoreDist-fr.png?react';
import styles from '../../dashboard-trends-sidebar-styles.module.scss';

import compStyles from './score-distributions-sii-styles.module.scss';
import ChartInfoComponent from 'components/chart-info-popup/chart-info-component';
import TaxaImageComponent from 'components/taxa-image';
import { useLocale } from '@transifex/react'
import { SECTION_INFO } from '../../../dashboard-sidebar/tutorials/sections/sections-info';

function ScoreDistributionsSiiComponent(props) {
  const t = useT();
  const bucketSize = 5;
  const locale = useLocale();
  const { siiScoresData, siiSelectSpeciesData, lang } = props;
  const { lightMode } = useContext(LightModeContext);
  const taxas = ['birds', 'mammals', 'reptiles', 'amphibians'];
  const lowAvg = 'Amphibians';
  const highAvg = 'birds';

  const spsSpecies = [
    {
      name: 'Grey Winged Robin Chat',
      scientificname: 'Cossypha polioptera',
    },
    {
      name: 'Piliocolobus parmentieri',
      scientificname: 'Piliocolobus parmentieri',
    },
    {
      name: 'Palm Egg Eater',
      scientificname: 'Dasypeltis palmarum',
    },
    {
      name: 'Caconda Grassland Frog',
      scientificname: 'Ptychadena bunoderma',
    },
  ];

  const [chartData, setChartData] = useState();
  const [taxaData, setTaxaData] = useState();
  const [showTable, setShowTable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chartInfo, setChartInfo] = useState();

  const getChartData = async () => {
    const data = siiScoresData;
    const taxaSet = {};

    // Loop through each number and place it in the appropriate bucket
    data.forEach((a) => {
      const number = +a.protection_score;
      // Determine the bucket index based on the floor value of the number
      const bucketIndex = Math.floor(number / 5);

      if (!(bucketIndex in taxaSet)) {
        taxaSet[bucketIndex] = 1;
      } else {
        taxaSet[bucketIndex] += 1;
      }
    });

    const labels = Object.keys(taxaSet).map((key) => +key * 5);

    setChartData({
      labels,
      datasets: [
        {
          label: t('Items'),
          data: Object.values(taxaSet),
          backgroundColor: getCSSVariable('birds'),
        },
      ],
    });
  };

  const toolTipTitle = (tooltipItems) => {
    const bucket = parseInt(tooltipItems[0].label, 10);
    if(bucket === 120){
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
        console.log(elements);
        const datasetIndex = elements[0].datasetIndex;
        const dataIndex = elements[0].index;
        const value = chartData.datasets[datasetIndex].data[dataIndex];
        console.log(value);

        getBucketSpecies((dataIndex * bucketSize), (dataIndex * bucketSize) + bucketSize);
      }
    }
  };

  const getBucketSpecies = (low, high) => {
    const response = fetch(`${DASHBOARD_URLS.BUCKET_SPECIES_URL}?iso3=${countryISO}&region_key=${selectedProvince?.region_key}&min_value=${low}&max_value=${high}&filter_by=shs&lang=${tx.currentLocale}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      if(res.ok){
        res.json().then((data) => {
          const species = data || [];
          const formattedSpecies = species.map((s) => ({
            species: s.species,
            commonname: s.commonname,
            species_url: s.species_url,
            habitat_score: s.shs,
            taxa: s.taxa,
          }));
          setSpsSpecies(formattedSpecies);
        });
      }
    }).catch((error) => {
      console.error('Error submitting feedback:', error);
      alert(t('There was an issue submitting your feedback. Please try again later.'));
    });
  };

  useEffect(() => {
    if (!siiScoresData.length) return;
    getChartData();
    getTaxaData();
    setIsLoading(false);
  }, [siiScoresData]);

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
          {t('Species with SIS between')} <b>0-5:</b>
        </span>
        <hr />
        <ul className={styles.spsSpecies}>
          {spsSpecies.map((species) => {
            return (
              <li key={species.scientificname}>
                <img src="https://place-hold.it/50x50" alt="species" />
                <div className={styles.spsInfo}>
                  <span className={styles.name}>{species.name}</span>
                  <span className={styles.scientificname}>
                    {species.scientificname}
                  </span>
                </div>
                <span className={styles.spsScore}>SPS: 0.04</span>
              </li>
            );
          })}
        </ul>
        <ul className={styles.spsSpecies}>
          {spsSpecies &&
            spsSpecies.map((s) => {
              if(s){
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
                      <span
                        className={styles.spsScore}
                      >{s.species_protection_score_all?.toFixed(
                        1
                      )}</span>
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
      <div className={compStyles.chartArea}>
        {!showTable && (
          <>
            {/* <SpeciesRichnessComponent countryData={countryData} taxaData={taxaData} /> */}
            {isLoading && <Loading height={200} />}
            {!isLoading && (
              <ChartInfoComponent chartInfo={chartInfo} {...props}>
                <DistributionsChartComponent data={chartData} options={options} />
              </ChartInfoComponent>
            )}
          </>
        )}
        {/* {showTable && (<>
          <SpeciesRichnessComponent countryData={countryData} taxaData={taxaData} />
          <DistributionsTableContainer chartData={siiData?.scoresData} {...props} />
        </>)} */}
      </div>
    </div>
  );
}

export default ScoreDistributionsSiiComponent;
