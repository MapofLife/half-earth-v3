import React from 'react';
import styles from './habitat-component-styles.module.scss';

import cx from 'classnames';

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LinearScale, LineElement, PointElement, Tooltip, Legend, CategoryScale);

function HabitatComponent(props) {
  const {
    habitatScore,
    globalHabitatScore,
    countryName,
    habitatTableData,
    lightMode,
    selectedCountry,
    shiCountries,
    chartData,
    globalTrend,
    countryTrend,
    globalTrendIcon,
    countryTrendIcon,
    onCountryChange,
    chartOptions,
    updateCountry } = props;

  return (
    <div className={cx(lightMode ? styles.light : '', styles.container)}>
      <p>
        *The Species Habitat Score is calculated using the habitat suitable
        range map and remote sensing layers.
      </p>
      <div className={styles.scores}>
        <div className={styles.metric}>
          <label>Guinea</label>
          <div className={styles.score}>
            <span className={cx(styles['material-symbols-outlined'], styles[countryTrend])}>
              {countryTrendIcon}
            </span>
            <div className={styles.results}>
              <b>{habitatScore}%</b>
              <span className={styles.desc}>Suitable habitat lost in Guinea since 2001</span>
            </div>
          </div>
        </div>
        <div className={styles.metric}>
          <label>Globally</label>
          <div className={styles.score}>
            <span className={cx(styles['material-symbols-outlined'], styles[globalTrend])}>
              {globalTrendIcon}
            </span>
            <div className={styles.results}>
              <b>{(globalHabitatScore).toLocaleString(undefined, { maximumFractionDigits: 2 })}%</b>
              <span className={styles.desc}>Suitable habitat lost globally since 2001</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.chart}>
        <div className={styles.compareWrap}>
          <label className={styles.compare}>Compare</label>
          <select value={selectedCountry} onChange={onCountryChange}>
            {shiCountries.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className={styles.labels}>
          <label className={styles.dashed}>Area</label>
          <label className={styles.dotted}>Connectivity</label>
          <label className={styles.solid}>Total</label>
        </div>
        <div className={styles.legend}>
          <div className={cx(styles.legendBox, styles.blue)}></div>
          <label>{countryName}</label>
          <div className={cx(styles.legendBox, styles.green)}></div>
          <label>{selectedCountry}</label>
        </div>
        {chartData && <Line options={chartOptions} data={chartData} />}
        {habitatTableData.length &&
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th className={cx(styles.textLeft, styles.w28)}>Country</th>
                <th className={cx(styles.textCenter, styles.w14)}>Stewardship</th>
                <th className={cx(styles.textCenter, styles.w14)}>Connectivity Score</th>
                <th className={cx(styles.textCenter, styles.w14)}>Area Score</th>
                <th className={cx(styles.textCenter, styles.w14)}>Total SHS</th>
              </tr>
            </thead>
            <tbody>
              {habitatTableData.map(row => (
                <tr key={row.country} onClick={() => updateCountry({ value: row.country })}
                  className={(selectedCountry === row.country || countryName === row.country) ? styles.highlighted : ''}
                >
                  <td>{row.country}</td>
                  <td className={styles.textCenter}>{row.stewardship.toLocaleString(undefined, { maximumFractionDigits: 2 })}%</td>
                  <td className={styles.textCenter}>
                    {(row.countryConnectivityScore * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className={styles.textCenter}>
                    {(row.countryAreaScore * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className={styles.textCenter}>{row.shs.toLocaleString(undefined, { maximumFractionDigits: 2 })}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div >
  )
}

export default HabitatComponent