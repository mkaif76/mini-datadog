import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookCopy, BarChart2, ChevronsLeft, ChevronsRight } from 'lucide-react';
import datadogLogo from '../assets/datadog_logo.png';

function Sidebar({ isCollapsed, setCollapsed }) {
  return (
    // UPDATED: Using the new, darker theme color
    <aside className={`bg-dd-sidebar text-dd-text-secondary flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center h-20 px-4 border-b border-dd-border">
        {/* Logo and Title Section */}
        <div className={`flex items-center overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <img src={datadogLogo} alt="Logo" className="h-10 w-10 flex-shrink-0" />
          <span className="ml-3 text-2xl font-bold text-dd-text-main whitespace-nowrap">Mini-Datadog</span>
        </div>
        
        {/* Collapse/Expand button */}
        <button 
          onClick={() => setCollapsed(!isCollapsed)} 
          className="hidden md:block p-1 rounded-md hover:bg-dd-light ml-auto"
        >
          {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>

      <nav className="flex-grow mt-6">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center py-3 px-4 mx-4 rounded-lg transition-colors duration-200 font-medium ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-dd-accent text-white shadow-lg shadow-dd-accent/30' : 'hover:bg-dd-light'}`
          }
        >
          <BookCopy size={22} />
          {!isCollapsed && <span className="ml-4 text-base">Logs</span>}
        </NavLink>
        <NavLink
          to="/metrics"
          className={({ isActive }) =>
            `flex items-center py-3 px-4 mx-4 rounded-lg transition-colors duration-200 font-medium ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-dd-accent text-white shadow-lg shadow-dd-accent/30' : 'hover:bg-dd-light'}`
          }
        >
          <BarChart2 size={22} />
          {!isCollapsed && <span className="ml-4 text-base">Metrics</span>}
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;