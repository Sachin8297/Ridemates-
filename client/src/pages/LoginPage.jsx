import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please enter your email and password.'); return; }

    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data.token, data.user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-9 w-9 bg-gradient-to-br from-teal-500 to-navy-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Ride<span className="text-teal-500">Mates</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account to continue.</p>
        </div>

        <div className="card p-8">
          {error && <Alert type="error" message={error} className="mb-5" onDismiss={() => setError('')} />}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="form-label">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
                  className="input-field" placeholder="jane@example.com" required autoComplete="email" />
              </div>
              <div>
                <label htmlFor="password" className="form-label">Password</label>
                <input id="password" name="password" type="password" value={form.password} onChange={handleChange}
                  className="input-field" placeholder="Your password" required autoComplete="current-password" />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-6" disabled={loading} aria-busy={loading}>
              {loading && <Spinner size="sm" />}
              Sign in
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-600 hover:underline font-medium">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
