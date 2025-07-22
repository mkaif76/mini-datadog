import React, { useState, useEffect, useCallback } from 'react';
import SearchForm from '../components/SearchForm';
import LogList from '../components/LogList';

// The base URL for our backend API. We get this from Vite's environment variables.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Logs() {
  // State to hold the array of log data fetched from the API
  const [logs, setLogs] = useState([]);
  // State to track if we are currently fetching data (to show a loading message)
  const [isLoading, setIsLoading] = useState(true);
  // State to hold the current values of all our search filters
  const [searchParams, setSearchParams] = useState({
    q: '',
    service: '',
    level: '',
    requestId: '',
    startTime: '', // NEW: State for start time
    endTime: '',   // NEW: State for end time
  });

  // This function is responsible for fetching logs from the backend.
  const fetchLogs = useCallback(async (params) => {
    setIsLoading(true);
    
    // NEW: Filter out any empty parameters before creating the query string
    const activeParams = {};
    for (const key in params) {
      if (params[key]) { // Only add params that have a value
        let value = params[key];
        // The backend expects dates in ISO format. The input gives a local time string.
        // We convert it to a full ISO 8601 string (e.g., "2025-07-22T15:30:00.000Z").
        if ((key === 'startTime' || key === 'endTime') && !value.endsWith('Z')) {
            value = new Date(value).toISOString();
        }
        activeParams[key] = value;
      }
    }
    const queryString = new URLSearchParams(activeParams).toString();
    
    try {
      const response = await fetch(`${API_BASE_URL}/search?${queryString}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // This useEffect hook runs ONCE when the component first mounts.
  useEffect(() => {
    fetchLogs(searchParams);
  }, [fetchLogs]);

  // This function will be passed down to the SearchForm.
  const handleSearch = (params) => {
    setSearchParams(params);
    fetchLogs(params);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Log Explorer</h2>
      
      {/* Search Form Section */}
      <div className="bg-secondary-dark p-6 rounded-xl shadow-md mb-8">
        <SearchForm 
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          handleSearch={handleSearch}
        />
      </div>
      
      {/* Log List Section */}
      <LogList 
        logs={logs} 
        isLoading={isLoading} 
      />
    </div>
  );
}

export default Logs;