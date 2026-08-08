import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { GlassButton } from './GlassButton';

export function GlassTable({
  columns = [],
  data = [],
  loading = false,
  pagination,
  onPageChange,
  emptyMessage = 'No records found',
  className = '',
}) {
  return (
    <div className={`w-full overflow-hidden rounded-2xl glass border border-white/15 ${className}`}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-gray-200">
          <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 font-semibold select-none">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-5 py-3.5 ${col.className || ''}`}
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-normal">
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <div className="h-4 bg-white/10 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row._id || row.id || rowIdx}
                  className="hover:bg-white/5 transition-colors duration-150 group"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-5 py-4 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 bg-white/5 border-t border-white/10 text-xs text-gray-400">
          <div>
            Showing <span className="font-semibold text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-semibold text-white">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-semibold text-white">{pagination.total}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <GlassButton
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              icon={ChevronLeftIcon}
            >
              Prev
            </GlassButton>

            <span className="px-3 py-1 glass rounded-lg text-white font-medium">
              {pagination.page} / {pagination.pages}
            </span>

            <GlassButton
              size="sm"
              variant="outline"
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
              icon={ChevronRightIcon}
            >
              Next
            </GlassButton>
          </div>
        </div>
      )}
    </div>
  );
}
