import React, { useState, useEffect, useCallback, useRef } from 'react';
import SearchForm from '../components/SearchForm';
import TableComponent from '../components/TableComponent';
// NEW: Import the refresh icon
import { RefreshCw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    q: '', service: '', level: '', requestId: '', startTime: '', endTime: '',
  });
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
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
    
    activeParams.page = pageNum;
    activeParams.limit = 50;
    
    const queryString = new URLSearchParams(activeParams).toString();
    
    try {
      const response = await fetch(`${API_BASE_URL}/search?${queryString}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      setLogs(prevLogs => pageNum === 1 ? data.logs : [...prevLogs, ...data.logs]);
      setHasMore(data.hasMore);

    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialLoad.current) {
        fetchLogs(searchParams, 1);
        initialLoad.current = false;
    }
  }, [fetchLogs, searchParams]);

  const handleSearch = (params) => {
    setSearchParams(params);
    setPage(1);
    fetchLogs(params, 1);
  };

  const loadMoreLogs = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLogs(searchParams, nextPage);
  };

  return (
    <div>
      {/* NEW: Added a flex container for the title and the refresh button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-main">Log Explorer</h2>
        <button
          onClick={() => handleSearch(searchParams)}
          disabled={isLoading}
          className="flex items-center px-4 py-2 rounded-md text-text-secondary bg-secondary-dark hover:bg-border-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} className={`mr-2 ${isLoading && logs.length === 0 ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
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