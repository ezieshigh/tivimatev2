import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface CalendarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  minDaysFromNow?: number; // Minimum days in future (e.g., 3 for 3-day response)
}

const CalendarPopup: React.FC<CalendarPopupProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onDateChange,
  minDaysFromNow = 3
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate the minimum selectable date
  const minDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + minDaysFromNow);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [minDaysFromNow]);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    if (date >= minDate) {
      onDateChange(date);
      onClose();
    }
  };

  const isDateDisabled = (date: Date) => {
    return date < minDate;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // Check if prev month navigation should be disabled
  const isPrevMonthDisabled = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const lastDayOfPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
    return lastDayOfPrevMonth < minDate;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="calendar-popup-overlay" onClick={onClose}>
          <motion.div
            className="calendar-popup-container"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Glitch border effect */}
            <div className="calendar-popup-border" />

            {/* Header */}
            <div className="calendar-popup-header">
              <div className="calendar-popup-title">
                <Calendar size={18} />
                <span>Select Callout Date</span>
              </div>
              <button className="calendar-popup-close" onClick={onClose}>
                <X size={16} />
              </button>
            </div>

            {/* Month navigation */}
            <div className="calendar-popup-nav">
              <button 
                className="calendar-nav-btn"
                onClick={handlePrevMonth}
                disabled={isPrevMonthDisabled()}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="calendar-current-month">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button className="calendar-nav-btn" onClick={handleNextMonth}>
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day names header */}
            <div className="calendar-day-names">
              {dayNames.map(day => (
                <span key={day} className="calendar-day-name">{day}</span>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="calendar-grid">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <span key={`empty-${index}`} className="calendar-day empty" />;
                }

                const disabled = isDateDisabled(date);
                const selected = isDateSelected(date);
                const today = isToday(date);

                return (
                  <button
                    key={date.toISOString()}
                    className={`calendar-day ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''} ${today ? 'today' : ''}`}
                    onClick={() => handleDateSelect(date)}
                    disabled={disabled}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Footer note */}
            <div className="calendar-popup-footer">
              <p className="calendar-note">
                ⚡ Minimum {minDaysFromNow}-day notice required • London area only
              </p>
            </div>

            {/* Scanline effect */}
            <div className="calendar-scanline" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CalendarPopup;

