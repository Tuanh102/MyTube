// src/components/ClockWidget.tsx
import React, { useEffect, useState } from 'react';

// A simple live clock component. Updates every second.
// Uses 24‑hour format by default (can be changed via props).
export default function ClockWidget({ format24 = true }: { format24?: boolean }) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const options: Intl.DateTimeFormatOptions = format24
    ? { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
    : { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true };

  const formatted = time.toLocaleTimeString('vi-VN', options);

  return (
    <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400 animate-pulse">
      {formatted}
    </span>
  );
}
