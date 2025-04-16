import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    BellIcon,
    XMarkIcon,
    ChevronRightIcon,
    CheckIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const ReminderNotifications = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [count, setCount] = useState(0);

    useEffect(() => {
        fetchUpcomingReminders();

        // Rafraîchir les rappels toutes les 15 minutes
        const intervalId = setInterval(fetchUpcomingReminders, 15 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    const fetchUpcomingReminders = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/reminders/upcoming?days=3');

            if (response.data.success) {
                const reminderData = response.data.data;

                // Trier les rappels : en retard, aujourd'hui, puis les futurs
                reminderData.sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);

                    const aIsLate = isPast(dateA) && !isToday(dateA);
                    const bIsLate = isPast(dateB) && !isToday(dateB);

                    if (aIsLate && !bIsLate) return -1;
                    if (!aIsLate && bIsLate) return 1;

                    const aIsToday = isToday(dateA);
                    const bIsToday = isToday(dateB);

                    if (aIsToday && !bIsToday) return -1;
                    if (!aIsToday && bIsToday) return 1;

                    return dateA - dateB;
                });

                setReminders(reminderData);
                setCount(reminderData.length);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des rappels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await axios.put(`/api/reminders/${id}/complete`);

            if (response.data.success) {
                // Mettre à jour l'état local
                setReminders(reminders.filter(reminder => reminder._id !== id));
                setCount(count - 1);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du rappel:', error);
        }
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    const getStatusClass = (date) => {
        const reminderDate = new Date(date);

        if (isPast(reminderDate) && !isToday(reminderDate)) {
            return 'bg-red-100 text-red-800 border-red-200';
        } else if (isToday(reminderDate)) {
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        } else {
            return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const getStatusIcon = (date) => {
        const reminderDate = new Date(date);

        if (isPast(reminderDate) && !isToday(reminderDate)) {
            return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
        } else if (isToday(reminderDate)) {
            return <BellIcon className="h-5 w-5 text-yellow-500" />;
        } else {
            return <BellIcon className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <div className="relative">
            {/* Icône de notification avec badge */}
            <button
                onClick={toggleOpen}
                className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
                <BellIcon className="h-6 w-6" />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500">
            {count}
          </span>
                )}
            </button>

            {/* Panneau de notifications */}
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-2">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">Rappels ({count})</h3>
                            <button
                                onClick={toggleOpen}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="px-4 py-3 text-center">
                                <div className="animate-spin inline-block h-4 w-4 border-b-2 border-primary-500"></div>
                                <span className="ml-2 text-sm text-gray-500">Chargement...</span>
                            </div>
                        ) : reminders.length === 0 ? (
                            <div className="px-4 py-3 text-center text-sm text-gray-500">
                                Aucun rappel pour les 3 prochains jours
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto">
                                {reminders.map(reminder => (
                                    <Link
                                        key={reminder._id}
                                        to="/reminders"
                                        className={`block px-4 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                                            isPast(new Date(reminder.date)) && !isToday(new Date(reminder.date))
                                                ? 'bg-red-50'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 flex items-center">
                                                    {getStatusIcon(reminder.date)}
                                                    <span className="ml-1">{reminder.title}</span>
                                                </p>
                                                <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(reminder.date)}`}>
                            {format(new Date(reminder.date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </span>
                                                    {reminder.priority === 'haute' && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Priorité haute
                            </span>
                                                    )}
                                                </div>
                                                {reminder.description && (
                                                    <p className="mt-1 text-xs text-gray-500 truncate">
                                                        {reminder.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <button
                                                    onClick={(e) => handleComplete(reminder._id, e)}
                                                    className="text-gray-400 hover:text-green-500"
                                                    title="Marquer comme terminé"
                                                >
                                                    <CheckIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        <div className="px-4 py-2 border-t border-gray-200">
                            <Link
                                to="/reminders"
                                className="block text-center text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center justify-center"
                            >
                                Voir tous les rappels
                                <ChevronRightIcon className="ml-1 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReminderNotifications;