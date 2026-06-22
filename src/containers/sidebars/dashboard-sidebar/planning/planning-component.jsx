import React, { useContext } from 'react';
import cx from 'classnames';
import { useLocale, useT } from '@transifex/react';
import { LightModeContext } from 'context/light-mode';
import styles from './planning-styles.module.scss';
import hrTheme from 'styles/themes/hr-theme.module.scss';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Slider } from '@mui/material';

const marks = [
  {
    value: 0,
    label: '0%',
  },
  {
    value: 0.25,
    label: '25%',
  },
  {
    value: 0.5,
    label: '50%',
  },
  {
    value: 0.75,
    label: '75%',
  },
  {
    value: 1,
    label: '100%',
  },
];

function PlanningComponent({
  options,
  updateValue,
  displaySlider,
  maximumArea,
  setMaximumArea,
}) {
  const t = useT();
  const locale = useLocale();
  const { lightMode } = useContext(LightModeContext);
  return (
    <section className={cx(lightMode ? styles.light : '', styles.container)}>
      <span className={styles.sectionTitle}>{t('Planning')}</span>
      <span className={styles.sectionSubtitle}>
        {t('Placeholder text for planning')}
      </span>
      <hr className={hrTheme.dark} />
      <div className={styles.options}>
        {options.map((option, index) => (
          <FormControlLabel
            key={index}
            label={t(option.label)}
            control={
              <Checkbox
                checked={option.checked}
                onChange={(e) =>
                  displaySlider(option, option.value, e.target.checked)
                }
                name={option.label}
              />
            }
          />
        ))}
      </div>
      <div className={styles.sliders}>
        {options
          .filter((opt) => opt.checked)
          .map((option, index) => (
            <div key={option.label}>
              <span className={styles.sliderLabel}>{t(option.label)}</span>
              <div className={styles.sliderContainer}>
                <Slider
                  title={option.label}
                  className={styles.slider}
                  min={0}
                  max={1}
                  marks={marks}
                  step={0.25}
                  value={option.value}
                  onChange={(e, value) => updateValue(option, value)}
                />
              </div>
            </div>
          ))}
      </div>
      <hr className={hrTheme.dark} />
      <div className={styles.sliders}>
        <span className={styles.sliderLabel}>{t('Maximum Area')}</span>
        <div className={styles.sliderContainer}>
          <Slider
            title={t('Maximum Area')}
            className={styles.slider}
            min={0}
            max={1}
            step={0.01}
            value={maximumArea}
            onChange={(e, value) => setMaximumArea(value)}
          />
        </div>
      </div>
    </section>
  );
}

export default PlanningComponent;
