import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookCopy, BarChart2, ChevronsLeft, ChevronsRight } from 'lucide-react';

// The Sidebar now receives props from its parent (App.jsx) to control its state
function Sidebar({ isCollapsed, setCollapsed }) {
  return (
    <aside className={`bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo and Collapse Toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && <span className="text-xl font-bold text-gray-800 dark:text-white">Mini-Datadog</span>}
        <button onClick={() => setCollapsed(!isCollapsed)} className="hidden md:block p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
          {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow mt-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center py-2 px-4 mx-2 rounded-md transition-colors duration-200 ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`
          }
        >
          <BookCopy size={20} />
          {!isCollapsed && <span className="ml-4">Logs</span>}
        </NavLink>
        <NavLink
          to="/metrics"
          className={({ isActive }) =>
            `flex items-center py-2 px-4 mx-2 rounded-md transition-colors duration-200 ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`
          }
        >
          <BarChart2 size={20} />
          {!isCollapsed && <span className="ml-4">Metrics</span>}
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;