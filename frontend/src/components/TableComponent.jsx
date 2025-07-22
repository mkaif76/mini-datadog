import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

// A mapping to get colors and text styles for different log levels
const levelStyleMap = {
  error: 'text-red-400',
  warn: 'text-yellow-400',
  info: 'text-blue-400',
  debug: 'text-green-400',
};

function TableComponent({ logs, isLoading, hasMore, loadMore }) {
  const observer = useRef();
  
  const lastLogElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMore]);

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center p-8 min-h-[40vh]">
        <div className="w-12 h-12 border-4 border-accent-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-secondary-dark rounded-lg">
      <table className="min-w-full divide-y divide-border-dark">
        <thead className="bg-primary-dark">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Service</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Level</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Message</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Timestamp</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Request ID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-dark">
          {logs.map((log, index) => {
            const levelStyle = levelStyleMap[log.level] || 'text-text-secondary';
            const isLastElement = logs.length === index + 1;
            
            return (
              <motion.tr
                ref={isLastElement ? lastLogElementRef : null}
                key={index}
                className="hover:bg-primary-dark/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{log.service || 'N/A'}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${levelStyle}`}>{log.level || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main truncate max-w-md">{log.message}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary font-mono">{new Date(log['@timestamp']).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary font-mono">{log.metadata?.requestId || 'N/A'}</td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
      {isLoading && logs.length > 0 && (
         <div className="flex justify-center items-center p-4">
            <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin"></div>
         </div>
      )}
      {!isLoading && !hasMore && logs.length > 0 && (
        <div className="text-center p-4 text-sm text-text-secondary">
          You've reached the end of the logs.
        </div>
      )}
    </div>
  );
}

// FIX: We now directly export the main component.
export default TableComponent;