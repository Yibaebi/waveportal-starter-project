import React from 'react'
import styles from './Spinner.module.css'

const Spinner = ({ style = {} }) => {
  return (
    <div className={styles.ldsRing} style={{ ...style }}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export { Spinner }
