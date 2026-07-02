import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import client from '@/api/client';
import InputField from '@/components/InputField/InputField';
import Button from '@/components/Button/Button';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Campo requerido';
    if (!form.password) errs.password = 'Campo requerido';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      const { data } = await client.post('/auth/login', form);
      const { token, user } = data.data;
      login(token, user);
      navigate(user.role === 'administrador' ? '/productos' : '/cajero/venta', { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>TPV Papelería</h1>
        <p className={styles.subtitle}>Inicia sesión para continuar</p>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <InputField
            label="Usuario"
            name="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            error={errors.username}
            required
            placeholder="admin"
          />
          <InputField
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            required
            placeholder="••••••••"
          />
          {apiError && <p className={styles.apiError}>{apiError}</p>}
          <Button type="submit" loading={loading} fullWidth>
            Iniciar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
