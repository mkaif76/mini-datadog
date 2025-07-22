import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// A mapping to get colors for different log levels
const levelColorMap = {
  error: 'bg-red-500',
  warn: 'bg-yellow-500',
  info: 'bg-blue-500',
  debug: 'bg-green-500',
};

// Component for a single, expandable log row
function LogRow({ log }) {
  const [isExpanded, setExpanded] = useState(false);
  const levelColor = levelColorMap[log.level] || 'bg-gray-500';

  return (
    <div className="border-b border-border-dark">
      <div 
        className="flex items-center p-3 cursor-pointer hover:bg-secondary-dark/50"
        onClick={() => setExpanded(!isExpanded)}
      >
        <div className="mr-3">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        <div className={`w-2 h-2 rounded-full mr-3 ${levelColor}`}></div>
        <div className="font-mono text-sm text-text-secondary mr-4">
          {new Date(log['@timestamp']).toLocaleTimeString()}
        </div>
        <div className="flex-1 text-sm text-text-main truncate">
          {log.message}
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 bg-primary-dark">
          <pre className="text-xs text-text-secondary whitespace-pre-wrap">
            {JSON.stringify(log, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}


// Main component to display the list of logs
function LogList({ logs, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center p-8">
        <p className="text-text-secondary">Loading logs...</p>
        {/* We can add a cool spinner animation here later */}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-text-secondary">No logs found for the selected criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary-dark rounded-lg overflow-hidden">
      {logs.map((log, index) => (
        // Using index as a key is okay here since the list is read-only and stable
        <LogRow key={index} log={log} />
      ))}
    </div>
  );
}

export default LogList;