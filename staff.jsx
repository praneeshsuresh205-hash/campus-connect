// staff.jsx - Campus Connect Staff App - React (Executive Deep Purple & Teal Theme)
const API = "http://localhost:5000/api";
const { useState, useEffect } = React;

function StaffApp() {
  const [menu, setMenu] = useState("dashboard"); // "dashboard" | "profile" | "timing" | "exam" | "attendance"
  const [editProfile, setEditProfile] = useState(false);
  const [msg, setMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [profile, setProfile] = useState(() => {
    let saved = localStorage.getItem("staff_profile");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: "Campus Staff",
      email: "staff@campus.com",
      role: "staff",
      department: "Computer Science",
      portalStatus: "Active",
      accessType: "Staff",
      phone: "98410 12345",
      subject: "Web Development"
    };
  });

  const [timings, setTimings] = useState(() => {
    let saved = localStorage.getItem("campus_timings");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 1, day: "Monday", subject: "Web Development", time: "09:00 AM - 10:00 AM", room: "Lab 4", class: "CSE 2nd Year" },
      { id: 2, day: "Tuesday", subject: "DBMS", time: "11:00 AM - 12:00 PM", room: "Room B-12", class: "CSE 2nd Year" },
      { id: 3, day: "Wednesday", subject: "Python Lab", time: "02:00 PM - 04:00 PM", room: "Lab 2", class: "CSE 3rd Year" },
      { id: 4, day: "Thursday", subject: "Web Development", time: "10:00 AM - 11:00 AM", room: "Lab 4", class: "CSE 2nd Year" },
      { id: 5, day: "Friday", subject: "Project Hour", time: "03:00 PM - 04:00 PM", room: "Seminar Hall", class: "CSE Final Year" },
    ];
  });

  const [exams, setExams] = useState(() => {
    let saved = localStorage.getItem("campus_exams");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 1, name: "Web Development - Unit Test 2", date: "2026-11-25", time: "10:00 AM", room: "Room B-12", class: "CSE 2nd Year", alert: true },
      { id: 2, name: "DBMS - Model Exam", date: "2026-11-28", time: "09:30 AM", room: "Hall 2", class: "CSE 2nd Year", alert: true },
      { id: 3, name: "Python - Practical Exam", date: "2026-12-02", time: "02:00 PM", room: "Lab 2", class: "CSE 3rd Year", alert: false },
    ];
  });

  const [attendance, setAttendance] = useState(() => {
    let saved = localStorage.getItem("campus_attendance");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 1, name: "Priya S", roll: "CSE-01", subject: "Web Development", present: 19, total: 20 },
      { id: 2, name: "Arjun K", roll: "CSE-02", subject: "Web Development", present: 15, total: 20 },
      { id: 3, name: "Meera R", roll: "CSE-03", subject: "Web Development", present: 19, total: 20 },
      { id: 4, name: "Karthik M", roll: "CSE-04", subject: "Web Development", present: 12, total: 20 },
      { id: 5, name: "hari", roll: "CSE-05", subject: "Web Development", present: 17, total: 20 }
    ];
  });

  const [newExam, setNewExam] = useState({ name: "", date: "", time: "", room: "", class: "" });
  const [newTiming, setNewTiming] = useState({ day: "Monday", subject: "", time: "", room: "", class: "" });
  const [newStudent, setNewStudent] = useState({ name: "", roll: "", subject: "Web Development", present: "", total: "20" });
  const [editExamId, setEditExamId] = useState(null);

  // Dashboard staff list popup states
  const [showList, setShowList] = useState(null); // null | "status" | "department" | "access"
  const [allStaff, setAllStaff] = useState([]);
  const [staffFilter, setStaffFilter] = useState("All");

  // Fetch initial data from backend API
  useEffect(() => {
    loadBackendData();
  }, []);

  async function loadBackendData() {
    try {
      const [resProf, resTime, resEx, resAtt] = await Promise.all([
        fetch(`${API}/profile/staff`),
        fetch(`${API}/timings`),
        fetch(`${API}/exams`),
        fetch(`${API}/attendance`)
      ]);
      if (resProf.ok) {
        const p = await resProf.json();
        if (p && p.name) {
          setProfile(p);
          localStorage.setItem("staff_profile", JSON.stringify(p));
        }
      }
      if (resTime.ok) {
        const t = await resTime.json();
        if (Array.isArray(t) && t.length > 0) {
          setTimings(t);
          localStorage.setItem("campus_timings", JSON.stringify(t));
        }
      }
      if (resEx.ok) {
        const ex = await resEx.json();
        if (Array.isArray(ex) && ex.length > 0) {
          setExams(ex);
          localStorage.setItem("campus_exams", JSON.stringify(ex));
        }
      }
      if (resAtt.ok) {
        const a = await resAtt.json();
        if (Array.isArray(a) && a.length > 0) {
          setAttendance(a);
          localStorage.setItem("campus_attendance", JSON.stringify(a));
        }
      }
    } catch (err) {}
  }

  async function openStaffList(type) {
    setShowList(type);
    setStaffFilter("All");
    try {
      const res = await fetch(`${API}/staff`);
      if (res.ok) {
        const data = await res.json();
        setAllStaff(data);
      }
    } catch (err) {
      console.error("Error fetching staff list:", err);
    }
  }

  async function saveProfile() {
    setEditProfile(false);
    try {
      const idOrEmail = profile.id || profile._id || "staff";
      const res = await fetch(`${API}/profile/${idOrEmail}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        localStorage.setItem("staff_profile", JSON.stringify(updated));
      }
    } catch (err) {
      localStorage.setItem("staff_profile", JSON.stringify(profile));
    }
    setMsg("Profile saved! Department, Status, Access Type updated.");
    setTimeout(() => setMsg(""), 3000);
  }

  async function addExam() {
    if (newExam.name === "" || newExam.date === "") {
      alert("Please enter exam name and date");
      return;
    }

    if (editExamId) {
      try {
        const res = await fetch(`${API}/exams/${editExamId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newExam, alert: true })
        });
        if (res.ok) {
          const updated = await res.json();
          setExams(exams.map((e) => (e.id === editExamId || e._id === editExamId ? updated : e)));
        } else {
          setExams(exams.map((e) => (e.id === editExamId || e._id === editExamId ? { ...e, ...newExam, alert: true } : e)));
        }
      } catch (err) {
        setExams(exams.map((e) => (e.id === editExamId || e._id === editExamId ? { ...e, ...newExam, alert: true } : e)));
      }
      setEditExamId(null);
      setMsg("Exam updated! Students will see new date/time.");
    } else {
      try {
        const res = await fetch(`${API}/exams`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newExam, alert: true })
        });
        if (res.ok) {
          const created = await res.json();
          setExams([...exams, created]);
        } else {
          setExams([...exams, { id: Date.now(), ...newExam, alert: true }]);
        }
      } catch (err) {
        setExams([...exams, { id: Date.now(), ...newExam, alert: true }]);
      }
      setMsg("New exam added + Alert ON for students!");
    }
    setNewExam({ name: "", date: "", time: "", room: "", class: "" });
    setTimeout(() => setMsg(""), 3000);
  }

  function editExam(e) {
    setEditExamId(e.id || e._id);
    setNewExam({ name: e.name, date: e.date, time: e.time, room: e.room, class: e.class });
    setMenu("exam");
  }

  async function toggleAlert(e) {
    const examId = e.id || e._id;
    const newAlert = !e.alert;
    try {
      await fetch(`${API}/exams/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alert: newAlert })
      });
    } catch (err) {}
    setExams(exams.map((x) => ((x.id === examId || x._id === examId) ? { ...x, alert: newAlert } : x)));
  }

  async function deleteExam(e) {
    const examId = e.id || e._id;
    try {
      await fetch(`${API}/exams/${examId}`, { method: "DELETE" });
    } catch (err) {}
    setExams(exams.filter((x) => x.id !== examId && x._id !== examId));
  }

  async function addTiming() {
    if (newTiming.subject === "" || newTiming.time === "") {
      alert("Enter subject and time");
      return;
    }
    try {
      const res = await fetch(`${API}/timings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTiming)
      });
      if (res.ok) {
        const created = await res.json();
        setTimings([...timings, created]);
      } else {
        setTimings([...timings, { id: Date.now(), ...newTiming }]);
      }
    } catch (err) {
      setTimings([...timings, { id: Date.now(), ...newTiming }]);
    }
    setNewTiming({ day: "Monday", subject: "", time: "", room: "", class: "" });
    setMsg("Class timing added! Students will see it.");
    setTimeout(() => setMsg(""), 3000);
  }

  async function deleteTiming(t) {
    const timeId = t.id || t._id;
    try {
      await fetch(`${API}/timings/${timeId}`, { method: "DELETE" });
    } catch (err) {}
    setTimings(timings.filter((x) => x.id !== timeId && x._id !== timeId));
  }

  async function addStudentAttendance() {
    if (newStudent.name === "") {
      alert("Enter student name");
      return;
    }
    const studentData = {
      name: newStudent.name,
      roll: newStudent.roll,
      subject: newStudent.subject || "Web Development",
      present: Number(newStudent.present) || 0,
      total: Number(newStudent.total) || 20
    };
    try {
      const res = await fetch(`${API}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData)
      });
      if (res.ok) {
        const created = await res.json();
        setAttendance([...attendance, created]);
      } else {
        setAttendance([...attendance, { id: Date.now(), ...studentData }]);
      }
    } catch (err) {
      setAttendance([...attendance, { id: Date.now(), ...studentData }]);
    }
    setNewStudent({ name: "", roll: "", subject: "Web Development", present: "", total: "20" });
    setMsg("Student attendance added! Student will see now.");
    setTimeout(() => setMsg(""), 3000);
  }

  async function deleteAttendance(a) {
    const attId = a.id || a._id;
    try {
      await fetch(`${API}/attendance/${attId}`, { method: "DELETE" });
    } catch (err) {}
    setAttendance(attendance.filter((x) => x.id !== attId && x._id !== attId));
  }

  async function saveAttendance() {
    try {
      await Promise.all(
        attendance.map((a) => {
          const attId = a.id || a._id;
          if (attId) {
            return fetch(`${API}/attendance/${attId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                present: Number(a.present) || 0,
                total: Number(a.total) || 0,
                name: a.name,
                roll: a.roll,
                subject: a.subject
              })
            });
          }
          return Promise.resolve();
        })
      );
      localStorage.setItem("campus_attendance", JSON.stringify(attendance));
      alert("Attendance Saved! Student will see now.");
    } catch (err) {
      localStorage.setItem("campus_attendance", JSON.stringify(attendance));
      alert("Attendance Saved! Student will see now.");
    }
  }

  function handleLogout() {
    window.location.href = "index.html";
  }

  // Filtered staff for popup
  const filteredStaff = allStaff.filter((s) => {
    if (staffFilter === "All") return true;
    if (showList === "status") return s.portalStatus === staffFilter;
    if (showList === "department") return s.department === staffFilter;
    if (showList === "access") return s.accessType === staffFilter;
    return true;
  });

  // Calculate initials
  const initials = profile.name
    ? profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "CS";

  const menuTitleMap = {
    dashboard: "Dashboard",
    profile: "My Profile",
    timing: "Class Timing",
    exam: "Exam & Alert",
    attendance: "Attendance"
  };

  return (
    <div className="layout">
      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-box">CC</div>
          <div className="logo-text-wrap">
            <b>Campus Connect</b>
            <span className="portal-tag">STAFF PORTAL</span>
          </div>
        </div>

        <div className="menu-heading">STAFF MENU</div>

        <nav className="sidebar-menu">
          <button
            className={menu === "dashboard" ? "menu-btn active" : "menu-btn"}
            onClick={() => { setMenu("dashboard"); setShowList(null); }}
          >
            <span className="menu-icon">📊</span>
            <span>Dashboard</span>
          </button>

          <button
            className={menu === "profile" ? "menu-btn active" : "menu-btn"}
            onClick={() => setMenu("profile")}
          >
            <span className="menu-icon">👤</span>
            <span>My Profile</span>
          </button>

          <button
            className={menu === "timing" ? "menu-btn active" : "menu-btn"}
            onClick={() => setMenu("timing")}
          >
            <span className="menu-icon">🕒</span>
            <span>Class Timing</span>
          </button>

          <button
            className={menu === "exam" ? "menu-btn active" : "menu-btn"}
            onClick={() => setMenu("exam")}
          >
            <span className="menu-icon">📝</span>
            <span>Exam &amp; Alert</span>
          </button>

          <button
            className={menu === "attendance" ? "menu-btn active" : "menu-btn"}
            onClick={() => setMenu("attendance")}
          >
            <span className="menu-icon">✅</span>
            <span>Attendance</span>
          </button>

          <button
            className="menu-btn logout"
            onClick={handleLogout}
          >
            <span className="menu-icon">🚪</span>
            <span>Logout</span>
          </button>
        </nav>

        <div className="sidebar-profile">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            <div className="profile-name">{profile.name || "Campus Staff"}</div>
            <div className="profile-role-badge">Role: {profile.role || "staff"}</div>
          </div>
          <div className="online-pulse" title="Active Status"></div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <main className="main">
        {/* TOPBAR HEADER */}
        <header className="topbar">
          <div className="breadcrumb">
            <span className="home-icon">🏠</span>
            <span>Home</span>
            <span className="sep">›</span>
            <span>Staff Portal</span>
            <span className="sep">/</span>
            <span className="current">{menuTitleMap[menu] || "Dashboard"}</span>
          </div>

          <div className="topbar-actions">
            <div className="search-bar-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search student, exam, timing..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="top-bell-btn" title="3 Notifications">
              🔔
              <span className="top-bell-badge">3</span>
            </button>

            <div
              className="top-user-pill"
              onClick={() => setMenu("profile")}
              title="View Profile"
            >
              <div className="top-user-avatar">{initials}</div>
              <span>Hi, {profile.name ? profile.name.split(" ")[0] : "Staff"}</span>
            </div>

            <button
              className="top-logout-btn"
              onClick={handleLogout}
              title="Sign Out"
            >
              Logout ↪
            </button>
          </div>
        </header>

        {msg !== "" && (
          <div className="success-box">
            <span>✅</span>
            <span>{msg}</span>
          </div>
        )}

        {/* ==================== DASHBOARD VIEW ==================== */}
        {menu === "dashboard" && (
          <div>
            {/* 1. HERO / WELCOME BANNER CARD */}
            <div className="staff-hero-banner">
              <div className="staff-hero-content">
                <h1>Welcome back, {profile.name || "Campus Staff"}! 👋</h1>
                <p>
                  You have <b>{timings.length} classes</b>, <b>{exams.length} exams</b>, and <b>{attendance.length} students</b> to manage today.
                </p>
                <div className="hero-pills">
                  <span className="hero-pill">
                    <span style={{ color: "#34d399", fontSize: "11px" }}>●</span> Active Now
                  </span>
                  <span className="hero-pill">
                    📅 Today: 19 Nov 2025
                  </span>
                  <span className="hero-pill">
                    🏛️ {profile.department || "Computer Science"}
                  </span>
                </div>
              </div>

              {/* Decorative SVG Illustration on right */}
              <div className="staff-hero-illustration">
                <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="25" y="20" width="110" height="75" rx="8" fill="#ffffff" fillOpacity="0.12" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3"/>
                  <rect x="35" y="32" width="40" height="8" rx="4" fill="#ffffff" fillOpacity="0.9"/>
                  <rect x="35" y="46" width="65" height="4" rx="2" fill="#c4b5fd"/>
                  <rect x="35" y="55" width="50" height="4" rx="2" fill="#c4b5fd"/>
                  <rect x="35" y="64" width="58" height="4" rx="2" fill="#c4b5fd"/>
                  <circle cx="112" cy="52" r="14" fill="#14b8a6"/>
                  <path d="M107 52L110 55L118 47" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M55 105L80 95L105 105" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
                  <rect x="52" y="105" width="56" height="6" rx="3" fill="#ffffff" fillOpacity="0.8"/>
                  <circle cx="80" cy="116" r="3" fill="#34d399"/>
                </svg>
              </div>
            </div>

            {/* 2. STAFF PROFILE CARD */}
            <div className="white-card staff-profile-card">
              <div className="profile-card-header">
                <div className="profile-identity">
                  <div className="profile-initials-avatar">{initials}</div>
                  <div className="profile-name-role">
                    <h3>{profile.name || "Campus Staff"}</h3>
                    <span>{profile.email} • {profile.department}</span>
                  </div>
                </div>

                <button
                  className="btn-edit-profile"
                  onClick={() => setMenu("profile")}
                >
                  ✏️ Edit Profile
                </button>
              </div>

              {/* Chips / Pills */}
              <div className="profile-chips-grid">
                <span className="profile-chip">
                  <b>Role:</b> {profile.role || "staff"}
                </span>
                <span className="profile-chip">
                  <b>Subject:</b> {profile.subject || "Web Development"}
                </span>
                <span className="profile-chip">
                  <b>Phone:</b> {profile.phone || "98410 12345"}
                </span>
                <span className="profile-chip">
                  <b>Email:</b> {profile.email}
                </span>
                <span className="profile-chip">
                  <b>Department:</b> {profile.department}
                </span>
                <span className="profile-chip" style={{ background: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46" }}>
                  <b>Status:</b> {profile.portalStatus || "Active"}
                </span>
              </div>

              {/* Profile Completion Bar */}
              <div className="profile-completion-wrap">
                <div className="completion-label-row">
                  <span>Profile Completion</span>
                  <span className="pct">90%</span>
                </div>
                <div className="completion-track">
                  <div className="completion-fill" style={{ width: "90%" }}></div>
                </div>
              </div>
            </div>

            {/* 3. THREE CARDS (Portal Status, Department, Access Type) */}
            <div className="three-box">
              {/* Card 1: Portal Status */}
              <div
                className="small-card"
                onClick={() => openStaffList("status")}
                title="Click to view staff by status"
              >
                <div>
                  <div className="small-card-top">
                    <div className="card-icon-circle green">
                      🟢
                    </div>
                    <span className="card-badge green">Online</span>
                  </div>
                  <span className="card-title">Portal Status • Click to Filter</span>
                  <h2>{profile.portalStatus || "Active"}</h2>
                  <p className="card-subtext">Tap to edit in Profile</p>
                </div>
                <div className="small-card-footer">
                  <span>Staff Status List</span>
                  <span>View All →</span>
                </div>
              </div>

              {/* Card 2: Department */}
              <div
                className="small-card"
                onClick={() => openStaffList("department")}
                title="Click to view staff by department"
              >
                <div>
                  <div className="small-card-top">
                    <div className="card-icon-circle purple">
                      🏛️
                    </div>
                    <span className="card-badge purple">
                      {allStaff.length > 0
                        ? `${allStaff.filter((s) => s.department === profile.department).length || 6} Staff`
                        : "6 Staff"}
                    </span>
                  </div>
                  <span className="card-title">Department • Click to Filter</span>
                  <h2>{profile.department || "Computer Science"}</h2>
                  <p className="card-subtext">{profile.subject || "Web Development"}</p>
                </div>
                <div className="small-card-footer">
                  <span>Department Members</span>
                  <span>View All →</span>
                </div>
              </div>

              {/* Card 3: Access Type */}
              <div
                className="small-card"
                onClick={() => openStaffList("access")}
                title="Click to view staff by access type"
              >
                <div>
                  <div className="small-card-top">
                    <div className="card-icon-circle orange">
                      🔑
                    </div>
                    <span className="card-badge orange">Full Access</span>
                  </div>
                  <span className="card-title">Access Type • Click to Filter</span>
                  <h2>{profile.accessType || "Staff"}</h2>
                  <p className="card-subtext">Role: {profile.role || "staff"}</p>
                </div>
                <div className="small-card-footer">
                  <span>Role Hierarchy</span>
                  <span>View All →</span>
                </div>
              </div>
            </div>

            {/* POPUP / STAFF LIST FILTER TABLE (When Card Clicked) */}
            {showList && (
              <div className="staff-filter-card">
                <div className="staff-filter-header">
                  <h3>
                    {showList === "status" && "Staff Directory by Portal Status"}
                    {showList === "department" && "Staff Directory by Department"}
                    {showList === "access" && "Staff Directory by Access Type"}
                  </h3>
                  <button
                    className="btn-close-filter"
                    onClick={() => setShowList(null)}
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Filter Pills */}
                <div className="filter-pills-row">
                  {showList === "status" &&
                    ["All", "Active", "Inactive", "On Leave", "Pending"].map((f) => (
                      <button
                        key={f}
                        className={`filter-pill-btn ${staffFilter === f ? "active" : ""}`}
                        onClick={() => setStaffFilter(f)}
                      >
                        {f}
                      </button>
                    ))}

                  {showList === "department" &&
                    ["All", "Computer Science", "ECE", "EEE", "IT", "MECH"].map((f) => (
                      <button
                        key={f}
                        className={`filter-pill-btn ${staffFilter === f ? "active" : ""}`}
                        onClick={() => setStaffFilter(f)}
                      >
                        {f}
                      </button>
                    ))}

                  {showList === "access" &&
                    ["All", "Staff", "Admin", "HOD", "Principal", "Teacher"].map((f) => (
                      <button
                        key={f}
                        className={`filter-pill-btn ${staffFilter === f ? "active" : ""}`}
                        onClick={() => setStaffFilter(f)}
                      >
                        {f}
                      </button>
                    ))}
                </div>

                <div className="filter-count-label">
                  {showList === "status" && `${staffFilter === "All" ? "Total" : staffFilter} Staff: ${filteredStaff.length}`}
                  {showList === "department" && `${staffFilter === "All" ? "Total" : staffFilter}: ${filteredStaff.length} Staff Members`}
                  {showList === "access" && `${staffFilter === "All" ? "Total" : staffFilter} Access: ${filteredStaff.length} Available`}
                </div>

                {/* Table */}
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Subject / Specialization</th>
                      <th>Portal Status</th>
                      <th>Access Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}>
                          No staff found matching filter.
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.map((s, i) => (
                        <tr key={s.id || s._id || i}>
                          <td><b>{s.name}</b></td>
                          <td>
                            <span style={{ background: "#f3e8ff", color: "#6d28d9", padding: "3px 8px", borderRadius: "6px", fontSize: "11.5px", fontWeight: "700" }}>
                              {s.department || "—"}
                            </span>
                          </td>
                          <td>{s.subject || "Web Development"}</td>
                          <td>
                            <span
                              style={{
                                fontSize: "11.5px",
                                padding: "3px 8px",
                                borderRadius: "10px",
                                fontWeight: "700",
                                background:
                                  s.portalStatus === "Active"
                                    ? "#dcfce7"
                                    : s.portalStatus === "Inactive"
                                    ? "#fee2e2"
                                    : s.portalStatus === "On Leave"
                                    ? "#ffedd5"
                                    : "#f3f4f6",
                                color:
                                  s.portalStatus === "Active"
                                    ? "#16a34a"
                                    : s.portalStatus === "Inactive"
                                    ? "#c00"
                                    : s.portalStatus === "On Leave"
                                    ? "#ea580c"
                                    : "#4b5563"
                              }}
                            >
                              {s.portalStatus || "Active"}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: "700", color: "#4338ca", fontSize: "12px" }}>
                              {s.accessType || "Staff"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. STAFF INFORMATION CARD (Upgraded with 3 Mini Stat Boxes & Schedule) */}
            <div className="white-card staff-info-card">
              <div className="info-card-grid">
                {/* Left side: Overview, stats & 3 buttons */}
                <div className="info-left">
                  <h3>📋 Staff Management &amp; Overview</h3>
                  <p className="subtext">
                    You have successfully entered the staff portal. Check your classes, manage exams, and record student attendance.
                  </p>

                  <div className="mini-stats-row">
                    <div className="mini-stat-box">
                      <div className="mini-stat-icon">🕒</div>
                      <div className="mini-stat-val">{timings.length}</div>
                      <div className="mini-stat-label">Classes</div>
                    </div>
                    <div className="mini-stat-box">
                      <div className="mini-stat-icon">🔔</div>
                      <div className="mini-stat-val">{exams.length}</div>
                      <div className="mini-stat-label">Exams</div>
                    </div>
                    <div className="mini-stat-box">
                      <div className="mini-stat-icon">👥</div>
                      <div className="mini-stat-val">{attendance.length}</div>
                      <div className="mini-stat-label">Students</div>
                    </div>
                  </div>

                  <div className="info-action-buttons">
                    <button
                      className="btn-action-teal"
                      onClick={() => setMenu("timing")}
                    >
                      🕒 View Class Timing
                    </button>
                    <button
                      className="btn-action-navy"
                      onClick={() => setMenu("exam")}
                    >
                      🔔 View Exam Alerts
                    </button>
                    <button
                      className="btn-action-purple"
                      onClick={() => setMenu("attendance")}
                    >
                      ✅ View Attendance
                    </button>
                  </div>
                </div>

                {/* Right side: Today's Schedule */}
                <div className="info-right">
                  <div className="schedule-header">
                    <h4>📅 Today's Schedule</h4>
                    <span>Wed, 19 Nov</span>
                  </div>
                  <div className="schedule-list">
                    <div className="schedule-item">
                      <span className="schedule-time-badge">09:00 AM</span>
                      <div className="schedule-details">
                        <b>Web Development</b>
                        <div className="schedule-room">📍 Lab 4 • CSE 2nd Year</div>
                      </div>
                    </div>
                    <div className="schedule-item">
                      <span className="schedule-time-badge">11:00 AM</span>
                      <div className="schedule-details">
                        <b>Database Systems (DBMS)</b>
                        <div className="schedule-room">📍 Room B-12 • CSE 2nd Year</div>
                      </div>
                    </div>
                    <div className="schedule-item">
                      <span className="schedule-time-badge">02:00 PM</span>
                      <div className="schedule-details">
                        <b>Python Practical Lab</b>
                        <div className="schedule-room">📍 Lab 2 • CSE 3rd Year</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. NEW BOTTOM ROW: Quick Actions & Recent Activity */}
            <div className="bottom-dashboard-grid">
              <div className="white-card bottom-card">
                <h3>⚡ Quick Actions</h3>
                <div className="quick-actions-btns">
                  <div
                    className="quick-action-btn"
                    onClick={() => setMenu("exam")}
                  >
                    <span style={{ fontSize: "20px" }}>➕</span>
                    <span>Add Exam</span>
                  </div>
                  <div
                    className="quick-action-btn"
                    onClick={() => setMenu("attendance")}
                  >
                    <span style={{ fontSize: "20px" }}>✅</span>
                    <span>Mark Attendance</span>
                  </div>
                  <div
                    className="quick-action-btn"
                    onClick={() => setMenu("timing")}
                  >
                    <span style={{ fontSize: "20px" }}>🕒</span>
                    <span>Add Timetable</span>
                  </div>
                </div>
              </div>

              <div className="white-card bottom-card">
                <h3>🔔 Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-dot green"></span>
                    <div className="activity-text-wrap">
                      <b>Updated Attendance for Priya S</b>
                      <span className="activity-time">2 min ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-dot purple"></span>
                    <div className="activity-text-wrap">
                      <b>Exam scheduled: Web Development Unit Test 2</b>
                      <span className="activity-time">1 hr ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-dot blue"></span>
                    <div className="activity-text-wrap">
                      <b>Class timetable synchronized for DBMS</b>
                      <span className="activity-time">Yesterday</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PROFILE TAB ==================== */}
        {menu === "profile" && (
          <div className="white-card staff-profile-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#1e1145", fontSize: "19px", fontWeight: "800" }}>
                👤 My Profile - Edit Staff Details
              </h3>
              {!editProfile && (
                <button
                  className="btn-edit-profile"
                  onClick={() => setEditProfile(true)}
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {!editProfile ? (
              <div>
                <div className="profile-chips-grid" style={{ margin: "14px 0" }}>
                  <span className="profile-chip"><b>Name:</b> {profile.name}</span>
                  <span className="profile-chip"><b>Email:</b> {profile.email}</span>
                  <span className="profile-chip"><b>Phone:</b> {profile.phone}</span>
                  <span className="profile-chip"><b>Department:</b> {profile.department}</span>
                  <span className="profile-chip"><b>Subject:</b> {profile.subject}</span>
                  <span className="profile-chip"><b>Portal Status:</b> {profile.portalStatus}</span>
                  <span className="profile-chip"><b>Access Type:</b> {profile.accessType}</span>
                </div>
                <div className="alert-box" style={{ marginTop: "16px" }}>
                  <b>Faculty Record Verified</b>
                  <p>Your staff account has full permissions to manage classes, publish exams, and update student attendance.</p>
                </div>
              </div>
            ) : (
              <div>
                <label>Full Name</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
                <div className="row">
                  <div>
                    <label>Email</label>
                    <input
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Phone</label>
                    <input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row">
                  <div>
                    <label>Department</label>
                    <select
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    >
                      <option>Computer Science</option>
                      <option>ECE</option>
                      <option>EEE</option>
                      <option>MECH</option>
                      <option>IT</option>
                      <option>Admin Office</option>
                    </select>
                  </div>
                  <div>
                    <label>Subject</label>
                    <input
                      value={profile.subject}
                      onChange={(e) => setProfile({ ...profile, subject: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row">
                  <div>
                    <label>Portal Status</label>
                    <select
                      value={profile.portalStatus}
                      onChange={(e) => setProfile({ ...profile, portalStatus: e.target.value })}
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>On Leave</option>
                      <option>Pending</option>
                    </select>
                  </div>
                  <div>
                    <label>Access Type</label>
                    <select
                      value={profile.accessType}
                      onChange={(e) => setProfile({ ...profile, accessType: e.target.value })}
                    >
                      <option>Staff</option>
                      <option>Admin</option>
                      <option>HOD</option>
                      <option>Principal</option>
                      <option>Teacher</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <button className="btn btn-green" onClick={saveProfile}>
                    Save Changes ✅
                  </button>
                  <button className="btn btn-gray" onClick={() => setEditProfile(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== CLASS TIMING TAB ==================== */}
        {menu === "timing" && (
          <div>
            <div className="white-card">
              <h3 style={{ color: "#1e1145", fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>
                🕒 Class Timetable - {timings.length} Classes Scheduled
              </h3>
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Subject</th>
                    <th>Time</th>
                    <th>Room</th>
                    <th>Class</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {timings.map((t) => (
                    <tr key={t.id || t._id}>
                      <td><b>{t.day}</b></td>
                      <td>{t.subject}</td>
                      <td>{t.time}</td>
                      <td>{t.room}</td>
                      <td>{t.class}</td>
                      <td>
                        <button
                          className="btn btn-red"
                          style={{ margin: 0, padding: "5px 10px", fontSize: "11px" }}
                          onClick={() => deleteTiming(t)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="white-card">
              <h3 style={{ color: "#1e1145", fontSize: "17px", fontWeight: "800", marginBottom: "12px" }}>
                ➕ Add New Class Timing
              </h3>
              <div className="row">
                <div>
                  <label>Day</label>
                  <select
                    value={newTiming.day}
                    onChange={(e) => setNewTiming({ ...newTiming, day: e.target.value })}
                  >
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                    <option>Saturday</option>
                  </select>
                </div>
                <div>
                  <label>Subject</label>
                  <input
                    placeholder="ex: DBMS"
                    value={newTiming.subject}
                    onChange={(e) => setNewTiming({ ...newTiming, subject: e.target.value })}
                  />
                </div>
              </div>
              <div className="row">
                <div>
                  <label>Time</label>
                  <input
                    placeholder="10:00 AM - 11:00 AM"
                    value={newTiming.time}
                    onChange={(e) => setNewTiming({ ...newTiming, time: e.target.value })}
                  />
                </div>
                <div>
                  <label>Room</label>
                  <input
                    placeholder="Lab 4"
                    value={newTiming.room}
                    onChange={(e) => setNewTiming({ ...newTiming, room: e.target.value })}
                  />
                </div>
                <div>
                  <label>Class</label>
                  <input
                    placeholder="CSE 2nd Year"
                    value={newTiming.class}
                    onChange={(e) => setNewTiming({ ...newTiming, class: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn btn-green" onClick={addTiming}>
                Add Timing + Save
              </button>
            </div>
          </div>
        )}

        {/* ==================== EXAMS TAB ==================== */}
        {menu === "exam" && (
          <div>
            <div className="white-card">
              <h3 style={{ color: "#1e1145", fontSize: "18px", fontWeight: "800", marginBottom: "14px" }}>
                📝 Exam List + Student Notification Alerts
              </h3>
              {exams.map((e) => (
                <div className="alert-box" key={e.id || e._id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <b>{e.name}</b>
                    <span
                      style={{
                        fontSize: "11.5px",
                        background: e.alert ? "#dcfce7" : "#fee2e2",
                        color: e.alert ? "#15803d" : "#b91c1c",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontWeight: "700"
                      }}
                    >
                      {e.alert ? "🔔 Alert ON" : "🔕 Alert OFF"}
                    </span>
                  </div>
                  <p>
                    📅 <b>Date:</b> {e.date} &nbsp;•&nbsp; 🕒 <b>Time:</b> {e.time} &nbsp;•&nbsp; 🏫 <b>Room:</b> {e.room} &nbsp;•&nbsp; 👥 <b>Class:</b> {e.class}
                  </p>
                  <div>
                    <button
                      className="btn btn-blue"
                      style={{ marginTop: 0, padding: "6px 12px", fontSize: "11.5px" }}
                      onClick={() => editExam(e)}
                    >
                      ✏️ Edit Exam
                    </button>
                    <button
                      className="btn btn-gray"
                      style={{ marginTop: 0, padding: "6px 12px", fontSize: "11.5px" }}
                      onClick={() => toggleAlert(e)}
                    >
                      {e.alert ? "Turn Alert OFF" : "Turn Alert ON"}
                    </button>
                    <button
                      className="btn btn-red"
                      style={{ marginTop: 0, padding: "6px 12px", fontSize: "11.5px" }}
                      onClick={() => deleteExam(e)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="white-card">
              <h3 style={{ color: "#1e1145", fontSize: "17px", fontWeight: "800", marginBottom: "12px" }}>
                {editExamId ? "✏️ Edit Exam Details" : "➕ Add New Exam + Send Alert"}
              </h3>
              <label>Exam Name</label>
              <input
                placeholder="ex: Web Development - Unit Test 3"
                value={newExam.name}
                onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
              />
              <div className="row">
                <div>
                  <label>Exam Date</label>
                  <input
                    type="date"
                    value={newExam.date}
                    onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                  />
                </div>
                <div>
                  <label>Exam Time</label>
                  <input
                    type="time"
                    value={newExam.time}
                    onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                  />
                </div>
                <div>
                  <label>Room</label>
                  <input
                    placeholder="Room B-12"
                    value={newExam.room}
                    onChange={(e) => setNewExam({ ...newExam, room: e.target.value })}
                  />
                </div>
                <div>
                  <label>Class</label>
                  <input
                    placeholder="CSE 2nd Year"
                    value={newExam.class}
                    onChange={(e) => setNewExam({ ...newExam, class: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ marginTop: "14px" }}>
                <button className="btn btn-green" onClick={addExam}>
                  {editExamId ? "Update Exam ✅" : "Add Exam + Send Alert 🔔"}
                </button>
                {editExamId && (
                  <button
                    className="btn btn-gray"
                    onClick={() => {
                      setEditExamId(null);
                      setNewExam({ name: "", date: "", time: "", room: "", class: "" });
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ATTENDANCE TAB ==================== */}
        {menu === "attendance" && (
          <div>
            <div className="white-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <h3 style={{ color: "#1e1145", fontSize: "18px", fontWeight: "800", margin: 0 }}>
                  ✅ Student Attendance Management
                </h3>
                <button
                  className="btn btn-green"
                  style={{ margin: 0 }}
                  onClick={saveAttendance}
                >
                  Save Attendance ✅
                </button>
              </div>
              <p style={{ fontSize: "13px", color: "gray", marginBottom: "14px" }}>
                Adjust Present / Total days; it updates percentage automatically and reflects instantly in each Student's Portal.
              </p>

              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Subject</th>
                    <th>Present Days</th>
                    <th>Total Days</th>
                    <th>Attendance %</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a) => {
                    const pres = Number(a.present) || 0;
                    const tot = Number(a.total) || 0;
                    const pct = tot > 0 ? Math.round((pres / tot) * 100) : 0;
                    const attId = a.id || a._id;
                    return (
                      <tr key={attId}>
                        <td><b>{a.name}</b></td>
                        <td>
                          <span style={{ background: "#ede9fe", color: "#6d28d9", padding: "2px 7px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>
                            {a.roll}
                          </span>
                        </td>
                        <td>{a.subject}</td>
                        <td>
                          <input
                            type="number"
                            value={a.present}
                            style={{ width: "72px", height: "32px", padding: "4px 8px" }}
                            onChange={(e) =>
                              setAttendance(
                                attendance.map((x) =>
                                  (x.id === attId || x._id === attId) ? { ...x, present: e.target.value } : x
                                )
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={a.total}
                            style={{ width: "72px", height: "32px", padding: "4px 8px" }}
                            onChange={(e) =>
                              setAttendance(
                                attendance.map((x) =>
                                  (x.id === attId || x._id === attId) ? { ...x, total: e.target.value } : x
                                )
                              )
                            }
                          />
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "800",
                              color: pct >= 75 ? "#10b981" : "#ef4444"
                            }}
                          >
                            {pct}%
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-red"
                            style={{ margin: 0, padding: "5px 10px", fontSize: "11px" }}
                            onClick={() => deleteAttendance(a)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ marginTop: "16px" }}>
                <button
                  className="btn btn-green"
                  onClick={saveAttendance}
                >
                  Save Attendance ✅
                </button>
              </div>
            </div>

            <div className="white-card">
              <h3 style={{ color: "#1e1145", fontSize: "17px", fontWeight: "800", marginBottom: "12px" }}>
                ➕ Add New Student Attendance Record
              </h3>
              <div className="row">
                <div>
                  <label>Student Name</label>
                  <input
                    placeholder="ex: Sneha"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  />
                </div>
                <div>
                  <label>Roll No</label>
                  <input
                    placeholder="CSE-06"
                    value={newStudent.roll}
                    onChange={(e) => setNewStudent({ ...newStudent, roll: e.target.value })}
                  />
                </div>
              </div>
              <div className="row">
                <div>
                  <label>Subject</label>
                  <input
                    value={newStudent.subject}
                    onChange={(e) => setNewStudent({ ...newStudent, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label>Present Days</label>
                  <input
                    type="number"
                    placeholder="18"
                    value={newStudent.present}
                    onChange={(e) => setNewStudent({ ...newStudent, present: e.target.value })}
                  />
                </div>
                <div>
                  <label>Total Days</label>
                  <input
                    type="number"
                    value={newStudent.total}
                    onChange={(e) => setNewStudent({ ...newStudent, total: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn btn-green" onClick={addStudentAttendance}>
                Add Student Record
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<StaffApp />);
