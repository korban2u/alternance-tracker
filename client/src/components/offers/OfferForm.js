import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { XMarkIcon } from '@heroicons/react/24/outline';

const OfferForm = ({ initialData, onSubmit, onCancel }) => {
  const location = useLocation();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [technologies, setTechnologies] = useState(initialData?.technologies || []);
  const [techInput, setTechInput] = useState('');

  // Récupérer l'entreprise depuis le state (si on vient de la page de détail d'une entreprise)
  const preselectedCompany = location.state?.company || initialData?.company?._id || initialData?.company;

  useEffect(() => {
    fetchCompanies();
  }, []);

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

  const formik = useFormik({
    initialValues: {
      title: initialData?.title || '',
      company: preselectedCompany || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      duration: initialData?.duration || '',
      salary: initialData?.salary || '',
      interestLevel: initialData?.interestLevel || 'intéressant',
      status: initialData?.status || 'active',
      dates: {
        publication: initialData?.dates?.publication ? new Date(initialData.dates.publication) : new Date(),
        deadline: initialData?.dates?.deadline ? new Date(initialData.dates.deadline) : null
      },
      sourceUrl: initialData?.sourceUrl || ''
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Le titre est requis'),
      company: Yup.string().required('L\'entreprise est requise'),
      description: Yup.string().required('La description est requise'),
      location: Yup.string().required('La localisation est requise'),
      duration: Yup.string().required('La durée est requise'),
      salary: Yup.string(),
      interestLevel: Yup.string().required('Le niveau d\'intérêt est requis'),
      status: Yup.string().required('Le statut est requis'),
      dates: Yup.object({
        publication: Yup.date().required('La date de publication est requise'),
        deadline: Yup.date().nullable()
      }),
      sourceUrl: Yup.string().url('URL invalide').nullable()
    }),
    onSubmit: (values) => {
      // Formatage des dates
      const formattedValues = {
        ...values,
        technologies,
        dates: {
          publication: values.dates.publication ? format(values.dates.publication, 'yyyy-MM-dd') : null,
          deadline: values.dates.deadline ? format(values.dates.deadline, 'yyyy-MM-dd') : null
        }
      };

      onSubmit(formattedValues);
    }
  });

  const addTechnology = () => {
    if (techInput.trim() !== '' && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTechnology = (techToRemove) => {
    setTechnologies(technologies.filter(tech => tech !== techToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechnology();
    }
  };

  return (
      <form onSubmit={formik.handleSubmit}>
        <div className="space-y-6">
          {/* Titre et entreprise */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="form-label">Titre de l'offre*</label>
              <input
                  type="text"
                  id="title"
                  name="title"
                  className={`form-input ${formik.touched.title && formik.errors.title ? 'border-red-300' : ''}`}
                  {...formik.getFieldProps('title')}
              />
              {formik.touched.title && formik.errors.title && (
                  <p className="form-error">{formik.errors.title}</p>
              )}
            </div>

            <div className="sm:col-span-2">
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

          {/* Description */}
          <div>
            <label htmlFor="description" className="form-label">Description*</label>
            <textarea
                id="description"
                name="description"
                rows="6"
                className={`form-input ${formik.touched.description && formik.errors.description ? 'border-red-300' : ''}`}
                {...formik.getFieldProps('description')}
            ></textarea>
            {formik.touched.description && formik.errors.description && (
                <p className="form-error">{formik.errors.description}</p>
            )}
          </div>

          {/* Lieu et durée */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="location" className="form-label">Localisation*</label>
              <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="ex: Paris, Remote, etc."
                  className={`form-input ${formik.touched.location && formik.errors.location ? 'border-red-300' : ''}`}
                  {...formik.getFieldProps('location')}
              />
              {formik.touched.location && formik.errors.location && (
                  <p className="form-error">{formik.errors.location}</p>
              )}
            </div>

            <div>
              <label htmlFor="duration" className="form-label">Durée*</label>
              <input
                  type="text"
                  id="duration"
                  name="duration"
                  placeholder="ex: 12 mois, 2 ans, etc."
                  className={`form-input ${formik.touched.duration && formik.errors.duration ? 'border-red-300' : ''}`}
                  {...formik.getFieldProps('duration')}
              />
              {formik.touched.duration && formik.errors.duration && (
                  <p className="form-error">{formik.errors.duration}</p>
              )}
            </div>
          </div>

          {/* Salaire et dates */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="salary" className="form-label">Rémunération</label>
              <input
                  type="text"
                  id="salary"
                  name="salary"
                  placeholder="ex: 800€/mois, à partir de 1000€, etc."
                  className={`form-input ${formik.touched.salary && formik.errors.salary ? 'border-red-300' : ''}`}
                  {...formik.getFieldProps('salary')}
              />
              {formik.touched.salary && formik.errors.salary && (
                  <p className="form-error">{formik.errors.salary}</p>
              )}
            </div>

            <div>
              <label htmlFor="sourceUrl" className="form-label">URL de la source</label>
              <input
                  type="url"
                  id="sourceUrl"
                  name="sourceUrl"
                  placeholder="ex: https://example.com/job"
                  className={`form-input ${formik.touched.sourceUrl && formik.errors.sourceUrl ? 'border-red-300' : ''}`}
                  {...formik.getFieldProps('sourceUrl')}
              />
              {formik.touched.sourceUrl && formik.errors.sourceUrl && (
                  <p className="form-error">{formik.errors.sourceUrl}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="dates.publication" className="form-label">Date de publication*</label>
              <DatePicker
                  selected={formik.values.dates.publication}
                  onChange={(date) => formik.setFieldValue('dates.publication', date)}
                  className={`form-input w-full ${formik.touched.dates?.publication && formik.errors.dates?.publication ? 'border-red-300' : ''}`}
                  dateFormat="dd/MM/yyyy"
              />
              {formik.touched.dates?.publication && formik.errors.dates?.publication && (
                  <p className="form-error">{formik.errors.dates.publication}</p>
              )}
            </div>

            <div>
              <label htmlFor="dates.deadline" className="form-label">Date limite de candidature</label>
              <DatePicker
                  selected={formik.values.dates.deadline}
                  onChange={(date) => formik.setFieldValue('dates.deadline', date)}
                  className="form-input w-full"
                  dateFormat="dd/MM/yyyy"
                  isClearable
                  placeholderText="Sélectionner une date (optionnel)"
              />
            </div>
          </div>

          {/* Technologies */}
          <div>
            <label htmlFor="technologies" className="form-label">Technologies</label>
            <div className="flex space-x-2">
              <input
                  type="text"
                  id="technologies"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ajouter une technologie"
                  className="form-input"
              />
              <button
                  type="button"
                  onClick={addTechnology}
                  className="btn btn-secondary"
              >
                Ajouter
              </button>
            </div>

            {technologies.length > 0 && (
                <div className="mt-2 flex flex-wrap">
                  {technologies.map((tech, index) => (
                      <span
                          key={index}
                          className="mr-2 mb-2 px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800 flex items-center"
                      >
                  {tech}
                        <button
                            type="button"
                            onClick={() => removeTechnology(tech)}
                            className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
                  ))}
                </div>
            )}
          </div>

          {/* Statut et intérêt */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="interestLevel" className="form-label">Niveau d'intérêt*</label>
              <select
                  id="interestLevel"
                  name="interestLevel"
                  className="form-input"
                  {...formik.getFieldProps('interestLevel')}
              >
                <option value="prioritaire">Prioritaire</option>
                <option value="très intéressant">Très intéressant</option>
                <option value="intéressant">Intéressant</option>
                <option value="peu intéressant">Peu intéressant</option>
                <option value="non intéressant">Non intéressant</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="form-label">Statut de l'offre*</label>
              <select
                  id="status"
                  name="status"
                  className="form-input"
                  {...formik.getFieldProps('status')}
              >
                <option value="active">Active</option>
                <option value="expirée">Expirée</option>
                <option value="pourvue">Pourvue</option>
              </select>
            </div>
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

export default OfferForm;