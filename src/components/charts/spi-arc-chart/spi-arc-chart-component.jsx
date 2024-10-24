import React, { useContext, useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import cx from 'classnames';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import styles from './spi-arc-chart-styles.module.scss';
import { LightModeContext } from '../../../context/light-mode';
import { useT } from '@transifex/react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function SpiArcChartComponent(props) {
  const t = useT();
  const { scores, width, height, data, img, species, value } = props;
  const { lightMode } = useContext(LightModeContext);
  const [score, setScore] = useState(0);

  const doughnutOptions = {
    cutout: '80%',
    radius: '100%',
    rotation: -90,
    responsive: false,
    circumference: 180,
    hoverOffset: 5,
    animation: {
      animateRotate: true,
      animateScale: false,
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    layout: {
      padding: {
        left: 5,
        right: 5,
        top: 5,
        bottom: 5,
      },
    },
  };

  const arcChartHeight = height || 100;
  const arcChartWidth = width || 120;

  const getPercentage = () => {
    const { count, total } = scores[species];

    if (!value) {
      const percent = (count / total) * 100 || 0;
      return [percent, 100 - percent];
    } else {
      return [count, 100 - count];
    }
  };

  useEffect(() => {
    setScore(value.toFixed(2));
  }, [value]);

  return (
    <div className={cx(lightMode ? styles.light : '', styles.spi)}>
      {scores && (
        <span className={styles.score}>{getPercentage()[0].toFixed(2)}</span>
      )}
      <Doughnut
        data={data}
        options={doughnutOptions}
        width={arcChartWidth}
        height={arcChartHeight}
      />
      {scores && (
        <div className={styles.taxoGroup}>
          <img src={img} width={40} height={40} alt={species} />
          {/* <div className={styles.richness}>{t('Species Richness:')}</div> */}
          <div className={styles.score}>
            {scores[species].total} {t(species)}
          </div>
        </div>
      )}
      {!scores && <div className={styles.globalScore}>{score}</div>}
    </div>
  );
}

export default SpiArcChartComponent;
