import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile } from '../services/userService';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/common/Avatar';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    role: user?.role || 'passenger',
    bio: user?.bio || '',
    vehicleType: user?.vehicle?.type || '',
    vehicleModel: user?.vehicle?.model || '',
    vehicleColor: user?.vehicle?.color || '',
    vehicleLicensePlate: user?.vehicle?.licensePlate || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        role: form.role,
        bio: form.bio,
        vehicle: {
          type: form.vehicleType,
          model: form.vehicleModel,
          color: form.vehicleColor,
          licensePlate: form.vehicleLicensePlate,
        },
      };
      const { data } = await updateMyProfile(payload);
      updateUser(data.user);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-title">Your Profile</h1>
      <p className="section-subtitle">Manage your personal information and vehicle details.</p>

      {error && <Alert type="error" message={error} className="mb-5" onDismiss={() => setError('')} />}
      {success && <Alert type="success" message={success} className="mb-5" onDismiss={() => setSuccess('')} />}

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar name={user?.name} photo={user?.profilePhoto} size="xl" />
        <div>
          <p className="font-semibold text-gray-800">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">Profile photo upload coming soon</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Personal info */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Personal information</h2>

          <div>
            <label htmlFor="name" className="form-label">Full name</label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} className="input-field" required />
          </div>

          <div>
            <label htmlFor="phone" className="form-label">Phone number</label>
            <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
              className="input-field" placeholder="+91 98765 43210" />
          </div>

          <div>
            <label htmlFor="email-display" className="form-label">Email</label>
            <input id="email-display" type="email" value={user?.email || ''} disabled
              className="input-field" aria-label="Email (read only)" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label htmlFor="role" className="form-label">Primary role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange} className="input-field">
              <option value="passenger">Passenger — looking for rides</option>
              <option value="driver">Driver — offering rides</option>
              <option value="both">Both — find and offer rides</option>
            </select>
          </div>

          <div>
            <label htmlFor="bio" className="form-label">Bio</label>
            <textarea id="bio" name="bio" rows={3} value={form.bio} onChange={handleChange}
              maxLength={300} placeholder="Tell other commuters a bit about yourself..."
              className="input-field resize-none" />
            <p className="text-xs text-gray-400 mt-1">{form.bio.length}/300</p>
          </div>
        </div>

        {/* Vehicle info */}
        {(form.role === 'driver' || form.role === 'both') && (
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-800">Vehicle information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vehicleType" className="form-label">Vehicle type</label>
                <select id="vehicleType" name="vehicleType" value={form.vehicleType} onChange={handleChange} className="input-field">
                  <option value="">Select type</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="MPV">MPV</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="vehicleModel" className="form-label">Model</label>
                <input id="vehicleModel" name="vehicleModel" type="text" value={form.vehicleModel}
                  onChange={handleChange} placeholder="e.g. Maruti Swift" className="input-field" />
              </div>
              <div>
                <label htmlFor="vehicleColor" className="form-label">Color</label>
                <input id="vehicleColor" name="vehicleColor" type="text" value={form.vehicleColor}
                  onChange={handleChange} placeholder="e.g. White" className="input-field" />
              </div>
              <div>
                <label htmlFor="vehicleLicensePlate" className="form-label">License plate</label>
                <input id="vehicleLicensePlate" name="vehicleLicensePlate" type="text"
                  value={form.vehicleLicensePlate} onChange={handleChange}
                  placeholder="e.g. DL 01 AB 1234" className="input-field" />
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading} aria-busy={loading}>
          {loading && <Spinner size="sm" />}
          Save changes
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
