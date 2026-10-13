import { useState } from 'react';

const SearchBar = ({ onSearch, initialValues = {}, compact = false }) => {
  const [form, setForm] = useState({
    origin: initialValues.origin || '',
    destination: initialValues.destination || '',
    date: initialValues.date || '',
    time: initialValues.time || '',
    seats: initialValues.seats || '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${compact ? '' : 'bg-white rounded-2xl shadow-lg p-6'}`}
      aria-label="Search for rides"
    >
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label htmlFor="origin" className="form-label">Pickup</label>
          <input
            id="origin"
            name="origin"
            type="text"
            value={form.origin}
            onChange={handleChange}
            placeholder="From where?"
            className="input-field"
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="destination" className="form-label">Destination</label>
          <input
            id="destination"
            name="destination"
            type="text"
            value={form.destination}
            onChange={handleChange}
            placeholder="Going to?"
            className="input-field"
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="date" className="form-label">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="time" className="form-label">Around (time)</label>
          <input
            id="time"
            name="time"
            type="time"
            value={form.time}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="flex flex-col justify-end">
          <label className="form-label opacity-0 select-none" aria-hidden="true">Search</label>
          <button type="submit" className="btn-primary w-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
