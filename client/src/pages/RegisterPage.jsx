import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/authService';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'passenger',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.email) return 'Email is required.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const { data } = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
      });
      loginUser(data.token, data.user);
      navigate('/dashboard');
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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Start sharing rides in minutes.</p>
        </div>

        <div className="card p-8">
          {error && <Alert type="error" message={error} className="mb-5" onDismiss={() => setError('')} />}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label">Full name <span aria-hidden="true">*</span></label>
                <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
                  className="input-field" placeholder="Jane Doe" required autoComplete="name" />
              </div>

              <div>
                <label htmlFor="email" className="form-label">Email <span aria-hidden="true">*</span></label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
                  className="input-field" placeholder="jane@example.com" required autoComplete="email" />
              </div>

              <div>
                <label htmlFor="phone" className="form-label">Phone number</label>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                  className="input-field" placeholder="+91 98765 43210" autoComplete="tel" />
              </div>

              <div>
                <label htmlFor="role" className="form-label">I want to</label>
                <select id="role" name="role" value={form.role} onChange={handleChange} className="input-field">
                  <option value="passenger">Find rides (Passenger)</option>
                  <option value="driver">Offer rides (Driver)</option>
                  <option value="both">Both — find and offer rides</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="form-label">Password <span aria-hidden="true">*</span></label>
                <input id="password" name="password" type="password" value={form.password} onChange={handleChange}
                  className="input-field" placeholder="Min. 8 characters" required autoComplete="new-password" />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">Confirm password <span aria-hidden="true">*</span></label>
                <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                  className="input-field" placeholder="Repeat password" required autoComplete="new-password" />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-6" disabled={loading} aria-busy={loading}>
              {loading && <Spinner size="sm" />}
              Create account
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
