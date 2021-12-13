import React from 'react'
import styles from './styles.module.css'

const SenderDetailsModal = ({ waver, isOpen, closeModalHandler = () => {} }) => {
  const openModalStyles = `${isOpen ? styles.open : ''}`
  const date = new Date(waver?.timestamp?.toNumber() * 1000)

  if (!isOpen) return null

  return (
    <div className={`${styles.mainContainer} ${isOpen ? styles.sendersModal : styles.sendersModalClose}`}>
      <div className={`${styles.modalContent}  ${openModalStyles} ${styles.sendersModal}`}>
        <span className={styles.messageIcon}>
          <i class="fas fa-envelope-open-text"></i>
        </span>

        <div className={styles.messageText}>
          <h2>"{waver?.message}"</h2>
        </div>

        <div className={styles.waverAddress}>
          <h2>{waver?.sender}</h2>
        </div>

        <p className={styles.modalContentDate}>{date.toString()}</p>
        <span className={`${styles.closeIcon}`} onClick={() => closeModalHandler()}>
          <i class="fas fa-times-circle"></i>
        </span>
      </div>
    </div>
  )
}

export { SenderDetailsModal }
