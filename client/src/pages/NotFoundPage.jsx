import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <div className="text-8xl mb-6">🚗</div>
    <h1 className="text-4xl font-bold text-gray-900 mb-3">404</h1>
    <p className="text-xl text-gray-600 mb-2">Page not found</p>
    <p className="text-gray-400 mb-8 max-w-sm">
      Looks like this road doesn't go anywhere. Let's get you back on track.
    </p>
    <Link to="/" className="btn-primary">Back to home</Link>
  </div>
);

export default NotFoundPage;
