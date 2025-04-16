import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { UserIcon } from '@heroicons/react/24/outline';
import ExportData from '../components/export/ExportData';

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const formik = useFormik({
    initialValues: {
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      password: '',
      confirmPassword: '',
      settings: {
        darkMode: currentUser?.settings?.darkMode || false,
        notifications: currentUser?.settings?.notifications || true
      }
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('Le prénom est requis'),
      lastName: Yup.string().required('Le nom est requis'),
      email: Yup.string()
        .email('Adresse email invalide')
        .required('L\'email est requis'),
      password: Yup.string()
        .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Si le mot de passe est vide, l'exclure de la mise à jour
        const updatedData = { ...values };
        if (!updatedData.password) {
          delete updatedData.password;
          delete updatedData.confirmPassword;
        }
        
        const result = await updateProfile(updatedData);
        
        if (result.success) {
          toast.success('Profil mis à jour avec succès');
          formik.resetForm({
            values: {
              ...updatedData,
              password: '',
              confirmPassword: ''
            }
          });
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Une erreur est survenue lors de la mise à jour du profil');
      } finally {
        setLoading(false);
      }
    }
  });

  const handleSettingChange = (setting) => {
    formik.setFieldValue(`settings.${setting}`, !formik.values.settings[setting]);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profil et préférences</h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('profile')}
            >
              Profil
            </button>
            <button
              className={`${
                activeTab === 'export'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('export')}
            >
              Exportation des données
            </button>
          </nav>
        </div>

        <div className="px-4 py-5 sm:p-6">
          {activeTab === 'profile' ? (
            <form onSubmit={formik.handleSubmit}>
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserIcon className="h-16 w-16 text-primary-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="form-label">Prénom*</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className={`form-input ${formik.touched.firstName && formik.errors.firstName ? 'border-red-300' : ''}`}
                      {...formik.getFieldProps('firstName')}
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                      <p className="form-error">{formik.errors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="form-label">Nom*</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className={`form-input ${formik.touched.lastName && formik.errors.lastName ? 'border-red-300' : ''}`}
                      {...formik.getFieldProps('lastName')}
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                      <p className="form-error">{formik.errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="form-label">Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-input ${formik.touched.email && formik.errors.email ? 'border-red-300' : ''}`}
                    {...formik.getFieldProps('email')}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="form-error">{formik.errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="form-label">Nouveau mot de passe</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Laissez vide pour ne pas changer"
                      className={`form-input ${formik.touched.password && formik.errors.password ? 'border-red-300' : ''}`}
                      {...formik.getFieldProps('password')}
                    />
                    {formik.touched.password && formik.errors.password && (
                      <p className="form-error">{formik.errors.password}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirmer le nouveau mot de passe"
                      className={`form-input ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-300' : ''}`}
                      {...formik.getFieldProps('confirmPassword')}
                    />
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                      <p className="form-error">{formik.errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="form-label mb-2">Paramètres</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="darkMode"
                          name="settings.darkMode"
                          type="checkbox"
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={formik.values.settings.darkMode}
                          onChange={() => handleSettingChange('darkMode')}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="darkMode" className="font-medium text-gray-700">Mode sombre</label>
                        <p className="text-gray-500">Activer le thème sombre pour l'interface</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notifications"
                          name="settings.notifications"
                          type="checkbox"
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={formik.values.settings.notifications}
                          onChange={() => handleSettingChange('notifications')}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifications" className="font-medium text-gray-700">Notifications</label>
                        <p className="text-gray-500">Recevoir des notifications sur les échéances et actions</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Mise à jour...' : 'Sauvegarder les modifications'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <ExportData />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;