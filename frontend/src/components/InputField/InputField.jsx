import styles from './InputField.module.css';

export default function InputField({ label, name, type = 'text', value, onChange, error, required = false, placeholder, min, step, disabled = false }) {
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={name}>
          {label}{required && <span className={styles.req}> *</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        step={step}
        disabled={disabled}
        className={[styles.input, error ? styles.inputError : ''].join(' ')}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
