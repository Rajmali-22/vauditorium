import React, { useMemo, useState } from 'react';
import {
  CalendarDays, LayoutDashboard, ClipboardList,
  Lightbulb, Moon, Sun, Menu, X, ChevronLeft, ChevronRight, Plus, Search, Bell,
  ArrowUpRight, Clock3, MapPin, Users, FileText, Upload, Check, AlertCircle,
  Video, Trophy, CalendarCheck, MoreHorizontal, Send, Filter, ExternalLink,
  Building2, ShieldCheck, CircleHelp, Download,
  MessageSquareText, CheckCircle2, XCircle, Eye, Paperclip, Sparkles,
} from 'lucide-react';
import './vauditorium.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const INSTITUTES = ['VIT','VSIT','VP','VIIE','VMMS'];

interface EventItem {
  id: number | string;
  date: string;
  title: string;
  institute: string;
  type: string;
  time: string;
  owner: string;
  attendees: number;
  status: string;
  description: string;
  equipment: string;
  stream: boolean;
  result?: string;
}

interface RequestItem {
  id: string;
  title: string;
  institute: string;
  date: string;
  submitted: string;
  applicant: string;
  status: string;
  people: number;
  docs: string[];
  purpose: string;
  equipment: string;
  contact: string;
  email: string;
  notes: string;
  attendees?: number;
}

const initialEvents: EventItem[] = [
  { id: 1, date: '2026-10-20', title: 'Annual Research Symposium', institute: 'VIT', type: 'Academic', time: '09:30 AM – 04:00 PM', owner: 'Research Cell', attendees: 280, status: 'Booked', description: 'A full-day showcase of student and faculty research, presentations and poster sessions.', equipment: 'Projector, microphones, recording', stream: true },
  { id: 2, date: '2026-10-22', title: 'Industry Connect: Future of AI', institute: 'VSIT', type: 'Talk', time: '02:00 PM – 05:00 PM', owner: 'IT Forum', attendees: 180, status: 'Booked', description: 'Guest talks and a panel discussion with industry professionals.', equipment: 'Projector, 4 microphones', stream: true },
  { id: 3, date: '2026-10-25', title: 'Inter-college Hackathon', institute: 'VIIE', type: 'Competition', time: '08:00 AM – 08:00 PM', owner: 'Innovation Council', attendees: 350, status: 'Booked', description: 'A collaborative build event bringing together teams from across institutes.', equipment: 'Wi-Fi, projector, sound system', stream: false },
  { id: 4, date: '2026-10-28', title: 'Scholarship Felicitation', institute: 'VMMS', type: 'Ceremony', time: '10:00 AM – 01:00 PM', owner: 'Student Affairs', attendees: 220, status: 'Booked', description: 'Recognising scholarship recipients and celebrating academic achievement.', equipment: 'Stage, microphones, lectern', stream: true },
  { id: 5, date: '2026-11-03', title: 'Design Thinking Workshop', institute: 'VP', type: 'Workshop', time: '10:00 AM – 03:00 PM', owner: 'Design Club', attendees: 120, status: 'Booked', description: 'A practical workshop on human-centred problem solving.', equipment: 'Projector, movable seating', stream: false },
  { id: 6, date: '2026-10-17', title: 'Welcome to VDT', institute: 'VIT', type: 'Induction', time: '10:00 AM – 12:30 PM', owner: 'Central Student Council', attendees: 400, status: 'Past event', description: 'An introduction to campus life, student services and institute communities.', equipment: 'Full AV setup', stream: true, result: 'Event completed successfully' },
];

const initialRequests: RequestItem[] = [
  { id: 'VA-026', title: 'Inter-college Hackathon', institute: 'VIIE', date: '2026-10-25', submitted: '14 Oct 2026', applicant: 'Innovation Council', status: 'Under review', people: 350, docs: ['Permission letter.pdf','Event proposal.pdf'], purpose: 'A 12-hour collaborative hackathon for student teams across VDT institutes.', equipment: 'Projector, sound system, Wi-Fi access', contact: 'Aarav Mehta', email: 'innovation@viie.edu', notes: 'Please confirm additional power outlets for the team workstations.' },
  { id: 'VA-027', title: 'Leadership & Motivation Talk', institute: 'VSIT', date: '2026-10-30', submitted: '15 Oct 2026', applicant: 'Student Council', status: 'Documents requested', people: 240, docs: ['Event outline.pdf'], purpose: 'An invited speaker session for students and faculty.', equipment: 'Projector, 3 microphones, livestream', contact: 'Riya Shah', email: 'council@vsit.edu', notes: 'Please attach the signed institute permission letter.' },
  { id: 'VA-028', title: 'Alumni Networking Evening', institute: 'VIT', date: '2026-11-06', submitted: '16 Oct 2026', applicant: 'Alumni Relations Cell', status: 'Pending review', people: 300, docs: ['Alumni evening brief.pdf','Permission letter.pdf'], purpose: 'A networking evening connecting alumni, current students and faculty.', equipment: 'Stage, microphones, projector', contact: 'Dev Patel', email: 'alumni@vit.edu', notes: '' },
];

const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', opts);

const isoDate = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

function Brand() {
  return (
    <div className="brand">
      <span className="brand-word">VOSS</span>
      <span className="brand-square" />
      <span className="brand-divider" />
      <span className="product-name">VAuditorium</span>
    </div>
  );
}

function Status({ children }: { children: React.ReactNode }) {
  const s = String(children).toLowerCase();
  let cls = 'status';
  if (s.includes('approved') || s.includes('booked') || s.includes('completed')) cls += ' status-good';
  else if (s.includes('requested') || s.includes('review')) cls += ' status-warn';
  else if (s.includes('declined') || s.includes('rejected')) cls += ' status-danger';
  return <span className={cls}><span className="status-dot" />{children}</span>;
}

