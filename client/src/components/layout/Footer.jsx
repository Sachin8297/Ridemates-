import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 mt-auto">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 bg-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-bold">RideMates</span>
          </div>
          <p className="text-sm leading-relaxed">
            Connecting daily commuters to share rides, split costs, and travel smarter.
          </p>
        </div>

        <div>
          <h3 className="text-white text-sm font-semibold mb-3">Navigate</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-teal-400 transition-colors">Home</Link></li>
            <li><Link to="/rides" className="hover:text-teal-400 transition-colors">Find a Ride</Link></li>
            <li><Link to="/offer" className="hover:text-teal-400 transition-colors">Offer a Ride</Link></li>
            <li><Link to="/dashboard" className="hover:text-teal-400 transition-colors">Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white text-sm font-semibold mb-3">Account</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/register" className="hover:text-teal-400 transition-colors">Sign up</Link></li>
            <li><Link to="/login" className="hover:text-teal-400 transition-colors">Sign in</Link></li>
            <li><Link to="/profile" className="hover:text-teal-400 transition-colors">Profile</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6 text-center text-xs">
        <p>© {new Date().getFullYear()} RideMates. Built with the MERN stack.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
