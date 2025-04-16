import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const ApplicationForm = ({ initialData, onSubmit, onCancel }) => {
  const location = useLocation();
  const [companies, setCompanies] = useState([]);
  const [offers, setOffers] = useState([]);
  const [applicationType, setApplicationType] = useState(initialData?.type || 'offre');
  const [loading, setLoading] = useState(true);

  // Récupérer l'offre et l'entreprise depuis le state (si on vient de la page de détail d'une offre)
  const preselectedOffer = location.state?.offer || initialData?.offer?._id || initialData?.offer;
  const preselectedCompany = location.state?.company || initialData?.company?._id || initialData?.company;

  useEffect(() => {
    fetchCompanies();
    fetchOffers();
  }, []);

  useEffect(() => {
    if (applicationType === 'spontanée') {
      formik.setFieldValue('offer', '');
    }
  }, [applicationType]);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/companies');
      if (response.data.success) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await axios.get('/api/offers');
      if (response.data.success) {
        setOffers(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      type: initialData?.type || 'offre',
      company: preselectedCompany || '',
      offer: preselectedOffer || '',
      status: initialData?.status || 'à envoyer',
      documents: {
        cv: {
          version: initialData?.documents?.cv?.version || '',
          sent: initialData?.documents?.cv?.sent || false,
          fileName: initialData?.documents?.cv?.fileName || ''
        },
        coverLetter: {
          version: initialData?.documents?.coverLetter?.version || '',
          sent: initialData?.documents?.coverLetter?.sent || false,
          fileName: initialData?.documents?.coverLetter?.fileName || ''
        }
      },
      nextAction: initialData?.nextAction || '',
      nextActionDate: initialData?.nextActionDate ? new Date(initialData.nextActionDate) : null,
      notes: initialData?.notes || ''
    },
    validationSchema: Yup.object({
      type: Yup.string().required('Le type est requis'),
      company: Yup.string().required('L\'entreprise est requise'),
      offer: Yup.string().when('type', {
        is: 'offre',
        then: Yup.string().required('L\'offre est requise')
      }),
      status: Yup.string().required('Le statut est requis'),
      documents: Yup.object({
        cv: Yup.object({
          version: Yup.string(),
          sent: Yup.boolean(),
          fileName: Yup.string()
        }),
        coverLetter: Yup.object({
          version: Yup.string(),
          sent: Yup.boolean(),
          fileName: Yup.string()
        })
      }),
      nextAction: Yup.string(),
      nextActionDate: Yup.date().nullable(),
      notes: Yup.string()
    }),
    onSubmit: (values) => {
      // Préparer les données pour la soumission
      const formattedValues = {
        ...values,
        nextActionDate: values.nextActionDate ? values.nextActionDate.toISOString() : null
      };
      
      // Si c'est une nouvelle candidature, ajouter l'entrée initiale dans la timeline
      if (!initialData) {
        formattedValues.timeline = [{
          date: new Date(),
          action: 'Création de la candidature',
          notes: 'Candidature créée'
        }];
      }
      
      onSubmit(formattedValues);
    }
  });

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setApplicationType(newType);
    formik.setFieldValue('type', newType);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="space-y-6">
        {/* Type de candidature et entreprise */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="type" className="form-label">Type de candidature*</label>
            <select
              id="type"
              name="type"
              className="form-input"
              value={formik.values.type}
              onChange={handleTypeChange}
            >
              <option value="offre">Réponse à une offre</option>
              <option value="spontanée">Candidature spontanée</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="company" className="form-label">Entreprise*</label>
            <select
              id="company"
              name="company"
              className={`form-input ${formik.touched.company && formik.errors.company ? 'border-red-300' : ''}`}
              {...formik.getFieldProps('company')}
              disabled={loading}
            >
              <option value="">Sélectionner une entreprise</option>
              {companies.map(company => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
            {formik.touched.company && formik.errors.company && (
              <p className="form-error">{formik.errors.company}</p>
            )}
          </div>
        </div>

        {/* Offre (si type = offre) */}
        {formik.values.type === 'offre' && (
          <div>
            <label htmlFor="offer" className="form-label">Offre associée*</label>
            <select
              id="offer"
              name="offer"
              className={`form-input ${formik.touched.offer && formik.errors.offer ? 'border-red-300' : ''}`}
              {...formik.getFieldProps('offer')}
              disabled={loading}
            >
              <option value="">Sélectionner une offre</option>
              {offers
                .filter(offer => !formik.values.company || offer.company === formik.values.company || offer.company._id === formik.values.company)
                .map(offer => (
                  <option key={offer._id} value={offer._id}>
                    {offer.title}
                  </option>
                ))
              }
            </select>
            {formik.touched.offer && formik.errors.offer && (
              <p className="form-error">{formik.errors.offer}</p>
            )}
          </div>
        )}

        {/* Statut */}
        <div>
          <label htmlFor="status" className="form-label">Statut*</label>
          <select
            id="status"
            name="status"
            className="form-input"
            {...formik.getFieldProps('status')}
          >
            <option value="à envoyer">À envoyer</option>
            <option value="envoyée">Envoyée</option>
            <option value="relance effectuée">Relance effectuée</option>
            <option value="entretien planifié">Entretien planifié</option>
            <option value="en attente de réponse">En attente de réponse</option>
            <option value="acceptée">Acceptée</option>
            <option value="refusée">Refusée</option>
          </select>
        </div>

        {/* Documents */}
        <div>
          <h4 className="form-label mb-3">Documents</h4>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="documents.cv.sent"
                name="documents.cv.sent"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formik.values.documents.cv.sent}
                onChange={formik.handleChange}
              />
              <label htmlFor="documents.cv.sent" className="ml-3 text-sm text-gray-700">
                CV envoyé
              </label>
              <input
                type="text"
                id="documents.cv.version"
                name="documents.cv.version"
                className="ml-3 form-input"
                placeholder="Version (ex: v1, v2...)"
                {...formik.getFieldProps('documents.cv.version')}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="documents.coverLetter.sent"
                name="documents.coverLetter.sent"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formik.values.documents.coverLetter.sent}
                onChange={formik.handleChange}
              />
              <label htmlFor="documents.coverLetter.sent" className="ml-3 text-sm text-gray-700">
                Lettre de motivation envoyée
              </label>
              <input
                type="text"
                id="documents.coverLetter.version"
                name="documents.coverLetter.version"
                className="ml-3 form-input"
                placeholder="Version (ex: v1, v2...)"
                {...formik.getFieldProps('documents.coverLetter.version')}
              />
            </div>
          </div>
        </div>

        {/* Prochaine action */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="nextAction" className="form-label">Prochaine action</label>
            <input
              type="text"
              id="nextAction"
              name="nextAction"
              className="form-input"
              placeholder="ex: Relancer par email, Préparer l'entretien..."
              {...formik.getFieldProps('nextAction')}
            />
          </div>
          
          <div>
            <label htmlFor="nextActionDate" className="form-label">Date de la prochaine action</label>
            <DatePicker
              selected={formik.values.nextActionDate}
              onChange={(date) => formik.setFieldValue('nextActionDate', date)}
              className="form-input w-full"
              dateFormat="dd/MM/yyyy"
              isClearable
              placeholderText="Sélectionner une date (optionnel)"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="form-label">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows="4"
            className="form-input"
            placeholder="Notes supplémentaires sur cette candidature..."
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

export default ApplicationForm;