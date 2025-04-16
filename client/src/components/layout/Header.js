import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bars3Icon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import ReminderNotifications from '../reminders/ReminderNotifications';

const Header = ({ setSidebarOpen }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
      <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
        <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Ouvrir la barre latérale</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 px-4 flex justify-between">
          <div className="flex-1 flex">
            <form className="w-full flex md:ml-0" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Rechercher
              </label>
              <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <input
                    id="search-field"
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="Rechercher"
                    type="search"
                    name="search"
                />
              </div>
            </form>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            {/* Composant de notifications des rappels */}
            <ReminderNotifications />

            {/* Profile dropdown */}
            <Menu as="div" className="ml-3 relative">
              <div>
                <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <span className="sr-only">Ouvrir le menu utilisateur</span>
                  <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    {currentUser?.firstName?.charAt(0) || 'U'}
                  </div>
                </Menu.Button>
              </div>
              <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                        <a
                            href="/profile"
                            className={`${
                                active ? 'bg-gray-100' : ''
                            } block px-4 py-2 text-sm text-gray-700`}
                        >
                          Profil
                        </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                        <button
                            onClick={handleLogout}
                            className={`${
                                active ? 'bg-gray-100' : ''
                            } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                        >
                          Déconnexion
                        </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
  );
};

export default Header;