import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    BellIcon,
    CalendarIcon,
    ClockIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import ReminderForm from '../components/reminders/ReminderForm';

const Reminders = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentReminder, setCurrentReminder] = useState(null);

    useEffect(() => {
        fetchReminders();
    }, [filter]);

    const fetchReminders = async () => {
        try {
            setLoading(true);
            let url = '/api/reminders';

            // Ajouter les filtres
            if (filter !== 'all') {
                url += `?completed=${filter === 'completed'}`;
            }

            const response = await axios.get(url);
            if (response.data.success) {
                setReminders(response.data.data);
            }
        } catch (error) {
            toast.error('Erreur lors du chargement des rappels');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rappel ?')) {
            try {
                const response = await axios.delete(`/api/reminders/${id}`);
                if (response.data.success) {
                    toast.success('Rappel supprimé avec succès');
                    setReminders(reminders.filter(reminder => reminder._id !== id));
                }
            } catch (error) {
                toast.error('Erreur lors de la suppression du rappel');
                console.error(error);
            }
        }
    };

    const handleComplete = async (id) => {
        try {
            const response = await axios.put(`/api/reminders/${id}/complete`);
            if (response.data.success) {
                toast.success('Rappel marqué comme terminé');
                setReminders(reminders.map(reminder =>
                    reminder._id === id ? { ...reminder, isCompleted: true } : reminder
                ));
            }
        } catch (error) {
            toast.error('Erreur lors de la mise à jour du rappel');
            console.error(error);
        }
    };

    const openAddModal = () => {
        setCurrentReminder(null);
        setIsModalOpen(true);
    };

    const openEditModal = (reminder) => {
        setCurrentReminder(reminder);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentReminder(null);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (currentReminder) {
                // Mode édition
                const response = await axios.put(`/api/reminders/${currentReminder._id}`, formData);
                if (response.data.success) {
                    toast.success('Rappel mis à jour avec succès');
                    setReminders(reminders.map(reminder =>
                        reminder._id === currentReminder._id ? response.data.data : reminder
                    ));
                }
            } else {
                // Mode création
                const response = await axios.post('/api/reminders', formData);
                if (response.data.success) {
                    toast.success('Rappel ajouté avec succès');
                    setReminders([...reminders, response.data.data]);
                }
            }
            closeModal();
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement du rappel');
            console.error(error);
        }
    };

    // Filtrer les rappels avec le terme de recherche
    const filteredReminders = reminders.filter(reminder =>
        reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reminder.description && reminder.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Obtenir la classe de priorité
    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'haute':
                return 'bg-red-100 text-red-800';
            case 'normale':
                return 'bg-blue-100 text-blue-800';
            case 'basse':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

// Vérifier si un rappel est en retard
    const isOverdue = (date, isCompleted) => {
        return new Date(date) < new Date() && !isCompleted;
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Rappels et notifications</h1>
                <button
                    onClick={openAddModal}
                    className="btn btn-primary flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Ajouter un rappel
                </button>
            </div>

            {/* Filtres et recherche */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="form-input pl-10"
                            placeholder="Rechercher par titre ou description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="sm:w-48">
                    <select
                        className="form-input w-full"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">Tous les rappels</option>
                        <option value="active">Rappels actifs</option>
                        <option value="completed">Rappels terminés</option>
                    </select>
                </div>
            </div>

            {/* Liste des rappels */}
            {loading ? (
                <div className="flex items-center justify-center h-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            ) : filteredReminders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun rappel trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {filter !== 'all'
                            ? 'Essayez de modifier vos filtres ou d\'ajouter un nouveau rappel.'
                            : 'Commencez par ajouter un nouveau rappel.'}
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={openAddModal}
                            className="btn btn-primary"
                        >
                            Ajouter un rappel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {filteredReminders.map(reminder => {
                            const isLate = new Date(reminder.date) < new Date() && !reminder.isCompleted;

                            return (
                                <li key={reminder._id} className={isLate ? 'bg-red-50' : ''}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className={`w-2 h-2 rounded-full ${reminder.isCompleted ? 'bg-green-500' : isLate ? 'bg-red-500' : 'bg-blue-500'} mr-3`}></div>
                                                <p className={`text-lg font-medium ${reminder.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                                    {reminder.title}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityClass(reminder.priority)}`}>
                          {reminder.priority}
                        </span>
                                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {reminder.type}
                        </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex items-center">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    {format(new Date(reminder.date), 'dd MMMM yyyy', { locale: fr })}
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    {format(new Date(reminder.date), 'HH:mm', { locale: fr })}
                                                </div>
                                            </div>
                                            <div className="mt-2 flex items-center sm:mt-0">
                                                {isLate && !reminder.isCompleted && (
                                                    <div className="flex items-center text-red-600 mr-2">
                                                        <ExclamationCircleIcon className="h-5 w-5 mr-1" />
                                                        <span className="text-xs font-medium">En retard</span>
                                                    </div>
                                                )}
                                                {!reminder.isCompleted && (
                                                    <button
                                                        onClick={() => handleComplete(reminder._id)}
                                                        className="mr-2 inline-flex items-center p-1.5 text-sm font-medium text-white bg-green-600 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                        title="Marquer comme terminé"
                                                    >
                                                        <CheckIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEditModal(reminder)}
                                                    className="mr-2 inline-flex items-center p-1.5 text-sm font-medium text-gray-700 bg-white rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                    title="Modifier"
                                                >
                                                    <PencilIcon className="h-4 w-4 text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(reminder._id)}
                                                    className="inline-flex items-center p-1.5 text-sm font-medium text-gray-700 bg-white rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    title="Supprimer"
                                                >
                                                    <TrashIcon className="h-4 w-4 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                        {reminder.description && (
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">{reminder.description}</p>
                                            </div>
                                        )}
                                        {reminder.application && (
                                            <div className="mt-2">
                                                <a
                                                    href={`/applications/${reminder.application._id}`}
                                                    className="text-sm text-primary-600 hover:text-primary-500"
                                                >
                                                    Voir la candidature associée
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Modal pour ajouter/éditer un rappel */}
            {isModalOpen && (
                <div className="fixed inset-0 overflow-y-auto z-50">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                        >
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {currentReminder ? 'Modifier le rappel' : 'Ajouter un rappel'}
                                </h3>
                                <div className="mt-4">
                                    <ReminderForm
                                        initialData={currentReminder}
                                        onSubmit={handleFormSubmit}
                                        onCancel={closeModal}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reminders;