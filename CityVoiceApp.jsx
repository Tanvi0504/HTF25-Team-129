import React, { useState, useMemo, useCallback } from 'react';

// --- 1. Mock Data ---
const MOCK_ISSUES = [
    { id: 1, title: "Sewage Water Overflow", category: "Sanitation", priority: "HIGH", status: "In Progress", description: "Sewage water overflowing on the street. Urgent health hazard.", address: "45B T Nagar, Chennai, Tamil Nadu", date: "10/18/2025", votes: 23, phone: "+91-9876543210" },
    { id: 2, title: "Water Supply Disruption", category: "Water", priority: "HIGH", status: "Submitted", description: "No water supply for 2 days in the area.", address: "321 Mylapore, Chennai, Tamil Nadu", date: "10/22/2025", votes: 18, phone: "+91-5551234568" },
    { id: 3, title: "Dangerous Pothole on Main Road", category: "Roads", priority: "MEDIUM", status: "Acknowledged", description: "Large pothole causing accidents. Multiple vehicles damaged.", address: "123 Anna Salai, Chennai, Tamil Nadu", date: "10/20/2025", votes: 15, phone: "+91-9876543210" },
    { id: 4, title: "Street Light Not Working", category: "Electricity", priority: "MEDIUM", status: "Submitted", description: "Street lights not functioning for the past week. Safety concern.", address: "789 Adyar, Chennai, Tamil Nadu", date: "10/23/2025", votes: 8, phone: "+91-5551234567" },
    { id: 5, title: "Manhole Cover Missing", category: "Sanitation", priority: "HIGH", status: "Submitted", description: "Missing manhole cover near the park entrance. Extreme hazard.", address: "14 Velachery, Chennai, Tamil Nadu", date: "10/24/2025", votes: 20, phone: "+91-9988776655" },
    { id: 6, title: "Unstable Power Grid", category: "Electricity", priority: "HIGH", status: "In Progress", description: "Frequent voltage fluctuations damaging home appliances.", address: "55 Ashok Nagar, Chennai, Tamil Nadu", date: "10/25/2025", votes: 12, phone: "+91-9988776655" },
];

// Custom theme colors for easy Tailwind mapping (simulating custom config)
const COLORS = {
    'bg-dark': '#13101d', 
    'card-dark': '#211B34', 
    'accent-red': '#E91E63', 
    'text-light': '#E5E7EB',
    'card-border': '#9333ea',
};

// --- 2. Utility Components and Functions ---

const getStatusTag = (status) => {
    let colorClass = '';
    switch (status) {
        case 'In Progress': colorClass = 'bg-purple-600'; break;
        case 'Submitted': colorClass = 'bg-yellow-600'; break;
        case 'Acknowledged': colorClass = 'bg-blue-600'; break;
        case 'Resolved': colorClass = 'bg-green-600'; break;
        default: colorClass = 'bg-gray-600';
    }
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colorClass} text-white`}>
            {status.toUpperCase()}
        </span>
    );
};

const getPriorityTag = (priority) => {
    let colorClass = '';
    let icon = '';
    switch (priority) {
        case 'HIGH':
            colorClass = 'bg-red-600';
            icon = <i className="fa-solid fa-fire text-red-300"></i>;
            break;
        case 'MEDIUM':
            colorClass = 'bg-orange-600';
            icon = <i className="fa-solid fa-triangle-exclamation text-orange-300"></i>;
            break;
        default:
            colorClass = 'bg-gray-600';
    }
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colorClass} text-white flex items-center gap-1`}>
            {icon} {priority}
        </span>
    );
};

