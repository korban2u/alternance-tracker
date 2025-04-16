import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CompanyForm = ({ initialData, onSubmit, onCancel }) => {
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      sector: initialData?.sector || '',
      contacts: initialData?.contacts || [{ name: '', email: '', phone: '', role: '' }],
      address: initialData?.address || { street: '', city: '', postalCode: '', country: 'France' },
      website: initialData?.website || '',
      notes: initialData?.notes || '',
      tags: initialData?.tags ? initialData.tags.join(', ') : ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Le nom est requis'),
      sector: Yup.string().required('Le secteur est requis'),
      contacts: Yup.array().of(
        Yup.object().shape({
          name: Yup.string().required('Le nom est requis'),
          email: Yup.string().email('Email invalide'),
          phone: Yup.string(),
          role: Yup.string()
        })
      ),
      address: Yup.object().shape({
        street: Yup.string(),
        city: Yup.string(),
        postalCode: Yup.string(),
        country: Yup.string()
      }),
      website: Yup.string().url('URL invalide').nullable(),
      notes: Yup.string(),
      tags: Yup.string()
    }),
    onSubmit: (values) => {
      // Convertir les tags de chaîne à tableau
      const formattedValues = {
        ...values,
        tags: values.tags 
          ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') 
          : []
      };
      
      onSubmit(formattedValues);
    }
  });

  const addContact = () => {
    formik.setFieldValue('contacts', [
      ...formik.values.contacts,
      { name: '', email: '', phone: '', role: '' }
    ]);
  };

  const removeContact = (index) => {
    const updatedContacts = [...formik.values.contacts];
    updatedContacts.splice(index, 1);
    formik.setFieldValue('contacts', updatedContacts);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="space-y-6">
        {/* Informations de base */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Informations générales</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="form-label">Nom de l'entreprise*</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-input ${formik.touched.name && formik.errors.name ? 'border-red-300' : ''}`}
                {...formik.getFieldProps('name')}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="form-error">{formik.errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="sector" className="form-label">Secteur d'activité*</label>
              <input
                type="text"
                id="sector"
                name="sector"
                className={`form-input ${formik.touched.sector && formik.errors.sector ? 'border-red-300' : ''}`}
                {...formik.getFieldProps('sector')}
              />
              {formik.touched.sector && formik.errors.sector && (
                <p className="form-error">{formik.errors.sector}</p>
              )}
            </div>
          </div>
        </div>

        {/* Site web */}
        <div>
          <label htmlFor="website" className="form-label">Site web</label>
          <input
            type="url"
            id="website"
            name="website"
            className={`form-input ${formik.touched.website && formik.errors.website ? 'border-red-300' : ''}`}
            {...formik.getFieldProps('website')}
          />
          {formik.touched.website && formik.errors.website && (
            <p className="form-error">{formik.errors.website}</p>
          )}
        </div>

        {/* Adresse */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Adresse</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="address.street" className="form-label">Rue</label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                className="form-input"
                {...formik.getFieldProps('address.street')}
              />
            </div>
            <div>
              <label htmlFor="address.city" className="form-label">Ville</label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                className="form-input"
                {...formik.getFieldProps('address.city')}
              />
            </div>
            <div>
              <label htmlFor="address.postalCode" className="form-label">Code postal</label>
              <input
                type="text"
                id="address.postalCode"
                name="address.postalCode"
                className="form-input"
                {...formik.getFieldProps('address.postalCode')}
              />
            </div>
            <div>
              <label htmlFor="address.country" className="form-label">Pays</label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                className="form-input"
                {...formik.getFieldProps('address.country')}
              />
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Contacts</h4>
            <button
              type="button"
              onClick={addContact}
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Ajouter
            </button>
          </div>
          
          {formik.values.contacts.map((contact, index) => (
            <div key={index} className="border rounded-md p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-sm font-medium text-gray-700">Contact #{index + 1}</h5>
                {formik.values.contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`contacts[${index}].name`} className="form-label">Nom*</label>
                  <input
                    type="text"
                    id={`contacts[${index}].name`}
                    name={`contacts[${index}].name`}
                    className={`form-input ${
                      formik.touched.contacts?.[index]?.name && formik.errors.contacts?.[index]?.name 
                      ? 'border-red-300' 
                      : ''
                    }`}
                    {...formik.getFieldProps(`contacts[${index}].name`)}
                  />
                  {formik.touched.contacts?.[index]?.name && formik.errors.contacts?.[index]?.name && (
                    <p className="form-error">{formik.errors.contacts[index].name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor={`contacts[${index}].role`} className="form-label">Fonction</label>
                  <input
                    type="text"
                    id={`contacts[${index}].role`}
                    name={`contacts[${index}].role`}
                    className="form-input"
                    {...formik.getFieldProps(`contacts[${index}].role`)}
                  />
                </div>
                <div>
                  <label htmlFor={`contacts[${index}].email`} className="form-label">Email</label>
                  <input
                    type="email"
                    id={`contacts[${index}].email`}
                    name={`contacts[${index}].email`}
                    className={`form-input ${
                      formik.touched.contacts?.[index]?.email && formik.errors.contacts?.[index]?.email 
                      ? 'border-red-300' 
                      : ''
                    }`}
                    {...formik.getFieldProps(`contacts[${index}].email`)}
                  />
                  {formik.touched.contacts?.[index]?.email && formik.errors.contacts?.[index]?.email && (
                    <p className="form-error">{formik.errors.contacts[index].email}</p>
                  )}
                </div>
                <div>
                  <label htmlFor={`contacts[${index}].phone`} className="form-label">Téléphone</label>
                  <input
                    type="tel"
                    id={`contacts[${index}].phone`}
                    name={`contacts[${index}].phone`}
                    className="form-input"
                    {...formik.getFieldProps(`contacts[${index}].phone`)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="form-label">Tags (séparés par des virgules)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            className="form-input"
            placeholder="ex: tech, startup, alternance..."
            {...formik.getFieldProps('tags')}
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="form-label">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            className="form-input"
            {...formik.getFieldProps('notes')}
          ></textarea>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting 
              ? 'Enregistrement...' 
              : initialData 
                ? 'Mettre à jour' 
                : 'Enregistrer'
            }
          </button>
        </div>
      </div>
    </form>
  );
};

export default CompanyForm;