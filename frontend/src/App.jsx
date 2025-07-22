import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Sun, Moon, Search, Menu } from 'lucide-react';

function App() {
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
    // UPDATED: Using our new custom colors
    <div className="flex h-screen bg-gray-100 dark:bg-primary-dark">
      {/* RESPONSIVE: Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 z-20 md:hidden"></div>
      )}

      {/* RESPONSIVE: Sidebar has different behavior on mobile vs desktop */}
      <div className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <Sidebar isCollapsed={isSidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* === Main Content Wrapper === */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* --- Top Header --- */}
        <header className="flex justify-between items-center p-4 bg-white dark:bg-secondary-dark border-b border-gray-200 dark:border-border-dark">
          <div className="flex items-center">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden mr-4 p-1 rounded-md text-text-secondary hover:bg-gray-200 dark:hover:bg-border-dark">
              <Menu size={24} />
            </button>
            <div className="relative hidden sm:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input type="text" placeholder="Search..." className="bg-gray-100 dark:bg-primary-dark text-text-main rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-purple" />
            </div>
          </div>
          <div className="flex items-center">
            <button onClick={toggleTheme} className="p-2 rounded-full text-text-secondary hover:bg-gray-200 dark:hover:bg-border-dark">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* --- Main Content --- */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 text-text-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;