const getCategoryIcon = (category) => {
    let categoryIcon = '';
    let categoryClass = '';
    switch(category) {
        case 'Sanitation': categoryIcon = <i className="fa-solid fa-poo"></i>; categoryClass = 'bg-red-800/50 text-red-400'; break;
        case 'Water': categoryIcon = <i className="fa-solid fa-faucet-drip"></i>; categoryClass = 'bg-blue-800/50 text-blue-400'; break;
        case 'Roads': categoryIcon = <i className="fa-solid fa-road"></i>; categoryClass = 'bg-yellow-800/50 text-yellow-400'; break;
        case 'Electricity': categoryIcon = <i className="fa-solid fa-bolt"></i>; categoryClass = 'bg-amber-800/50 text-amber-400'; break;
        default: categoryIcon = <i className="fa-solid fa-circle-question"></i>; categoryClass = 'bg-gray-800/50 text-gray-400';
    }
    return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${categoryClass}`}>
            {categoryIcon}
        </div>
    );
};


// --- 3. Shared/Reusable Components ---

const PrimaryButton = ({ onClick, children, className = '' }) => (
    <button 
        onClick={onClick} 
        className={`bg-accent-red text-white transition-all duration-200 
            shadow-md shadow-accent-red/40 hover:bg-pink-500 active:bg-pink-600 active:scale-[0.98] ${className}`}
        style={{ '--tw-accent-red': COLORS['accent-red'] }}
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
            boxShadow: `0 0 8px rgba(147, 51, 234, 0.2)` 
        }}
    >
        {children}
    </div>
);


// --- 4. Modal Implementations (Modal and Content) ---

const AppModal = ({ children, onClose }) => (
    <div 
        className="fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity modal-backdrop"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={onClose}
    >
        <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transition-transform duration-300 scale-100"
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
            {children}
        </div>
    </div>
);

const ReportIssueModal = ({ onClose }) => (
    <>
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-black">
            <h2 className="text-xl font-bold">Report an Issue</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">&times;</button>
        </div>
        <div className="py-4 space-y-3 text-black">
            <label className="block text-sm font-medium text-gray-700">Issue Title</label>
            <input type="text" placeholder="Brief description of the issue" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-accent-red" />

            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-accent-red bg-white">
                <option>Select category</option>
                <option>Sanitation</option>
                <option>Water</option>
                <option>Roads</option>
                <option>Electricity</option>
            </select>

            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea placeholder="Provide detailed information about the issue" rows="3" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-accent-red"></textarea>

            <label className="block text-sm font-medium text-gray-700">Photo Evidence</label>
            <div className="flex gap-4">
                <button className="px-3 py-1.5 border border-gray-400 rounded-lg text-sm text-gray-800 hover:bg-gray-100"><i className="fa-solid fa-camera"></i> Take Photo</button>
                <button className="px-3 py-1.5 border border-gray-400 rounded-lg text-sm text-gray-800 hover:bg-gray-100"><i className="fa-solid fa-cloud-arrow-up"></i> Upload Photo</button>
            </div>

            <label className="block text-sm font-medium text-gray-700">GPS Location</label>
            <button className="px-3 py-1.5 border border-gray-400 rounded-lg text-sm text-gray-800 hover:bg-gray-100"><i className="fa-solid fa-location-dot"></i> Capture Location</button>
        </div>

        <div className="flex justify-between space-x-3 pt-3 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 flex items-center gap-2">
                <i className="fa-solid fa-chevron-left"></i> Go Back
            </button>
            <PrimaryButton onClick={onClose} className="px-4 py-2 rounded-xl font-semibold">
                Submit Report
            </PrimaryButton>
        </div>
    </>
);

const AssignTaskModal = ({ onClose, issue }) => (
    <>
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-black">
            <h2 className="text-xl font-bold">Assign Task</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">&times;</button>
        </div>
        <div className="py-4 space-y-3 text-black">
            <p className="text-sm font-medium text-gray-700 mb-2">Assign this issue to one of your subordinate officers</p>
            
            <div className="bg-pink-50 rounded-lg p-3 text-sm border border-pink-200">
                <p className="font-semibold text-black">{issue.title}</p>
                <p className="text-gray-600">{issue.description}</p>
                <p className="text-gray-500 text-xs mt-1">{issue.address}</p>
            </div>

            <label className="block text-sm font-medium text-gray-700">Assign To Officer *</label>
            <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-accent-red bg-white">
                <option>Select an officer</option>
                <option>Priya Sharma - Assistant Engineer</option>
                <option>Piyush Mehta - Field Inspector</option>
            </select>

            <label className="block text-sm font-medium text-gray-700">Priority *</label>
            <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-accent-red bg-white">
                <option>High Priority</option>
                <option selected>Medium Priority</option>
                <option>Low Priority</option>
            </select>
            
            <label className="block text-sm font-medium text-gray-700">Due Date *</label>
            <input type="date" defaultValue="2025-11-05" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-accent-red bg-white" />

            <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea placeholder="Add any special instructions or notes for the officer..." rows="2" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-accent-red"></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100">Cancel</button>
            <PrimaryButton onClick={onClose} className="px-6 py-2 rounded-xl font-semibold">
                Assign Task
            </PrimaryButton>
        </div>
    </>
);

const FeedbackModal = ({ onClose }) => (
    <>
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-black">
            <h2 className="text-xl font-bold">Provide Feedback</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">&times;</button>
        </div>
        <div className="py-4 space-y-3 text-black">
            <label className="block text-sm font-medium text-gray-700">How would you rate your experience?</label>
            <div className="flex justify-center space-x-4 text-4xl py-2">
                <i className="fa-solid fa-face-frown text-red-500 hover:text-red-700 cursor-pointer transition-transform hover:scale-110"></i>
                <i className="fa-solid fa-face-meh text-yellow-500 hover:text-yellow-700 cursor-pointer transition-transform hover:scale-110"></i>
                <i className="fa-solid fa-face-smile text-green-500 hover:text-green-700 cursor-pointer transition-transform hover:scale-110"></i>
                <i className="fa-solid fa-face-grin-stars text-blue-500 hover:text-blue-700 cursor-pointer transition-transform hover:scale-110"></i>
            </div>

            <label className="block text-sm font-medium text-gray-700">Your Comments</label>
            <textarea placeholder="Tell us how we can improve or what you liked!" rows="4" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-accent-red"></textarea>
            
            <label className="block text-sm font-medium text-gray-700">Contact (Optional)</label>
            <input type="text" placeholder="Email or Phone Number" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-red focus:border-accent-red" />
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100">Cancel</button>
            <PrimaryButton onClick={onClose} className="px-6 py-2 rounded-xl font-semibold">
                Send Feedback
            </PrimaryButton>
        </div>
    </>
);


// --- 5. Issue Card Components ---

const IssueCard = ({ issue, isAdmin, onShowModal }) => {
    const hasImage = issue.title.toLowerCase().includes('manhole'); 
    
    return (
        <DarkCard className="hover:shadow-red-glow/40 flex flex-col justify-between">
            {hasImage && (
                <div className="p-2">
                    <img 
                        src={`https://placehold.co/400x200/404040/${COLORS['text-light'].substring(1)}?text=Image+Evidence`} 
                        onError={(e) => e.target.src = `https://placehold.co/400x200/404040/${COLORS['text-light'].substring(1)}?text=Image+Evidence`}
                        className="w-full h-32 object-cover rounded-lg mb-4 opacity-80" 
                        alt="Issue photo evidence"
                    />
                </div>
            )}
            <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(issue.category)}
                    <h3 className="text-lg font-bold text-text-light leading-snug">{issue.title}</h3>
                </div>
                <p className="text-sm text-gray-400 leading-tight">{issue.description}</p>
            </div>

            <div className="flex flex-wrap gap-2 my-3 border-t border-b border-gray-700 py-3">
                {getPriorityTag(issue.priority)}
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full border border-white/50 text-white">{issue.category}</span>
                {getStatusTag(issue.status)}
                <span className="text-xs text-gray-400 mt-0.5">{issue.date}</span>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-400 mt-3">
                <p className="text-xs text-gray-500"><i className="fa-solid fa-location-dot mr-1"></i>{issue.address}</p>
            </div>

            <div className="flex justify-between items-center pt-3 mt-4 border-t border-gray-800/70">
                <div className="flex items-center space-x-4">
                    <span className="text-accent-red font-bold text-lg">{issue.votes}</span>
                    <div className="flex space-x-3 text-gray-400">
                        <button className="hover:text-accent-red transition-colors text-sm"><i className="fa-solid fa-thumbs-up"></i> Vote</button>
                        <button className="hover:text-accent-red transition-colors text-sm"><i className="fa-solid fa-share-nodes"></i> Share</button>
                    </div>
                </div>
                
                {isAdmin 
                    ? <PrimaryButton onClick={() => onShowModal('assign', issue)} className="text-sm px-3 py-1 rounded-lg border border-accent-red hover:text-white">Assign Task</PrimaryButton>
                    : <button className="text-sm px-3 py-1 rounded-lg border border-accent-red text-accent-red hover:bg-accent-red hover:text-white transition-colors">View Details</button>
                }
            </div>
        </DarkCard>
    );
};


