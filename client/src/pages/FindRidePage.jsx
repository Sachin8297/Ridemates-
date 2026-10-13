import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/rides/SearchBar';
import RideCard from '../components/rides/RideCard';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import Alert from '../components/common/Alert';
import { getRides } from '../services/rideService';

const FindRidePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const [sortBy, setSortBy] = useState('date');
  const [maxCost, setMaxCost] = useState('');

  const getParamsAsObject = useCallback(() => ({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') || '',
    time: searchParams.get('time') || '',
    seats: searchParams.get('seats') || '',
  }), [searchParams]);

  const fetchRides = useCallback(async (params) => {
    setLoading(true);
    setError('');
    try {
      const query = { ...params };
      if (maxCost) query.maxCost = maxCost;
      const { data } = await getRides(query);
      let results = data.rides || [];

      // Client-side sort
      if (sortBy === 'cost') {
        results = [...results].sort((a, b) => (a.costPerPassenger || 0) - (b.costPerPassenger || 0));
      } else if (sortBy === 'seats') {
        results = [...results].sort((a, b) => b.availableSeats - a.availableSeats);
      } else if (sortBy === 'match' && results[0]?.matchScore !== undefined) {
        results = [...results].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      }

      setRides(results);
      setTotal(data.total || results.length);
      setHasSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [maxCost, sortBy]);

  // Run search when URL params change
  useEffect(() => {
    const params = getParamsAsObject();
    const hasParams = Object.values(params).some(Boolean);
    if (hasParams) {
      fetchRides(params);
    } else {
      // Load all upcoming rides by default
      fetchRides({});
    }
  }, [searchParams, fetchRides, getParamsAsObject]);

  const handleSearch = (values) => {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params);
  };

  return (
    <div className="page-container">
      {/* Search */}
      <div className="mb-8">
        <h1 className="section-title">Find a Ride</h1>
        <p className="section-subtitle">Search rides by location, date, and time.</p>
        <SearchBar onSearch={handleSearch} initialValues={getParamsAsObject()} compact />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="sortBy" className="text-sm text-gray-600 font-medium">Sort by:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="date">Date</option>
            <option value="cost">Lowest cost</option>
            <option value="seats">Most seats</option>
            {rides[0]?.matchScore !== undefined && <option value="match">Best match</option>}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="maxCost" className="text-sm text-gray-600 font-medium">Max cost (₹):</label>
          <input
            id="maxCost"
            type="number"
            value={maxCost}
            onChange={(e) => setMaxCost(e.target.value)}
            onBlur={() => fetchRides(getParamsAsObject())}
            placeholder="Any"
            min={0}
            className="w-24 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {hasSearched && (
          <p className="text-sm text-gray-500 ml-auto">
            {total} ride{total !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {error && <Alert type="error" message={error} className="mb-6" onDismiss={() => setError('')} />}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : rides.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rides.map((ride) => (
            <RideCard key={ride._id} ride={ride} />
          ))}
        </div>
      ) : hasSearched ? (
        <EmptyState
          icon="🚗"
          title="No rides found"
          description="Try adjusting your search — change the date, broaden the location, or check back later."
        />
      ) : (
        <EmptyState
          icon="🔍"
          title="Search for a ride"
          description="Enter your pickup location, destination, and travel date above to find available rides."
        />
      )}
    </div>
  );
};

export default FindRidePage;
