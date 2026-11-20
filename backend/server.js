const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/campusconnect';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('MongoDB Connected - Compass Ready');
    autoSeed();
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
  });

// Schemas & Models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  roll: { type: String, default: '' },
  department: { type: String, default: 'Computer Science' },
  class: { type: String, default: 'CSE 2nd Year' },
  portalStatus: { type: String, default: 'Active' },
  accessType: { type: String, default: 'Staff' },
  phone: { type: String, default: '98410 12345' },
  subject: { type: String, default: 'Web Development' }
}, {
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; return ret; } }
});

const attendanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll: { type: String, default: '' },
  studentEmail: { type: String, default: '' },
  subject: { type: String, default: 'Web Development' },
  present: { type: Number, default: 0 },
  total: { type: Number, default: 20 }
}, {
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; return ret; } }
});

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, default: '' },
  time: { type: String, default: '' },
  room: { type: String, default: '' },
  class: { type: String, default: '' },
  alert: { type: Boolean, default: true }
}, {
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; return ret; } }
});

const timingSchema = new mongoose.Schema({
  day: { type: String, required: true },
  subject: { type: String, required: true },
  time: { type: String, default: '' },
  room: { type: String, default: '' },
  class: { type: String, default: '' }
}, {
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; return ret; } }
});

const lostItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  place: { type: String, default: '' },
  date: { type: String, default: '' },
  status: { type: String, default: 'Lost' },
  by: { type: String, default: 'Student' }
}, {
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; return ret; } }
});