const PollCard = ({ issue, onVote, votedIssueIds }) => {
    // Determine if the current issue has been voted on (using IDs for persistent state sim)
    const isVoted = votedIssueIds.includes(issue.id);
    
    return (
        <DarkCard className="hover:shadow-red-glow/40 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(issue.category)}
                    <h3 className="text-xl font-bold text-text-light leading-snug">{issue.title}</h3>
                </div>
                
                <p className="text-sm text-gray-400 leading-tight mb-3">{issue.description}</p>

                <div className="flex flex-wrap gap-2 my-3 border-t border-b border-gray-700 py-3">
                    {getPriorityTag(issue.priority)}
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full border border-white/50 text-white">{issue.category}</span>
                    {getStatusTag(issue.status)}
                </div>

                <p className="text-sm text-gray-500 mb-4"><i className="fa-solid fa-location-dot mr-1"></i> {issue.address}</p>
            </div>

            {/* Voting Section */}
            <div className="mt-4 pt-4 border-t border-gray-800/70 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <span className="text-accent-red font-extrabold text-3xl leading-none">{issue.votes}</span>
                    <span className="text-gray-400 text-sm font-medium">Votes</span>
                </div>
                
                <PrimaryButton 
                    onClick={() => onVote(issue.id)} 
                    className={`px-6 py-2 rounded-xl text-md font-bold uppercase tracking-wide 
                        ${isVoted ? 'bg-gray-600 cursor-not-allowed shadow-none hover:bg-gray-600' : 'btn-primary'}`}
                    disabled={isVoted}
                >
                    <i className="fa-solid fa-thumbs-up mr-2"></i> {isVoted ? 'Voted!' : 'Vote Now'}
                </PrimaryButton>
            </div>
        </DarkCard>
    );
};


