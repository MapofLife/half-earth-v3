import React, { useContext, useEffect, useState } from 'react';

import cx from 'classnames';

import Button from 'components/button';

import {
  NATIONAL_TREND,
  PROVINCE_TREND,
} from '../../dashboard-trends-sidebar-component';
import styles from '../../dashboard-trends-sidebar-styles.module.scss';

import NationalChartContainer from './national-chart';
import { LightModeContext } from '../../../../../context/light-mode';
import { T, useT } from '@transifex/react';

function TemporalTrendsShiComponent(props) {
  const t = useT();
  const { shiData, shiValue, countryName } = props;

  // const [chartData, setChartData] = useState();
  const [lostAvg, setLostAvg] = useState(0);
  const { lightMode } = useContext(LightModeContext);
  const [startYear, setStartYear] = useState(2001);

  useEffect(() => {
    setLostAvg((100 - shiValue).toFixed(2));

  }, [shiValue]);

  const handleActionChange = (event) => {

  };

  return (
    <div className={cx(lightMode ? styles.light : '', styles.trends)}>
      <div className={styles.info}>
        <span className={styles.title}>{t('Temporal Trends')}</span>
        <p className={styles.description}>
          <T
            _str='Since {startYear}, the terrestrial vertebrate species of the {countryNameBold} have lost an average of {lostAvgBold} of their suitable habitat, leading to the country having a Species Habitat Index of {shiValueBold}.'
            startYear={startYear}
            countryNameBold={<b>{countryName}</b>}
            lostAvgBold={<b>{lostAvg}%</b>}
            shiValueBold={<b>{shiValue}</b>}
          />
        </p>
        <p className={styles.description}>
          {t('The Area Score addresses changes in habitat extent while the Connectivity Score addresses changes in the fragmentation of habitat.')}
        </p>
        <div className={styles.options}>
          <Button
            type="rectangular"
            className={styles.saveButton}
            label={NATIONAL_TREND}
            handleClick={handleActionChange}
          />
          {/*
          <span className={styles.helpText}>
            {t('Toggle national SPI and province-level breakdown.')}
          </span>
          <Button
            type="rectangular"
            className={cx(styles.saveButton, styles.notActive)}
            label="play animation"
          />
          <span className={styles.helpText}>
            {t('View how the percent of area protected, SPI, and score distributions have changed over time.')}
          </span>*/}
        </div>
      </div>
      <NationalChartContainer
        chartData={shiData.trendData}
        {...props}
      />
    </div>
  );
}

export default TemporalTrendsShiComponent;
