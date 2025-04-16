import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';

// Enregistrer la locale française pour le DatePicker
registerLocale('fr', fr);

const ReminderForm = ({ initialData, onSubmit, onCancel }) => {
    const [applications, setApplications] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [offers, setOffers] = useState([]);
    const [emailTemplates, setEmailTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(
        initialData?.date ? new Date(initialData.date) : new Date()
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Récupérer les données pour les références
            const [applicationsRes, companiesRes, offersRes, templatesRes] = await Promise.all([
                axios.get('/api/applications'),
                axios.get('/api/companies'),
                axios.get('/api/offers'),
                axios.get('/api/email-templates')
            ]);

            setApplications(applicationsRes.data.data);
            setCompanies(companiesRes.data.data);
            setOffers(offersRes.data.data);
            setEmailTemplates(templatesRes.data.data);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            type: initialData?.type || 'relance',
            date: initialData?.date ? new Date(initialData.date) : new Date(),
            priority: initialData?.priority || 'normale',
            application: initialData?.application?._id || initialData?.application || '',
            company: initialData?.company?._id || initialData?.company || '',
            offer: initialData?.offer?._id || initialData?.offer || '',
            emailTemplate: initialData?.emailTemplate?._id || initialData?.emailTemplate || ''
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Le titre est requis'),
            description: Yup.string(),
            type: Yup.string().required('Le type est requis'),
            date: Yup.date().required('La date est requise'),
            priority: Yup.string().required('La priorité est requise'),
            application: Yup.string(),
            company: Yup.string(),
            offer: Yup.string(),
            emailTemplate: Yup.string()
        }),
        onSubmit: (values) => {
            // Formater la date
            const formattedValues = {
                ...values,
                date: values.date.toISOString()
            };

            onSubmit(formattedValues);
        }
    });

    // Lorsqu'une application est sélectionnée, préremplir l'entreprise et l'offre
    useEffect(() => {
        if (formik.values.application) {
            const selectedApplication = applications.find(app => app._id === formik.values.application);

            if (selectedApplication) {
                const companyId = selectedApplication.company._id || selectedApplication.company;
                formik.setFieldValue('company', companyId);

                if (selectedApplication.offer) {
                    const offerId = selectedApplication.offer._id || selectedApplication.offer;
                    formik.setFieldValue('offer', offerId);
                }
            }
        }
    }, [formik.values.application, applications]);

    // Lorsqu'une entreprise est sélectionnée, filtrer les offres
    const filteredOffers = formik.values.company
        ? offers.filter(offer => (offer.company._id || offer.company) === formik.values.company)
        : offers;

    // Générer des suggestions de titre basées sur le type
    const generateTitle = (type) => {
        const dateFormatted = format(new Date(formik.values.date), 'dd/MM/yyyy');
        let title = '';

        switch(type) {
            case 'relance':
                title = `Relance candidature - ${dateFormatted}`;
                break;
            case 'entretien':
                title = `Entretien - ${dateFormatted}`;
                break;
            case 'échéance':
                title = `Échéance - ${dateFormatted}`;
                break;
            default:
                title = `Rappel - ${dateFormatted}`;
        }

        // Ajouter le nom de l'entreprise si disponible
        if (formik.values.company) {
            const company = companies.find(c => c._id === formik.values.company);
            if (company) {
                title += ` - ${company.name}`;
            }
        }

        return title;
    };

    const handleTypeChange = (e) => {
        formik.setFieldValue('type', e.target.value);

        // Suggérer un titre basé sur le nouveau type
        if (!initialData) {
            formik.setFieldValue('title', generateTitle(e.target.value));
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        formik.setFieldValue('date', date);

        // Mettre à jour le titre suggéré avec la nouvelle date
        if (!initialData && formik.values.type) {
            formik.setFieldValue('title', generateTitle(formik.values.type));
        }
    };

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className="space-y-6">
                {/* Titre et type */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label htmlFor="title" className="form-label">Titre*</label>
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

                    <div>
                        <label htmlFor="type" className="form-label">Type de rappel*</label>
                        <select
                            id="type"
                            name="type"
                            className={`form-input ${formik.touched.type && formik.errors.type ? 'border-red-300' : ''}`}
                            value={formik.values.type}
                            onChange={handleTypeChange}
                        >
                            <option value="relance">Relance</option>
                            <option value="entretien">Entretien</option>
                            <option value="échéance">Échéance</option>
                            <option value="autre">Autre</option>
                        </select>
                        {formik.touched.type && formik.errors.type && (
                            <p className="form-error">{formik.errors.type}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="priority" className="form-label">Priorité*</label>
                        <select
                            id="priority"
                            name="priority"
                            className={`form-input ${formik.touched.priority && formik.errors.priority ? 'border-red-300' : ''}`}
                            {...formik.getFieldProps('priority')}
                        >
                            <option value="basse">Basse</option>
                            <option value="normale">Normale</option>
                            <option value="haute">Haute</option>
                        </select>
                        {formik.touched.priority && formik.errors.priority && (
                            <p className="form-error">{formik.errors.priority}</p>
                        )}
                    </div>
                </div>

                {/* Date et heure */}
                <div>
                    <label htmlFor="date" className="form-label">Date et heure*</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        timeCaption="Heure"
                        dateFormat="dd/MM/yyyy HH:mm"
                        className="form-input w-full"
                        locale="fr"
                    />
                    {formik.touched.date && formik.errors.date && (
                        <p className="form-error">{formik.errors.date}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows="3"
                        className={`form-input ${formik.touched.description && formik.errors.description ? 'border-red-300' : ''}`}
                        {...formik.getFieldProps('description')}
                    ></textarea>
                    {formik.touched.description && formik.errors.description && (
                        <p className="form-error">{formik.errors.description}</p>
                    )}
                </div>

                {/* Références */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="application" className="form-label">Candidature associée</label>
                        <select
                            id="application"
                            name="application"
                            className="form-input"
                            {...formik.getFieldProps('application')}
                            disabled={loading}
                        >
                            <option value="">Aucune candidature</option>
                            {applications.map(app => (
                                <option key={app._id} value={app._id}>
                                    {app.company?.name || 'Entreprise'}
                                    {app.offer?.title ? ` - ${app.offer.title}` : ' - Candidature spontanée'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="company" className="form-label">Entreprise associée</label>
                        <select
                            id="company"
                            name="company"
                            className="form-input"
                            {...formik.getFieldProps('company')}
                            disabled={loading || formik.values.application}
                        >
                            <option value="">Aucune entreprise</option>
                            {companies.map(company => (
                                <option key={company._id} value={company._id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="offer" className="form-label">Offre associée</label>
                        <select
                            id="offer"
                            name="offer"
                            className="form-input"
                            {...formik.getFieldProps('offer')}
                            disabled={loading || formik.values.application || !formik.values.company}
                        >
                            <option value="">Aucune offre</option>
                            {filteredOffers.map(offer => (
                                <option key={offer._id} value={offer._id}>
                                    {offer.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="emailTemplate" className="form-label">Template d'email associé</label>
                        <select
                            id="emailTemplate"
                            name="emailTemplate"
                            className="form-input"
                            {...formik.getFieldProps('emailTemplate')}
                            disabled={loading}
                        >
                            <option value="">Aucun template</option>
                            {emailTemplates.map(template => (
                                <option key={template._id} value={template._id}>
                                    {template.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Actions */}
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

export default ReminderForm;