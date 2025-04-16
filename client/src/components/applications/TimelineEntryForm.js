import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const TimelineEntryForm = ({ onSubmit, onCancel, currentStatus }) => {
  const formik = useFormik({
    initialValues: {
      date: new Date(),
      action: '',
      notes: '',
      updateStatus: false,
      newStatus: currentStatus || 'envoyée'
    },
    validationSchema: Yup.object({
      date: Yup.date().required('La date est requise'),
      action: Yup.string().required('L\'action est requise'),
      notes: Yup.string(),
      updateStatus: Yup.boolean(),
      newStatus: Yup.string().when('updateStatus', {
        is: true,
        then: Yup.string().required('Le nouveau statut est requis')
      })
    }),
    onSubmit: (values) => {
      // Préparer les données pour la soumission
      const entryData = {
        date: values.date,
        action: values.action,
        notes: values.notes
      };
      
      // Si on doit mettre à jour le statut
      const data = {
        ...entryData,
        updateStatus: values.updateStatus,
        newStatus: values.updateStatus ? values.newStatus : undefined
      };
      
      onSubmit(data);
    }
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="space-y-6">
        {/* Date */}
        <div>
          <label htmlFor="date" className="form-label">Date*</label>
          <DatePicker
            selected={formik.values.date}
            onChange={(date) => formik.setFieldValue('date', date)}
            className={`form-input w-full ${formik.touched.date && formik.errors.date ? 'border-red-300' : ''}`}
            dateFormat="dd/MM/yyyy"
          />
          {formik.touched.date && formik.errors.date && (
            <p className="form-error">{formik.errors.date}</p>
          )}
        </div>

        {/* Action */}
        <div>
          <label htmlFor="action" className="form-label">Action*</label>
          <input
            type="text"
            id="action"
            name="action"
            className={`form-input ${formik.touched.action && formik.errors.action ? 'border-red-300' : ''}`}
            placeholder="ex: Envoi de la candidature, Relance par téléphone..."
            {...formik.getFieldProps('action')}
          />
          {formik.touched.action && formik.errors.action && (
            <p className="form-error">{formik.errors.action}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="form-label">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            className="form-input"
            placeholder="Détails supplémentaires sur cette action..."
            {...formik.getFieldProps('notes')}
          ></textarea>
        </div>

        {/* Mise à jour du statut */}
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="updateStatus"
              name="updateStatus"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={formik.values.updateStatus}
              onChange={formik.handleChange}
            />
            <label htmlFor="updateStatus" className="ml-3 text-sm text-gray-700">
              Mettre à jour le statut de la candidature
            </label>
          </div>
          
          {formik.values.updateStatus && (
            <div className="mt-3">
              <select
                id="newStatus"
                name="newStatus"
                className="form-input"
                {...formik.getFieldProps('newStatus')}
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
          )}
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
            {formik.isSubmitting ? 'Enregistrement...' : 'Ajouter'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TimelineEntryForm;