const User = mongoose.model('User', userSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Exam = mongoose.model('Exam', examSchema);
const Timing = mongoose.model('Timing', timingSchema);
const LostItem = mongoose.model('LostItem', lostItemSchema);

// Initial / Seed Data
const demoUsers = [
  {
    name: 'Student',
    email: 'student@college.com',
    password: '123456',
    role: 'student',
    roll: 'CSE-05',
    department: 'Computer Science',
    class: 'CSE 2nd Year'
  },
  {
    name: 'hari',
    email: 'hari@college.com',
    password: '123456',
    role: 'student',
    roll: 'CSE-05',
    department: 'Computer Science',
    class: 'CSE 2nd Year'
  },
  {
    name: 'Priya',
    email: 'priya@college.com',
    password: '123456',
    role: 'student',
    roll: 'CSE-01',
    department: 'Computer Science',
    class: 'CSE 2nd Year'
  },
  {
    name: 'Arjun',
    email: 'arjun@college.com',
    password: '123456',
    role: 'student',
    roll: 'CSE-02',
    department: 'Computer Science',
    class: 'CSE 2nd Year'
  },
  {
    name: 'Campus Staff',
    email: 'staff@campus.com',
    password: '123456',
    role: 'staff',
    department: 'Computer Science',
    portalStatus: 'Active',
    accessType: 'Staff',
    phone: '98410 12345',
    subject: 'Web Development'
  }
];

const demoStaffList = [
  {
    name: 'Priya',
    email: 'priya@campus.com',
    password: '123456',
    role: 'staff',
    department: 'Computer Science',
    portalStatus: 'Active',
    accessType: 'Staff',
    phone: '98410 11111',
    subject: 'Web Development'
  },
  {
    name: 'Arjun',
    email: 'arjun@campus.com',
    password: '123456',
    role: 'staff',
    department: 'ECE',
    portalStatus: 'Active',
    accessType: 'Teacher',
    phone: '98410 22222',
    subject: 'DBMS'
  },
  {
    name: 'Meera',
    email: 'meera@campus.com',
    password: '123456',
    role: 'staff',
    department: 'Computer Science',
    portalStatus: 'On Leave',
    accessType: 'Staff',
    phone: '98410 33333',
    subject: 'Python'
  },
  {
    name: 'Karthik',
    email: 'karthik@campus.com',
    password: '123456',
    role: 'staff',
    department: 'EEE',
    portalStatus: 'Inactive',
    accessType: 'HOD',
    phone: '98410 44444',
    subject: 'Electrical'
  },
  {
    name: 'Sneha',
    email: 'sneha@campus.com',
    password: '123456',
    role: 'staff',
    department: 'IT',
    portalStatus: 'Active',
    accessType: 'Admin',
    phone: '98410 55555',
    subject: 'Networks'
  },
  {
    name: 'Ravi',
    email: 'ravi@campus.com',
    password: '123456',
    role: 'staff',
    department: 'MECH',
    portalStatus: 'Active',
    accessType: 'Principal',
    phone: '98410 66666',
    subject: 'Mechanical'
  }
];

const demoAttendance = [
  { name: 'Priya S', roll: 'CSE-01', studentEmail: 'priya@college.com', subject: 'Web Development', present: 19, total: 20 },
  { name: 'Arjun K', roll: 'CSE-02', studentEmail: 'arjun@college.com', subject: 'Web Development', present: 15, total: 20 },
  { name: 'Meera R', roll: 'CSE-03', studentEmail: 'meera@college.com', subject: 'Web Development', present: 19, total: 20 },
  { name: 'Karthik M', roll: 'CSE-04', studentEmail: 'karthik@college.com', subject: 'Web Development', present: 12, total: 20 },
  { name: 'hari', roll: 'CSE-05', studentEmail: 'hari@college.com', subject: 'Web Development', present: 17, total: 20 }
];

const demoExams = [
  { name: 'Web Development - Unit Test 2', date: '2026-11-25', time: '10:00 AM', room: 'Room B-12', class: 'CSE 2nd Year', alert: true },
  { name: 'DBMS - Model Exam', date: '2026-11-28', time: '09:30 AM', room: 'Hall 2', class: 'CSE 2nd Year', alert: true },
  { name: 'Python - Practical Exam', date: '2026-12-02', time: '02:00 PM', room: 'Lab 2', class: 'CSE 3rd Year', alert: false }
];

const demoTimings = [
  { day: 'Monday', subject: 'Web Development', time: '09:00 AM - 10:00 AM', room: 'Lab 4', class: 'CSE 2nd Year' },
  { day: 'Tuesday', subject: 'DBMS', time: '11:00 AM - 12:00 PM', room: 'Room B-12', class: 'CSE 2nd Year' },
  { day: 'Wednesday', subject: 'Python Lab', time: '02:00 PM - 04:00 PM', room: 'Lab 2', class: 'CSE 3rd Year' },
  { day: 'Thursday', subject: 'Web Development', time: '10:00 AM - 11:00 AM', room: 'Lab 4', class: 'CSE 2nd Year' },
  { day: 'Friday', subject: 'Project Hour', time: '03:00 PM - 04:00 PM', room: 'Seminar Hall', class: 'CSE Final Year' }
];

const demoLostItems = [
  { title: 'Black Wallet', place: 'Library', date: '2026-11-15', status: 'Found', by: 'Priya' },
  { title: 'ID Card - Arjun', place: 'Canteen', date: '2026-11-16', status: 'Lost', by: 'Arjun' },
  { title: 'Water Bottle - Steel', place: 'Lab 4', date: '2026-11-17', status: 'Found', by: 'Staff' }
];

async function seedDemoStudentsAndAttendance() {
  const students = [
    { name: 'hari', email: 'hari@college.com', password: '123456', role: 'student', roll: 'CSE-05', department: 'Computer Science', class: 'CSE 2nd Year' },
    { name: 'Priya', email: 'priya@college.com', password: '123456', role: 'student', roll: 'CSE-01', department: 'Computer Science', class: 'CSE 2nd Year' },
    { name: 'Arjun', email: 'arjun@college.com', password: '123456', role: 'student', roll: 'CSE-02', department: 'Computer Science', class: 'CSE 2nd Year' }
  ];

  for (const s of students) {
    const existing = await User.findOne({ email: s.email });
    if (!existing) {
      await User.create(s);
    } else {
      let updated = false;
      if (!existing.roll) { existing.roll = s.roll; updated = true; }
      if (!existing.class) { existing.class = s.class; updated = true; }
      if (updated) await existing.save();
    }
  }

  // Ensure attendances link to studentEmail and roll
  const attMapping = [
    { namePattern: /hari/i, roll: 'CSE-05', studentEmail: 'hari@college.com', present: 17, total: 20, name: 'hari' },
    { namePattern: /priya/i, roll: 'CSE-01', studentEmail: 'priya@college.com', present: 19, total: 20, name: 'Priya S' },
    { namePattern: /arjun/i, roll: 'CSE-02', studentEmail: 'arjun@college.com', present: 15, total: 20, name: 'Arjun K' },
    { namePattern: /meera/i, roll: 'CSE-03', studentEmail: 'meera@college.com', present: 19, total: 20, name: 'Meera R' },
    { namePattern: /karthik/i, roll: 'CSE-04', studentEmail: 'karthik@college.com', present: 12, total: 20, name: 'Karthik M' }
  ];

  for (const m of attMapping) {
    const found = await Attendance.findOne({
      $or: [
        { studentEmail: m.studentEmail },
        { roll: m.roll },
        { name: m.namePattern }
      ]
    });
    if (found) {
      found.studentEmail = m.studentEmail;
      found.roll = m.roll;
      found.name = m.name;
      found.present = m.present;
      found.total = m.total;
      await found.save();
    } else {
      await Attendance.create({
        name: m.name,
        roll: m.roll,
        studentEmail: m.studentEmail,
        subject: 'Web Development',
        present: m.present,
        total: m.total
      });
    }
  }
}

async function seedDemoStaff() {
  for (const s of demoStaffList) {
    const exists = await User.findOne({ email: s.email });
    if (!exists) {
      await User.create(s);
    }
  }
}

async function autoSeed() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial demo data...');
      await User.insertMany(demoUsers);
      await Attendance.insertMany(demoAttendance);
      await Exam.insertMany(demoExams);
      await Timing.insertMany(demoTimings);
      await LostItem.insertMany(demoLostItems);
      console.log('Demo data seeded successfully!');
    }
    await seedDemoStaff();
    await seedDemoStudentsAndAttendance();
  } catch (err) {
    console.error('Auto seed error:', err.message);
  }
}