// --- 6. Page Components ---

const LandingPage = ({ onNavigate }) => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-text-light">
        {/* Logo and Title */}
        <div className="mb-12 text-center">
            <div className="w-16 h-16 bg-accent-red rounded-full mx-auto mb-4 flex items-center justify-center shadow-red-glow" style={{ boxShadow: `0 0 10px ${COLORS['accent-red'] + 'b3'}, 0 0 20px ${COLORS['accent-red'] + '4d'}` }}>
                <i className="fa-solid fa-city text-3xl text-white"></i>
            </div>
            <h1 className="text-5xl font-extrabold text-white">CityVoice</h1>
            <p className="text-lg text-gray-400 mt-2">Empowering Citizens, Building Better Communities</p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
            {[
                { title: 'Citizen Portal', icon: 'fa-user-gear', desc: 'Report civic issues, vote on priorities, and track resolutions in real-time.' },
                { title: 'Admin Dashboard', icon: 'fa-gauge-high', desc: 'Manage issues, assign tasks, and coordinate with officers efficiently.' },
                { title: 'Real-time Updates', icon: 'fa-bolt', desc: 'Get instant notifications and see live progress on community issues.' },
            ].map(item => (
                <DarkCard key={item.title} className="text-center hover:scale-[1.02] transition-transform duration-300">
                    <i className={`fa-solid ${item.icon} text-4xl text-accent-red mb-3`}></i>
                    <h2 className="text-xl font-bold mb-2">{item.title}</h2>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                </DarkCard>
            ))}
        </div>

        {/* Features Row */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 text-gray-400 text-sm font-medium">
            {[
                { label: 'GPS Tagging', icon: 'fa-location-dot' },
                { label: 'Community Voting', icon: 'fa-users-viewfinder' },
                { label: 'Multi-level Admin', icon: 'fa-layer-group' },
                { label: 'WhatsApp Integration', icon: 'fa-brands fa-whatsapp' },
            ].map(feature => (
                <span key={feature.label} className="flex items-center gap-2">
                    <i className={`fa-solid ${feature.icon} text-accent-red`}></i> {feature.label}
                </span>
            ))}
        </div>

        {/* Get Started Button */}
        <PrimaryButton onClick={() => onNavigate('login')} className="px-10 py-3 rounded-xl text-lg font-semibold uppercase tracking-wider">
            Get Started
        </PrimaryButton>
    </div>
);

