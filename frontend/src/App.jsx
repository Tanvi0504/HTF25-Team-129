// src/App.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from './api';

// Reuse COLORS and components from your CityVoiceApp.jsx design
const COLORS = {
  'bg-dark': '#13101d',
  'card-dark': '#211B34',
  'accent-red': '#E91E63',
  'text-light': '#E5E7EB',
  'card-border': '#9333ea',
};

// Small UI primitives
const PrimaryButton = ({ onClick, children, className = '', disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`bg-accent-red text-white transition-all duration-200 shadow-md ${className}`}
    style={{ '--tw-accent-red': COLORS['accent-red'], opacity: disabled ? 0.6 : 1 }}
  >
    {children}
  </button>
);

const DarkCard = ({ children, className = '' }) => (
  <div
    className={`p-4 rounded-xl border border-card-border hover:border-accent-red transition-all duration-300 shadow-sm ${className}`}
    style={{
      backgroundColor: COLORS['card-dark'],
      borderColor: COLORS['card-border'],
      boxShadow: `0 0 8px rgba(147, 51, 234, 0.12)`
    }}
  >
    {children}
  </div>
);

// small tags
const getPriorityTag = (priority) => {
  let color = priority === 'HIGH' ? 'bg-red-600' : 'bg-orange-600';
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color} text-white`}>{priority}</span>;
};
const getStatusTag = (status) => {
  let cls = 'bg-gray-600';
  if (status === 'In Progress') cls = 'bg-purple-600';
  if (status === 'Submitted') cls = 'bg-yellow-600';
  if (status === 'Acknowledged') cls = 'bg-blue-600';
  if (status === 'Resolved') cls = 'bg-green-600';
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cls} text-white`}>{status}</span>;
};

const IssueCard = ({ issue, isAdmin, onAssign, onVote }) => {
  return (
    <DarkCard className="flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg bg-gray-800/60 text-gray-300">
            <i className="fa-solid fa-city" />
          </div>
          <h3 className="text-lg font-bold text-white">{issue.title}</h3>
        </div>
        <p className="text-sm text-gray-400">{issue.description}</p>
      </div>

      <div className="flex flex-wrap gap-2 my-3 border-t border-gray-700 py-3">
        {getPriorityTag(issue.priority)}
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full border border-white/20 text-white">{issue.category}</span>
        {getStatusTag(issue.status)}
        <span className="text-xs text-gray-400">{issue.date || ''}</span>
      </div>

      <div className="flex justify-between items-center pt-3 mt-4 border-t border-gray-800/70">
        <div className="flex items-center space-x-4">
          <span className="text-accent-red font-bold text-lg">{issue.votes || 0}</span>
          <div className="flex space-x-3 text-gray-400">
            <button onClick={() => onVote(issue)} className="hover:text-accent-red transition-colors text-sm"><i className="fa-solid fa-thumbs-up" /> Vote</button>
            <button className="hover:text-accent-red transition-colors text-sm"><i className="fa-solid fa-share-nodes" /> Share</button>
          </div>
        </div>

        {isAdmin ? (
          <PrimaryButton onClick={() => onAssign(issue)} className="text-sm px-3 py-1 rounded-lg">
            Assign
          </PrimaryButton>
        ) : (
          <button className="text-sm px-3 py-1 rounded-lg border border-accent-red text-accent-red hover:bg-accent-red hover:text-white transition-colors">View Details</button>
        )}
      </div>
    </DarkCard>
  );
};

// === Pages ===

