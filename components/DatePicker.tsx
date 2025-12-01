
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  min?: string;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, name, value, onChange, min, className }) => {
  const [show, setShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to parse YYYY-MM-DD string as LOCAL date to avoid UTC timezone shifts
  const parseDate = (dateStr: string) => {
    if (!dateStr) {
      // Return current date in local timezone
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        // Ensure we create a date in local timezone, not UTC
        return new Date(y, m - 1, d);
    }
    // Fallback: parse the date string but ensure local timezone
    const parsed = new Date(dateStr);
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  };

  // Always initialize with current date or parsed value - never allow invalid dates
  const getCurrentDate = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  const initialDate = value ? parseDate(value) : getCurrentDate();
  const [viewDate, setViewDate] = useState(initialDate);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync view if value changes externally
  useEffect(() => {
    if (value) {
      setViewDate(parseDate(value));
    }
  }, [value]);

  const getDaysArray = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    
    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDayClick = (d: Date) => {
    const dStr = formatDate(d);
    onChange(name, dStr);
    setShow(false);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const isSelected = (d: Date) => {
    if (!value) return false;
    const sel = parseDate(value);
    return d.getDate() === sel.getDate() && 
           d.getMonth() === sel.getMonth() && 
           d.getFullYear() === sel.getFullYear();
  };

  const isDisabled = (d: Date) => {
    if (!min) return false;
    // Compare as strings YYYY-MM-DD to be timezone safe
    const currentStr = formatDate(d);
    return currentStr < min;
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      <div 
        className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 cursor-pointer hover:border-urbane-gold transition-all group shadow-sm"
        onClick={() => setShow(!show)}
      >
        <span className={`${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
          {value ? parseDate(value).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Date'}
        </span>
        <CalendarIcon size={18} className="text-gray-400 group-hover:text-urbane-gold transition-colors" />
      </div>

      {show && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white shadow-2xl border border-gray-100 z-50 animate-fade-in rounded-lg overflow-hidden">
          <div className="bg-urbane-mist p-4 flex justify-between items-center border-b border-gray-200">
            <button type="button" onClick={(e) => { e.stopPropagation(); changeMonth(-1); }} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-600"><ChevronLeft size={18} /></button>
            <span className="font-serif font-bold text-gray-800 text-lg">{months[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); changeMonth(1); }} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-600"><ChevronRight size={18} /></button>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-center text-xs text-gray-400 font-bold uppercase">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysArray().map((d, i) => {
                if (!d) return <div key={i} />;
                const disabled = isDisabled(d);
                const selected = isSelected(d);
                const isToday = !disabled && d.getDate() === new Date().getDate() && d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
                
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={(e) => { e.stopPropagation(); handleDayClick(d); }}
                    className={`
                      h-8 w-8 text-sm flex items-center justify-center rounded-full transition-all duration-200
                      ${selected ? 'bg-urbane-gold text-white shadow-md scale-105' : ''}
                      ${!selected && !disabled ? 'hover:bg-gray-100 text-gray-700 hover:text-urbane-green' : ''}
                      ${disabled ? 'text-gray-300 cursor-not-allowed' : ''}
                      ${!selected && isToday ? 'border border-urbane-gold text-urbane-gold font-bold' : ''}
                    `}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
