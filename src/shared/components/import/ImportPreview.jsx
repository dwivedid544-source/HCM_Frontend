import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Columns, Database } from 'lucide-react';
import ErrorTable from './ErrorTable';

const ImportPreview = ({ data }) => {
  if (!data) return null;

  const { totalRows, validRows, invalidRows, errors, importedColumns, ignoredColumns, previewData } = data;

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Rows</h4>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalRows}</p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800/50">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h4 className="text-sm font-medium text-green-900 dark:text-green-300">Valid Rows</h4>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{validRows}</p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/50">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h4 className="text-sm font-medium text-red-900 dark:text-red-300">Invalid Rows</h4>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{invalidRows}</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800/50">
          <div className="flex items-center gap-3 mb-2">
            <Columns className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h4 className="text-sm font-medium text-orange-900 dark:text-orange-300">Ignored Columns</h4>
          </div>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{ignoredColumns.length}</p>
        </div>
      </div>

      {/* Column Info */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Column Mapping Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">Imported Columns ({importedColumns.length})</h5>
            <div className="flex flex-wrap gap-2">
              {importedColumns.map((col, idx) => (
                <span key={idx} className="px-2 py-1 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-sm text-gray-700 dark:text-gray-300">
                  {col}
                </span>
              ))}
            </div>
          </div>
          {ignoredColumns.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2">Ignored Columns ({ignoredColumns.length})</h5>
              <div className="flex flex-wrap gap-2">
                {ignoredColumns.map((col, idx) => (
                  <span key={idx} className="px-2 py-1 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-sm text-gray-500 dark:text-gray-400 line-through">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Errors */}
      {errors && errors.length > 0 && (
        <ErrorTable errors={errors} />
      )}

    </div>
  );
};

export default ImportPreview;
