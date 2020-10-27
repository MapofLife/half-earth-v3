import React from 'react';
import Link from 'redux-first-router-link';
import styles from './switcher-styles.module';

const Switcher = ({ route, changeMapSceneAnalyticsEvent }) => {
  const isDataGlobe = route.path === '/dataGlobe';
  const experienceText = isDataGlobe ? 'featured maps' : 'explore data';
  return (
    <Link
      className={styles.switcherContainer}
      to={{ type: isDataGlobe ? 'location/FEATURED' : 'location/DATA' }}
      onClick={() => changeMapSceneAnalyticsEvent(experienceText)}
    >
      <div className={styles.switcher}>Go to {experienceText}</div>
    </Link>
  );
};

export default Switcher;