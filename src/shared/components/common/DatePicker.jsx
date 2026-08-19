import React, { useRef, useState } from 'react';
import { useDateFormat } from '../../../hooks/useDateFormat';
import { Calendar } from 'lucide-react';

const DatePicker = ({ value, onChange, className = '', required, readOnly, name, defaultValue = '' }) => {
  const { formatDate } = useDateFormat();
  const inputRef = useRef(null);
  const [localValue, setLocalValue] = useState(defaultValue);
  
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : localValue;

  // Ensure the date is in YYYY-MM-DD format for the native input without timezone shift
  let dateVal = '';
  if (activeValue) {
    if (typeof activeValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(activeValue.slice(0, 10))) {
      dateVal = activeValue.slice(0, 10);
    } else {
      try {
        const d = new Date(activeValue);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          dateVal = `${yyyy}-${mm}-${dd}`;
        }
      } catch (e) {
        // ignore invalid dates
      }
    }
  }

  // Format the date using our global format hook
  const displayValue = dateVal ? formatDate(dateVal) : '';

  const handleChange = (e) => {
    if (!isControlled) {
      setLocalValue(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`relative flex items-center overflow-hidden ${className}`}>
      {/* Visible Formatted Text */}
      <span className={`pointer-events-none block w-full truncate ${!dateVal ? 'text-slate-400 font-normal' : ''}`}>
        {displayValue || 'Select date'}
      </span>
      
      {/* Calendar Icon */}
      <Calendar size={16} className="pointer-events-none text-slate-400 shrink-0 ml-2 opacity-70" />

      {/* Invisible Native Input */}
      <input
        ref={inputRef}
        type="date"
        name={name}
        value={dateVal}
        onChange={handleChange}
        onClick={(e) => {
          if (!readOnly) {
            try {
              e.target.showPicker();
            } catch (err) {}
          }
        }}
        required={required}
        readOnly={readOnly}
        disabled={readOnly}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        style={{ pointerEvents: readOnly ? 'none' : 'auto' }}
      />
    </div>
  );
};

export default DatePicker;
