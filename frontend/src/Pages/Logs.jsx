import React, { useState, useEffect, useCallback, useRef } from 'react';
import SearchForm from '../components/SearchForm';
import TableComponent from '../components/TableComponent';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    q: '', service: '', level: '', requestId: '', startTime: '', endTime: '',
  });
  
  // NEW: State for pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // A ref to prevent the initial useEffect from running twice in StrictMode
  const initialLoad = useRef(true);

  const fetchLogs = useCallback(async (params, pageNum) => {
    setIsLoading(true);
    
    const activeParams = {};
    for (const key in params) {
      if (params[key]) {
        let value = params[key];
        if ((key === 'startTime' || key === 'endTime') && !value.endsWith('Z')) {
            value = new Date(value).toISOString();
        }
        activeParams[key] = value;
      }
    }
    
    // Add pagination params to the query
    activeParams.page = pageNum;
    activeParams.limit = 50; // Load 50 logs per page
    
    const queryString = new URLSearchParams(activeParams).toString();
    
    try {
      const response = await fetch(`${API_BASE_URL}/search?${queryString}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      // If it's the first page, replace the logs. Otherwise, append them.
      setLogs(prevLogs => pageNum === 1 ? data.logs : [...prevLogs, ...data.logs]);
      setHasMore(data.hasMore);

    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect for the initial load
  useEffect(() => {
    // This check prevents the double-fetch in development due to React.StrictMode
    if (initialLoad.current) {
        fetchLogs(searchParams, 1);
        initialLoad.current = false;
    }
  }, [fetchLogs, searchParams]);

  // This function is triggered by a new search
  const handleSearch = (params) => {
    setSearchParams(params);
    setPage(1); // Reset to page 1 for a new search
    fetchLogs(params, 1);
  };

  // This function is triggered by the infinite scroll
  const loadMoreLogs = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLogs(searchParams, nextPage);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-main mb-6">Log Explorer</h2>
      
      <div className="bg-secondary-dark p-6 rounded-xl shadow-md mb-8">
        <SearchForm 
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          handleSearch={handleSearch}
        />
      </div>
      
      <TableComponent 
        logs={logs} 
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMoreLogs}
      />
    </div>
  );
}

export default Logs;