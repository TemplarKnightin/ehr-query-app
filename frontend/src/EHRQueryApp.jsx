import { useState } from 'react';
import QueryBuilder from './QueryBuilder';
import EHRFlattener from './EHRFlattener';
import ehrData from './mockEHRs.json';
import models from '../models/models.json';

export default function EHRQueryApp() {
  const [filters, setFilters] = useState([]);
  const [logic, setLogic] = useState('AND');
  const [results, setResults] = useState([]);

  const getAllLeafFields = (node, fields = []) => {
    if (node.path) fields.push(node.name);
    if (node.children) {
      node.children.forEach((child) => getAllLeafFields(child, fields));
    }
    return fields;
  };

  const allFields = getAllLeafFields(models);

  const updateFilter = (index, field, value) => {
    const updated = [...filters];
    updated[index] = { ...updated[index], [field]: value };
    setFilters(updated);
  };

  const addFilter = () => {
    setFilters([...filters, { key: '', value: '' }]);
  };

  const removeFilter = (index) => {
    const updated = filters.filter((_, i) => i !== index);
    setFilters(updated);
  };

  const handleQuery = () => {
    const filterObj = {};
    filters.forEach(({ key, value }) => {
      if (!key || value === '') return;
      if (typeof value === 'object' && ('start' in value || 'end' in value)) {
        filterObj[key] = {};
        if (value.start) filterObj[key].start = value.start;
        if (value.end) filterObj[key].end = value.end;
      } else {
        filterObj[key] = value;
      }
    });

    const query = new QueryBuilder().buildQuery(filterObj);
    const filtered = ehrData.filter((ehr) => {
      try {
        const checks = Object.entries(query).map(([path, val]) => {
          const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
          let curr = ehr;
          for (const k of keys) curr = curr?.[k];
          if (typeof val === 'object') {
            if ('$gte' in val && curr < val['$gte']) return false;
            if ('$lte' in val && curr > val['$lte']) return false;
            return true;
          }
          return curr === val;
        });
        return logic === 'AND' ? checks.every(Boolean) : checks.some(Boolean);
      } catch {
        return false;
      }
    });

    const flatResults = new EHRFlattener().flattenEHRS(filtered);
    setResults(flatResults);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">EHR Dynamic Query Builder</h1>

      <div className="flex gap-4 items-center">
        <label className="font-semibold">Query Logic:</label>
        <select
          value={logic}
          onChange={(e) => setLogic(e.target.value)}
          className="border px-2 py-1"
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      </div>

      {filters.map((filter, index) => (
        <div key={index} className="flex gap-4 items-center">
          <select
            value={filter.key}
            onChange={(e) => updateFilter(index, 'key', e.target.value)}
            className="border p-1 w-1/3"
          >
            <option value="">Select field</option>
            {allFields.map((field) => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>

          {filter.key?.includes('date') || filter.key?.includes('age') ? (
            <>
              <input
                type="text"
                placeholder="Start"
                className="border p-1 w-1/4"
                onChange={(e) => {
                  const value = { ...filter.value, start: e.target.value };
                  updateFilter(index, 'value', value);
                }}
              />
              <input
                type="text"
                placeholder="End"
                className="border p-1 w-1/4"
                onChange={(e) => {
                  const value = { ...filter.value, end: e.target.value };
                  updateFilter(index, 'value', value);
                }}
              />
            </>
          ) : (
            <input
              type="text"
              value={filter.value || ''}
              onChange={(e) => updateFilter(index, 'value', e.target.value)}
              className="border p-1 w-1/2"
            />
          )}

          <button
            onClick={() => removeFilter(index)}
            className="text-red-500 font-bold"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={addFilter}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        + Add Filter
      </button>

      <button
        onClick={handleQuery}
        className="bg-blue-600 text-white px-4 py-2 rounded ml-4"
      >
        Run Query
      </button>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Results:</h2>
        <pre className="bg-gray-100 p-2 mt-2 text-sm overflow-auto max-h-[400px]">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    </div>
  );
}