const LoginPage = ({ onNavigate, currentAuthMode, onAuthModeChange }) => {
    const authContent = currentAuthMode === 'Citizen' ? (
        <>
            <h3 className="text-xl font-semibold mb-6">Citizen Login</h3>
            <p className="text-gray-400 mb-6">Report and track civic issues in your area</p>
            <input type="text" placeholder="Phone Number" defaultValue="+91 98765 43210" className="bg-card-dark text-text-light w-full p-3 rounded-lg mb-4 focus:ring-2 focus:ring-accent-red focus:border-accent-red border border-card-border" />
            <input type="text" placeholder="Address" defaultValue="T Nagar, Chennai, Tamil Nadu" className="bg-card-dark text-text-light w-full p-3 rounded-lg mb-8 focus:ring-2 focus:ring-accent-red focus:border-accent-red border border-card-border" />
            <PrimaryButton onClick={() => onNavigate('dashboard')} className="w-full py-3 rounded-xl font-semibold uppercase">
                Login as Citizen
            </PrimaryButton>
        </>
    ) : (
        <>
            <h3 className="text-xl font-semibold mb-6">Administrator Login</h3>
            <p className="text-gray-400 mb-6">Manage and resolve civic issues</p>
            <input type="text" placeholder="Officer Username" defaultValue="officer.username" className="bg-card-dark text-text-light w-full p-3 rounded-lg mb-4 focus:ring-2 focus:ring-accent-red focus:border-accent-red border border-card-border" />
            <input type="password" placeholder="Enter password" defaultValue="••••••••" className="bg-card-dark text-text-light w-full p-3 rounded-lg mb-4 focus:ring-2 focus:ring-accent-red focus:border-accent-red border border-card-border" />
            
            <DarkCard className="p-3 mb-6 text-sm text-left">
                <p className="font-bold text-white mb-1">Demo Credentials:</p>
                <p className="text-gray-400">Username: <span className="text-accent-red">rajesh.kumar</span></p>
                <p className="text-gray-400">Password: <span className="text-accent-red">admin123</span></p>
            </DarkCard>

            <PrimaryButton onClick={() => onNavigate('dashboard')} className="w-full py-3 rounded-xl font-semibold uppercase">
                Login as Administrator
            </PrimaryButton>
        </>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] text-text-light">
            {/* Logo and Title */}
            <div className="mb-8 text-center">
                <div className="w-12 h-12 bg-accent-red rounded-full mx-auto mb-2 flex items-center justify-center shadow-red-glow" style={{ boxShadow: `0 0 10px ${COLORS['accent-red'] + 'b3'}` }}>
                    <i className="fa-solid fa-city text-2xl text-white"></i>
                </div>
                <h1 className="text-3xl font-extrabold text-white">CityVoice</h1>
                <p className="text-sm text-gray-400 mt-1">Welcome Back!</p>
            </div>

            {/* Role Switcher */}
            <div className="flex p-1 rounded-xl mb-8 border border-card-border" style={{ backgroundColor: COLORS['card-dark'] }}>
                {['Citizen', 'Admin'].map(mode => (
                    <button 
                        key={mode}
                        onClick={() => onAuthModeChange(mode)} 
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${currentAuthMode === mode ? 'bg-accent-red text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        <i className={`fa-solid ${mode === 'Citizen' ? 'fa-user' : 'fa-user-shield'}`}></i> {mode}
                    </button>
                ))}
            </div>

            {/* Login Card */}
            <DarkCard className="p-8 w-full max-w-sm">
                {authContent}
            </DarkCard>
        </div>
    );
};