const LandingPage = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-white">
    <div className="mb-8 text-center">
      <div className="w-16 h-16 bg-accent-red rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg" style={{ backgroundColor: COLORS['accent-red'] }}>
        <i className="fa-solid fa-city text-3xl text-white"></i>
      </div>
      <h1 className="text-4xl font-bold">CityVoice</h1>
      <p className="text-gray-300 mt-2">Empowering Citizens, Building Better Communities</p>
    </div>

    <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mb-8">
      <DarkCard className="text-center">
        <i className="fa-solid fa-user-gear text-3xl text-accent-red mb-3"></i>
        <h2 className="text-xl font-bold mb-1">Citizen Portal</h2>
        <p className="text-gray-400 text-sm">Report civic issues, vote, and track resolutions.</p>
      </DarkCard>
      <DarkCard className="text-center">
        <i className="fa-solid fa-gauge-high text-3xl text-accent-red mb-3"></i>
        <h2 className="text-xl font-bold mb-1">Admin Dashboard</h2>
        <p className="text-gray-400 text-sm">Manage and assign issues.</p>
      </DarkCard>
      <DarkCard className="text-center">
        <i className="fa-solid fa-bolt text-3xl text-accent-red mb-3"></i>
        <h2 className="text-xl font-bold mb-1">Real-time Updates</h2>
        <p className="text-gray-400 text-sm">Get updates and notifications.</p>
      </DarkCard>
    </div>

    <PrimaryButton onClick={() => onNavigate('login')} className="px-8 py-3 rounded-xl text-lg font-semibold">Get Started</PrimaryButton>
  </div>
);

