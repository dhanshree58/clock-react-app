import { useEffect, useMemo, useState } from 'react';

const timeZones = [
  { label: 'Local Time', tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { label: 'UTC', tz: 'UTC' },
  { label: 'New York', tz: 'America/New_York' },
  { label: 'London', tz: 'Europe/London' },
  { label: 'Tokyo', tz: 'Asia/Tokyo' },
  { label: 'Sydney', tz: 'Australia/Sydney' },
];

const numberToTwoDigits = (value) => String(value).padStart(2, '0');

function AnalogClock({ date }) {
  const secondsRatio = date.getSeconds() / 60;
  const minutesRatio = (date.getMinutes() + secondsRatio) / 60;
  const hoursRatio = ((date.getHours() % 12) + minutesRatio) / 12;

  return (
    <div className="analog-clock">
      <div className="dial">
        <div className="hand hour" style={{ transform: `translate(-50%, -100%) rotate(${hoursRatio * 360}deg)` }} />
        <div className="hand minute" style={{ transform: `translate(-50%, -100%) rotate(${minutesRatio * 360}deg)` }} />
        <div className="hand second" style={{ transform: `translate(-50%, -100%) rotate(${secondsRatio * 360}deg)` }} />
      </div>
    </div>
  );
}

function DigitalClock({ date, format24 }) {
  const hours = format24 ? date.getHours() : ((date.getHours() + 11) % 12) + 1;
  const period = date.getHours() >= 12 ? 'PM' : 'AM';
  return (
    <div className="digital-clock">
      <div className="time">
        {numberToTwoDigits(hours)}:{numberToTwoDigits(date.getMinutes())}:{numberToTwoDigits(date.getSeconds())}
      </div>
      {!format24 && <div className="period">{period}</div>}
    </div>
  );
}

function App() {
  const [now, setNow] = useState(new Date());
  const [activeZone, setActiveZone] = useState(timeZones[0].tz);
  const [format24, setFormat24] = useState(true);
  const [alarmTime, setAlarmTime] = useState('');
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [alarmMessage, setAlarmMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedDate = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: activeZone,
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    const parts = formatter.formatToParts(now);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    const date = new Date(now.toLocaleString('en-US', { timeZone: activeZone }));
    date.setHours(parseInt(values.hour, 10));
    date.setMinutes(parseInt(values.minute, 10));
    date.setSeconds(parseInt(values.second, 10));
    return date;
  }, [activeZone, now]);

  useEffect(() => {
    if (!alarmEnabled || !alarmTime) {
      setAlarmMessage('');
      return;
    }
    const [alarmHour, alarmMinute] = alarmTime.split(':').map(Number);
    if (
      alarmHour === selectedDate.getHours() &&
      alarmMinute === selectedDate.getMinutes() &&
      selectedDate.getSeconds() === 0
    ) {
      setAlarmMessage('Alarm! Time to act.');
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
      audio.play().catch(() => null);
    }
  }, [selectedDate, alarmEnabled, alarmTime]);

  return (
    <div className="app-shell">
      <header>
        <h1>Clock Dashboard</h1>
        <p>Analog + digital clocks, timezone switcher, 12/24-hour mode, alarm preview.</p>
      </header>

      <section className="controls">
        <div className="control-group">
          <label htmlFor="timezone">Time zone</label>
          <select id="timezone" value={activeZone} onChange={(e) => setActiveZone(e.target.value)}>
            {timeZones.map((zone) => (
              <option key={zone.tz} value={zone.tz}>
                {zone.label}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group toggle-row">
          <label htmlFor="format24">24-hour</label>
          <input id="format24" type="checkbox" checked={format24} onChange={(e) => setFormat24(e.target.checked)} />
        </div>

        <div className="control-group">
          <label htmlFor="alarm">Set alarm</label>
          <input
            id="alarm"
            type="time"
            value={alarmTime}
            onChange={(e) => setAlarmTime(e.target.value)}
          />
          <button type="button" className="button" onClick={() => setAlarmEnabled((enabled) => !enabled)}>
            {alarmEnabled ? 'Disable alarm' : 'Enable alarm'}
          </button>
        </div>
      </section>

      <section className="clock-grid">
        <div className="clock-card">
          <h2>Analog clock</h2>
          <AnalogClock date={selectedDate} />
        </div>

        <div className="clock-card">
          <h2>Digital clock</h2>
          <DigitalClock date={selectedDate} format24={format24} />
          <div className="clock-note">Zone: {activeZone}</div>
        </div>
      </section>

      <section className="alarm-panel">
        <div>
          <strong>Alarm:</strong> {alarmTime || 'Not set'}
        </div>
        <div>Status: {alarmEnabled ? 'Enabled' : 'Disabled'}</div>
        {alarmMessage && <div className="alarm-message">{alarmMessage}</div>}
      </section>
    </div>
  );
}

export default App;