function PageTitle({ eyebrow, title, subtitle, actions }: { eyebrow: string; title: string; subtitle: string; actions?: React.ReactNode }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-square" /> {eyebrow}</div>
        <h1>{title}<span className="heading-period">.</span></h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  );
}

function Metric({ icon: Icon, label, value, note }: { icon: React.ElementType; label: string; value: string; note: string }) {
  return (
    <div className="panel metric-card">
      <div className="metric-top">
        <span className="metric-icon"><Icon size={17} /></span>
        <span className="metric-label">{label}</span>
      </div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-note">{note}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="panel empty-state">
      <span className="empty-icon"><Icon size={22} /></span>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span className="field-label">{label}{required && <i>*</i>}</span>
      {children}
      {hint && <span className="field-help">{hint}</span>}
    </label>
  );
}

function DetailInfo({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="detail-info">
      <span className="detail-info-icon"><Icon size={15} /></span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

interface BookingState {
  title: string;
  institute: string;
  date: string;
  purpose: string;
  equipment: string;
  contact: string;
  email: string;
  attendees: string;
  type: string;
  stream: boolean;
}

function BookingForm({
  booking, setBooking, onSubmit, onCancel, error, availableDate, compact = false,
}: {
  booking: BookingState;
  setBooking: React.Dispatch<React.SetStateAction<BookingState>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  error: string;
  availableDate: (date: string) => boolean;
  compact?: boolean;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const update = (key: keyof BookingState, value: string | boolean) =>
    setBooking(prev => ({ ...prev, [key]: value }));
  return (
    <form className={`booking-form ${compact ? 'booking-form-compact' : ''}`} onSubmit={onSubmit}>
      <div className="form-section-heading">
        <span className="form-step">01</span>
        <div><strong>Event information</strong><p>Tell us what you are planning.</p></div>
      </div>
      <div className="form-grid">
        <Field label="Event name" required>
          <input value={booking.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Annual research symposium" required maxLength={120} />
        </Field>
        <Field label="Institute / organisation" required>
          <select value={booking.institute} onChange={e => update('institute', e.target.value)} required>
            {INSTITUTES.map(i => <option key={i}>{i}</option>)}
          </select>
        </Field>
        <Field label="Event date" required>
          <input type="date" value={booking.date} min="2026-10-17" onChange={e => update('date', e.target.value)} required />
          <span className="field-help">
            {booking.date && !availableDate(booking.date)
              ? <span className="inline-error"><AlertCircle size={13} /> This date has a confirmed booking.</span>
              : 'Choose a date with no confirmed booking.'}
          </span>
        </Field>
        <Field label="Event type" required>
          <select value={booking.type} onChange={e => update('type', e.target.value)}>
            {['Academic','Talk','Ceremony','Workshop','Competition','Induction','Other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Purpose and event description" required>
          <textarea value={booking.purpose} onChange={e => update('purpose', e.target.value)} placeholder="Describe the event, audience and objectives..." rows={3} required maxLength={1200} />
        </Field>
        <Field label="Expected attendees">
          <input type="number" min="1" max="5000" value={booking.attendees} onChange={e => update('attendees', e.target.value)} placeholder="e.g. 250" />
        </Field>
        <Field label="Equipment &amp; other requirements">
          <textarea value={booking.equipment} onChange={e => update('equipment', e.target.value)} rows={2} placeholder="Projector, microphones, livestream..." />
        </Field>
      </div>
      <div className="form-section-heading">
        <span className="form-step">02</span>
        <div><strong>Responsible person</strong><p>Who should the approval team contact?</p></div>
      </div>
      <div className="form-grid form-grid-two">
        <Field label="Full name" required>
          <input value={booking.contact} onChange={e => update('contact', e.target.value)} placeholder="Person responsible" required maxLength={100} />
        </Field>
        <Field label="Email address" required>
          <input type="email" value={booking.email} onChange={e => update('email', e.target.value)} placeholder="name@institute.edu" required />
        </Field>
      </div>
      <div className="form-section-heading">
        <span className="form-step">03</span>
        <div><strong>Supporting documents</strong><p>Attach the institute permission letter and event documents.</p></div>
      </div>
      <label className="upload-zone">
        <input type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={e => setFiles(Array.from(e.target.files || []))} />
        <span className="upload-icon"><Upload size={18} /></span>
        <strong>{files.length ? `${files.length} file${files.length === 1 ? '' : 's'} selected` : 'Choose files to upload'}</strong>
        <span>{files.length ? files.map(f => f.name).join(', ') : 'PDF, DOC, DOCX or images · 10 MB per file (UI preview)'}</span>
        <span className="upload-browse">Browse files</span>
      </label>
      <div className="field-help upload-note"><AlertCircle size={13} /> Files are selected in your browser only. Secure upload will be enabled by the backend.</div>
      <label className="checkbox-field">
        <input type="checkbox" checked={booking.stream} onChange={e => update('stream', e.target.checked)} />
        <span className="fake-checkbox"><Check size={12} /></span>
        <span><strong>Request livestream / recording support</strong><small>Let the auditorium team know that online streaming is needed.</small></span>
      </label>
      <div className="approval-info">
        <ShieldCheck size={17} />
        <p><strong>What happens next?</strong> Your application will be reviewed by a VDT-level approver. They may approve it or request more documents. The date is confirmed only after approval.</p>
      </div>
      {error && <div className="form-error" role="alert"><AlertCircle size={15} />{error}</div>}
      <div className="form-actions">
        <button className="btn btn-outline" type="button" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" type="submit"><Send size={15} /> Submit application</button>
      </div>
    </form>
  );
}

export default function VAuditorium() {
  const now = new Date('2026-10-17T12:00:00');
  const [active, setActive] = useState('Calendar');
  const [role, setRole] = useState('Viewer');
  const [theme, setTheme] = useState('light');
  const [mobileNav, setMobileNav] = useState(false);
  const [month, setMonth] = useState(9);
  const [year, setYear] = useState(2026);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests);
  const [selectedDate, setSelectedDate] = useState('2026-10-20');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [query, setQuery] = useState('');
  const [instituteFilter, setInstituteFilter] = useState('All institutes');
  const [showBooking, setShowBooking] = useState(false);
  const [toast, setToast] = useState('');
  const [suggestions, setSuggestions] = useState([{ id: 1, text: 'Add a dedicated student club showcase day', category: 'Events', date: '12 Oct 2026', status: 'Under consideration' }]);
  const [suggestion, setSuggestion] = useState('');
  const [booking, setBooking] = useState<BookingState>({ title: '', institute: 'VIT', date: '', purpose: '', equipment: '', contact: '', email: '', attendees: '', type: 'Academic', stream: false });
  const [formError, setFormError] = useState('');

  const navItems: { name: string; icon: React.ElementType; group: string }[] =
    role === 'Viewer' ? [
      { name: 'Calendar', icon: CalendarDays, group: 'Explore' },
      { name: 'Past events', icon: Video, group: 'Explore' },
      { name: 'Outcomes', icon: Trophy, group: 'Explore' },
      { name: 'Suggestions', icon: Lightbulb, group: 'Community' },
    ] : role === 'Applier' ? [
      { name: 'Calendar', icon: CalendarDays, group: 'Workspace' },
      { name: 'My applications', icon: ClipboardList, group: 'Workspace' },
      { name: 'New booking', icon: Plus, group: 'Workspace' },
      { name: 'Suggestions', icon: Lightbulb, group: 'Community' },
    ] : [
      { name: 'Overview', icon: LayoutDashboard, group: 'Administration' },
      { name: 'Calendar', icon: CalendarDays, group: 'Administration' },
      { name: 'Applications', icon: ClipboardList, group: 'Administration' },
      { name: 'Suggestions', icon: Lightbulb, group: 'Community' },
    ];

  const allEvents = events.filter(e => e.status === 'Booked' || e.status === 'Past event');
  const visibleEvents = allEvents.filter(e =>
    (instituteFilter === 'All institutes' || e.institute === instituteFilter) &&
    `${e.title} ${e.institute} ${e.type}`.toLowerCase().includes(query.toLowerCase())
  );
  const selectedEvents = visibleEvents.filter(e => e.date === selectedDate);
  const pendingCount = requests.filter(r => r.status !== 'Approved' && r.status !== 'Declined').length;
  const monthDays = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const nullPad: (null)[] = Array.from({ length: firstDay }, () => null);
  const dayNums: number[] = Array.from({ length: monthDays }, (_, i) => i + 1);
  const days: (number | null)[] = (nullPad as (number | null)[]).concat(dayNums);
  // eventDates used for calendar markers
  const eventDates = useMemo(() => new Set(allEvents.map(e => e.date)), [events]);
  const changeMonth = (dir: number) => { const d = new Date(year, month + dir, 1); setMonth(d.getMonth()); setYear(d.getFullYear()); };
  const notify = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(''), 3200); };
  const go = (name: string) => { setActive(name); setMobileNav(false); setSelectedEvent(null); setSelectedRequest(null); if (name === 'New booking') setShowBooking(true); };

  const submitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking.title.trim() || !booking.date || !booking.purpose.trim() || !booking.contact.trim() || !booking.email.trim()) {
      setFormError('Complete all required fields before submitting.'); return;
    }
    if (events.some(ev => ev.date === booking.date && ev.status === 'Booked')) {
      setFormError('That date is already booked. Choose another date.'); return;
    }
    const newId = `VA-${String(29 + requests.length).padStart(3, '0')}`;
    const item: RequestItem = {
      id: newId, title: booking.title.trim(), institute: booking.institute,
      date: booking.date, purpose: booking.purpose, equipment: booking.equipment,
      contact: booking.contact, email: booking.email,
      attendees: Number(booking.attendees) || 0, people: Number(booking.attendees) || 0,
      status: 'Pending review', applicant: booking.contact, docs: [], submitted: '17 Oct 2026', notes: '',
    };
    setRequests(prev => [item, ...prev]);
    setBooking({ title: '', institute: 'VIT', date: '', purpose: '', equipment: '', contact: '', email: '', attendees: '', type: 'Academic', stream: false });
    setFormError(''); setShowBooking(false); setActive('My applications');
    notify('Booking application submitted for review.');
  };

  const requestAction = (id: string, action: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    if (action === 'Approved') {
      const req = requests.find(r => r.id === id);
      if (req && !events.some(e => e.date === req.date && e.status === 'Booked')) {
        setEvents(prev => [...prev, {
          id: Date.now(), date: req.date, title: req.title, institute: req.institute,
          type: 'Academic', status: 'Booked', owner: req.applicant || req.contact || 'Event team',
          time: 'Time to be confirmed', description: req.purpose || 'Approved auditorium event',
          attendees: req.people || req.attendees || 0, equipment: req.equipment, stream: false,
        }]);
      }
      notify('Application approved. Calendar updated in this demo.');
    } else {
      notify(`Application marked: ${action}.`);
    }
    setSelectedRequest(null);
  };

  const submitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;
    setSuggestions(prev => [{ id: Date.now(), text: suggestion.trim(), category: 'General', date: '17 Oct 2026', status: 'Under consideration' }, ...prev]);
    setSuggestion('');
    notify('Suggestion submitted. Thank you.');
  };

  const availableDate = (date: string) => !events.some(e => e.date === date && e.status === 'Booked');

  return (
    <div className={`app theme-${theme}`} data-theme={theme}>
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <Brand />
          <button className="icon-btn mobile-close" aria-label="Close menu" onClick={() => setMobileNav(false)}><X size={19} /></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="role-picker">
          <span className="role-avatar"><ShieldCheck size={16} /></span>
          <div className="role-picker-copy">
            <span className="role-picker-title">VDT Portal</span>
            <span className="role-picker-sub">Preview environment</span>
          </div>
          <select aria-label="Preview role" value={role} onChange={e => { setRole(e.target.value); setActive(e.target.value === 'Approver' ? 'Overview' : 'Calendar'); }}>
            <option>Viewer</option><option>Applier</option><option>Approver</option>
          </select>
        </div>
        {(['Explore','Workspace','Administration','Community'] as const).filter(g => navItems.some(n => n.group === g)).map(group => (
          <div className="nav-group" key={group}>
            <div className="nav-label">{group}</div>
            {navItems.filter(n => n.group === group).map(item => (
              <button key={item.name} className={`nav-item ${active === item.name ? 'active' : ''}`} onClick={() => go(item.name)}>
                <item.icon size={17} strokeWidth={1.8} />
                <span>{item.name}</span>
                {item.name === 'Applications' && pendingCount > 0 && <span className="nav-count">{pendingCount}</span>}
                {item.name === 'My applications' && <span className="nav-count">{requests.length}</span>}
              </button>
            ))}
          </div>
        ))}
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon"><CircleHelp size={17} /></span>
            <div>
              <strong>Need help?</strong>
              <p>Learn how auditorium bookings work.</p>
              <button onClick={() => notify('Contact the VDT portal administrator for booking support.')}>View help <ArrowUpRight size={13} /></button>
            </div>
          </div>
          <div className="user-row">
            <div className="user-avatar">{role === 'Viewer' ? 'GU' : role === 'Applier' ? 'AP' : 'VD'}</div>
            <div className="user-copy">
              <strong>{role === 'Viewer' ? 'Guest viewer' : role === 'Applier' ? 'Applicant preview' : 'VDT approver'}</strong>
              <span>{role} access</span>
            </div>
            <button className="icon-btn" aria-label="Account information" onClick={() => notify('Demo environment — account management is not connected.')}><MoreHorizontal size={18} /></button>
          </div>
        </div>
      </aside>
      {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn mobile-menu" aria-label="Open menu" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
            <span className="breadcrumb-muted">VDT Portal</span>
            <span className="crumb-slash">/</span>
            <span className="breadcrumb-current">{active}</span>
          </div>
          <div className="topbar-actions">
            <span className="environment-pill"><span />Demo environment</span>
            <button className="icon-btn theme-toggle" aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button className="icon-btn notification-btn" aria-label="Notifications" onClick={() => notify('You are all caught up.')}><Bell size={17} /><i /></button>
            <div className="topbar-avatar">{role === 'Viewer' ? 'G' : role === 'Applier' ? 'A' : 'V'}</div>
          </div>
        </header>
        <div className="page-wrap">
          {active === 'Calendar' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow"><span className="eyebrow-square" /> SHARED FACILITY <span className="eyebrow-separator">/</span> V-AUDITORIUM</div>
                  <h1>Auditorium calendar<span className="heading-period">.</span></h1>
                  <p className="page-subtitle">One shared space. Five institutes. Everything in sync.</p>
                </div>
                <div className="heading-actions">
                  {role === 'Applier' && <button className="btn btn-primary" onClick={() => setShowBooking(true)}><Plus size={16} /> New booking request</button>}
                </div>
              </div>
              <div className="notice-strip">
                <span className="notice-icon"><CalendarCheck size={17} /></span>
                <div><strong>Check availability before you apply.</strong><span>Only VDT-approved bookings appear on the public calendar.</span></div>
                <button className="text-action" onClick={() => { setRole('Applier'); setActive('New booking'); setShowBooking(true); }}>Request a date <ArrowUpRight size={14} /></button>
              </div>
              <div className="calendar-layout">
                <section className="panel calendar-panel">
                  <div className="panel-header calendar-header">
                    <div><h2>Schedule</h2><p>View auditorium availability by date</p></div>
                    <div className="calendar-controls">
                      <button className="icon-btn bordered" aria-label="Previous month" onClick={() => changeMonth(-1)}><ChevronLeft size={17} /></button>
                      <button className="month-label" onClick={() => { setMonth(9); setYear(2026); }}>{MONTHS[month]} {year}</button>
                      <button className="icon-btn bordered" aria-label="Next month" onClick={() => changeMonth(1)}><ChevronRight size={17} /></button>
                      <button className="today-btn" onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()); setSelectedDate(isoDate(now.getFullYear(), now.getMonth(), now.getDate())); }}>Today</button>
                    </div>
                  </div>
                  <div className="calendar-legend">
                    <span><i className="legend-dot booked" />Booked</span>
                    <span><i className="legend-dot selected" />Selected date</span>
                    <span><i className="legend-dot available" />Available</span>
                  </div>
                  <div className="calendar-grid">
                    <div className="weekday-row">{['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => <span key={d}>{d}</span>)}</div>
                    <div className="days-grid">
                      {days.map((d, i) => {
                        if (d === null) return <div className="day-empty" key={`empty-${i}`} />;
                        const date = isoDate(year, month, d);
                        const items = allEvents.filter(e => e.date === date);
                        const isSelected = selectedDate === date;
                        const isToday = date === isoDate(now.getFullYear(), now.getMonth(), now.getDate());
                        return (
                          <button key={date} className={`day-cell ${isSelected ? 'day-selected' : ''} ${isToday ? 'day-today' : ''} ${items.length ? 'has-events' : ''}`} onClick={() => setSelectedDate(date)} aria-label={`${fmtDate(date)}, ${items.length ? String(items.length) + ' event(s)' : 'no events'}`}>
                            <span className="day-number">{d}</span>
                            {items.length > 0 && <span className="day-event-markers">{items.slice(0, 2).map((e, j) => <i key={String(e.id)} className={`event-marker marker-${j}`} />)}</span>}
                            {items.length > 0 && <span className="day-event-count">{items.length} {items.length === 1 ? 'event' : 'events'}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="calendar-footer">
                    <span><span className="footer-live-dot" /> Schedule updates when an application is approved</span>
                    <button className="text-action" onClick={() => notify('Calendar export will be available after backend integration.')}><Download size={14} /> Export calendar</button>
                  </div>
                </section>
                <section className="panel selected-day-panel">
                  <div className="panel-header selected-day-head">
                    <div>
                      <div className="eyebrow">SELECTED DATE</div>
                      <h2>{fmtDate(selectedDate, { weekday: 'short', day: 'numeric', month: 'long' })}</h2>
                      <p>{selectedEvents.length ? `${selectedEvents.length} scheduled ${selectedEvents.length === 1 ? 'event' : 'events'}` : 'No confirmed events'}</p>
                    </div>
                    <span className={`date-status ${selectedEvents.length ? 'date-status-booked' : 'date-status-free'}`}><i />{selectedEvents.length ? 'Booked' : 'Available'}</span>
                  </div>
                  <div className="selected-events">
                    {selectedEvents.length ? selectedEvents.map(ev => (
                      <button className="event-card" key={String(ev.id)} onClick={() => setSelectedEvent(ev)}>
                        <div className="event-card-top"><span className="event-type">{ev.type}</span><span className="event-card-arrow"><ArrowUpRight size={15} /></span></div>
                        <h3>{ev.title}</h3>
                        <div className="event-card-meta">
                          <span><Clock3 size={13} />{ev.time}</span>
                          <span><Building2 size={13} />{ev.institute}</span>
                        </div>
                        <p>{ev.description}</p>
                        <div className="event-card-bottom">
                          <span><Users size={14} />{ev.attendees || '—'} attendees</span>
                          <Status>{ev.status}</Status>
                        </div>
                      </button>
                    )) : (
                      <div className="empty-date">
                        <div className="empty-icon"><CalendarDays size={22} /></div>
                        <strong>This date is open</strong>
                        <p>No confirmed booking on this date yet. Applications are subject to VDT approval.</p>
                        {role === 'Applier' && <button className="btn btn-primary btn-small" onClick={() => { setBooking(p => ({ ...p, date: selectedDate })); setShowBooking(true); }}><Plus size={14} /> Apply for this date</button>}
                        {role !== 'Applier' && <button className="btn btn-outline btn-small" onClick={() => notify('Switch to Applier in the role selector to preview the booking flow.')}>How to book <ArrowUpRight size={13} /></button>}
                      </div>
                    )}
                  </div>
                  <div className="day-panel-bottom">
                    <div className="mini-stat"><span className="mini-stat-icon"><CalendarDays size={15} /></span><div><strong>{monthDays}</strong><span>Days this month</span></div></div>
                    <div className="mini-stat"><span className="mini-stat-icon"><Building2 size={15} /></span><div><strong>05</strong><span>VDT institutes</span></div></div>
                  </div>
                </section>
              </div>
              <section className="below-calendar">
                <div className="section-heading">
                  <div><h2>Upcoming events</h2><p>Confirmed events across all VDT institutes</p></div>
                  <button className="text-action" onClick={() => setActive('Past events')}>View event archive <ArrowUpRight size={14} /></button>
                </div>
                <div className="toolbar">
                  <div className="search-field"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search events, institutes..." aria-label="Search events" /><kbd>⌘ K</kbd></div>
                  <div className="filter-field"><Filter size={15} /><select value={instituteFilter} onChange={e => setInstituteFilter(e.target.value)} aria-label="Filter by institute"><option>All institutes</option>{INSTITUTES.map(i => <option key={i}>{i}</option>)}</select></div>
                  <span className="results-count">{visibleEvents.length} events</span>
                </div>
                <div className="event-list">
                  {visibleEvents.filter(e => e.date >= isoDate(year, month, 1)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4).map(ev => (
                    <button className="event-row" key={String(ev.id)} onClick={() => setSelectedEvent(ev)}>
                      <div className="event-date-block">
                        <span>{fmtDate(ev.date, { month: 'short' }).toUpperCase()}</span>
                        <strong>{new Date(`${ev.date}T12:00:00`).getDate()}</strong>
                      </div>
                      <div className="event-row-content">
                        <div className="event-row-title"><h3>{ev.title}</h3><span className="event-type">{ev.type}</span></div>
                        <p>{ev.institute} <span>·</span> {ev.owner}</p>
                      </div>
                      <div className="event-row-time"><Clock3 size={14} />{ev.time}</div>
                      <ArrowUpRight className="row-arrow" size={17} />
                    </button>
                  ))}
                  {visibleEvents.filter(e => e.date >= isoDate(year, month, 1)).length === 0 && <div className="no-results">No events match these filters. Try another institute or search term.</div>}
                </div>
              </section>
            </>
          )}

          {active === 'Past events' && (
            <>
              <PageTitle eyebrow="EVENT ARCHIVE" title="Past events" subtitle="Revisit moments, talks and gatherings from V-Auditorium." />
              <div className="toolbar archive-toolbar">
                <div className="search-field"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search past events..." /></div>
                <div className="filter-field"><Filter size={15} /><select value={instituteFilter} onChange={e => setInstituteFilter(e.target.value)}><option>All institutes</option>{INSTITUTES.map(i => <option key={i}>{i}</option>)}</select></div>
              </div>
              <div className="archive-grid">
                {visibleEvents.filter(e => e.status === 'Past event').map(e => (
                  <div className="panel archive-card" key={String(e.id)}>
                    <div className="archive-art"><Video size={27} /><span>V-AUDITORIUM / ARCHIVE</span><span className="archive-art-date">{fmtDate(e.date, { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                    <div className="archive-card-body">
                      <div className="event-card-top"><span className="event-type">{e.type}</span><span className="institute-tag">{e.institute}</span></div>
                      <h3>{e.title}</h3>
                      <p>{e.description}</p>
                      <div className="archive-card-footer">
                        {e.stream ? <span className="stream-label"><Video size={14} /> Stream available</span> : <span className="muted-inline">No stream linked</span>}
                        <button className="text-action" onClick={() => setSelectedEvent(e)}>View details <ArrowUpRight size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {visibleEvents.filter(e => e.status === 'Past event').length === 0 && <EmptyState icon={Video} title="No past events found" body="Try changing your search or institute filter." />}
            </>
          )}

          {active === 'Outcomes' && (
            <>
              <PageTitle eyebrow="RESULTS &amp; RECOGNITION" title="Event outcomes" subtitle="Highlights, achievements and results from events hosted at V-Auditorium." />
              <div className="metric-grid">
                <Metric icon={Trophy} label="Published outcomes" value="01" note="Across VDT institutes" />
                <Metric icon={Users} label="Institutes represented" value="05" note="One shared community" />
                <Metric icon={Video} label="Recorded events" value="01" note="Streams available where linked" />
              </div>
              <div className="panel outcomes-panel">
                <div className="panel-header"><div><h2>Published results</h2><p>Official event outcomes shared by organisers</p></div><span className="subtle-count">01 RESULT</span></div>
                <div className="outcome-row">
                  <div className="outcome-icon"><Trophy size={20} /></div>
                  <div className="outcome-content">
                    <span className="eyebrow">17 OCT 2026 <span className="eyebrow-separator">/</span> VIT</span>
                    <h3>Welcome to VDT</h3>
                    <p>Event completed successfully. The archive entry is available for viewers.</p>
                    <span className="result-chip"><CheckCircle2 size={13} /> Published outcome</span>
                  </div>
                  <button className="btn btn-outline btn-small" onClick={() => { const ev = events.find(e => e.id === 6); if (ev) setSelectedEvent(ev); }}>View event <ArrowUpRight size={14} /></button>
                </div>
                <div className="empty-inline"><Sparkles size={16} /><span>More results will appear here as organisers publish outcomes.</span></div>
              </div>
            </>
          )}

          {active === 'Suggestions' && (
            <>
              <PageTitle eyebrow="COMMUNITY INPUT" title="Suggestion box" subtitle="Help improve how V-Auditorium serves the VDT community." />
              <div className="suggestion-layout">
                <section className="panel suggestion-form-panel">
                  <div className="panel-header"><div><h2>Share an idea</h2><p>Suggestions are reviewed by the portal team.</p></div><span className="suggestion-spark"><Lightbulb size={19} /></span></div>
                  <form onSubmit={submitSuggestion} className="form-stack">
                    <Field label="Your suggestion" required>
                      <textarea value={suggestion} onChange={e => setSuggestion(e.target.value)} required minLength={8} placeholder="What would make the auditorium or booking experience better?" rows={5} />
                    </Field>
                    <p className="field-help">Avoid including personal or confidential information.</p>
                    <button className="btn btn-primary" type="submit"><Send size={15} /> Submit suggestion</button>
                  </form>
                </section>
                <section className="suggestions-list-section">
                  <div className="section-heading"><div><h2>Community ideas</h2><p>{suggestions.length} suggestion{suggestions.length === 1 ? '' : 's'} in this demo</p></div></div>
                  {suggestions.map(s => (
                    <div className="panel suggestion-item" key={s.id}>
                      <div className="suggestion-item-top"><span className="event-type">{s.category}</span><Status>{s.status}</Status></div>
                      <p>{s.text}</p>
                      <span className="suggestion-date">Submitted {s.date}</span>
                    </div>
                  ))}
                </section>
              </div>
            </>
          )}

          {active === 'New booking' && (
            <>
              <PageTitle eyebrow="BOOKING WORKSPACE" title="New booking request" subtitle="Submit an auditorium booking application for VDT-level approval." />
              <BookingForm booking={booking} setBooking={setBooking} onSubmit={submitBooking} onCancel={() => setActive('Calendar')} error={formError} availableDate={availableDate} />
            </>
          )}

          {active === 'My applications' && (
            <>
              <PageTitle eyebrow="BOOKING WORKSPACE" title="My applications" subtitle="Track booking requests and respond to requests for more information." actions={<button className="btn btn-primary" onClick={() => setShowBooking(true)}><Plus size={15} /> New application</button>} />
              <div className="metric-grid">
                <Metric icon={ClipboardList} label="Applications" value={String(requests.length).padStart(2, '0')} note="Submitted in this demo" />
                <Metric icon={Clock3} label="In review" value={String(requests.filter(r => r.status !== 'Approved' && r.status !== 'Declined').length).padStart(2, '0')} note="Awaiting a decision" />
                <Metric icon={CheckCircle2} label="Approved" value={String(requests.filter(r => r.status === 'Approved').length).padStart(2, '0')} note="Confirmed bookings" />
              </div>
              <div className="panel table-panel">
                <div className="panel-header"><div><h2>Application history</h2><p>Updates from the VDT approval process</p></div><span className="subtle-count">{requests.length} RECORDS</span></div>
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>APPLICATION</th><th>REQUESTED DATE</th><th>SUBMITTED</th><th>STATUS</th><th /></tr></thead>
                    <tbody>
                      {requests.map(r => (
                        <tr key={r.id}>
                          <td><div className="table-title">{r.title}</div><span className="table-sub">{r.id} · {r.institute}</span></td>
                          <td>{fmtDate(r.date)}</td>
                          <td>{r.submitted || '17 Oct 2026'}</td>
                          <td><Status>{r.status}</Status></td>
                          <td><button className="icon-btn" aria-label={`View ${r.title}`} onClick={() => setSelectedRequest(r)}><ArrowUpRight size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {active === 'Overview' && (
            <>
              <PageTitle eyebrow="VDT ADMINISTRATION" title="Approval overview" subtitle="A clear view of auditorium requests and the shared schedule." actions={<button className="btn btn-primary" onClick={() => setActive('Applications')}>Review applications <ArrowUpRight size={15} /></button>} />
              <div className="metric-grid">
                <Metric icon={ClipboardList} label="Awaiting review" value={String(pendingCount).padStart(2, '0')} note="Applications need attention" />
                <Metric icon={CalendarCheck} label="Confirmed events" value={String(allEvents.filter(e => e.status === 'Booked').length).padStart(2, '0')} note="On the shared calendar" />
                <Metric icon={Building2} label="Institutes" value="05" note="Sharing one auditorium" />
                <Metric icon={Clock3} label="Next event" value="20 OCT" note="Annual Research Symposium" />
              </div>
              <div className="overview-columns">
                <div className="panel table-panel">
                  <div className="panel-header"><div><h2>Needs your review</h2><p>Applications awaiting an approval decision</p></div><button className="text-action" onClick={() => setActive('Applications')}>View all <ArrowUpRight size={14} /></button></div>
                  {requests.filter(r => r.status !== 'Approved' && r.status !== 'Declined').slice(0, 3).map(r => (
                    <button className="review-row" key={r.id} onClick={() => setSelectedRequest(r)}>
                      <span className="review-doc-icon"><FileText size={17} /></span>
                      <span className="review-copy"><strong>{r.title}</strong><span>{r.id} · {r.institute} · {fmtDate(r.date, { day: 'numeric', month: 'short' })}</span></span>
                      <Status>{r.status}</Status>
                      <ChevronRight size={15} />
                    </button>
                  ))}
                </div>
                <div className="panel overview-note">
                  <div className="overview-note-icon"><ShieldCheck size={20} /></div>
                  <h3>One approval trail</h3>
                  <p>Keep queries, supporting documents and decisions together with each application.</p>
                  <button className="text-action" onClick={() => setActive('Applications')}>Open approval queue <ArrowUpRight size={14} /></button>
                </div>
              </div>
            </>
          )}

          {active === 'Applications' && (
            <>
              <PageTitle eyebrow="VDT ADMINISTRATION" title="Booking applications" subtitle="Review event details, verify documents and make approval decisions." />
              <div className="toolbar applications-toolbar">
                <div className="search-field"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search applications..." /></div>
                <div className="filter-field"><Filter size={15} /><select value={instituteFilter} onChange={e => setInstituteFilter(e.target.value)}><option>All institutes</option>{INSTITUTES.map(i => <option key={i}>{i}</option>)}</select></div>
                <span className="results-count">{requests.filter(r => (instituteFilter === 'All institutes' || r.institute === instituteFilter) && `${r.title} ${r.id} ${r.applicant}`.toLowerCase().includes(query.toLowerCase())).length} applications</span>
              </div>
              <div className="application-list">
                {requests.filter(r => (instituteFilter === 'All institutes' || r.institute === instituteFilter) && `${r.title} ${r.id} ${r.applicant}`.toLowerCase().includes(query.toLowerCase())).map(r => (
                  <button className="panel application-row" key={r.id} onClick={() => setSelectedRequest(r)}>
                    <span className="application-file-icon"><FileText size={20} /></span>
                    <span className="application-row-copy">
                      <span className="application-id">{r.id} <i /> {r.institute}</span>
                      <strong>{r.title}</strong>
                      <span className="application-meta">
                        <span><CalendarDays size={13} />{fmtDate(r.date)}</span>
                        <span><Users size={13} />{r.people || r.attendees || '—'} attendees</span>
                        <span><Paperclip size={13} />{r.docs?.length || 0} documents</span>
                      </span>
                    </span>
                    <span className="application-row-end"><Status>{r.status}</Status><ChevronRight size={17} /></span>
                  </button>
                ))}
              </div>
              {requests.every(r => (instituteFilter !== 'All institutes' && r.institute !== instituteFilter) || !`${r.title} ${r.id} ${r.applicant}`.toLowerCase().includes(query.toLowerCase())) && <EmptyState icon={ClipboardList} title="No applications found" body="Try a different search or institute filter." />}
            </>
          )}

          <footer className="app-footer">
            <div className="footer-brand"><span className="footer-square" />VAUDITORIUM <span className="footer-divider">/</span> VOSS LABS</div>
            <span>Built for the VDT community</span>
            <span>Preview · 2026</span>
          </footer>
        </div>
      </main>

      {showBooking && (
        <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) { setShowBooking(false); setFormError(''); } }}>
          <div className="modal booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
            <div className="modal-header">
              <div><div className="eyebrow">NEW APPLICATION <span className="eyebrow-separator">/</span> PHASE 02</div><h2 id="booking-title">Book V-Auditorium</h2><p>Provide the event details and supporting documents.</p></div>
              <button className="icon-btn" aria-label="Close booking form" onClick={() => { setShowBooking(false); setFormError(''); }}><X size={19} /></button>
            </div>
            <BookingForm booking={booking} setBooking={setBooking} onSubmit={submitBooking} onCancel={() => { setShowBooking(false); setFormError(''); }} error={formError} availableDate={availableDate} compact />
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSelectedEvent(null); }}>
          <div className="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="event-detail-title">
            <div className="modal-header">
              <div><div className="eyebrow">EVENT DETAILS <span className="eyebrow-separator">/</span> {selectedEvent.institute}</div><h2 id="event-detail-title">{selectedEvent.title}</h2><p>{fmtDate(selectedEvent.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
              <button className="icon-btn" aria-label="Close event details" onClick={() => setSelectedEvent(null)}><X size={19} /></button>
            </div>
            <div className="detail-status-row"><Status>{selectedEvent.status}</Status><span className="event-type">{selectedEvent.type}</span></div>
            <p className="detail-description">{selectedEvent.description}</p>
            <div className="detail-info-grid">
              <DetailInfo icon={Clock3} label="Schedule" value={selectedEvent.time} />
              <DetailInfo icon={Building2} label="Institute" value={selectedEvent.institute} />
              <DetailInfo icon={Users} label="Expected attendees" value={selectedEvent.attendees || 'Not specified'} />
              <DetailInfo icon={MapPin} label="Venue" value="V-Auditorium" />
            </div>
            <div className="detail-docs"><strong>Requirements</strong><p>{selectedEvent.equipment || 'No additional requirements listed.'}</p></div>
            {selectedEvent.stream && (
              <div className="stream-banner">
                <span><Video size={17} /></span>
                <div><strong>Livestream / recording</strong><p>A stream is listed for this event. Link availability depends on the organiser.</p></div>
                <button className="icon-btn" aria-label="Livestream information" onClick={() => notify('The YouTube URL must be added by the event organiser.')}><ExternalLink size={16} /></button>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setSelectedEvent(null)}>Close</button>
              {role === 'Applier' && selectedEvent.status !== 'Past event' && <button className="btn btn-primary" onClick={() => { setBooking(p => ({ ...p, date: selectedEvent.date })); setSelectedEvent(null); setShowBooking(true); }}>Apply for a date <ArrowUpRight size={14} /></button>}
            </div>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSelectedRequest(null); }}>
          <div className="modal request-modal" role="dialog" aria-modal="true" aria-labelledby="request-detail-title">
            <div className="modal-header">
              <div><div className="eyebrow">APPLICATION REVIEW <span className="eyebrow-separator">/</span> {selectedRequest.id}</div><h2 id="request-detail-title">{selectedRequest.title}</h2><p>Submitted {selectedRequest.submitted || '17 Oct 2026'} by {selectedRequest.applicant || selectedRequest.contact || 'Applicant'}</p></div>
              <button className="icon-btn" aria-label="Close application" onClick={() => setSelectedRequest(null)}><X size={19} /></button>
            </div>
            <div className="detail-status-row"><Status>{selectedRequest.status}</Status><span className="institute-tag">{selectedRequest.institute}</span></div>
            <div className="request-summary">
              <div><span>Requested date</span><strong>{fmtDate(selectedRequest.date)}</strong></div>
              <div><span>Expected attendees</span><strong>{selectedRequest.people || selectedRequest.attendees || '—'}</strong></div>
              <div><span>Contact person</span><strong>{selectedRequest.contact || selectedRequest.applicant || '—'}</strong></div>
            </div>
            <div className="detail-docs"><strong>Event purpose</strong><p>{selectedRequest.purpose || 'No purpose provided.'}</p></div>
            <div className="detail-docs"><strong>Equipment &amp; requirements</strong><p>{selectedRequest.equipment || 'No additional requirements listed.'}</p></div>
            <div className="documents-block">
              <div className="documents-heading"><strong>Supporting documents</strong><span>{selectedRequest.docs?.length || 0} files</span></div>
              {selectedRequest.docs?.length ? selectedRequest.docs.map(doc => (
                <div className="document-row" key={doc}>
                  <span className="document-icon"><FileText size={16} /></span>
                  <span>{doc}</span>
                  <button className="icon-btn" aria-label={`Preview ${doc}`} onClick={() => notify('Document preview requires backend file storage.')}><Eye size={15} /></button>
                </div>
              )) : <div className="no-documents"><AlertCircle size={15} /> No supporting documents attached in this demo.</div>}
            </div>
            {selectedRequest.notes && (
              <div className="query-note">
                <MessageSquareText size={16} />
                <div><strong>Applicant note / outstanding query</strong><p>{selectedRequest.notes}</p></div>
              </div>
            )}
            <div className="approval-note"><ShieldCheck size={16} /><p>Approval adds the event to the shared calendar. Requesting documents returns the application to the applicant.</p></div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => requestAction(selectedRequest.id, 'Documents requested')}><MessageSquareText size={14} /> Request documents</button>
              <button className="btn btn-danger-outline" onClick={() => requestAction(selectedRequest.id, 'Declined')}><XCircle size={14} /> Decline</button>
              <button className="btn btn-primary" onClick={() => requestAction(selectedRequest.id, 'Approved')}><Check size={15} /> Approve booking</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          <span>{toast}</span>
          <button className="icon-btn" aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15} /></button>
        </div>
      )}
    </div>
  );
}
