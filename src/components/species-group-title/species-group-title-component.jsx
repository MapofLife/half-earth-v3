import React from 'react'
import cx from 'classnames';
import styles from './species-group-title-component.module.scss';

function SpeciesGroupTitleComponent(props) {
  const { species, filter } = props;
  const { family_common, family } = species;
  return (
    <div className={cx(styles.name, styles.familyTitle, styles.item)}>
      <div className={styles.common}>
        {species === '__blank' ? '' : family_common[0]}
      </div>
      <div className={styles.sci}>{family}</div>
      {filter !== '' &&
        (
          <div className={styles.filterCount}>
            {familyObj.visibleCount}/{familyObj.total}
            {familyObj.visibleCount === 1 ? 'match' : 'matches'}
          </div>
        )
      }
    </div>
  )
}

export default SpeciesGroupTitleComponent
