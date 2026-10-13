import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/rides/SearchBar';

const steps = [
  {
    icon: '🔍',
    title: 'Search a Ride',
    desc: 'Enter your pickup location, destination, date, and preferred departure time.',
  },
  {
    icon: '🤝',
    title: 'Connect',
    desc: 'Browse available rides from verified commuters travelling your route.',
  },
  {
    icon: '🚗',
    title: 'Ride Together',
    desc: 'Share the journey, split the cost, and arrive refreshed.',
  },
];

const benefits = [
  {
    icon: '💰',
    title: 'Save Money',
    desc: 'Split fuel and toll costs with fellow commuters every day.',
  },
  {
    icon: '🌿',
    title: 'Go Green',
    desc: 'Fewer cars on the road means lower emissions for everyone.',
  },
  {
    icon: '⏱️',
    title: 'Save Time',
    desc: 'Use carpool lanes and spend less time searching for parking.',
  },
  {
    icon: '👥',
    title: 'Great Company',
    desc: 'Turn your commute into a social experience with like-minded people.',
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  const handleSearch = (values) => {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => { if (v) params.set(k, v); });
    navigate(`/rides?${params.toString()}`);
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f1f35] via-[#1e3a5f] to-[#0d9488] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-teal-400 rounded-full blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400 rounded-full blur-3xl" aria-hidden="true" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-2xl mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Your Daily Commute,{' '}
              <span className="text-teal-400">Shared.</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 leading-relaxed mb-8">
              RideMates connects people travelling the same route so you can share rides,
              split costs, and make every commute worth it.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/rides')} className="btn-primary text-base px-6 py-3">
                Find a Ride
              </button>
              <button
                onClick={() => navigate('/offer')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white text-white hover:bg-white hover:text-teal-700 font-medium rounded-lg transition-colors duration-150 text-base"
              >
                Offer a Ride
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-4xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How RideMates works</h2>
            <p className="text-gray-500 max-w-md mx-auto">Get started in minutes and find your perfect commute partner.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative text-center px-4">
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-[60%] w-full h-px border-t-2 border-dashed border-gray-200" aria-hidden="true" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 text-3xl mb-4">
                  {step.icon}
                </div>
                <div className="inline-flex absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-white text-xs font-bold rounded-full w-6 h-6 items-center justify-center" aria-hidden="true">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why share your ride?</h2>
            <p className="text-gray-500 max-w-md mx-auto">Carpooling is better for your wallet, your schedule, and the planet.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, idx) => (
              <div key={idx} className="card p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-teal-500 to-teal-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to start sharing?</h2>
          <p className="text-teal-100 mb-8">Join thousands of commuters saving time and money every day.</p>
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition-colors text-base"
          >
            Create your free account
          </button>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
