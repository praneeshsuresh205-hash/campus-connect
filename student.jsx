// student.jsx — Campus Connect Student Dashboard
// Reads campus_current_user from localStorage, redirects to index.html if not logged in
// All data from MongoDB API (localhost:5000)

const API = 'http://localhost:5000/api';
const { useState, useEffect } = React;

function StudentApp() {
  const [user, setUser]               = useState(null);
  const [tab, setTab]                 = useState('home');
  const [subjects, setSubjects]       = useState([]);
  const [attendance, setAttendance]   = useState([]);
  const [exams, setExams]             = useState([]);
  const [timings, setTimings]         = useState([]);
  const [lost, setLost]               = useState([]);
  const [loading, setLoading]         = useState(true);

  /* ── On mount: auth check + load all data ── */
  useEffect(() => {
    const saved = localStorage.getItem('campus_current_user');
    if (!saved) { window.location.href = 'index.html'; return; }
    const u = JSON.parse(saved);
    if (u.role !== 'student') { window.location.href = 'index.html'; return; }
    setUser(u);
    loadAll(u);
  }, []);

  async function loadAll(u) {
    setLoading(true);
    try {
      const [subRes, attRes, examRes, timRes, lostRes] = await Promise.all([
        fetch(`${API}/subjects?department=Computer%20Science&class=CSE%202nd%20Year`),
        fetch(`${API}/attendance?email=${encodeURIComponent(u.email)}`),
        fetch(`${API}/exams`),
        fetch(`${API}/timings`),
        fetch(`${API}/lost`)
      ]);
      const [subData, attData, examData, timData, lostData] = await Promise.all([
        subRes.json(), attRes.json(), examRes.json(), timRes.json(), lostRes.json()
      ]);
      // If subjects empty, seed then re-fetch
      if (!subData.length) {
        await fetch(`${API}/seed`);
        const r2 = await fetch(`${API}/subjects?department=Computer%20Science&class=CSE%202nd%20Year`);
        setSubjects(await r2.json());
      } else {
        setSubjects(subData);
      }
      setAttendance(Array.isArray(attData) ? attData : []);
      setExams(Array.isArray(examData) ? examData : []);
      // filter timings to CSE 2nd Year
      const myTimings = Array.isArray(timData)
        ? timData.filter(t => !t.class || t.class === 'CSE 2nd Year' || t.class === '')
        : [];
      setTimings(myTimings);
      setLost(Array.isArray(lostData) ? lostData : []);
    } catch (e) {
      console.error('Load error:', e);
    }
    setLoading(false);
  }

  function logout() {
    localStorage.removeItem('campus_current_user');
    window.location.href = 'index.html';
  }

  /* ── Computed stats ── */
  const totalPresent = attendance.reduce((s, a) => s + (a.present || 0), 0);
  const totalClasses = attendance.reduce((s, a) => s + (a.total || 0), 0);
  const attPct       = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
  const attColor     = attPct >= 75 ? '#22c55e' : '#ef4444';

  /* ── Teacher lookup from subjects ── */
  function teacherFor(subject) {
    const s = subjects.find(x => x.name === subject || x.code === subject);
    return s ? s.teacher : '—';
  }

  /* ── Hour greeting ── */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user ? user.name.split(' ')[0] : 'Student';

  /* ── Sidebar items ── */
  const navItems = [
    { id: 'home',         label: '📊 Dashboard' },
    { id: 'profile',      label: '👤 My Profile' },
    { id: 'courses',      label: '📚 My Courses' },
    { id: 'attendance',   label: '📅 Attendance' },
    { id: 'timetable',    label: '🕐 Timetable' },
    { id: 'exams',        label: '📝 Exams' },
    { id: 'lost',         label: '🔍 Lost & Found' },
  ];

  if (!user) return React.createElement('div', { style: { color: '#fff', padding: 40 } }, 'Loading...');

  return (
    <div className="student-layout">

      {/* ── Sidebar ── */}
      <aside className="student-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">CC</div>
          <span>Campus Connect</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(n => (
            <button
              key={n.id}
              className={`sidebar-nav-item${tab === n.id ? ' active' : ''}`}
              onClick={() => setTab(n.id)}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout-btn" onClick={logout}>↪ Logout</button>
      </aside>

      {/* ── Main area ── */}
      <main className="student-main">

        {/* Top Header */}
        <header className="student-top-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
              {navItems.find(n => n.id === tab)?.label || 'Dashboard'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Hi, {firstName}!</span>
            <button className="header-logout-btn" onClick={logout}>Logout</button>
          </div>
        </header>

        {/* ── HOME TAB ── */}
        {tab === 'home' && (
          <div>
            {/* Hero Banner */}
            <div className="hero-banner-card">
              <div>
                <h1 className="hero-greeting">{greeting}, {firstName}! 👋</h1>
                <p className="hero-sub">Welcome to Campus Connect — your student portal</p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '3rem' }}>🎓</div>
            </div>

            {/* 4 Stat Cards */}
            {loading ? (
              <p style={{ color: '#94a3b8', padding: '20px 0' }}>Loading your data...</p>
            ) : (
              <div className="stat-cards-grid">
                <div className="stat-card-new">
                  <div className="stat-card-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>📅</div>
                  <div>
                    <div className="stat-card-value" style={{ color: attColor }}>{attPct}%</div>
                    <div className="stat-card-label">My Attendance</div>
                  </div>
                </div>
                <div className="stat-card-new">
                  <div className="stat-card-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>📚</div>
                  <div>
                    <div className="stat-card-value">{subjects.length}</div>
                    <div className="stat-card-label">Active Courses</div>
                  </div>
                </div>
                <div className="stat-card-new">
                  <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>📝</div>
                  <div>
                    <div className="stat-card-value">{exams.length}</div>
                    <div className="stat-card-label">Upcoming Exams</div>
                  </div>
                </div>
                <div className="stat-card-new">
                  <div className="stat-card-icon" style={{ background: 'rgba(20,184,166,0.15)', color: '#14b8a6' }}>🕐</div>
                  <div>
                    <div className="stat-card-value">{timings.length}</div>
                    <div className="stat-card-label">Class Slots</div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick attendance breakdown */}
            {!loading && attendance.length > 0 && (
              <div className="student-section-card" style={{ marginTop: 20 }}>
                <h3 className="section-title">📋 Attendance Breakdown</h3>
                <table className="student-table">
                  <thead>
                    <tr><th>Subject</th><th>Present</th><th>Total</th><th>%</th></tr>
                  </thead>
                  <tbody>
                    {attendance.map((a, i) => {
                      const pct = a.total > 0 ? Math.round((a.present / a.total) * 100) : 0;
                      return (
                        <tr key={i}>
                          <td>{a.subject}</td>
                          <td>{a.present}</td>
                          <td>{a.total}</td>
                          <td style={{ color: pct >= 75 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div className="student-section-card">
            <h3 className="section-title">👤 My Profile</h3>
            <div style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
              {[
                ['Name',            user.name],
                ['Register Number', user.roll || 'N/A'],
                ['Email',           user.email],
                ['Department',      user.department || 'Computer Science'],
                ['Class',           user.class || 'CSE 2nd Year'],
                ['Role',            user.role],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', background: '#1e2d45', borderRadius: 10 }}>
                  <span style={{ color: '#94a3b8', minWidth: 140, fontSize: '0.85rem' }}>{label}</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COURSES TAB ── */}
        {tab === 'courses' && (
          <div className="student-section-card">
            <h3 className="section-title">📚 My Courses</h3>
            {loading ? (
              <p style={{ color: '#94a3b8' }}>Loading courses...</p>
            ) : subjects.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No courses found.</p>
            ) : (
              <table className="student-table">
                <thead>
                  <tr><th>Course</th><th>Course Code</th><th>Faculty</th><th>Subject Type</th></tr>
                </thead>
                <tbody>
                  {subjects.map((s, i) => (
                    <tr key={i}>
                      <td>{s.name}</td>
                      <td><span style={{ background: '#1e3a5f', color: '#60a5fa', padding: '2px 8px', borderRadius: 6, fontSize: '0.82rem' }}>{s.code}</span></td>
                      <td>{s.teacher}</td>
                      <td><span style={{ background: '#14b8a620', color: '#14b8a6', padding: '2px 8px', borderRadius: 6, fontSize: '0.82rem' }}>{s.type}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── ATTENDANCE TAB ── */}
        {tab === 'attendance' && (
          <div className="student-section-card">
            <h3 className="section-title">📅 My Attendance</h3>
            {loading ? (
              <p style={{ color: '#94a3b8' }}>Loading...</p>
            ) : attendance.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No attendance records found for your account.</p>
            ) : (
              <>
                <div style={{ marginBottom: 18, padding: '14px 18px', background: '#1e2d45', borderRadius: 12, display: 'inline-block' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Overall Attendance: </span>
                  <span style={{ color: attColor, fontWeight: 800, fontSize: '1.3rem' }}>{attPct}%</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: 8 }}>({totalPresent} / {totalClasses} classes)</span>
                </div>
                <table className="student-table">
                  <thead>
                    <tr><th>Subject</th><th>Present</th><th>Total</th><th>%</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {attendance.map((a, i) => {
                      const pct = a.total > 0 ? Math.round((a.present / a.total) * 100) : 0;
                      return (
                        <tr key={i}>
                          <td>{a.subject}</td>
                          <td>{a.present}</td>
                          <td>{a.total}</td>
                          <td style={{ color: pct >= 75 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{pct}%</td>
                          <td>
                            <span style={{ background: pct >= 75 ? '#22c55e20' : '#ef444420', color: pct >= 75 ? '#22c55e' : '#ef4444', padding: '2px 10px', borderRadius: 20, fontSize: '0.8rem' }}>
                              {pct >= 75 ? 'Good' : 'Low'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* ── TIMETABLE TAB ── */}
        {tab === 'timetable' && (
          <div className="student-section-card">
            <h3 className="section-title">🕐 Class Timetable</h3>
            {loading ? (
              <p style={{ color: '#94a3b8' }}>Loading...</p>
            ) : timings.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No timetable data found.</p>
            ) : (
              <table className="student-table">
                <thead>
                  <tr><th>Day</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Room</th></tr>
                </thead>
                <tbody>
                  {timings.map((t, i) => (
                    <tr key={i}>
                      <td><span style={{ background: '#1e3a5f', color: '#60a5fa', padding: '2px 8px', borderRadius: 6, fontSize: '0.82rem' }}>{t.day}</span></td>
                      <td>{t.time || '—'}</td>
                      <td>{t.subject}</td>
                      <td>{teacherFor(t.subject)}</td>
                      <td>{t.room || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── EXAMS TAB ── */}
        {tab === 'exams' && (
          <div className="student-section-card">
            <h3 className="section-title">📝 Upcoming Exams</h3>
            {loading ? (
              <p style={{ color: '#94a3b8' }}>Loading...</p>
            ) : exams.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No exam records found.</p>
            ) : (
              <table className="student-table">
                <thead>
                  <tr><th>Exam</th><th>Date</th><th>Time</th><th>Room</th><th>Class</th></tr>
                </thead>
                <tbody>
                  {exams.map((e, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{e.name}</td>
                      <td>{e.date || '—'}</td>
                      <td>{e.time || '—'}</td>
                      <td>{e.room || '—'}</td>
                      <td>{e.class || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── LOST & FOUND TAB ── */}
        {tab === 'lost' && (
          <div className="student-section-card">
            <h3 className="section-title">🔍 Lost & Found</h3>
            {loading ? (
              <p style={{ color: '#94a3b8' }}>Loading...</p>
            ) : lost.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No lost & found items.</p>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {lost.map((item, i) => (
                  <div key={i} style={{ background: '#1e2d45', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{item.title}</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>📍 {item.place || 'Unknown'} · 📅 {item.date || 'N/A'} · By: {item.by || 'Student'}</div>
                    </div>
                    <span style={{ background: item.status === 'Found' ? '#22c55e20' : '#f9731620', color: item.status === 'Found' ? '#22c55e' : '#f97316', padding: '4px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600 }}>
                      {item.status || 'Lost'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(StudentApp));
