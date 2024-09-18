import React, { useContext, useEffect, useState } from 'react';
import { useT } from '@transifex/react';
import cx from 'classnames';

import styles from './dashboard-trends-sidebar-styles.module.scss';
import ScoreDistributionsContainer from './score-distributions';
import TemporalTrendsContainer from './temporal-trends';

export const NATIONAL_TREND = 'NATIONAL';
export const PROVINCE_TREND = 'PROVINCE';

function DashboardTrendsSidebar(props) {
  const t = useT();
  const { shiValue, siiValue, spiValue, countryName } = props;

  const [trendOption, setTrendOption] = useState(2);

  return (
    <div className={styles.container}>
      <header>
        <div className={styles.title}>
          <b>{t('Conservation Metrics')}</b>
          <label>{countryName}</label>
        </div>
        <div className={styles.tabs}>
          <button
            type="button"
            aria-label="Species Protection Index"
            className={cx({
              [styles.selected]: trendOption === 2,
            })}
            onClick={() => setTrendOption(2)}
          >
            <label>{spiValue}</label>
            <span>{t('Species Protection Index')}</span>
          </button>
          <button
            type="button"
            aria-label="Species Habitat Index"
            className={cx({
              [styles.selected]: trendOption === 1,
            })}
            onClick={() => setTrendOption(1)}
          >
            <label>{shiValue}</label>
            <span>{t('Species Habitat Index')}</span>
          </button>

          <button
            type="button"
            aria-label="Species Information Index"
            className={cx({
              [styles.selected]: trendOption === 3,
            })}
            onClick={() => setTrendOption(3)}
          >
            <label>{siiValue}</label>
            <span>{t('Species Information Index')}</span>
          </button>
        </div>
      </header>
      <TemporalTrendsContainer
        trendOption={trendOption}
        {...props}
      />
      <ScoreDistributionsContainer
        trendOption={trendOption}
        {...props}
      />
    </div>
  );
}

export default DashboardTrendsSidebar;
