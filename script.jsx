// script.jsx - Student App - React (Modern Dark Navy & Royal Blue Sidebar Layout)
const API = "http://localhost:5000/api";
const { useState, useEffect } = React;

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const s = localStorage.getItem("campus_current_user");
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  });

  const [page, setPage] = useState(() => {
    try {
      return localStorage.getItem("campus_current_user") ? "home" : "login";
    } catch (e) {
      return "login";
    }
  }); // "login" or "home"

  const [role, setRole] = useState("student"); // "student" or "staff"
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regRoll, setRegRoll] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Logged-in student info
  const [studentName, setStudentName] = useState(() => {
    try {
      const s = localStorage.getItem("campus_current_user");
      if (s) {
        const u = JSON.parse(s);
        return u.name || "Hari";
      }
    } catch (e) {}
    return "Hari";
  });

  const [tab, setTab] = useState("home"); // "home" | "attendance" | "myexams" | "timing" | "lost" | "notices" | "profile" | "settings"
  const [search, setSearch] = useState("");

  // Lost & Found
  const [items, setItems] = useState(() => {
    let s = localStorage.getItem("campus_lost");
    if (s) {
      try { return JSON.parse(s); } catch (e) {}
    }
    return [
      { id: 1, title: "Black Wallet", place: "Library", date: "2026-11-15", status: "Found", by: "Priya" },
      { id: 2, title: "ID Card - Arjun", place: "Canteen", date: "2026-11-16", status: "Lost", by: "Arjun" },
      { id: 3, title: "Water Bottle - Steel", place: "Lab 4", date: "2026-11-17", status: "Found", by: "Staff" },
    ];
  });
  const [newItem, setNewItem] = useState({ title: "", place: "", date: "" });
  const [joined, setJoined] = useState([]);

  // Shared staff data
  const [myAttendance, setMyAttendance] = useState(() => {
    let s = localStorage.getItem("campus_attendance");
    let uStr = localStorage.getItem("campus_current_user");
    if (s && uStr) {
      try {
        let arr = JSON.parse(s);
        let u = JSON.parse(uStr);
        let ue = (u.email || "").toLowerCase().trim();
        let ur = (u.roll || "").trim();
        let un = (u.name || "").toLowerCase().trim();
        if (Array.isArray(arr)) {
          return arr.filter(item => {
            const itemEmail = (item.studentEmail || "").toLowerCase().trim();
            const itemRoll = (item.roll || "").trim();
            const itemName = (item.name || "").toLowerCase().trim();
            return (
              (ue && itemEmail === ue) ||
              (ur && itemRoll === ur) ||
              (un && itemName === un) ||
              (un && itemName.startsWith(un)) ||
              (ue === "student@college.com" && (itemRoll === "CSE-05" || itemEmail === "hari@college.com"))
            );
          });
        }
      } catch (e) {}
    }
    return [];
  });

  const [myExams, setMyExams] = useState(() => {
    let s = localStorage.getItem("campus_exams");
    if (s) {
      try { return JSON.parse(s); } catch (e) {}
    }
    return [];
  });

  const [myTimings, setMyTimings] = useState(() => {
    let s = localStorage.getItem("campus_timings");
    if (s) {
      try { return JSON.parse(s); } catch (e) {}
    }
    return [];
  });

  // Fetch initial data from backend API
  useEffect(() => {
    fetchLost();
    const saved = localStorage.getItem("campus_current_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setCurrentUser(u);
        setStudentName(u.name || "Hari");
        fetchStaffData(u);
      } catch (e) {
        fetchStaffData(null);
      }
    } else {
      fetchStaffData(null);
    }
  }, []);

  async function fetchLost() {
    try {
      const res = await fetch(`${API}/lost`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
          localStorage.setItem("campus_lost", JSON.stringify(data));
        }
      }
    } catch (err) {}
  }

  async function fetchStaffData(userParam) {
    const user = userParam !== undefined ? userParam : currentUser;
    const userEmail = (user && user.email) ? user.email.toLowerCase().trim() : "";
    const userRoll = (user && user.roll) ? user.roll.trim() : "";
    const userName = (user && user.name) ? user.name.trim().toLowerCase() : "";
    const userClass = (user && user.class) ? user.class : "CSE 2nd Year";

    try {
      const attUrl = userEmail
        ? `${API}/attendance?email=${encodeURIComponent(userEmail)}`
        : (userRoll ? `${API}/attendance?roll=${encodeURIComponent(userRoll)}` : `${API}/attendance`);

      const [resAtt, resEx, resTime] = await Promise.all([
        fetch(attUrl),
        fetch(`${API}/exams?class=${encodeURIComponent(userClass)}`),
        fetch(`${API}/timings?class=${encodeURIComponent(userClass)}`)
      ]);

      if (resAtt.ok) {
        let a = await resAtt.json();
        if (Array.isArray(a)) {
          if (userEmail || userRoll || userName) {
            a = a.filter(item => {
              const itemEmail = (item.studentEmail || "").toLowerCase().trim();
              const itemRoll = (item.roll || "").trim();
              const itemName = (item.name || "").toLowerCase().trim();
              return (
                (userEmail && itemEmail === userEmail) ||
                (userRoll && itemRoll === userRoll) ||
                (userName && itemName === userName) ||
                (userName && itemName.startsWith(userName)) ||
                (userEmail === "student@college.com" && (itemRoll === "CSE-05" || itemEmail === "hari@college.com"))
              );
            });
          }
          setMyAttendance(a);
          localStorage.setItem("campus_attendance", JSON.stringify(a));
        }
      }

      if (resEx.ok) {
        let ex = await resEx.json();
        if (Array.isArray(ex)) {
          const classExams = ex.filter(e => !e.class || e.class === userClass || e.class === "CSE 2nd Year");
          setMyExams(classExams);
          localStorage.setItem("campus_exams", JSON.stringify(classExams));
        }
      }

      if (resTime.ok) {
        let t = await resTime.json();
        if (Array.isArray(t)) {
          const classTimings = t.filter(item => !item.class || item.class === userClass || item.class === "CSE 2nd Year");
          setMyTimings(classTimings);
          localStorage.setItem("campus_timings", JSON.stringify(classTimings));
        }
      }
    } catch (err) {
      let a = localStorage.getItem("campus_attendance");
      let ex = localStorage.getItem("campus_exams");
      let t = localStorage.getItem("campus_timings");
      if (a) {
        try {
          let parsed = JSON.parse(a);
          if (Array.isArray(parsed) && (userEmail || userRoll || userName)) {
            parsed = parsed.filter(item => {
              const itemEmail = (item.studentEmail || "").toLowerCase().trim();
              const itemRoll = (item.roll || "").trim();
              const itemName = (item.name || "").toLowerCase().trim();
              return (
                (userEmail && itemEmail === userEmail) ||
                (userRoll && itemRoll === userRoll) ||
                (userName && itemName === userName) ||
                (userName && itemName.startsWith(userName)) ||
                (userEmail === "student@college.com" && (itemRoll === "CSE-05" || itemEmail === "hari@college.com"))
              );
            });
          }
          setMyAttendance(parsed || []);
        } catch (e) {}
      }
      if (ex) {
        try {
          let parsed = JSON.parse(ex);
          if (Array.isArray(parsed)) {
            setMyExams(parsed.filter(e => !e.class || e.class === userClass || e.class === "CSE 2nd Year"));
          }
        } catch (e) {}
      }
      if (t) {
        try {
          let parsed = JSON.parse(t);
          if (Array.isArray(parsed)) {
            setMyTimings(parsed.filter(item => !item.class || item.class === userClass || item.class === "CSE 2nd Year"));
          }
        } catch (e) {}
      }
    }
  }

  // Read staff data whenever entering home or switching tabs
  useEffect(() => {
    if (page === "home") {
      fetchStaffData(currentUser);
    }
  }, [page, tab]);

  async function handleStudentLogin(e) {
    e.preventDefault();
    const email = studentEmail.trim().toLowerCase();
    const password = studentPassword.trim();

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.user) {
        const u = data.user;
        setCurrentUser(u);
        setStudentName(u.name || "Hari");
        localStorage.setItem("campus_current_user", JSON.stringify(u));
        setPage("home");
        setMessage("");
        fetchStaffData(u);
        return;
      } else {
        setMessage(data.message || "Invalid student email or password. Use demo: hari@college.com / 123456");
        setIsSuccess(false);
        return;
      }
    } catch (err) {
      // Fallback if backend is not reachable
      const demoUsers = {
        "hari@college.com": { name: "hari", email: "hari@college.com", roll: "CSE-05", class: "CSE 2nd Year", department: "Computer Science" },
        "priya@college.com": { name: "Priya S", email: "priya@college.com", roll: "CSE-01", class: "CSE 2nd Year", department: "Computer Science" },
        "arjun@college.com": { name: "Arjun K", email: "arjun@college.com", roll: "CSE-02", class: "CSE 2nd Year", department: "Computer Science" },
        "student@college.com": { name: "Student", email: "student@college.com", roll: "CSE-05", class: "CSE 2nd Year", department: "Computer Science" }
      };
      if (demoUsers[email] && password === "123456") {
        const u = demoUsers[email];
        setCurrentUser(u);
        setStudentName(u.name);
        localStorage.setItem("campus_current_user", JSON.stringify(u));
        setPage("home");
        setMessage("");
        fetchStaffData(u);
        return;
      }
      alert("Backend not running - Start backend with npm start");
      setMessage("Backend not running - Start backend with npm start");
      setIsSuccess(false);
    }
  }

  async function handleStaffLogin(e) {
    e.preventDefault();
    const email = staffEmail.trim().toLowerCase();
    const password = staffPassword.trim();

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.user) {
        window.location.href = "staff.html";
        return;
      } else {
        setMessage(data.message || "Invalid staff credentials. Access denied.");
        setIsSuccess(false);
        return;
      }
    } catch (err) {
      if (email === "staff@campus.com" && (password === "123456" || password === "Staff@123")) {
        window.location.href = "staff.html";
        return;
      }
      alert("Backend not running - Start backend with npm start");
      setMessage("Backend not running - Start backend with npm start");
      setIsSuccess(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const name = regName.trim();
    const roll = regRoll.trim();
    const email = regEmail.trim().toLowerCase();
    const password = regPassword.trim();

    try {
      const res = await fetch(`${API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, roll, email, password, role: "student" })
      });
      const data = await res.json();

      if (data.success) {
        setRegName("");
        setRegRoll("");
        setRegEmail("");
        setRegPassword("");

        setMessage("Registration successful! Please login.");
        setIsSuccess(true);
        setTimeout(() => {
          setIsRegister(false);
          setRole("student");
        }, 1200);
      } else {
        setMessage(data.message || "Registration failed.");
        setIsSuccess(false);
      }
    } catch (err) {
      alert("Backend not running - Start backend with npm start");
      setMessage("Backend not running - Start backend with npm start");
      setIsSuccess(false);
    }
  }

  async function refreshFromStaff() {
    try {
      await fetchStaffData(currentUser);
      alert("Refreshed from Staff! Data reloaded from server.");
    } catch (err) {
      alert("Refreshed from local cache!");
    }
  }

  function handleLogout() {
    localStorage.removeItem("campus_current_user");
    setCurrentUser(null);
    setStudentName("Hari");
    setMyAttendance([]);
    setMyExams([]);
    setMyTimings([]);
    setPage("login");
    setMessage("");
  }

  async function addItem() {
    if (!newItem.title.trim()) {
      alert("Enter item name");
      return;
    }
    const itemData = {
      title: newItem.title,
      place: newItem.place,
      date: newItem.date,
      status: "Lost",
      by: studentName
    };

    try {
      const res = await fetch(`${API}/lost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData)
      });
      if (res.ok) {
        const saved = await res.json();
        setItems([saved, ...items]);
        setNewItem({ title: "", place: "", date: "" });
        alert("Posted!");
        return;
      }
    } catch (err) {
      alert("Backend not running - Start backend with npm start");
    }

    setItems([
      { id: Date.now(), ...itemData },
      ...items
    ]);
    setNewItem({ title: "", place: "", date: "" });
    alert("Posted!");
  }

  // Calculate dynamic attendance %
  let attendancePct = 85;
  if (myAttendance && myAttendance.length > 0) {
    const pres = Number(myAttendance[0].present) || 0;
    const tot = Number(myAttendance[0].total) || 20;
    if (tot > 0) attendancePct = Math.round((pres / tot) * 100);
  }

  // Display name formatting
  const displayFirstName = studentName ? studentName.split(" ")[0] : "Hari";
  const displayInitial = displayFirstName ? displayFirstName.charAt(0).toUpperCase() : "H";
  const displayRoll = (currentUser && currentUser.roll) ? currentUser.roll : "25BCA042";

  // Breadcrumb tab title map
  const tabTitles = {
    home: "Overview",
    attendance: "Attendance",
    myexams: "Exams",
    timing: "Class Timetable",
    lost: "Lost & Found",
    notices: "Notices",
    profile: "Profile",
    settings: "Settings"
  };

  // Filtered lost items
  let filteredItems = items.filter((i) =>
    i.title && i.title.toLowerCase().includes(search.toLowerCase())
  );

  // Today's classes timeline list (dynamic from API or fallback)
  const timetableSchedule = myTimings.length > 0 ? myTimings.slice(0, 4) : [
    { time: "09:00 AM", subject: "Web Development", room: "Lab 1" },
    { time: "10:00 AM", subject: "Database Systems", room: "Lab 2" },
    { time: "11:30 AM", subject: "Break", room: "Cafeteria" },
    { time: "12:00 PM", subject: "Java Programming", room: "Lab 1" }
  ];

  // Upcoming exams list
  const upcomingExamsList = myExams.length > 0 ? myExams.slice(0, 2) : [
    { name: "Web Development - Unit Test 2", date: "2026-11-25", time: "10:00 AM", room: "Room B-12" },
    { name: "Database Systems - Model Exam", date: "2026-11-28", time: "09:30 AM", room: "Hall 2" }
  ];

  // ==================== LOGIN VIEW ====================
  if (page === "login") {
    return (
      <div className="login-page">
        <header className="login-topbar">
          <div className="brand">
            <span className="brand-icon">CC</span>
            <span>Campus Connect</span>
          </div>
          <span className="top-label">COLLEGE PORTAL</span>
        </header>

        <main className="login-container">
          <section className="welcome-section">
            <span className="eyebrow">YOUR CAMPUS. YOUR COMMUNITY.</span>
            <h1>Everything on campus,<br />connected in one place.</h1>
            <p>
              A simple and smart platform to connect students,
              faculty and campus activities.
            </p>
            <div className="welcome-decoration">
              <span>Learn.</span>
              <span>Connect.</span>
              <span>Grow.</span>
            </div>
          </section>

          <section className="login-card">
            <div className="card-heading">
              <h2>Welcome back!</h2>
              <p>Choose your portal to continue.</p>
            </div>

            <div className="role-tabs">
              <button
                type="button"
                className={role === "student" && !isRegister ? "role-tab active" : "role-tab"}
                id="studentTab"
                onClick={() => { setRole("student"); setIsRegister(false); setMessage(""); }}
              >
                🎓 Student
              </button>
              <button
                type="button"
                className={role === "staff" && !isRegister ? "role-tab active" : "role-tab"}
                id="staffTab"
                onClick={() => { setRole("staff"); setIsRegister(false); setMessage(""); }}
              >
                👨‍🏫 Staff
              </button>
            </div>

            {/* STUDENT LOGIN FORM */}
            {!isRegister && role === "student" && (
              <form id="studentForm" onSubmit={handleStudentLogin}>
                <h3>Student Login</h3>
                <p className="form-description">Access your student account.</p>

                <label htmlFor="studentEmail">Email Address</label>
                <input
                  type="email"
                  id="studentEmail"
                  placeholder="hari@college.com"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  required
                />

                <label htmlFor="studentPassword">Password</label>
                <input
                  type="password"
                  id="studentPassword"
                  placeholder="Enter your password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  required
                />

                <button type="submit" className="primary-btn">
                  Login as Student →
                </button>

                <p className="form-footer">
                  New student?{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsRegister(true);
                      setMessage("");
                    }}
                  >
                    Create an account
                  </a>
                </p>
              </form>
            )}

            {/* STAFF LOGIN FORM */}
            {!isRegister && role === "staff" && (
              <form id="staffForm" onSubmit={handleStaffLogin}>
                <h3>Staff Login</h3>
                <p className="form-description">Authorized staff access only.</p>

                <label htmlFor="staffEmail">Staff Email</label>
                <input
                  type="email"
                  id="staffEmail"
                  placeholder="staff@campus.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  required
                />

                <label htmlFor="staffPassword">Password</label>
                <input
                  type="password"
                  id="staffPassword"
                  placeholder="Enter staff password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  required
                />

                <button type="submit" className="primary-btn staff-btn">
                  Login as Staff →
                </button>

                <p className="form-footer">
                  Staff accounts are provided by the administrator.
                </p>
              </form>
            )}

            {/* STUDENT REGISTRATION */}
            {isRegister && (
              <form id="registerForm" onSubmit={handleRegister}>
                <h3>Create Student Account</h3>
                <p className="form-description">Register to join Campus Connect.</p>

                <label htmlFor="regName">Full Name</label>
                <input
                  type="text"
                  id="regName"
                  placeholder="Enter your full name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />

                <label htmlFor="regRoll">Register Number</label>
                <input
                  type="text"
                  id="regRoll"
                  placeholder="Enter register number (e.g. CSE-05)"
                  value={regRoll}
                  onChange={(e) => setRegRoll(e.target.value)}
                  required
                />

                <label htmlFor="regEmail">Email Address</label>
                <input
                  type="email"
                  id="regEmail"
                  placeholder="Enter your email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />

                <label htmlFor="regPassword">Create Password</label>
                <input
                  type="password"
                  id="regPassword"
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />

                <button type="submit" className="primary-btn">
                  Create Account →
                </button>

                <p className="form-footer">
                  Already registered?{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsRegister(false);
                      setRole("student");
                      setMessage("");
                    }}
                  >
                    Back to login
                  </a>
                </p>
              </form>
            )}

            {message && (
              <p id="message" className={isSuccess ? "message success" : "message"}>
                {message}
              </p>
            )}
          </section>
        </main>

        <footer className="footer">
          © 2026 Campus Connect. All rights reserved.
        </footer>
      </div>
    );
  }

  // ==================== DASHBOARD VIEW (SIDEBAR LAYOUT) ====================
  return (
    <div className="student-layout">
      {/* 1. LEFT SIDEBAR */}
      <aside className="student-sidebar">
        <div className="sidebar-brand">
          <div className="brand-box">CC</div>
          <span className="brand-title">Campus Connect</span>
        </div>

        <div className="menu-label">STUDENT MENU</div>

        <nav className="student-sidebar-menu">
          <button
            className={tab === "home" ? "sidebar-item-btn active" : "sidebar-item-btn"}
            onClick={() => setTab("home")}
          >
            <span className="sidebar-item-icon">⌂</span>
            <span>Overview</span>
          </button>

          <button
            className={tab === "attendance" ? "sidebar-item-btn active" : "sidebar-item-btn"}
            onClick={() => setTab("attendance")}
          >
            <span className="sidebar-item-icon">▣</span>
            <span>Attendance</span>
          </button>

          <button
            className={tab === "myexams" ? "sidebar-item-btn active" : "sidebar-item-btn"}
            onClick={() => setTab("myexams")}
          >
            <span className="sidebar-item-icon">▤</span>
            <span>Exams</span>
          </button>

          <button
            className={tab === "timing" ? "sidebar-item-btn active" : "sidebar-item-btn"}
            onClick={() => setTab("timing")}
          >
            <span className="sidebar-item-icon">◷</span>
            <span>Class Timetable</span>
          </button>

          <button
            className={tab === "lost" ? "sidebar-item-btn active" : "sidebar-item-btn"}
            onClick={() => setTab("lost")}
          >
            <span className="sidebar-item-icon">⌕</span>
            <span>Lost &amp; Found</span>
          </button>

          <button
            className={tab === "notices" ? "sidebar-item-btn active" : "sidebar-item-btn"}
            onClick={() => setTab("notices")}
          >
            <span className="sidebar-item-icon">◢</span>
            <span>Notices</span>
          </button>

          <button
            className={tab === "profile" ? "sidebar-item-btn active" : "sidebar-item-btn"}
            onClick={() => setTab("profile")}
          >
            <span className="sidebar-item-icon">👤</span>
            <span>Profile</span>
          </button>

          <button
            className={tab === "settings" ? "sidebar-item-btn active" : "sidebar-item-btn"}
            onClick={() => setTab("settings")}
          >
            <span className="sidebar-item-icon">⚙</span>
            <span>Settings</span>
          </button>
        </nav>

        <div className="student-sidebar-profile">
          <div className="student-avatar">{displayInitial}</div>
          <div className="student-profile-text">
            <div className="student-profile-name">{studentName}</div>
            <div className="student-profile-roll">{displayRoll}</div>
          </div>
          <div className="online-dot" title="Online"></div>
        </div>
      </aside>

      {/* 2. MAIN AREA */}
      <main className="student-main">
        {/* TOP HEADER */}
        <header className="student-topbar">
          <div className="student-breadcrumb">
            <span className="bc-home">⌂</span>
            <span>Home</span>
            <span className="bc-sep">›</span>
            <span>Student Portal</span>
            <span className="bc-sep">/</span>
            <span className="bc-current">{tabTitles[tab] || "Overview"}</span>
          </div>

          <div className="student-topbar-actions">
            <div className="top-search-wrap">
              <span className="top-search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search anything..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="bell-btn" title="3 Notifications" onClick={() => setTab("notices")}>
              🔔
              <span className="bell-badge-pill">3</span>
            </button>

            <div className="user-pill" onClick={() => setTab("profile")}>
              <div className="user-pill-avatar">{displayInitial}</div>
              <span>Hi, {displayFirstName}</span>
            </div>

            <button className="logout-pill-btn" onClick={handleLogout} title="Sign Out">
              Logout ↪
            </button>
          </div>
        </header>

        {/* OVERVIEW (HOME) TAB */}
        {tab === "home" && (
          <div>
            {/* HERO BANNER */}
            <div className="hero-banner-card">
              <div className="hero-banner-content">
                <h1>Good morning, {displayFirstName} 👋</h1>
                <p>Here's your campus overview for today.</p>
                <div className="hero-action-row">
                  <input
                    className="hero-search-input"
                    placeholder="Search lost items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="hero-refresh-btn" onClick={refreshFromStaff}>
                    🔄 Refresh from Staff
                  </button>
                  <span className="hero-badge-pill">
                    👥 Class: {currentUser?.class || "CSE 2nd Year"}
                  </span>
                </div>
              </div>

              <div className="hero-illustration">
                <svg viewBox="0 0 150 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="25" width="110" height="70" rx="8" fill="#ffffff" fillOpacity="0.1" stroke="#ffffff" strokeWidth="1.5"/>
                  <rect x="30" y="35" width="40" height="7" rx="3.5" fill="#2e90fa"/>
                  <rect x="30" y="48" width="60" height="3" rx="1.5" fill="#94a3b8"/>
                  <rect x="30" y="56" width="45" height="3" rx="1.5" fill="#94a3b8"/>
                  <rect x="30" y="64" width="52" height="3" rx="1.5" fill="#94a3b8"/>
                  <circle cx="105" cy="55" r="14" fill="#12b76a"/>
                  <path d="M100 55L103 58L111 50" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M50 100L75 92L100 100" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            {/* 4 STAT CARDS */}
            <div className="stat-cards-grid">
              {/* Card 1: Attendance */}
              <div className="stat-card-modern" onClick={() => setTab("attendance")}>
                <div className="stat-card-top-row">
                  <div className="stat-card-icon-box blue">▣</div>
                  <span className="stat-delta-badge">▲ +2%</span>
                </div>
                <div className="stat-card-label">Attendance</div>
                <div className="stat-card-val">{attendancePct}%</div>
                <div className="stat-progress-track">
                  <div className="stat-progress-bar blue" style={{ width: `${Math.min(attendancePct, 100)}%` }}></div>
                </div>
              </div>

              {/* Card 2: Upcoming Exams */}
              <div className="stat-card-modern" onClick={() => setTab("myexams")}>
                <div className="stat-card-top-row">
                  <div className="stat-card-icon-box purple">▤</div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#6941c6" }}>Upcoming</span>
                </div>
                <div className="stat-card-label">Upcoming Exams</div>
                <div className="stat-card-val">{myExams.length}</div>
                <div className="stat-progress-track">
                  <div className="stat-progress-bar purple" style={{ width: `${Math.min(myExams.length * 40, 100)}%` }}></div>
                </div>
              </div>

              {/* Card 3: Classes Today */}
              <div className="stat-card-modern" onClick={() => setTab("timing")}>
                <div className="stat-card-top-row">
                  <div className="stat-card-icon-box green">◷</div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#027a48" }}>Active</span>
                </div>
                <div className="stat-card-label">Classes Today</div>
                <div className="stat-card-val">{myTimings.length || 4}</div>
                <div className="stat-progress-track">
                  <div className="stat-progress-bar green" style={{ width: "72%" }}></div>
                </div>
              </div>

              {/* Card 4: Notices */}
              <div className="stat-card-modern" onClick={() => setTab("notices")}>
                <div className="stat-card-top-row">
                  <div className="stat-card-icon-box orange">◢</div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#c4320a" }}>New</span>
                </div>
                <div className="stat-card-label">Notices</div>
                <div className="stat-card-val">3</div>
                <div className="stat-progress-track">
                  <div className="stat-progress-bar orange" style={{ width: "68%" }}></div>
                </div>
              </div>
            </div>

            {/* MIDDLE ROW (2 CARDS) */}
            <div className="middle-two-grid">
              {/* Left: Today's Timetable */}
              <div className="white-panel">
                <div className="panel-header">
                  <h3>▦ Today's Timetable</h3>
                  <span className="panel-date-pill">Wed, Nov 19, 2025</span>
                </div>
                <div className="timetable-timeline">
                  {timetableSchedule.map((item, idx) => (
                    <div className="timeline-row-item" key={idx}>
                      <span className="timeline-time-col">{item.time}</span>
                      <div className="timeline-dot-col">
                        <span className="timeline-dot-circle"></span>
                      </div>
                      <span className="timeline-title-col">{item.subject}</span>
                      <span className="timeline-room-col">{item.room}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Upcoming Exams */}
              <div className="white-panel">
                <div className="panel-header">
                  <h3>▤ Upcoming Exams</h3>
                  <button className="panel-link-btn" onClick={() => setTab("myexams")}>
                    View All →
                  </button>
                </div>
                <div className="exam-cards-list">
                  {upcomingExamsList.map((exam, i) => {
                    const daysLabel = i === 0 ? "In 3 Days" : "In 6 Days";
                    const monthStr = "NOV";
                    const dayStr = i === 0 ? "22" : "25";
                    return (
                      <div className="exam-item-box" key={exam.id || exam._id || i}>
                        <div className="exam-date-block">
                          <span className="month">{monthStr}</span>
                          <span className="day">{dayStr}</span>
                        </div>
                        <div className="exam-info-block">
                          <b>{exam.name}</b>
                          <span>{exam.time || "10:00 AM"} • {exam.room || "Hall A"}</span>
                        </div>
                        <span className="exam-status-tag">{daysLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BOTTOM ROW (2 CARDS) */}
            <div className="bottom-two-grid">
              {/* Left: Attendance Trend */}
              <div className="white-panel">
                <div className="panel-header">
                  <h3>▥ Attendance Trend</h3>
                  <span className="panel-date-pill" style={{ cursor: "pointer" }}>
                    Last 6 Months ⌄
                  </span>
                </div>
                <div className="attendance-chart-wrap">
                  <div className="chart-y-axis">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>

                  {[
                    ["May", 78],
                    ["Jun", 82],
                    ["Jul", 85],
                    ["Aug", 90],
                    ["Sep", 88],
                    ["Oct", 92]
                  ].map((bar) => (
                    <div className="chart-bar-column" key={bar[0]}>
                      <div
                        className={bar[0] === "Oct" ? "chart-bar-fill highlight" : "chart-bar-fill"}
                        style={{ height: `${bar[1]}%` }}
                      >
                        <span className="chart-bar-label-top">{bar[1]}%</span>
                      </div>
                      <span className="chart-month-name">{bar[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Campus Updates */}
              <div className="white-panel">
                <div className="panel-header">
                  <h3>◢ Campus Updates</h3>
                  <button className="panel-link-btn" onClick={() => setTab("notices")}>
                    View All →
                  </button>
                </div>
                <div className="updates-list-wrap">
                  <div className="update-item-row">
                    <span className="update-dot blue"></span>
                    <span className="update-title">College Symposium 2025 – Register Now!</span>
                    <span className="update-date">Nov 18, 2025</span>
                  </div>
                  <div className="update-item-row">
                    <span className="update-dot orange"></span>
                    <span className="update-title">Library Timings Extended till 9 PM</span>
                    <span className="update-date">Nov 17, 2025</span>
                  </div>
                  <div className="update-item-row">
                    <span className="update-dot green"></span>
                    <span className="update-title">Exam Hall Tickets Available in Student Portal</span>
                    <span className="update-date">Nov 15, 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="quick-actions-bar">
              <h4>⚡ Quick Actions</h4>
              <div className="quick-action-btns-group">
                <button className="qa-btn primary" onClick={() => setTab("attendance")}>
                  ▥ View Results →
                </button>
                <button
                  className="qa-btn secondary"
                  onClick={() => alert("Feedback submitted! Thank you.")}
                >
                  ♟ Submit Feedback →
                </button>
                <button className="qa-btn secondary" onClick={() => setTab("lost")}>
                  ◇ Report Lost Item →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {tab === "attendance" && (
          <div>
            <div className="attendance-detail-card">
              <div className="attendance-hero-row">
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#101828", marginBottom: "4px" }}>
                    My Attendance Record ✅
                  </h2>
                  <p style={{ color: "#667085", fontSize: "13px" }}>
                    Official attendance verified and synchronized by faculty staff.
                  </p>
                </div>
                <div className={attendancePct >= 75 ? "att-big-pct green" : "att-big-pct red"}>
                  {attendancePct}%
                </div>
              </div>

              {myAttendance.length === 0 ? (
                <p style={{ color: "#98a2b3", fontSize: "14px", padding: "16px 0" }}>
                  {"No attendance yet for " + studentName + ". Ask staff to add."}
                </p>
              ) : (
                <div>
                  <div className="attendance-stat-chips">
                    <span className="att-chip"><b>Student:</b> {myAttendance[0].name}</span>
                    <span className="att-chip"><b>Register No:</b> {myAttendance[0].roll}</span>
                    <span className="att-chip"><b>Subject:</b> {myAttendance[0].subject}</span>
                    <span className="att-chip">
                      <b>Present Days:</b> {myAttendance[0].present} / {myAttendance[0].total} days
                    </span>
                    <span className="att-chip" style={{ background: attendancePct >= 75 ? "#ecfdf3" : "#fef3f2", color: attendancePct >= 75 ? "#027a48" : "#b42318" }}>
                      <b>Status:</b> {attendancePct >= 75 ? "Eligible (Good)" : "Shortage Warning"}
                    </span>
                  </div>

                  <table className="modern-table" style={{ marginTop: "20px" }}>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Present Days</th>
                        <th>Total Days</th>
                        <th>Percentage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myAttendance.map((a, i) => {
                        const pres = Number(a.present) || 0;
                        const tot = Number(a.total) || 20;
                        const pct = tot > 0 ? Math.round((pres / tot) * 100) : 0;
                        return (
                          <tr key={a.id || a._id || i}>
                            <td><b>{a.subject}</b></td>
                            <td>{a.present}</td>
                            <td>{a.total}</td>
                            <td>
                              <b style={{ color: pct >= 75 ? "#12b76a" : "#f04438" }}>
                                {pct}%
                              </b>
                            </td>
                            <td>
                              <span
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: "10px",
                                  fontSize: "11px",
                                  fontWeight: "750",
                                  background: pct >= 75 ? "#ecfdf3" : "#fef3f2",
                                  color: pct >= 75 ? "#027a48" : "#b42318"
                                }}
                              >
                                {pct >= 75 ? "Satisfactory" : "Low Attendance"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EXAMS TAB */}
        {tab === "myexams" && (
          <div>
            <div className="white-panel" style={{ marginBottom: "16px" }}>
              <div className="panel-header">
                <h3>▤ Upcoming Semester &amp; Model Exams</h3>
                <span className="panel-date-pill">{myExams.length} Exams Scheduled</span>
              </div>
              <p style={{ color: "#667085", fontSize: "13px", marginBottom: "16px" }}>
                Exams published by your department faculty for {currentUser?.class || "CSE 2nd Year"}.
              </p>

              {myExams.length === 0 ? (
                <p style={{ color: "#98a2b3", fontSize: "14px" }}>No upcoming exam alerts.</p>
              ) : (
                <div className="exam-cards-list">
                  {myExams.map((e, idx) => (
                    <div className="exam-item-box" key={e.id || e._id || idx}>
                      <div className="exam-date-block">
                        <span className="month">EXAM</span>
                        <span className="day">{idx + 1}</span>
                      </div>
                      <div className="exam-info-block">
                        <b>{e.name}</b>
                        <span>📅 Date: {e.date} • 🕒 Time: {e.time} • 🏫 Room: {e.room} • 👥 {e.class}</span>
                      </div>
                      <span className="exam-status-tag" style={{ background: e.alert ? "#ecfdf3" : "#fef3f2", color: e.alert ? "#027a48" : "#b42318" }}>
                        {e.alert ? "🔔 Alert ON" : "🔕 Alert OFF"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TIMING TAB */}
        {tab === "timing" && (
          <div>
            <div className="white-panel">
              <div className="panel-header">
                <h3>◷ Class Timetable &amp; Schedule</h3>
                <span className="panel-date-pill">{currentUser?.class || "CSE 2nd Year"}</span>
              </div>
              <p style={{ color: "#667085", fontSize: "13px", marginBottom: "16px" }}>
                Weekly class timings configured by department staff.
              </p>

              {myTimings.length === 0 ? (
                <p style={{ color: "#98a2b3", fontSize: "14px" }}>No timetable records found.</p>
              ) : (
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Subject</th>
                      <th>Time</th>
                      <th>Room</th>
                      <th>Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTimings.map((t) => (
                      <tr key={t.id || t._id}>
                        <td><b>{t.day}</b></td>
                        <td>{t.subject}</td>
                        <td>{t.time}</td>
                        <td>{t.room}</td>
                        <td>{t.class}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* LOST & FOUND TAB */}
        {tab === "lost" && (
          <div>
            <div className="white-panel" style={{ marginBottom: "16px" }}>
              <div className="panel-header">
                <h3>⌕ Lost &amp; Found Campus Hub</h3>
                <span className="panel-date-pill">{filteredItems.length} Items</span>
              </div>
              <p style={{ color: "#667085", fontSize: "13px", marginBottom: "16px" }}>
                Found an item or lost something on campus? Post details below or claim matching items.
              </p>

              {/* Form to Post Lost Item */}
              <div className="lost-form-box">
                <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#101828", marginBottom: "10px" }}>
                  ➕ Report a Lost or Found Item
                </h4>
                <input
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d0d5dd", marginBottom: "8px" }}
                  placeholder="Item name (ex: Black Wallet)"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
                <input
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d0d5dd", marginBottom: "8px" }}
                  placeholder="Location (ex: Library Hall)"
                  value={newItem.place}
                  onChange={(e) => setNewItem({ ...newItem, place: e.target.value })}
                />
                <input
                  type="date"
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d0d5dd", marginBottom: "12px" }}
                  value={newItem.date}
                  onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                />
                <button className="primary-btn" style={{ margin: 0, padding: "10px" }} onClick={addItem}>
                  Post Item +
                </button>
              </div>

              {/* Items Cards */}
              <div className="lost-cards-grid">
                {filteredItems.map((item) => (
                  <div className="lost-item-card" key={item.id || item._id}>
                    <div>
                      <span className={item.status === "Found" ? "lost-item-tag found" : "lost-item-tag lost"}>
                        {item.status}
                      </span>
                      <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#101828", margin: "4px 0 6px" }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: "12.5px", color: "#667085", lineHeight: "1.5" }}>
                        📍 <b>Place:</b> {item.place}<br />
                        📅 <b>Date:</b> {item.date}<br />
                        👤 <b>Posted by:</b> {item.by}
                      </p>
                    </div>

                    <button
                      className={joined.includes(item.id || item._id) ? "claim-btn claimed" : "claim-btn"}
                      onClick={() => {
                        const itemId = item.id || item._id;
                        if (!joined.includes(itemId)) {
                          setJoined([...joined, itemId]);
                          alert("Claim request registered with Campus Security!");
                        } else {
                          alert("Already requested.");
                        }
                      }}
                    >
                      {joined.includes(item.id || item._id) ? "Requested ✓" : "Claim This Item"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NOTICES TAB */}
        {tab === "notices" && (
          <div>
            <div className="white-panel">
              <div className="panel-header">
                <h3>◢ Campus Official Notices &amp; Bulletins</h3>
                <span className="panel-date-pill">Active Alerts</span>
              </div>
              <div className="updates-list-wrap" style={{ marginTop: "12px" }}>
                <div className="white-panel" style={{ marginBottom: "10px", borderLeft: "4px solid #155eef" }}>
                  <b style={{ color: "#101828" }}>College Symposium 2025 – Paper Submission Open</b>
                  <p style={{ color: "#667085", fontSize: "13px", margin: "6px 0" }}>
                    The annual inter-college symposium registration has commenced. Submit project proposals before Nov 30.
                  </p>
                  <small style={{ color: "#98a2b3" }}>Published: Nov 18, 2025 • Dean Office</small>
                </div>

                <div className="white-panel" style={{ marginBottom: "10px", borderLeft: "4px solid #f79009" }}>
                  <b style={{ color: "#101828" }}>Central Library Extended Operating Hours</b>
                  <p style={{ color: "#667085", fontSize: "13px", margin: "6px 0" }}>
                    In view of upcoming unit tests, central library reading hall will remain open until 9:00 PM on weekdays.
                  </p>
                  <small style={{ color: "#98a2b3" }}>Published: Nov 17, 2025 • Library Administration</small>
                </div>

                <div className="white-panel" style={{ borderLeft: "4px solid #12b76a" }}>
                  <b style={{ color: "#101828" }}>Hall Tickets Available for Download</b>
                  <p style={{ color: "#667085", fontSize: "13px", margin: "6px 0" }}>
                    Students with attendance above 75% can verify their exam hall tickets under the Exams tab.
                  </p>
                  <small style={{ color: "#98a2b3" }}>Published: Nov 15, 2025 • Examination Cell</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <div>
            <div className="white-panel">
              <div className="panel-header">
                <h3>👤 Student Profile Details</h3>
                <span className="panel-date-pill">Verified Student</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#155eef", color: "white", fontSize: "24px", fontWeight: "800", display: "grid", placeItems: "center" }}>
                  {displayInitial}
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", color: "#101828" }}>{studentName}</h3>
                  <span style={{ fontSize: "13px", color: "#667085" }}>{currentUser?.email || "hari@college.com"}</span>
                </div>
              </div>

              <div className="attendance-stat-chips">
                <span className="att-chip"><b>Register No:</b> {displayRoll}</span>
                <span className="att-chip"><b>Department:</b> {currentUser?.department || "Computer Science"}</span>
                <span className="att-chip"><b>Class:</b> {currentUser?.class || "CSE 2nd Year"}</span>
                <span className="att-chip"><b>Role:</b> Student</span>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <div>
            <div className="white-panel">
              <div className="panel-header">
                <h3>⚙ Portal Settings</h3>
              </div>
              <p style={{ color: "#667085", fontSize: "13px", marginBottom: "14px" }}>
                Preferences and account security.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                  <input type="checkbox" defaultChecked style={{ width: "auto" }} /> Email notification alerts for exam schedules
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                  <input type="checkbox" defaultChecked style={{ width: "auto" }} /> Show attendance trend analytics on overview
                </label>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