const Dashboard = ({ issues, isAdmin, filterStatus, onNavigate, onFilterChange, onShowModal }) => {
    const filteredIssues = useMemo(() => {
        if (filterStatus === 'All') {
            return issues;
        }
        return issues.filter(issue => issue.status === filterStatus);
    }, [issues, filterStatus]);

    const stats = useMemo(() => [
        { label: 'Total', count: issues.length, color: 'bg-red-800', text: 'text-red-400' },
        { label: 'Submitted', count: issues.filter(i => i.status === 'Submitted').length, color: 'bg-yellow-800', text: 'text-yellow-400' },
        { label: 'Acknowledged', count: issues.filter(i => i.status === 'Acknowledged').length, color: 'bg-blue-800', text: 'text-blue-400' },
        { label: 'In Progress', count: issues.filter(i => i.status === 'In Progress').length, color: 'bg-purple-800', text: 'text-purple-400' },
        { label: 'Resolved', count: issues.filter(i => i.status === 'Resolved').length, color: 'bg-green-800', text: 'text-green-400' },
        { label: 'High Priority', count: issues.filter(i => i.priority === 'HIGH').length, color: 'bg-red-800', text: 'text-red-400' },
    ], [issues]);

    const adminInfo = isAdmin && (
        <DarkCard className="mb-8 border-accent-red/50 shadow-red-glow/20">
            <h2 className="text-2xl font-bold text-white mb-1">Rajesh Kumar <span className="text-accent-red text-sm font-normal">(Admin)</span></h2>
            <p className="text-sm text-gray-400">Chief Engineer</p>
            <div className="flex gap-4 mt-2 text-xs">
                <span className="bg-gray-700 px-2 py-1 rounded-full text-white">Public Works Department</span>
                <span className="bg-gray-700 px-2 py-1 rounded-full text-white">Zone 1 - North Chennai</span>
            </div>
        </DarkCard>
    );
    
    return (
        <div className="text-text-light">
            {/* Top Bar/Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 mb-6">
                <div className="text-2xl font-bold text-white mb-4 md:mb-0">{isAdmin ? 'Admin Dashboard' : 'Citizen Dashboard'}</div>
                <div className="flex flex-wrap gap-2 md:space-x-4">
                    <PrimaryButton onClick={() => onShowModal('report')} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                        <i className="fa-solid fa-plus"></i> Report Issue
                    </PrimaryButton>
                    <button onClick={() => onShowModal('feedback')} className="bg-card-dark px-4 py-2 rounded-xl text-sm font-semibold border border-card-border hover:border-accent-red transition-colors flex items-center gap-2">
                        <i className="fa-solid fa-star text-accent-red"></i> Give Feedback
                    </button>
                    <button onClick={() => onNavigate('polls')} className="bg-card-dark px-4 py-2 rounded-xl text-sm font-semibold border border-card-border hover:border-accent-red transition-colors">
                        <i className="fa-solid fa-bullhorn text-accent-red"></i> View Polls
                    </button>
                    <button onClick={() => onNavigate('landing')} className="text-gray-400 hover:text-accent-red transition-colors"><i className="fa-solid fa-right-from-bracket"></i> Logout</button>
                </div>
            </header>
            
            {adminInfo}

            {/* Stats Section (Horizontal Scroll) */}
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">{isAdmin ? 'Issue Management' : 'Dashboard Summary'}</h2>
            
            <div className="flex overflow-x-auto space-x-4 pb-2 mb-8">
                {stats.map(stat => (
                    <DarkCard key={stat.label} className="flex-shrink-0 w-32 text-center hover:shadow-red-glow/40">
                        <span className={`text-2xl font-bold ${stat.text} block mb-1 leading-none`}>{stat.count}</span>
                        <p className="text-xs text-gray-400 leading-tight">{stat.label}</p>
                    </DarkCard>
                ))}
            </div>

            {/* All Issues Filter/List */}
            <div className="mb-4">
                <h2 className="text-xl font-bold mb-4">All Issues</h2>
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6 text-sm">
                    {['All', 'Submitted', 'Acknowledged', 'In Progress', 'Resolved'].map(status => {
                        const count = status === 'All' ? issues.length : issues.filter(i => i.status === status).length;
                        const isActive = filterStatus === status;
                        const buttonClass = isActive 
                            ? 'bg-accent-red px-3 py-1 rounded-full text-white font-semibold' 
                            : 'bg-card-dark px-3 py-1 rounded-full text-gray-400 border border-card-border hover:border-accent-red transition-colors';
                        return (
                            <button key={status} onClick={() => onFilterChange(status)} className={buttonClass}>
                                {status} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Issues Grid */}
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                {filteredIssues.map(issue => (
                    <IssueCard 
                        key={issue.id} 
                        issue={issue} 
                        isAdmin={isAdmin} 
                        onShowModal={onShowModal}
                    />
                ))}
            </div>
        </div>
    );
};

const PollsPage = ({ issues, onNavigate, onVote, votedIssueIds }) => {
    // Filter issues for Sanitation and Electricity
    const pollIssues = useMemo(() => issues.filter(issue => 
        issue.category === 'Sanitation' || issue.category === 'Electricity'
    ), [issues]);

    return (
        <div className="text-text-light">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 mb-6 border-b border-gray-700">
                <button onClick={() => onNavigate('dashboard')} className="text-gray-400 hover:text-accent-red transition-colors flex items-center gap-2 text-sm mb-4 sm:mb-0">
                    <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-center sm:text-left">Community Priority Polls</h1>
                <div className="w-1/4 hidden sm:block"></div> {/* Placeholder for centering */}
            </header>

            <p className="text-gray-400 mb-8">Vote on the issues you believe require the most immediate attention to influence administrative prioritization.</p>

            <h2 className="text-xl font-bold mb-6 text-accent-red">Votable Issues: Sanitation & Electricity</h2>

            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                {pollIssues.map(issue => (
                    <PollCard 
                        key={issue.id} 
                        issue={issue} 
                        onVote={onVote}
                        votedIssueIds={votedIssueIds}
                    />
                ))}
                
                {pollIssues.length === 0 && (
                    <p className="text-gray-400 col-span-full p-6 bg-card-dark rounded-xl">
                        No active polls for Sanitation or Electricity categories right now.
                    </p>
                )}
            </div>
        </div>
    );
};


// --- 7. Main App Component ---

const App = () => {
    // State management for navigation and app data
    const [currentPage, setCurrentPage] = useState('landing');
    const [currentAuthMode, setCurrentAuthMode] = useState('Citizen'); // 'Citizen' or 'Admin'
    const [filterStatus, setFilterStatus] = useState('All');
    const [issues, setIssues] = useState(MOCK_ISSUES);
    const [modal, setModal] = useState(null); // { type: 'report' | 'assign' | 'feedback', issue: issueObject }
    const [votedIssueIds, setVotedIssueIds] = useState([]); // To simulate persistent votes within the session

    const isAdmin = currentAuthMode === 'Admin';

    // Navigation handler
    const handleNavigate = useCallback((page) => {
        setCurrentPage(page);
        setFilterStatus('All');
        setModal(null);
    }, []);
    
    // Modal handlers
    const handleShowModal = useCallback((type, issue = null) => {
        setModal({ type, issue });
    }, []);

    const handleCloseModal = useCallback(() => {
        setModal(null);
    }, []);
    
    // Voting handler (updates issues state and tracks voted IDs)
    const handleVote = useCallback((id) => {
        if (votedIssueIds.includes(id)) return;

        setIssues(prevIssues => 
            prevIssues.map(issue => 
                issue.id === id ? { ...issue, votes: issue.votes + 1 } : issue
            )
        );
        setVotedIssueIds(prevIds => [...prevIds, id]);
    }, [votedIssueIds]);


    // Determine which page component to render
    const renderPage = () => {
        switch (currentPage) {
            case 'login':
                return (
                    <LoginPage 
                        onNavigate={handleNavigate} 
                        currentAuthMode={currentAuthMode} 
                        onAuthModeChange={setCurrentAuthMode} 
                    />
                );
            case 'dashboard':
                return (
                    <Dashboard 
                        issues={issues} 
                        isAdmin={isAdmin} 
                        filterStatus={filterStatus}
                        onNavigate={handleNavigate} 
                        onFilterChange={setFilterStatus} 
                        onShowModal={handleShowModal}
                    />
                );
            case 'polls':
                return (
                    <PollsPage
                        issues={issues}
                        onNavigate={handleNavigate}
                        onVote={handleVote}
                        votedIssueIds={votedIssueIds}
                    />
                );
            case 'landing':
            default:
                return <LandingPage onNavigate={handleNavigate} />;
        }
    };

    // Determine which modal content to render
    const renderModalContent = () => {
        if (!modal) return null;

        switch (modal.type) {
            case 'report':
                return <ReportIssueModal onClose={handleCloseModal} />;
            case 'assign':
                // Pass the specific issue to the Assign Task modal
                const issueToAssign = issues.find(i => i.id === (modal.issue?.id || MOCK_ISSUES[0].id));
                return <AssignTaskModal onClose={handleCloseModal} issue={issueToAssign} />;
            case 'feedback':
                return <FeedbackModal onClose={handleCloseModal} />;
            default:
                return null;
        }
    };
    
    return (
        // Global styles are set via inline style to replicate custom Tailwind config
        <div style={{ backgroundColor: COLORS['bg-dark'] }} className="min-h-screen">
            <style>
                {`
                    /* Custom global styles for the app */
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                    body {
                        font-family: 'Inter', sans-serif;
                    }
                    /* Custom scrollbar styles */
                    .overflow-x-auto::-webkit-scrollbar {
                        height: 6px;
                    }
                    .overflow-x-auto::-webkit-scrollbar-thumb {
                        background-color: ${COLORS['accent-red']};
                        border-radius: 3px;
                    }
                    .overflow-x-auto::-webkit-scrollbar-track {
                        background: ${COLORS['card-dark']};
                    }
                `}
            </style>

            <div className="container mx-auto p-4 md:p-8">
                {renderPage()}
            </div>
            
            {/* Modal Container */}
            {modal && (
                <AppModal onClose={handleCloseModal}>
                    {renderModalContent()}
                </AppModal>
            )}
        </div>
    );
};

export default App;
