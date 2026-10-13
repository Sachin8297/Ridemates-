import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRideById, createRequest, cancelRide } from '../services/rideService';
import { formatDate, formatTime, formatCurrency } from '../utils/formatters';
import Avatar from '../components/common/Avatar';
import Spinner, { FullPageSpinner } from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const RideDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [requestModal, setRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ seatsRequested: 1, pickupLocation: '', message: '' });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');

  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const fetchRide = async () => {
      setLoading(true);
      try {
        const { data } = await getRideById(id);
        setRide(data.ride);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id]);

  const isDriver = user && ride?.driver?._id === user._id;
  const canRequest =
    user &&
    !isDriver &&
    ride?.status === 'active' &&
    ride?.availableSeats > 0;

  const handleRequest = async (e) => {
    e.preventDefault();
    setRequestError('');
    setRequestLoading(true);
    try {
      await createRequest(ride._id, requestForm);
      setRequestModal(false);
      setSuccess('Ride request sent! The driver will respond soon.');
      setRide((prev) => ({ ...prev })); // trigger re-render
    } catch (err) {
      setRequestError(err.message);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleCancelRide = async () => {
    setCancelLoading(true);
    try {
      await cancelRide(ride._id);
      setRide((prev) => ({ ...prev, status: 'cancelled' }));
      setCancelConfirm(false);
      setSuccess('Ride cancelled.');
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <FullPageSpinner />;
  if (error && !ride) return (
    <div className="page-container text-center py-20">
      <Alert type="error" message={error} />
      <button onClick={() => navigate(-1)} className="btn-ghost mt-4">Go back</button>
    </div>
  );
  if (!ride) return null;

  const driver = ride.driver || {};

  return (
    <div className="page-container max-w-3xl">
      {success && <Alert type="success" message={success} className="mb-6" onDismiss={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} className="mb-6" onDismiss={() => setError('')} />}

      {/* Status bar */}
      {ride.status !== 'active' && (
        <Alert
          type={ride.status === 'cancelled' ? 'error' : ride.status === 'full' ? 'warning' : 'info'}
          message={
            ride.status === 'cancelled' ? 'This ride has been cancelled.' :
            ride.status === 'full' ? 'This ride is fully booked.' :
            'This ride has been completed.'
          }
          className="mb-6"
        />
      )}

      <div className="grid gap-6">
        {/* Driver & Header */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Avatar name={driver.name} photo={driver.profilePhoto} size="lg" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{driver.name}</h1>
                <p className="text-sm text-gray-500">{driver.role === 'driver' ? 'Driver' : 'Driver & Passenger'}</p>
                {driver.phone && (
                  <a href={`tel:${driver.phone}`} className="text-sm text-teal-600 hover:underline">{driver.phone}</a>
                )}
              </div>
            </div>
            <span className={`badge ${ride.status === 'active' ? 'badge-active' : ride.status === 'full' ? 'badge-full' : 'badge-cancelled'}`}>
              {ride.status}
            </span>
          </div>
        </div>

        {/* Route */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Route</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-3 h-3 rounded-full bg-teal-500 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-400">From</p>
                <p className="font-medium text-gray-800">{ride.origin}</p>
                <p className="text-sm text-gray-500">{formatTime(ride.departureTime)}</p>
              </div>
            </div>

            {ride.stops?.map((stop, idx) => (
              <div key={idx} className="flex items-start gap-3 pl-1">
                <div className="mt-1 w-2 h-2 rounded-full bg-gray-300 flex-shrink-0 ml-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs text-gray-400">Stop {idx + 1}</p>
                  <p className="text-sm text-gray-700">{stop.location}</p>
                  {stop.estimatedTime && <p className="text-xs text-gray-400">{formatTime(stop.estimatedTime)}</p>}
                </div>
              </div>
            ))}

            <div className="flex items-start gap-3">
              <div className="mt-1 w-3 h-3 rounded-full bg-gray-700 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-400">To</p>
                <p className="font-medium text-gray-800">{ride.destination}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Ride details</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Travel date', value: formatDate(ride.travelDate) },
              { label: 'Departure', value: formatTime(ride.departureTime) },
              { label: 'Available seats', value: `${ride.availableSeats} of ${ride.totalSeats}` },
              { label: 'Vehicle', value: ride.vehicle?.type || '—' },
              { label: 'Vehicle details', value: ride.vehicle?.description || '—' },
              { label: 'Cost per seat', value: ride.costPerPassenger !== undefined ? formatCurrency(ride.costPerPassenger, ride.currency) : 'Free' },
              { label: 'Total trip cost', value: ride.estimatedTripCost ? formatCurrency(ride.estimatedTripCost, ride.currency) : '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
                <dd className="text-sm font-medium text-gray-800">{value}</dd>
              </div>
            ))}
          </dl>

          {ride.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Notes from driver</p>
              <p className="text-sm text-gray-700 leading-relaxed">{ride.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {canRequest && (
            <button onClick={() => setRequestModal(true)} className="btn-primary flex-1">
              Request a seat
            </button>
          )}

          {isDriver && ride.status === 'active' && (
            <>
              <Link to={`/rides/${ride._id}/edit`} className="btn-secondary">
                Edit ride
              </Link>
              <button onClick={() => setCancelConfirm(true)} className="btn-danger">
                Cancel ride
              </button>
            </>
          )}

          <button onClick={() => navigate(-1)} className="btn-ghost">
            ← Back
          </button>
        </div>
      </div>

      {/* Request Modal */}
      <Modal isOpen={requestModal} onClose={() => setRequestModal(false)} title="Request a seat">
        {requestError && <Alert type="error" message={requestError} className="mb-4" />}
        <form onSubmit={handleRequest} className="space-y-4">
          <div>
            <label htmlFor="seatsRequested" className="form-label">Seats needed</label>
            <input
              id="seatsRequested" type="number" min={1} max={Math.min(4, ride.availableSeats)}
              value={requestForm.seatsRequested}
              onChange={(e) => setRequestForm((p) => ({ ...p, seatsRequested: Number(e.target.value) }))}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="pickupLocation" className="form-label">Your pickup location</label>
            <input
              id="pickupLocation" type="text"
              value={requestForm.pickupLocation}
              onChange={(e) => setRequestForm((p) => ({ ...p, pickupLocation: e.target.value }))}
              placeholder="Where should the driver pick you up?"
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="reqMessage" className="form-label">Message (optional)</label>
            <textarea
              id="reqMessage" rows={2}
              value={requestForm.message}
              onChange={(e) => setRequestForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Anything the driver should know..."
              className="input-field resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setRequestModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={requestLoading} aria-busy={requestLoading}>
              {requestLoading && <Spinner size="sm" />}
              Send request
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel confirmation */}
      <ConfirmDialog
        isOpen={cancelConfirm}
        onClose={() => setCancelConfirm(false)}
        onConfirm={handleCancelRide}
        title="Cancel this ride?"
        message="All pending passenger requests will also be cancelled. This action cannot be undone."
        confirmLabel="Yes, cancel ride"
        loading={cancelLoading}
      />
    </div>
  );
};

export default RideDetailPage;
