import React from 'react';
import ReactTooltip from 'react-tooltip';
import Treemap from 'components/treemap';
import styles from './human-pressure-widget-styles.module.scss';

const HumanPressureWidgetComponent = ({ handleOnClick, data, pressureStatement }) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Human pressures in this area</h3>
      <p className={styles.text}>{pressureStatement}</p>
      {data && <Treemap data={data} handleOnClick={handleOnClick} className={styles.treemap}/>}
      <p  className={styles.hint}>CLICK TO SHOW ON MAP</p>
      <ReactTooltip id='treemap' getContent={(dataTip) => `${dataTip}`}/>
    </div>
  )
}
export default HumanPressureWidgetComponent;