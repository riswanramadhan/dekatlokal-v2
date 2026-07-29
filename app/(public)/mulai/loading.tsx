import styles from "./page.module.css";

export default function MulaiLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Memuat informasi pemeliharaan Digital Checkup"
      className={styles.page}
    >
      <div className={`${styles.card} ${styles.loadingCard}`}>
        <div aria-hidden="true" className={styles.loadingVisualPanel}>
          <span className={styles.loadingLogo} />
          <span className={styles.loadingVisual} />
        </div>
        <div aria-hidden="true" className={styles.loadingContent}>
          <span className={styles.loadingKicker} />
          <span className={styles.loadingTitle} />
          <span className={styles.loadingCopy} />
          <span className={styles.loadingStatus} />
          <div className={styles.loadingActions}>
            <span className={styles.loadingAction} />
            <span className={styles.loadingSecondaryAction} />
          </div>
        </div>
      </div>
    </main>
  );
}
