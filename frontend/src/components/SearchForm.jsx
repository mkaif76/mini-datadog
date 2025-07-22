import React from 'react';
import { Search, Filter, X } from 'lucide-react';

function SearchForm({ searchParams, setSearchParams, handleSearch }) {

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prevParams => ({
      ...prevParams,
      [name]: value,
    }));
  };

  const handleClear = () => {
    // UPDATED: Clear the new date fields as well
    const clearedParams = { q: '', service: '', level: '', requestId: '', startTime: '', endTime: '' };
    setSearchParams(clearedParams);
    handleSearch(clearedParams);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchParams);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Main text search bar */}
      <div className="relative">
        <label htmlFor="search-q" className="sr-only">Search</label>
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          name="q"
          id="search-q"
          placeholder="Search by message content..."
          value={searchParams.q}
          onChange={handleInputChange}
          className="w-full bg-primary-dark text-text-main rounded-md pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-purple"
        />
      </div>

      {/* UPDATED: Changed grid layout to fit more fields responsively */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label htmlFor="filter-service" className="block text-sm font-medium text-text-secondary mb-1">Service</label>
          <input
            type="text"
            name="service"
            id="filter-service"
            placeholder="e.g., payment-service"
            value={searchParams.service}
            onChange={handleInputChange}
            className="w-full bg-primary-dark text-text-main rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-purple"
          />
        </div>
        <div>
          <label htmlFor="filter-level" className="block text-sm font-medium text-text-secondary mb-1">Level</label>
          <input
            type="text"
            name="level"
            id="filter-level"
            placeholder="e.g., error"
            value={searchParams.level}
            onChange={handleInputChange}
            className="w-full bg-primary-dark text-text-main rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-purple"
          />
        </div>
        <div>
          <label htmlFor="filter-requestId" className="block text-sm font-medium text-text-secondary mb-1">Request ID</label>
          <input
            type="text"
            name="requestId"
            id="filter-requestId"
            placeholder="e.g., xyz-123"
            value={searchParams.requestId}
            onChange={handleInputChange}
            className="w-full bg-primary-dark text-text-main rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-purple"
          />
        </div>
        {/* NEW: Start Time input */}
        <div>
          <label htmlFor="filter-startTime" className="block text-sm font-medium text-text-secondary mb-1">Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            id="filter-startTime"
            value={searchParams.startTime}
            onChange={handleInputChange}
            className="w-full bg-primary-dark text-text-main rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-purple [color-scheme:dark]"
          />
        </div>
        {/* NEW: End Time input */}
        <div>
          <label htmlFor="filter-endTime" className="block text-sm font-medium text-text-secondary mb-1">End Time</label>
          <input
            type="datetime-local"
            name="endTime"
            id="filter-endTime"
            value={searchParams.endTime}
            onChange={handleInputChange}
            className="w-full bg-primary-dark text-text-main rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-purple [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button type="button" onClick={handleClear} className="px-4 py-2 rounded-md text-text-secondary hover:bg-border-dark transition-colors flex items-center">
          <X size={16} className="mr-2" />
          Clear
        </button>
        <button type="submit" className="px-6 py-2 rounded-md bg-accent-purple text-white font-semibold hover:bg-accent-hover transition-colors flex items-center">
          <Filter size={16} className="mr-2" />
          Apply Filters
        </button>
      </div>
    </form>
  );
}

export default SearchForm;