// Routes
app.get('/', (req, res) => {
  res.send('Campus Connect Backend Running');
});

// Seed endpoint
app.get('/api/seed', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(demoUsers);
      await Attendance.insertMany(demoAttendance);
      await Exam.insertMany(demoExams);
      await Timing.insertMany(demoTimings);
      await LostItem.insertMany(demoLostItems);
    }
    await seedDemoStaff();
    await seedDemoStudentsAndAttendance();
    return res.json({ success: true, message: 'Campus Connect demo data created in MongoDB Compass!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Staff list with filters
app.get('/api/staff', async (req, res) => {
  try {
    const query = { role: { $ne: 'student' } };
    if (req.query.status && req.query.status !== 'All') {
      query.portalStatus = req.query.status;
    }
    if (req.query.department && req.query.department !== 'All') {
      query.department = req.query.department;
    }
    if (req.query.accessType && req.query.accessType !== 'All') {
      query.accessType = req.query.accessType;
    }
    const staffMembers = await User.find(query);
    res.json(staffMembers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth Routes
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = await User.findOne({ email: cleanEmail, password: cleanPassword });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Access denied.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, role, roll } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This email is already registered.' });
    }
    if (roll) {
      const existingRoll = await User.findOne({ roll: roll.trim() });
      if (existingRoll) {
        return res.status(400).json({ success: false, message: 'This register number is already registered.' });
      }
    }
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      role: role || 'student',
      roll: roll ? roll.trim() : ''
    });
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Attendance Routes
app.get('/api/attendance', async (req, res) => {
  try {
    const { email, roll } = req.query;
    let filter = {};

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const studentUser = await User.findOne({ email: cleanEmail });
      const orConditions = [{ studentEmail: cleanEmail }];

      if (cleanEmail === 'student@college.com') {
        orConditions.push({ roll: 'CSE-05' }, { studentEmail: 'hari@college.com' });
      }

      if (studentUser) {
        if (studentUser.roll) orConditions.push({ roll: studentUser.roll });
        if (studentUser.name) orConditions.push({ name: new RegExp('^' + studentUser.name + '$', 'i') });
      } else {
        const namePrefix = cleanEmail.split('@')[0];
        orConditions.push({ name: new RegExp('^' + namePrefix + '$', 'i') });
      }
      filter.$or = orConditions;
    } else if (roll) {
      filter.roll = roll.trim();
    }

    const attendances = await Attendance.find(filter);
    res.json(attendances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { name, roll, studentEmail, subject, present, total } = req.body;
    const item = await Attendance.create({
      name,
      roll: roll || '',
      studentEmail: studentEmail || '',
      subject: subject || 'Web Development',
      present: Number(present) || 0,
      total: Number(total) || 20
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/attendance/:id', async (req, res) => {
  try {
    const item = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/attendance/:id', async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Attendance deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Exam Routes
app.get('/api/exams', async (req, res) => {
  try {
    const filter = {};
    if (req.query.class) filter.class = req.query.class;
    const exams = await Exam.find(filter);
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/exams', async (req, res) => {
  try {
    const item = await Exam.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/exams/:id', async (req, res) => {
  try {
    const item = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/exams/:id', async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Timing Routes
app.get('/api/timings', async (req, res) => {
  try {
    const filter = {};
    if (req.query.class) filter.class = req.query.class;
    const timings = await Timing.find(filter);
    res.json(timings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/timings', async (req, res) => {
  try {
    const item = await Timing.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/timings/:id', async (req, res) => {
  try {
    await Timing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Timing deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lost Items Routes
app.get('/api/lost', async (req, res) => {
  try {
    const items = await LostItem.find().sort({ _id: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/lost', async (req, res) => {
  try {
    const item = await LostItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profile Routes
app.get('/api/profile/:id', async (req, res) => {
  try {
    let user;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      user = await User.findById(req.params.id);
    } else {
      user = await User.findOne({ email: req.params.id }) || await User.findOne({ role: 'staff' });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profile/:id', async (req, res) => {
  try {
    let user;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    } else {
      user = await User.findOneAndUpdate({ email: req.params.id }, req.body, { new: true }) ||
             await User.findOneAndUpdate({ role: 'staff' }, req.body, { new: true });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subjects Schema & Model
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, default: '' },
  teacher: { type: String, default: '' },
  type: { type: String, default: 'Theory' },
  department: { type: String, default: 'Computer Science' },
  class: { type: String, default: 'CSE 2nd Year' }
}, {
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id; return ret; } }
});
const Subject = mongoose.model('Subject', subjectSchema);

const demoSubjects = [
  { name: 'Web Development',      code: 'CS301', teacher: 'Priya S',  type: 'Theory',    department: 'Computer Science', class: 'CSE 2nd Year' },
  { name: 'Database Management',  code: 'CS302', teacher: 'Arjun K',  type: 'Theory',    department: 'Computer Science', class: 'CSE 2nd Year' },
  { name: 'Software Engineering', code: 'CS303', teacher: 'Meera R',  type: 'Practical', department: 'Computer Science', class: 'CSE 2nd Year' },
  { name: 'Java Programming',     code: 'CS304', teacher: 'Karthik M',type: 'Lab',       department: 'Computer Science', class: 'CSE 2nd Year' },
  { name: 'Python',               code: 'CS305', teacher: 'Priya S',  type: 'Elective',  department: 'Computer Science', class: 'CSE 2nd Year' },
  { name: 'Networks',             code: 'CS306', teacher: 'Arjun K',  type: 'Theory',    department: 'Computer Science', class: 'CSE 2nd Year' }
];

app.get('/api/subjects', async (req, res) => {
  try {
    let subjects = await Subject.find({});
    if (subjects.length === 0) {
      await Subject.insertMany(demoSubjects);
      subjects = await Subject.find({});
    }
    const { department, class: cls } = req.query;
    if (department) subjects = subjects.filter(s => s.department === department);
    if (cls) subjects = subjects.filter(s => s.class === cls);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Campus Connect Backend running on port ${PORT}`);
});
