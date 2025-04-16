import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <ExclamationTriangleIcon className="mx-auto h-24 w-24 text-yellow-400" />
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            404
          </h1>
          <h2 className="mt-2 text-center text-xl font-bold text-gray-600">
            Page non trouvée
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        <div>
          <Link to="/" className="btn btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;