import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Sun, Moon, Menu, User, Wifi } from 'lucide-react';
import datadogLogo from './assets/datadog_logo.png';

function App() {
  // We are keeping the theme switcher logic, but making the default theme consistent.
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    // UPDATED: The entire app now uses the dd-background color in dark mode.
    <div className="flex h-screen bg-gray-100 dark:bg-dd-background">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 z-20 md:hidden"></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <Sidebar isCollapsed={isSidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header uses the dark sidebar color */}
        <header className="flex justify-between items-center p-4 bg-dd-sidebar border-b border-dd-border">
          <div className="flex items-center">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden mr-4 p-1 rounded-md text-dd-text-secondary hover:bg-dd-light">
              <Menu size={24} />
            </button>
            <div className="md:hidden flex items-center gap-2">
               <img src={datadogLogo} alt="Logo" className="h-8 w-8" />
               <span className="text-xl font-bold text-dd-text-main">Mini-Datadog</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-green-500">
              <Wifi size={16} />
              <span className="hidden sm:block">Live Status: Connected</span>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-full text-dd-text-secondary hover:bg-dd-light">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2 rounded-full text-dd-text-secondary hover:bg-dd-light">
              <User size={20} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 text-dd-text-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;