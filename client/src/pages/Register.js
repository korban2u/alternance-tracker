import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .required('Le prénom est requis'),
      lastName: Yup.string()
        .required('Le nom est requis'),
      email: Yup.string()
        .email('Adresse email invalide')
        .required('L\'email est requis'),
      password: Yup.string()
        .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
        .required('Le mot de passe est requis'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
        .required('La confirmation du mot de passe est requise'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const { confirmPassword, ...userData } = values;
        const result = await register(userData);
        
        if (result.success) {
          toast.success('Inscription réussie !');
          navigate('/');
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Une erreur est survenue lors de l\'inscription');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            AltTracker
          </h1>
          <h2 className="text-center text-sm font-medium text-gray-600">
            Créer un nouveau compte
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="firstName" className="sr-only">
                Prénom
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formik.touched.firstName && formik.errors.firstName
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500'
                } rounded-t-md focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="Prénom"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="sr-only">
                Nom
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formik.touched.lastName && formik.errors.lastName
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500'
                } focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="Nom"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.lastName}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500'
                } focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="Adresse email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500'
                } focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="Mot de passe"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500'
                } rounded-b-md focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="Confirmer le mot de passe"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
          </div>

          <div className="text-center text-sm">
            <p>
              Vous avez déjà un compte ?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;