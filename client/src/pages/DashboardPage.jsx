import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getMyRides, getSentRequests, getReceivedRequests, updateRequest, cancelRide,
} from '../services/rideService';
import { formatDate, formatTime, formatCurrency } from '../utils/formatters';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';

const TABS = ['overview', 'my-rides', 'sent', 'received'];
const TAB_LABELS = {
  overview: 'Overview',
  'my-rides': 'My Rides',
  sent: 'Sent Requests',
  received: 'Incoming Requests',
};

const StatusBadge = ({ status }) => {
  const cls = {
    active: 'badge-active', full: 'badge-full', cancelled: 'badge-cancelled',
    completed: 'badge-completed', pending: 'badge-pending', accepted: 'badge-accepted',
    rejected: 'badge-rejected',
  };
  return <span className={`badge ${cls[status] || 'badge'}`}>{status}</span>;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');

  const [myRides, setMyRides] = useState([]);
  const [sentReqs, setSentReqs] = useState([]);
  const [receivedReqs, setReceivedReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [ridesRes, sentRes, receivedRes] = await Promise.all([
          getMyRides(),
          getSentRequests(),
          getReceivedRequests(),
        ]);
        setMyRides(ridesRes.data.rides || []);
        setSentReqs(sentRes.data.requests || []);
        setReceivedReqs(receivedRes.data.requests || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const handleRespondRequest = async (requestId, status) => {
    try {
      await updateRequest(requestId, { status });
      setReceivedReqs((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status } : r))
      );
      setSuccess(`Request ${status}.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await updateRequest(requestId, { status: 'cancelled' });
      setSentReqs((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: 'cancelled' } : r))
      );
      setSuccess('Request cancelled.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelRide = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await cancelRide(cancelTarget);
      setMyRides((prev) =>
        prev.map((r) => (r._id === cancelTarget ? { ...r, status: 'cancelled' } : r))
      );
      setSuccess('Ride cancelled.');
      setCancelTarget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  // Overview stats
  const upcomingRides = myRides.filter((r) => r.status === 'active');
  const pendingSent = sentReqs.filter((r) => r.status === 'pending');
  const pendingReceived = receivedReqs.filter((r) => r.status === 'pending');
  const acceptedSent = sentReqs.filter((r) => r.status === 'accepted');

  if (loading) return (
    <div className="page-container flex justify-center py-20">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={user?.name} photo={user?.profilePhoto} size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hi, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-gray-500 text-sm">Here's your commute overview.</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link to="/rides" className="btn-secondary text-sm">Find a ride</Link>
          <Link to="/offer" className="btn-primary text-sm">Offer a ride</Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} className="mb-5" onDismiss={() => setError('')} />}
      {success && <Alert type="success" message={success} className="mb-5" onDismiss={() => setSuccess('')} />}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0 -mb-px overflow-x-auto" role="tablist" aria-label="Dashboard sections">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              role="tab"
              aria-selected={tab === t}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${tab === t ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {TAB_LABELS[t]}
              {t === 'received' && pendingReceived.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs bg-teal-500 text-white rounded-full">
                  {pendingReceived.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Active rides', value: upcomingRides.length, color: 'text-teal-600' },
              { label: 'Pending requests', value: pendingSent.length, color: 'text-yellow-600' },
              { label: 'Accepted rides', value: acceptedSent.length, color: 'text-green-600' },
              { label: 'Incoming requests', value: pendingReceived.length, color: 'text-blue-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-4 text-center">
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Upcoming rides */}
          {upcomingRides.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-3">Upcoming rides you're offering</h2>
              <div className="space-y-3">
                {upcomingRides.slice(0, 3).map((ride) => (
                  <div key={ride._id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium text-gray-800">{ride.origin} → {ride.destination}</p>
                      <p className="text-sm text-gray-500">{formatDate(ride.travelDate)} · {formatTime(ride.departureTime)} · {ride.availableSeats} seats left</p>
                    </div>
                    <Link to={`/rides/${ride._id}`} className="text-sm text-teal-600 hover:underline">View →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted requests */}
          {acceptedSent.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-3">Rides you've joined</h2>
              <div className="space-y-3">
                {acceptedSent.map((req) => (
                  <div key={req._id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium text-gray-800">
                        {req.ride?.origin} → {req.ride?.destination}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(req.ride?.travelDate)} · {formatTime(req.ride?.departureTime)}
                        {req.ride?.driver?.name && ` · with ${req.ride.driver.name}`}
                      </p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'my-rides' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Your ride listings</h2>
            <Link to="/offer" className="btn-primary text-sm">+ New ride</Link>
          </div>
          {myRides.length === 0 ? (
            <EmptyState icon="🚗" title="No rides yet" description="You haven't offered any rides."
              action={<Link to="/offer" className="btn-primary">Offer your first ride</Link>} />
          ) : (
            <div className="space-y-3">
              {myRides.map((ride) => (
                <div key={ride._id} className="card p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium text-gray-800">{ride.origin} → {ride.destination}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatDate(ride.travelDate)} · {formatTime(ride.departureTime)} · {ride.availableSeats}/{ride.totalSeats} seats
                        {ride.costPerPassenger !== undefined && ` · ${formatCurrency(ride.costPerPassenger, ride.currency)}/seat`}
                      </p>
                    </div>
                    <StatusBadge status={ride.status} />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link to={`/rides/${ride._id}`} className="text-sm text-teal-600 hover:underline">View</Link>
                    {ride.status === 'active' && (
                      <>
                        <span className="text-gray-300">|</span>
                        <Link to={`/rides/${ride._id}/edit`} className="text-sm text-gray-600 hover:underline">Edit</Link>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => setCancelTarget(ride._id)} className="text-sm text-red-500 hover:underline">
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'sent' && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Requests you've sent</h2>
          {sentReqs.length === 0 ? (
            <EmptyState icon="📤" title="No requests sent" description="You haven't requested any rides yet."
              action={<Link to="/rides" className="btn-primary">Find a ride</Link>} />
          ) : (
            <div className="space-y-3">
              {sentReqs.map((req) => (
                <div key={req._id} className="card p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium text-gray-800">
                        {req.ride?.origin} → {req.ride?.destination}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatDate(req.ride?.travelDate)} · {formatTime(req.ride?.departureTime)}
                        {req.ride?.driver?.name && ` · Driver: ${req.ride.driver.name}`}
                      </p>
                      <p className="text-sm text-gray-500">{req.seatsRequested} seat{req.seatsRequested > 1 ? 's' : ''} requested</p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {req.ride?._id && (
                      <Link to={`/rides/${req.ride._id}`} className="text-sm text-teal-600 hover:underline">View ride</Link>
                    )}
                    {req.status === 'pending' && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => handleCancelRequest(req._id)} className="text-sm text-red-500 hover:underline">
                          Cancel request
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'received' && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Requests from passengers</h2>
          {receivedReqs.length === 0 ? (
            <EmptyState icon="📥" title="No requests yet" description="When someone requests your ride, it'll appear here." />
          ) : (
            <div className="space-y-3">
              {receivedReqs.map((req) => (
                <div key={req._id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={req.passenger?.name} photo={req.passenger?.profilePhoto} size="md" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-medium text-gray-800">{req.passenger?.name}</p>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Ride: {req.ride?.origin} → {req.ride?.destination}
                        {req.ride && ` · ${formatDate(req.ride.travelDate)}`}
                      </p>
                      <p className="text-sm text-gray-500">{req.seatsRequested} seat{req.seatsRequested > 1 ? 's' : ''}</p>
                      {req.pickupLocation && <p className="text-sm text-gray-500">Pickup: {req.pickupLocation}</p>}
                      {req.message && <p className="text-sm text-gray-600 mt-1 italic">"{req.message}"</p>}
                    </div>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2 mt-3 ml-13">
                      <button
                        onClick={() => handleRespondRequest(req._id, 'accepted')}
                        className="btn-primary text-sm py-1.5"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondRequest(req._id, 'rejected')}
                        className="btn-danger text-sm py-1.5"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm cancel ride */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelRide}
        title="Cancel this ride?"
        message="All pending passenger requests will be cancelled. This action cannot be undone."
        confirmLabel="Yes, cancel ride"
        loading={cancelLoading}
      />
    </div>
  );
};

export default DashboardPage;
