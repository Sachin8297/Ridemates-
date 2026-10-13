import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRideById, updateRide } from '../services/rideService';
import Alert from '../components/common/Alert';
import Spinner, { FullPageSpinner } from '../components/common/Spinner';

const EditRidePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const { data } = await getRideById(id);
        const r = data.ride;
        // Only the driver can edit
        if (r.driver?._id !== user._id) {
          navigate(`/rides/${id}`, { replace: true });
          return;
        }
        setRide(r);
        setForm({
          origin: r.origin || '',
          destination: r.destination || '',
          travelDate: r.travelDate ? r.travelDate.split('T')[0] : '',
          departureTime: r.departureTime || '',
          totalSeats: r.totalSeats || 1,
          vehicleType: r.vehicle?.type || '',
          vehicleDescription: r.vehicle?.description || '',
          estimatedTripCost: r.estimatedTripCost ?? '',
          costPerPassenger: r.costPerPassenger ?? '',
          notes: r.notes || '',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id, user, navigate]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateRide(id, {
        origin: form.origin,
        destination: form.destination,
        travelDate: form.travelDate,
        departureTime: form.departureTime,
        totalSeats: Number(form.totalSeats),
        vehicle: { type: form.vehicleType, description: form.vehicleDescription },
        estimatedTripCost: form.estimatedTripCost ? Number(form.estimatedTripCost) : undefined,
        costPerPassenger: form.costPerPassenger ? Number(form.costPerPassenger) : undefined,
        notes: form.notes,
      });
      navigate(`/rides/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <FullPageSpinner />;
  if (!ride) return <div className="page-container"><Alert type="error" message={error || 'Ride not found.'} /></div>;

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-title">Edit Ride</h1>
      <p className="section-subtitle">Update the details of your ride listing.</p>

      {error && <Alert type="error" message={error} className="mb-6" onDismiss={() => setError('')} />}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Route</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="origin" className="form-label">From</label>
              <input id="origin" name="origin" type="text" value={form.origin} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="destination" className="form-label">To</label>
              <input id="destination" name="destination" type="text" value={form.destination} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="travelDate" className="form-label">Date</label>
              <input id="travelDate" name="travelDate" type="date" value={form.travelDate} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="departureTime" className="form-label">Departure time</label>
              <input id="departureTime" name="departureTime" type="time" value={form.departureTime} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Vehicle & Seats</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="totalSeats" className="form-label">Seats</label>
              <input id="totalSeats" name="totalSeats" type="number" min={1} max={8} value={form.totalSeats} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="vehicleType" className="form-label">Type</label>
              <input id="vehicleType" name="vehicleType" type="text" value={form.vehicleType} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="vehicleDescription" className="form-label">Model / Color</label>
              <input id="vehicleDescription" name="vehicleDescription" type="text" value={form.vehicleDescription} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Cost</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="estimatedTripCost" className="form-label">Total trip (₹)</label>
              <input id="estimatedTripCost" name="estimatedTripCost" type="number" min={0} value={form.estimatedTripCost} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="costPerPassenger" className="form-label">Per passenger (₹)</label>
              <input id="costPerPassenger" name="costPerPassenger" type="number" min={0} value={form.costPerPassenger} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <label htmlFor="notes" className="form-label">Notes</label>
          <textarea id="notes" name="notes" rows={3} value={form.notes} onChange={handleChange} className="input-field resize-none" />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={saving} aria-busy={saving}>
            {saving && <Spinner size="sm" />}
            Save changes
          </button>
          <button type="button" onClick={() => navigate(`/rides/${id}`)} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditRidePage;