const LoginPage = ({ onNavigate, mode, setMode, onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  useEffect(() => {
    if (mode === 'Citizen') {
      setId('+91 98765 43210');
      setPassword('password');
    } else {
      setId('rajesh.kumar');
      setPassword('admin123');
    }
  }, [mode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-white">
      <div className="mb-6 text-center">
        <div className="w-12 h-12 bg-accent-red rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: COLORS['accent-red'] }}>
          <i className="fa-solid fa-city text-2xl text-white"></i>
        </div>
        <h1 className="text-2xl font-bold">CityVoice</h1>
        <p className="text-gray-300 mt-1">Welcome Back</p>
      </div>

      <div className="flex p-1 rounded-xl mb-6 border border-card-border">
        {['Citizen', 'Admin'].map(m => (
          <button key={m} onClick={() => setMode(m)} className={`px-6 py-2 rounded-lg text-sm font-semibold ${mode === m ? 'bg-accent-red text-white' : 'text-gray-400'}`}>
            <i className={`fa-solid ${m === 'Citizen' ? 'fa-user' : 'fa-user-shield'}`}></i> {m}
          </button>
        ))}
      </div>

      <DarkCard className="p-8 w-full max-w-sm">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">{mode} Login</h3>
          <input value={id} onChange={(e)=>setId(e.target.value)} placeholder="ID / Phone / Username" className="w-full p-3 rounded-lg bg-[#1f1730] text-white" />
          <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 rounded-lg bg-[#1f1730] text-white" />
          <PrimaryButton onClick={() => onLogin({ id, password })} className="w-full py-3">Login</PrimaryButton>
          <button className="text-sm text-gray-400 underline mt-2" onClick={() => onNavigate('landing')}>Back to Landing</button>
        </div>
      </DarkCard>
    </div>
  );
};

const Dashboard = ({ issues, isAdmin, onReport, onAssign, onVote, onFeedback, onNavigate }) => {
  const stats = useMemo(() => [
    { label: 'Total', count: issues.length },
    { label: 'Submitted', count: issues.filter(i => i.status === 'Submitted').length },
    { label: 'Acknowledged', count: issues.filter(i => i.status === 'Acknowledged').length },
    { label: 'In Progress', count: issues.filter(i => i.status === 'In Progress').length },
    { label: 'Resolved', count: issues.filter(i => i.status === 'Resolved').length },
    { label: 'High Priority', count: issues.filter(i => i.priority === 'HIGH').length },
  ], [issues]);

  return (
    <div className="text-white">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{isAdmin ? 'Admin Dashboard' : 'Citizen Dashboard'}</h2>
        <div className="flex items-center gap-3">
          <PrimaryButton onClick={onReport}><i className="fa-solid fa-plus mr-2" /> Report Issue</PrimaryButton>
          <button onClick={onFeedback} className="bg-[#211B34] px-4 py-2 rounded-xl">Feedback</button>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto mb-6">
        {stats.map(s => (
          <DarkCard key={s.label} className="min-w-[120px] text-center">
            <div className="text-2xl font-bold text-white">{s.count}</div>
            <div className="text-sm text-gray-300">{s.label}</div>
          </DarkCard>
        ))}
      </div>

      <h3 className="text-xl font-bold mb-4">All Issues</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.map(issue => (
          <IssueCard key={issue.id} issue={issue} isAdmin={isAdmin} onAssign={onAssign} onVote={onVote} />
        ))}
      </div>
    </div>
  );
};

const PollsPage = ({ issues, onVote, onNavigate }) => {
  const pollIssues = issues.filter(i => i.category === 'Sanitation' || i.category === 'Electricity');
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => onNavigate('dashboard')} className="text-gray-300"><i className="fa-solid fa-arrow-left"></i> Back</button>
        <h1 className="text-2xl font-bold">Community Polls</h1>
        <div />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pollIssues.map(issue => (
          <DarkCard key={issue.id}>
            <h3 className="text-lg font-bold text-white mb-2">{issue.title}</h3>
            <p className="text-gray-400 mb-4">{issue.description}</p>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-accent-red">{issue.votes}</div>
                <div className="text-sm text-gray-300">Votes</div>
              </div>
              <PrimaryButton onClick={() => onVote(issue)} className="px-4 py-2">Vote</PrimaryButton>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
};

// === Modals/Forms ===

const ReportModal = ({ onClose, onSubmit, defaultReporter }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Sanitation');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title);
    fd.append('category', category);
    fd.append('priority', priority);
    fd.append('description', description);
    if (file) fd.append('file', file);
    if (defaultReporter) fd.append('reporter_id', defaultReporter);
    await onSubmit(fd);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-black" onClick={(e)=>e.stopPropagation()}>
        <div className="flex justify-between">
          <h3 className="text-lg font-bold">Report Issue</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={submit} className="space-y-3 mt-4">
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" required />
          <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full p-2 border rounded">
            <option>Sanitation</option><option>Water</option><option>Roads</option><option>Electricity</option>
          </select>
          <select value={priority} onChange={(e)=>setPriority(e.target.value)} className="w-full p-2 border rounded">
            <option>HIGH</option><option>MEDIUM</option><option>LOW</option>
          </select>
          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description" rows={4} className="w-full p-2 border rounded" />
          <input type="file" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-accent-red text-white rounded">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignModal = ({ onClose, issue, onAssign }) => {
  const [officer, setOfficer] = useState('');
  const [priority, setPriority] = useState(issue?.priority || 'MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  if (!issue) return null;

  async function submit(e) {
    e.preventDefault();
    await onAssign(issue.id, { officer, priority, due_date: dueDate, notes });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-black" onClick={(e)=>e.stopPropagation()}>
        <div className="flex justify-between">
          <h3 className="text-lg font-bold">Assign Task</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={submit} className="space-y-3 mt-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-semibold">{issue.title}</div>
            <div className="text-sm text-gray-600">{issue.address}</div>
          </div>
          <input value={officer} onChange={(e)=>setOfficer(e.target.value)} placeholder="Assign to officer (name or id)" className="w-full p-2 border rounded" required />
          <select value={priority} onChange={(e)=>setPriority(e.target.value)} className="w-full p-2 border rounded">
            <option>HIGH</option><option>MEDIUM</option><option>LOW</option>
          </select>
          <input type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} className="w-full p-2 border rounded" />
          <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Notes" rows={2} className="w-full p-2 border rounded" />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-accent-red text-white rounded">Assign</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FeedbackModal = ({ onClose, onSend }) => {
  const [rating, setRating] = useState(4);
  const [comments, setComments] = useState('');
  const [contact, setContact] = useState('');

  async function submit(e) {
    e.preventDefault();
    await onSend({ rating, comments, contact });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-black" onClick={(e)=>e.stopPropagation()}>
        <div className="flex justify-between">
          <h3 className="text-lg font-bold">Feedback</h3>
          <button onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={submit} className="space-y-3 mt-4">
          <label className="block">Rating</label>
          <select value={rating} onChange={e=>setRating(Number(e.target.value))} className="w-full p-2 border rounded">
            <option value={1}>1 - Poor</option>
            <option value={2}>2 - Fair</option>
            <option value={3}>3 - Good</option>
            <option value={4}>4 - Very Good</option>
            <option value={5}>5 - Excellent</option>
          </select>
          <textarea value={comments} onChange={e=>setComments(e.target.value)} placeholder="Comments" rows={4} className="w-full p-2 border rounded" />
          <input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Contact (optional)" className="w-full p-2 border rounded" />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-accent-red text-white rounded">Send</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// === Main App ===

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' | 'login' | 'dashboard' | 'polls'
  const [authMode, setAuthMode] = useState('Citizen');
  const [token, setToken] = useState(localStorage.getItem('cv_token') || null);
  const [userId, setUserId] = useState(localStorage.getItem('cv_user') || null);
  const [issues, setIssues] = useState([]);
  const [modal, setModal] = useState(null); // { type: 'report'|'assign'|'feedback', payload: ... }
  const [selectedIssue, setSelectedIssue] = useState(null);

  const isAdmin = authMode === 'Admin';

  // Load issues
  const loadIssues = useCallback(async () => {
    try {
      const data = await api.fetchIssues();
      setIssues(data || []);
    } catch (err) {
      console.error('Failed load issues', err);
      setIssues([]);
    }
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  // Authentication actions
  async function handleLogin({ id, password }) {
    try {
      const resp = await api.login({ id, password });
      const t = resp.access_token;
      setToken(t);
      localStorage.setItem('cv_token', t);
      // store id locally to use for reporting
      setUserId(id);
      localStorage.setItem('cv_user', id);
      setCurrentPage('dashboard');
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  }

  async function handleReportSubmit(formData) {
    try {
      await api.createIssue(formData, token);
      await loadIssues();
      alert('Issue submitted.');
    } catch (err) {
      console.error(err);
      alert('Submit failed: ' + err.message);
    }
  }

  async function handleVote(issue) {
    try {
      if (!token) {
        alert('You need to login to vote.');
        setCurrentPage('login');
        return;
      }
      await api.voteIssue(issue.id, token);
      await loadIssues();
    } catch (err) {
      alert('Vote failed: ' + (err.message || err));
    }
  }

  async function handleAssign(issueId, body) {
    try {
      if (!token) throw new Error('Admin auth required');
      await api.assignIssue(issueId, body, token);
      await loadIssues();
      alert('Assigned successfully');
    } catch (err) {
      alert('Assign failed: ' + err.message);
    }
  }

  async function handleUpdateStatus(issueId, status) {
    try {
      if (!token) throw new Error('Admin auth required');
      await api.updateIssueStatus(issueId, status, token);
      await loadIssues();
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  }

  async function handleFeedback(payload) {
    try {
      await api.sendFeedback(payload);
      alert('Thanks for your feedback!');
    } catch (err) {
      alert('Failed to send feedback: ' + err.message);
    }
  }

  // modal helpers
  function openReport() { setModal({ type: 'report' }); }
  function openAssign(issue) { setSelectedIssue(issue); setModal({ type: 'assign' }); }
  function openFeedback() { setModal({ type: 'feedback' }); }
  function closeModal() { setModal(null); setSelectedIssue(null); }

  // page renderer
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} mode={authMode} setMode={setAuthMode} onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard issues={issues} isAdmin={isAdmin} onReport={openReport} onAssign={openAssign} onVote={handleVote} onFeedback={openFeedback} onNavigate={setCurrentPage} />;
      case 'polls':
        return <PollsPage issues={issues} onVote={handleVote} onNavigate={setCurrentPage} />;
      case 'landing':
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div style={{ backgroundColor: COLORS['bg-dark'], minHeight: '100vh' }} className="p-6 text-white">
      <div className="container mx-auto">
        {renderPage()}
      </div>

      {modal?.type === 'report' && <ReportModal defaultReporter={userId} onClose={closeModal} onSubmit={handleReportSubmit} />}
      {modal?.type === 'assign' && <AssignModal issue={selectedIssue} onClose={closeModal} onAssign={handleAssign} />}
      {modal?.type === 'feedback' && <FeedbackModal onClose={closeModal} onSend={handleFeedback} />}
    </div>
  );
}
