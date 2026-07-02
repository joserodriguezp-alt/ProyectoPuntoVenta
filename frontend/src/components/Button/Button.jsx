import styles from './Button.module.css';

export default function Button({ children, variant = 'primary', loading = false, disabled = false, type = 'button', onClick, fullWidth = false }) {
  return (
    <button
      type={type}
      className={[styles.btn, styles[variant], fullWidth ? styles.fullWidth : ''].join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <span className={styles.spinner} /> : null}
      {children}
    </button>
  );
}
