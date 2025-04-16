import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  UserIcon,
  ChartBarIcon,
  EnvelopeIcon,
  DocumentDuplicateIcon,
  BellIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: HomeIcon },
  { name: 'Statistiques', href: '/statistics', icon: ChartBarIcon },
  { name: 'Entreprises', href: '/companies', icon: BuildingOfficeIcon },
  { name: 'Offres', href: '/offers', icon: BriefcaseIcon },
  { name: 'Candidatures', href: '/applications', icon: DocumentTextIcon },
  // Nouvelles entrées pour l'itération 3
  { name: 'Rappels', href: '/reminders', icon: BellIcon },
  { name: 'Documents', href: '/documents', icon: FolderIcon },
  { name: 'Templates Email', href: '/email-templates', icon: EnvelopeIcon },
  { name: 'Templates Lettre', href: '/letter-templates', icon: DocumentDuplicateIcon },
  { name: 'Profil', href: '/profile', icon: UserIcon },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
            as="div"
            className="fixed inset-0 flex z-40 md:hidden"
            onClose={setSidebarOpen}
        >
          <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
              <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Fermer la barre latérale</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-gray-800">AltTracker</h1>
              </div>
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  <Sidebar.Navigation />
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <Sidebar.UserMenu />
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>
  );
};

// Navigation component
Sidebar.Navigation = function SidebarNavigation() {
  return (
      <>
        {navigation.map((item) => (
            <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                    `${
                        isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-base md:text-sm font-medium rounded-md`
                }
            >
              <item.icon
                  className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
              />
              {item.name}
            </NavLink>
        ))}
      </>
  );
};

// User menu component
Sidebar.UserMenu = function SidebarUserMenu() {
  const { currentUser } = useAuth();

  return (
      <div className="flex items-center">
        <div className="h-9 w-9 rounded-full bg-primary-500 flex items-center justify-center text-white">
          {currentUser?.firstName?.charAt(0) || 'U'}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-700">
            {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Utilisateur'}
          </p>
          <p className="text-xs font-medium text-gray-500 truncate">
            {currentUser?.email || 'utilisateur@example.com'}
          </p>
        </div>
      </div>
  );
};

export default Sidebar;