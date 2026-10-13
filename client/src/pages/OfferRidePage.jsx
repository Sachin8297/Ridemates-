import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createRide } from '../services/rideService';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';

const OfferRidePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    origin: '',
    destination: '',
    travelDate: '',
    departureTime: '',
    totalSeats: 3,
    vehicleType: '',
    vehicleDescription: '',
    estimatedTripCost: '',
    costPerPassenger: '',
    notes: '',
  });

  const [stops, setStops] = useState([]);
  const [stopInput, setStopInput] = useState({ location: '', estimatedTime: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addStop = () => {
    if (!stopInput.location.trim()) return;
    setStops((prev) => [...prev, { ...stopInput }]);
    setStopInput({ location: '', estimatedTime: '' });
  };

  const removeStop = (idx) =>
    setStops((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
    if (!form.origin.trim()) return 'Starting location is required.';
    if (!form.destination.trim()) return 'Destination is required.';
    if (!form.travelDate) return 'Travel date is required.';
    if (!form.departureTime) return 'Departure time is required.';
    if (form.totalSeats < 1 || form.totalSeats > 8) return 'Seats must be between 1 and 8.';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (new Date(form.travelDate) < today) return 'Travel date cannot be in the past.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const payload = {
        origin: form.origin,
        destination: form.destination,
        stops,
        travelDate: form.travelDate,
        departureTime: form.departureTime,
        totalSeats: Number(form.totalSeats),
        vehicle: { type: form.vehicleType, description: form.vehicleDescription },
        estimatedTripCost: form.estimatedTripCost ? Number(form.estimatedTripCost) : undefined,
        costPerPassenger: form.costPerPassenger ? Number(form.costPerPassenger) : undefined,
        notes: form.notes,
      };

      const { data } = await createRide(payload);
      navigate(`/rides/${data.ride._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-title">Offer a Ride</h1>
      <p className="section-subtitle">Share your journey and split the costs with fellow commuters.</p>

      {error && <Alert type="error" message={error} className="mb-6" onDismiss={() => setError('')} />}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Route */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Route details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="origin" className="form-label">Starting location <span aria-hidden="true">*</span></label>
              <input id="origin" name="origin" type="text" value={form.origin} onChange={handleChange}
                className="input-field" placeholder="e.g. Sector 18, Noida" required />
            </div>
            <div>
              <label htmlFor="destination" className="form-label">Destination <span aria-hidden="true">*</span></label>
              <input id="destination" name="destination" type="text" value={form.destination} onChange={handleChange}
                className="input-field" placeholder="e.g. Cyber City, Gurugram" required />
            </div>
          </div>

          {/* Stops */}
          <div>
            <p className="form-label">Pickup stops (optional)</p>
            {stops.map((stop, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <span className="flex-1 text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  {stop.location} {stop.estimatedTime && `· ${stop.estimatedTime}`}
                </span>
                <button type="button" onClick={() => removeStop(idx)}
                  className="text-red-400 hover:text-red-600 text-xs px-2" aria-label={`Remove stop ${stop.location}`}>
                  ✕
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={stopInput.location}
                onChange={(e) => setStopInput((p) => ({ ...p, location: e.target.value }))}
                placeholder="Stop location"
                className="input-field text-sm"
                aria-label="Stop location"
              />
              <input
                type="time"
                value={stopInput.estimatedTime}
                onChange={(e) => setStopInput((p) => ({ ...p, estimatedTime: e.target.value }))}
                className="input-field text-sm w-32"
                aria-label="Stop estimated time"
              />
              <button type="button" onClick={addStop} className="btn-secondary text-sm whitespace-nowrap">
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Schedule</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="travelDate" className="form-label">Travel date <span aria-hidden="true">*</span></label>
              <input id="travelDate" name="travelDate" type="date" value={form.travelDate} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="input-field" required />
            </div>
            <div>
              <label htmlFor="departureTime" className="form-label">Departure time <span aria-hidden="true">*</span></label>
              <input id="departureTime" name="departureTime" type="time" value={form.departureTime} onChange={handleChange}
                className="input-field" required />
            </div>
          </div>
        </div>

        {/* Vehicle & seats */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Vehicle & seats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="totalSeats" className="form-label">Available seats <span aria-hidden="true">*</span></label>
              <input id="totalSeats" name="totalSeats" type="number" min={1} max={8}
                value={form.totalSeats} onChange={handleChange} className="input-field" required />
            </div>
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
              <label htmlFor="vehicleDescription" className="form-label">Vehicle model/color</label>
              <input id="vehicleDescription" name="vehicleDescription" type="text"
                value={form.vehicleDescription} onChange={handleChange}
                placeholder="e.g. White Swift Dzire" className="input-field" />
            </div>
          </div>
        </div>

        {/* Cost */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Cost sharing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="estimatedTripCost" className="form-label">Total trip cost (₹)</label>
              <input id="estimatedTripCost" name="estimatedTripCost" type="number" min={0}
                value={form.estimatedTripCost} onChange={handleChange}
                placeholder="e.g. 600" className="input-field" />
            </div>
            <div>
              <label htmlFor="costPerPassenger" className="form-label">Per passenger (₹)</label>
              <input id="costPerPassenger" name="costPerPassenger" type="number" min={0}
                value={form.costPerPassenger} onChange={handleChange}
                placeholder="e.g. 150" className="input-field" />
            </div>
          </div>
          <p className="text-xs text-gray-400">These are suggestions. Final cost is agreed between you and passengers.</p>
        </div>

        {/* Notes */}
        <div className="card p-6">
          <label htmlFor="notes" className="form-label">Additional notes</label>
          <textarea id="notes" name="notes" value={form.notes} onChange={handleChange}
            rows={3} maxLength={500}
            placeholder="Any preferences, luggage restrictions, pickup instructions..."
            className="input-field resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{form.notes.length}/500</p>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={loading} aria-busy={loading}>
            {loading && <Spinner size="sm" />}
            Publish ride
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfferRidePage;
