import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';

const statusBadge = (status) => {
  const map = {
    active: 'badge-active',
    full: 'badge-full',
    cancelled: 'badge-cancelled',
    completed: 'badge-completed',
  };
  return <span className={map[status] || 'badge'}>{status}</span>;
};

const matchBadge = (label) => {
  if (!label) return null;
  const colors = {
    'Great match': 'bg-teal-100 text-teal-700',
    'Good match': 'bg-blue-100 text-blue-700',
    'Partial match': 'bg-yellow-100 text-yellow-700',
    'Low match': 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`badge ${colors[label] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
};

const RideCard = ({ ride }) => {
  const driver = ride.driver || {};

  return (
    <article className="card hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={driver.name} photo={driver.profilePhoto} size="md" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{driver.name || 'Driver'}</p>
              <p className="text-xs text-gray-500">
                {driver.vehicle?.type || 'Vehicle'} {driver.vehicle?.model ? `· ${driver.vehicle.model}` : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {statusBadge(ride.status)}
            {ride.matchLabel && matchBadge(ride.matchLabel)}
          </div>
        </div>

        {/* Route */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex flex-col items-center mt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500" aria-hidden="true" />
            <div className="w-px h-8 bg-gray-200" aria-hidden="true" />
            <div className="w-2.5 h-2.5 rounded-full bg-navy-600 bg-gray-700" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">{ride.origin}</p>
            <p className="text-xs text-gray-400 my-1.5">
              {ride.stops?.length > 0 && `${ride.stops.length} stop${ride.stops.length > 1 ? 's' : ''}`}
            </p>
            <p className="text-sm font-medium text-gray-800">{ride.destination}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-3 py-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Date</p>
            <p className="text-sm font-medium text-gray-700">{formatDate(ride.travelDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Departs</p>
            <p className="text-sm font-medium text-gray-700">{formatTime(ride.departureTime)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Seats</p>
            <p className="text-sm font-medium text-gray-700">
              {ride.availableSeats}/{ride.totalSeats}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3">
          <div>
            <p className="text-xs text-gray-400">Per passenger</p>
            <p className="text-base font-bold text-teal-600">
              {ride.costPerPassenger !== undefined
                ? formatCurrency(ride.costPerPassenger, ride.currency)
                : 'Free'}
            </p>
          </div>
          <Link
            to={`/rides/${ride._id}`}
            className="btn-primary text-sm py-2 px-4"
            aria-label={`View ride from ${ride.origin} to ${ride.destination}`}
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
};

export default RideCard;
