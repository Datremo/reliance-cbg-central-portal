import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  Plus, Trash2, Calendar, MapPin, Users, Shield, LogOut, 
  Filter, CheckCircle, Smartphone, Monitor, Activity, 
  X, Search, ChevronDown, Download, Edit2, Save, Sun, Moon, Lock, Mail,RefreshCw, Copy, BookOpen, Briefcase, Phone, Menu
} from 'lucide-react';

const SITES_BY_STATE = {
  "Madhya Pradesh": ["Satna", "Balaghat", "Jabalpur", "Bhopal", "Indore", "Sehore"],
  "Maharashtra": ["Kurkumbh", "Nagothane", "Malegaon", "Akola", "Nagpur", "Solapur", "Nanded", "Yavatmal"],
  "Uttar Pradesh": ["Barabanki", "Haidergarh", "Hapur", "Prayagraj 1", "Prayagraj 2", "Unnao", "Chandauli","Ayodhya", "Pilibhit", "Ambedkar Nagar", "Noida"],
  "Rajasthan": ["Suratgarh", "Kota"],
  "Punjab": ["Mansa", "Hoshiarpur", "Ludhiana 1", "Ludhiana 2"],
  "Odisha":["Dhenkanal 1" , "Dhenkanal 2", "Choudwar"],
  "Haryana": ["Panipat", "Jhajjar 1", "Jhajjar 2", "Jind 1", "Jind 2"],
  "Gujarat": ["Vadodara", "Navsari 1", "Navsari 2"],
  "Chatttisgarh": ["Bilaspur", "Raipur"],
  "Andhra Pradesh": ["Rajahmundry 1", "Rajahmundry 2", "Vijaywada", "Kakinada 1", "Kakinada 2", "Kakinada 3", "Nellore", "Kurnool", "Prakasam 1", "Prakasam 2"],
  "Telangana": ["Warangal"],
};
const SITES = Object.values(SITES_BY_STATE).flat();
const LOCATIONS = ["Main Gate", "Weigh Bridge", "MTCC", "Other"];
const DESIGNATIONS = ["SS - Security Supervisor", "SG - Security Guard"];
const CONTACT_ROLES = ["State In-Charge", "Plant In-Charge","Safety In-Charge", "Site Store Team", "Operations In-Charge","Microlink", "Other"];
// ✨ NEW HELPER FUNCTION: Making phone numbers gorgeous (12345 67890)
const formatPhone = (phone) => {
  if (!phone) return "N/A";
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 10) return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  return phone;
};
export default function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [theme, setTheme] = useState('light');
  const [deletingRecord, setDeletingRecord] = useState(null); // ✨ NEW STATE
  const [viewingRecord, setViewingRecord] = useState(null); // ✨ NEW STATE
  const [contacts, setContacts] = useState([]); // ✨ NEW CONTACTS STATE
  const [editingContact, setEditingContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);
  const [viewingContact, setViewingContact] = useState(null); // ✨ NEW STATE!
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  
  // --- 🔥 AUTHENTICATION STATE & PROFILE FETCHING ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
        setDeployments([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
  
    // it defaults to making 'satna@rbg.local' a supervisor and 'shubham' an admin!
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    
    if (data) {
      setUserProfile(data);
    } else {
      // Mock profile if table is missing during your testing phase
      const email = session?.user?.email || '';
      if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('shubham')) {
      setUserProfile({ role: 'admin', name: 'Shubham (Admin)', site: 'All' });
    } else {
        const siteMatch = email.split('@')[0];
        const formattedSite = siteMatch.charAt(0).toUpperCase() + siteMatch.slice(1);
        setUserProfile({ role: 'supervisor', name: `${formattedSite} Sup`, site: formattedSite });
      }
    }
  };

// --- 🔥 FETCH DEPLOYMENTS & CONTACTS ---
  useEffect(() => {
    if (userProfile) {
      fetchDeployments();
      if (userProfile.role === 'admin') fetchContacts(); // Safe inside the shield! 🛡️
    }
  }, [userProfile]);

  // ✨ 1. FETCH DEPLOYMENTS
  const fetchDeployments = async () => {
    setIsLoadingData(true);
    
    let query = supabase.from('deployments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1500); 
    
    if (userProfile.role === 'supervisor') query = query.eq('site', userProfile.site);

    const { data, error } = await query;
    if (error) console.error("Error fetching:", error);
    else {
      const shiftOrder = { "Day Shift": 1, "Night Shift": 2, "Weekly Off": 3, "Weekly Off/Leave": 3 };
      const sortedData = (data || []).sort((a, b) => {
        if (a.date !== b.date) return new Date(b.date || "") - new Date(a.date || "");
        if (a.site !== b.site) return (a.site || "").localeCompare(b.site || "");
        
        // 1. Sort by shift first
        if (a.shift !== b.shift) return (shiftOrder[a.shift] || 4) - (shiftOrder[b.shift] || 4);
        
        // ✨ 2. THE MAGIC: Force 'SS' to the absolute top of their shift!
        const aIsSS = (a.designation || "").includes('SS');
        const bIsSS = (b.designation || "").includes('SS');
        if (aIsSS && !bIsSS) return -1;
        if (!aIsSS && bIsSS) return 1;
        
        return 0;
      });
      setDeployments(sortedData);
    }
    setIsLoadingData(false);
  };

  // ✨ 2. FETCH CONTACTS (Properly separated!)
  const fetchContacts = async () => {
    const { data, error } = await supabase.from('contacts').select('*').order('name', { ascending: true });
    if (!error) setContacts(data || []);
  };
  // --- 🔥 SAVE EDIT ---
  const saveEdit = async (updatedRecord) => {
    const { id, created_at, ...updateData } = updatedRecord;
    const { error } = await supabase.from('deployments').update(updateData).eq('id', id);
    if (error) {
  alert(`Vault Rejection: ${error.message}`); // This tells us the REAL error!
} else {
      setDeployments(deployments.map(d => d.id === updatedRecord.id ? updatedRecord : d));
      setEditingRecord(null);
    }
  };

// --- 🔥 CONTACT CRUD ---
  const saveContact = async (contactData) => {
    if (contactData.id) {
      // Update existing
      const { id, created_at, ...updateData } = contactData;
      const { data, error } = await supabase.from('contacts').update(updateData).eq('id', id).select();
      if (!error && data) setContacts(contacts.map(c => c.id === id ? data[0] : c));
    } else {
      // Insert new
      const { data, error } = await supabase.from('contacts').insert([contactData]).select();
      if (!error && data) setContacts([...contacts, data[0]].sort((a,b) => a.name.localeCompare(b.name)));
    }
    setEditingContact(null);
  };

  const confirmDeleteContact = async () => {
    if (!deletingContact) return;
    const { error } = await supabase.from('contacts').delete().eq('id', deletingContact.id);
    if (!error) {
      setContacts(contacts.filter(c => c.id !== deletingContact.id));
      setDeletingContact(null);
    }
  };

  // ✨ NEW DELETE FUNCTION
  const confirmDelete = async () => {
    if (!deletingRecord) return;
    const { error } = await supabase.from('deployments').delete().eq('id', deletingRecord.id);
    if (error) alert(`Vault Error: ${error.message}`);
    else {
      setDeployments(deployments.filter(d => d.id !== deletingRecord.id));
      setDeletingRecord(null);
    }
  };

  // --- LOGIN SCREEN ---
  if (!session || !userProfile) {
    return <AuthScreen theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
        <div className="flex flex-col md:flex-row min-h-screen">
          {userProfile.role === 'admin' ? (
            <AdminDesktopView 
  userProfile={userProfile} 
  deployments={deployments} 
  contacts={contacts} 
  isLoading={isLoadingData} 
  onLogout={() => supabase.auth.signOut()} 
  onEdit={setEditingRecord} 
  onDelete={setDeletingRecord} 
  onView={setViewingRecord} 
  onAddContact={() => setEditingContact({ name: '', phone: '', designation: '', state_name: '', site: '', email: '', company: '' })} 
  onEditContact={setEditingContact} 
  onDeleteContact={setDeletingContact} 
  onViewContact={setViewingContact} // ✨ HANDING OVER THE SUPERPOWER
  theme={theme} 
  toggleTheme={toggleTheme} 
/>
          ) : (
            <SupervisorMobileView userProfile={userProfile} deployments={deployments} isLoading={isLoadingData} fetchDeployments={fetchDeployments} onLogout={() => supabase.auth.signOut()} onEdit={setEditingRecord} onDelete={setDeletingRecord} onView={setViewingRecord} onAddContact={() => setEditingContact({ name: '', phone: '', designation: 'SS - Security Supervisor', state_name: '', site: '', email: '', company: '' })} onEditContact={setEditingContact} onDeleteContact={setDeletingContact} theme={theme} toggleTheme={toggleTheme} />
          )}
        </div>
          {/* Modals for Deployments */}
        {editingRecord && <EditModal record={editingRecord} onClose={() => setEditingRecord(null)} onSave={saveEdit} />}
        {deletingRecord && <DeleteModal record={deletingRecord} onClose={() => setDeletingRecord(null)} onConfirm={confirmDelete} type="deployment" />}
        {viewingRecord && <ViewModal record={viewingRecord} onClose={() => setViewingRecord(null)} />}
        
        {/* ✨ NEW: Modals for Contacts! */}
        {editingContact && <ContactFormModal record={editingContact} onClose={() => setEditingContact(null)} onSave={saveContact} />}
        {deletingContact && <DeleteModal record={deletingContact} onClose={() => setDeletingContact(null)} onConfirm={confirmDeleteContact} type="contact" />}
        {viewingContact && <ContactViewModal record={viewingContact} onClose={() => setViewingContact(null)} />}
      </div>
    </div>
  );
}

// ==========================================
// 🔐 AUTHENTICATION SCREEN
// ==========================================
function AuthScreen({ theme, toggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMsg(error.message);
    setLoading(false);
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
        <button onClick={toggleTheme} className="absolute top-6 right-6 p-3 bg-white dark:bg-slate-900 rounded-full shadow-md text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all z-50">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black w-full max-w-md relative overflow-hidden transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          
          <div className="mb-8 flex flex-col items-center">
            <div className="bg-indigo-50 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100 dark:border-slate-800">
              <Shield size={32} strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reliance CBG Central</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Secure Deployment Access</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-xs text-red-600 dark:text-red-400 font-semibold text-center">{errorMsg}</div>}
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Node ID / Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" placeholder="xyz@cbg.com" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Security Passkey</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all flex justify-center items-center shadow-lg shadow-indigo-900/20 mt-6">
              {loading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 📱 SUPERVISOR VIEW (SHARED KIOSK MODE)
// ==========================================
function SupervisorMobileView({ userProfile, deployments, isLoading, fetchDeployments, onLogout, onEdit, onDelete, onView, theme, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('form');
  
  // ✨ The Identity Tracker States
  const [fillerName, setFillerName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [customName, setCustomName] = useState('');

  // 🪄 THE MAGIC TRICK: Split the names by comma!
  // If userProfile.name is "Mayank, Rahul", this array becomes ["Mayank", "Rahul"]
  const allowedSupervisors = userProfile.name ? userProfile.name.split(',').map(n => n.trim()) : [];

  const selectName = (name) => {
    setFillerName(name.toUpperCase());
    setShowNamePrompt(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if(customName.trim().length > 0) {
      selectName(customName.trim());
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-slate-950 max-w-md mx-auto shadow-2xl relative border-x border-slate-200 dark:border-slate-900 transition-colors">
      
      {/* ✨ THE MANDATORY VIP SELECTION POP-UP */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600 w-full"></div>
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-4 mx-auto shadow-inner border border-indigo-100 dark:border-indigo-500/20">
                <Users size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white text-center mb-1">Who is on duty?</h2>
              <p className="text-xs text-slate-500 text-center mb-6">Tap your name to unlock the {userProfile.site} portal.</p>
              
              {/* 🔘 DYNAMIC BUTTONS FOR EACH SUPERVISOR */}
              <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar">
                {allowedSupervisors.map((name, idx) => (
                  <button 
                    key={idx}
                    onClick={() => selectName(name)}
                    className="w-full py-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 rounded-xl font-black text-sm uppercase transition-all shadow-sm flex justify-center items-center gap-2"
                  >
                    <CheckCircle size={18} /> {name}
                  </button>
                ))}
              </div>

              {/* ⌨️ MANUAL FALLBACK (Just in case someone new is filling in!) */}
              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3">Not on the list?</p>
                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                  <input type="text" placeholder="Type name..." value={customName} onChange={(e) => setCustomName(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-bold outline-none focus:border-indigo-500 uppercase" />
                  <button type="submit" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 rounded-lg font-bold text-xs hover:opacity-80 transition-opacity">GO</button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-5 py-4 flex justify-between items-center sticky top-0 z-40">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{userProfile.site} Node</h1>
          {/* ✨ SHOWS THE SELECTED SUPERVISOR NAME! */}
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest mt-0.5">
            {fillerName ? `Officer: ${fillerName}` : 'Active Deployment'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="p-2 text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full hover:text-indigo-600 transition-colors">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
          <button onClick={fetchDeployments} className={`p-2 text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full hover:text-indigo-600 transition-colors ${isLoading ? "animate-spin text-indigo-500" : ""}`}>
            <RefreshCw size={18} />
          </button>
          <button onClick={onLogout} className="p-2 text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full hover:text-rose-500 transition-colors"><LogOut size={18} /></button>
        </div>
      </div>

      <div className="flex-1 w-full overflow-y-auto pb-24">
        {activeTab === 'form' ? (
          /* ✨ WE PASS THE FILLER NAME INTO THE FORM HERE! */
          <DeploymentMobileForm userProfile={userProfile} fetchDeployments={fetchDeployments} setActiveTab={setActiveTab} fillerName={fillerName} />
        ) : (
          <SupervisorMobileHistory deployments={deployments} isLoading={isLoading} onEdit={onEdit} onDelete={onDelete} onView={onView}/>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe z-40">
        <div className="flex justify-around items-center p-1 max-w-md mx-auto">
          <button onClick={() => setActiveTab('form')} className={`flex flex-col items-center p-3 w-full transition-colors ${activeTab === 'form' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-400'}`}>
            <Users size={22} className={activeTab === 'form' ? 'stroke-2' : 'stroke-[1.5]'} /><span className="text-[10px] font-bold mt-1">ENTRY</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center p-3 w-full transition-colors ${activeTab === 'history' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-400'}`}>
            <Calendar size={22} className={activeTab === 'history' ? 'stroke-2' : 'stroke-[1.5]'} /><span className="text-[10px] font-bold mt-1">LOGS</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DeploymentMobileForm({ userProfile, fetchDeployments, setActiveTab, fillerName }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  
  const [personnel, setPersonnel] = useState([{ id: Date.now(), shift: "Day Shift", designation: "SS - Security Supervisor", name: "", phone: "", location: "Main Gate", customLocation: "" }]);

  const addPerson = () => setPersonnel([...personnel, { id: Date.now(), shift: "Day Shift", designation: "SG - Security Guard", name: "", phone: "", location: "Main Gate", customLocation: "" }]);
  const updatePerson = (id, field, value) => setPersonnel(personnel.map(p => p.id === id ? { ...p, [field]: value } : p));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newRecords = personnel.map(p => ({
      date, site: userProfile.site, shift: p.shift, designation: p.designation,
      name: p.name.toUpperCase(), phone: p.phone, location: p.location === 'Other' ? p.customLocation : p.location,
      submittedBy: fillerName || userProfile.name
    }));

    const { error } = await supabase.from('deployments').insert(newRecords);
    setIsSubmitting(false);

    if (error) {
  // This is the big one! It will show us the RLS or Check Constraint error.
  alert(`Vault Error: ${error.message} (Code: ${error.code})`);
} else {
      setSuccessMsg(true);
      fetchDeployments();
      setTimeout(() => {
        setSuccessMsg(false);
        setPersonnel([{ id: Date.now(), shift: "Day Shift", designation: "SS - Security Supervisor", name: "", phone: "", location: "Main Gate", customLocation: "" }]);
        setActiveTab('history');
      }, 1200);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-5">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Reporting Date</label>
        <div className="relative">
          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold outline-none [color-scheme:light] dark:[color-scheme:dark]" />
        </div>
      </div>

      <div className="space-y-4">
        {personnel.map((person, index) => (
          <div key={person.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase">Entry #{index + 1}</span>
              {personnel.length > 1 && <button type="button" onClick={() => setPersonnel(personnel.filter(p => p.id !== person.id))} className="text-slate-400 hover:text-red-500"><X size={16} /></button>}
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Shift</label>
                  <select value={person.shift} onChange={(e) => updatePerson(person.id, 'shift', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-semibold outline-none focus:border-indigo-500">
                    <option value="Day Shift">Day Shift</option>
                    <option value="Night Shift">Night Shift</option>
                    <option value="Weekly Off">Weekly Off/Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Role</label>
                  <select value={person.designation} onChange={(e) => updatePerson(person.id, 'designation', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-semibold outline-none focus:border-indigo-500">
                    {DESIGNATIONS.map(d => <option key={d} value={d}>{d.split(' - ')[0]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input type="text" required placeholder="Employee Name" value={person.name} onChange={(e) => updatePerson(person.id, 'name', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-bold outline-none uppercase placeholder:normal-case focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone</label>
                  <input type="tel" required pattern="[0-9]{10}" placeholder="10 Digits" maxLength="10" value={person.phone} onChange={(e) => updatePerson(person.id, 'phone', e.target.value.replace(/\D/g, ''))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-mono font-medium outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Location</label>
                  <select value={person.location} onChange={(e) => updatePerson(person.id, 'location', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-semibold outline-none focus:border-indigo-500">
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              {person.location === 'Other' && (
                <input type="text" required placeholder="Specify location" value={person.customLocation} onChange={(e) => updatePerson(person.id, 'customLocation', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 px-3 text-sm font-semibold outline-none focus:border-indigo-500" />
              )}
            </div>
          </div>
        ))}

        <button type="button" onClick={addPerson} className="w-full py-4 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white rounded-xl text-sm font-bold flex justify-center items-center gap-2">
          <Plus size={18} /> ADD PERSONNEL
        </button>
      </div>

      <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-xl font-bold text-base shadow-lg flex justify-center items-center gap-2 ${successMsg ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/50' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/20'}`}>
        {isSubmitting ? 'SAVING TO VAULT...' : successMsg ? <><CheckCircle size={20} /> RECORDED</> : 'SUBMIT DEPLOYMENT'}
      </button>
    </form>
  );
}

function SupervisorMobileHistory({ deployments, isLoading, onEdit, onDelete, onView }) {
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCopied, setIsCopied] = useState(false);

  if (isLoading) return <div className="p-10 text-center text-indigo-500 font-bold animate-pulse">Syncing with cloud vault...</div>;

  const filteredLogs = deployments.filter(d => d.date === viewDate);

  // ✨ THE PRO WHATSAPP EXPORT (With SS Sorting!)
  const handleCopyWhatsApp = () => {
    if (filteredLogs.length === 0) return alert("No logs to copy for this date!");

    const totalSS = filteredLogs.filter(l => (l.designation || "").includes('SS')).length;
    const totalSG = filteredLogs.filter(l => (l.designation || "").includes('SG')).length;
    const dayLogs = filteredLogs.filter(l => (l.shift || "").includes('Day'));
    const nightLogs = filteredLogs.filter(l => (l.shift || "").includes('Night'));
    const offLogs = filteredLogs.filter(l => (l.shift || "").includes('Off'));

    let msg = `*Deployment Report - ${filteredLogs[0].site || "Site"}*\n📅 *Date:* ${viewDate}\n📊 *Grand Total:* ${filteredLogs.length} (SS: ${totalSS}, SG: ${totalSG})\n\n`;

    const appendSection = (logs, title, icon) => {
      if (logs.length > 0) {
        const ssCount = logs.filter(l => (l.designation || "").includes('SS')).length;
        const sgCount = logs.filter(l => (l.designation || "").includes('SG')).length;
        msg += `*${icon} ${title} - Total: ${logs.length} (SS: ${ssCount}, SG: ${sgCount})*\n`;

        // 🪄 THE MAGIC SORT: Pushes 'SS' to the top!
        const sortedLogs = [...logs].sort((a, b) => {
          const aIsSS = (a.designation || "").includes('SS');
          const bIsSS = (b.designation || "").includes('SS');
          if (aIsSS && !bIsSS) return -1;
          if (!aIsSS && bIsSS) return 1;
          return 0;
        });

        sortedLogs.forEach((log, i) => {
          const role = (log.designation || "").split(' - ')[0] || "Staff";
          msg += `  ${i + 1}. ${log.name || "Unknown"} (${role})\n  📍 ${log.location || "N/A"} | 📞 ${formatPhone(log.phone)}\n`;
        });
        msg += `\n`;
      }
    };

    appendSection(dayLogs, "DAY SHIFT", "☀️");
    appendSection(nightLogs, "NIGHT SHIFT", "🌙");
    appendSection(offLogs, "WEEKLY OFF", "🏖️");

    navigator.clipboard.writeText(msg.trim()).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="p-4 space-y-3">
      {/* ✨ DATE PICKER & WHATSAPP BUTTON */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Log Date</span>
          <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold outline-none [color-scheme:light] dark:[color-scheme:dark]" />
        </div>
        <button onClick={handleCopyWhatsApp} className={`w-full py-2.5 rounded-lg text-xs font-bold flex justify-center items-center gap-2 transition-all ${isCopied ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800'}`}>
          {isCopied ? <><CheckCircle size={16} /> COPIED TO CLIPBOARD</> : <><Copy size={16} /> EXPORT FOR WHATSAPP</>}
        </button>
      </div>

      {filteredLogs.map((row, idx) => {
        // ✨ SAFETY FIRST: Fallbacks so React never panics!
        const safeShift = row.shift || "";
        const safeDesignation = row.designation || "";
        const safeName = row.name || "Unknown";
        const shiftType = safeShift.includes('Off') ? 'OFF' : safeShift.split(' ')[0];
        
        let badgeClasses = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
        if (safeShift.includes(' WEEKLY Off')) badgeClasses = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
        else if (safeShift.includes('Night')) badgeClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400';

        return (
          <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative group">
            <div className="flex justify-between items-start mb-3">
              <div className="pr-4">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-sm">{safeName}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{safeDesignation}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${badgeClasses}`}>
                {shiftType || "N/A"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50 mt-2 mb-3">
              <span className="flex items-center gap-1.5 font-medium"><Calendar size={12}/> {row.date || "N/A"}</span>
              <span className="flex items-center gap-1.5 font-medium"><MapPin size={12}/> {row.location || "N/A"}</span>
              <span className="flex items-center gap-1.5 font-mono font-bold col-span-2 text-slate-700 dark:text-slate-300">{formatPhone(row.phone)}</span>
            </div>

            <div className="flex justify-end border-t border-slate-100 dark:border-slate-800/50 pt-3 mt-1 gap-2">
              <button onClick={() => onEdit(row)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 rounded-lg transition-colors">
                <Edit2 size={14} /> Edit 
              </button>
              <button onClick={() => onDelete(row)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 dark:bg-slate-800 dark:hover:text-red-400 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
      {filteredLogs.length === 0 && <p className="text-center text-slate-500 text-sm mt-10 font-medium">No deployment logs found for this date.</p>}
    </div>
  );
}
// ==========================================
// 🖥️ ADMIN VIEW
// ==========================================
// ==========================================
// 🖥️ ADMIN VIEW (MASTER PORTAL)
// ==========================================
function AdminDesktopView({ userProfile, deployments, contacts, isLoading, onLogout, onEdit, onView, onDelete, onAddContact, onEditContact, onDeleteContact, onViewContact, theme, toggleTheme }) {
  // ✨ TAB STATE TO SWITCH BETWEEN DEPLOYMENTS & CONTACTS
  const [activeTab, setActiveTab] = useState('deployments'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Deployment Filters
  const [filterState, setFilterState] = useState("All");
  const [filterSite, setFilterSite] = useState("All");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterShift, setFilterShift] = useState("All");
  const [filterDesignation, setFilterDesignation] = useState("All");
  const [searchTerm, setSearchTerm] = useState(""); 

  // Contact Omni-Search
  const [contactSearchTerm, setContactSearchTerm] = useState("");

  const availableSites = filterState === "All" ? SITES : SITES_BY_STATE[filterState] || [];
  
  // Safe Deployment Filter
  const filteredData = deployments.filter(d => {
    const stateMatch = filterState === "All" || (SITES_BY_STATE[filterState] && SITES_BY_STATE[filterState].includes(d.site));
    const siteMatch = filterSite === "All" || d.site === filterSite;
    const dateMatch = filterDate === "" || d.date === filterDate;
    const shiftMatch = filterShift === "All" || d.shift === filterShift;
    const designationMatch = filterDesignation === "All" || (d.designation && d.designation.startsWith(filterDesignation));
    
    const safeName = d.name || ""; 
    const searchMatch = searchTerm === "" || safeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return stateMatch && siteMatch && dateMatch && shiftMatch && designationMatch && searchMatch;
  });

  // ✨ OMNI-SEARCH LOGIC FOR CONTACTS
  const filteredContacts = (contacts || []).filter(c => {
    if (contactSearchTerm === "") return true;
    const q = contactSearchTerm.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q) ||
      (c.designation || "").toLowerCase().includes(q) ||
      (c.state_name || "").toLowerCase().includes(q) ||
      (c.site || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.company || "").toLowerCase().includes(q)
    );
  });

  return (
     <div className="flex w-full h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors relative">
      
      {/* ✨ MOBILE BACKDROP FOR SIDEBAR */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[60] md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* 🧭 SIDEBAR NAVIGATION (NOW WORKS ON MOBILE AS A DRAWER!) */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center">
            <Shield size={20} className="text-indigo-500 mr-3" />
            <span className="font-bold text-sm tracking-widest text-white flex items-center gap-2">RELIANCE CBG COMMAND</span>
          </div>
          {/* Mobile Close Button */}
          <button className="md:hidden text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-2 flex-1 mt-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">Modules</p>
          <button onClick={() => { setActiveTab('deployments'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'deployments' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <Activity size={18} /> Deployment Matrix
          </button>
          <button onClick={() => { setActiveTab('contacts'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'contacts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <BookOpen size={18} /> Global Contacts
          </button>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-lg border border-slate-700">{userProfile.name.charAt(0)}</div>
            <div>
              <p className="text-sm font-bold text-slate-100">{userProfile.name}</p>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Administrator</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center justify-center gap-2 py-3 px-3 bg-slate-900 border border-slate-700 hover:border-rose-500/50 rounded-xl text-sm font-semibold text-slate-400 hover:text-rose-400 w-full transition-all">
            <LogOut size={16} /> Disconnect System
          </button>
        </div>
      </aside>

      {/* 🖥️ MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 transition-colors w-full">
          <div className="flex items-center gap-3">
            {/* Hamburger Button (Mobile Only) */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors">
              <Menu size={20} />
            </button>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-none">{activeTab === 'deployments' ? 'Deployment Matrix' : 'Global Contacts'}</h1>
            <span className="hidden sm:flex bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase items-center gap-1.5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Secure Cloud Vault
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="sm:hidden bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold px-2 py-1 rounded-full uppercase flex items-center shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></div> Live
            </span>
            <button onClick={toggleTheme} className="p-2 text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
               {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          
          {/* ===================================== */}
          {/* 🎯 TAB: DEPLOYMENT MATRIX VIEW */}
          {/* ===================================== */}
          {activeTab === 'deployments' && (
            <>
              {/* ✨ RESPONSIVE KPI CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <KPICard title="Deployed" value={filteredData.length} />
                <KPICard title="Facilities" value={new Set(filteredData.map(d => d.site)).size} />
                <KPICard title="SS Count" value={filteredData.filter(d => (d.designation||"").startsWith('SS')).length} />
                <KPICard title="SG Count" value={filteredData.filter(d => (d.designation||"").startsWith('SG')).length} />
              </div>

              {/* ✨ RESPONSIVE FILTER BAR */}
              <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
                <div className="relative flex items-center w-full sm:w-auto sm:mr-2">
                  <Search size={14} className="absolute left-3 text-slate-400" />
                  <input type="text" placeholder="Search Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-3 py-2 sm:py-1.5 w-full sm:w-40 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-800 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all" />
                </div>
                
                {/* Cute little divider line that only shows on desktop! */}
                <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                  <FilterSelect label="Date" value={filterDate} onChange={setFilterDate} type="date" />
                  <FilterSelect label="State" value={filterState} onChange={(e) => { setFilterState(e); setFilterSite("All"); }} options={Object.keys(SITES_BY_STATE).sort()} />
                  <FilterSelect label="Site" value={filterSite} onChange={setFilterSite} options={[...availableSites].sort()} />
                  <FilterSelect label="Shift" value={filterShift} onChange={setFilterShift} options={["Day Shift", "Night Shift"]} />
                  <FilterSelect label="Role" value={filterDesignation} onChange={setFilterDesignation} options={["SS", "SG"]} />
                </div>
                
                <button onClick={() => { setFilterState("All"); setFilterSite("All"); setFilterDate(new Date().toISOString().split('T')[0]); setFilterShift("All"); setFilterDesignation("All"); setSearchTerm(""); }} className="mt-2 sm:mt-0 sm:ml-auto text-xs font-bold text-indigo-600 dark:text-slate-400 bg-indigo-50 dark:bg-slate-800 px-4 py-2.5 sm:py-1.5 rounded-lg w-full sm:w-auto text-center transition-colors hover:bg-indigo-100 dark:hover:bg-slate-700">
                  Clear Filters
                </button>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="p-16 text-center font-bold text-indigo-500 animate-pulse">Decrypting secure cloud vault...</div>
                  ) : (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Facility</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shift</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Personnel</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location / Contact</th>
                          <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {filteredData.map((row, idx) => {
                          const safeShift = row.shift || "";
                          const shiftType = safeShift.includes('Off') ? 'OFF' : safeShift.split(' ')[0];
                          let badgeClass = 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20';
                          if (safeShift.includes('Off')) badgeClass = 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20';
                          else if (safeShift.includes('Night')) badgeClass = 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/20';

                          return (
                            <tr key={idx} onClick={() => onView(row)} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group cursor-pointer">
                              <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{row.date || "N/A"}</td>
                              <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{row.site || "N/A"}</span></td>
                              <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeClass}`}>{shiftType || "N/A"}</span></td>
                              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-semibold">{(row.designation || "N/A").split(' - ')[0]}</td>
                              <td className="px-6 py-4"><div className="text-sm font-bold uppercase">{row.name || "Unknown"}</div><div className="text-[10px] text-slate-500 uppercase">By: {row.submittedBy || "System"}</div></td>
                              <td className="px-6 py-4"><div className="text-xs text-slate-600 dark:text-slate-400"><MapPin size={12} className="inline mr-1"/>{row.location || "N/A"}</div><div className="text-xs font-mono font-bold text-slate-500 mt-1">{formatPhone(row.phone)}</div></td>
                              <td className="px-4 py-4 text-center">
                                <div className="flex justify-center gap-2">
                                  <button onClick={(e) => { e.stopPropagation(); onEdit(row); }} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800"><Edit2 size={14} /></button>
                                  <button onClick={(e) => { e.stopPropagation(); onDelete(row); }} className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800"><Trash2 size={14} /></button>
                                </div>
                              </td>                      
                            </tr>
                          );
                        })}
                        {filteredData.length === 0 && <tr><td colSpan="7" className="px-6 py-16 text-center text-slate-500 font-semibold">No records found.</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ===================================== */}
          {/* 📖 TAB: GLOBAL CONTACTS VIEW */}
          {/* ===================================== */}
          {activeTab === 'contacts' && (
            <>
              {/* Contacts Header & Search */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div className="relative w-full md:w-96">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Omni-Search (Name, Phone, Site, Email...)" 
                    value={contactSearchTerm} 
                    onChange={(e) => setContactSearchTerm(e.target.value)} 
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                  />
                </div>
                <button onClick={onAddContact} className="w-full md:w-auto py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 transition-all shrink-0">
                  <Plus size={18} /> ADD NEW CONTACT
                </button>
              </div>

              {/* Contacts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredContacts.map(contact => (
                <div key={contact.id} onClick={() => onViewContact(contact)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer">                    
                    {/* Actions Menu (Edit/Delete) - ✨ ADDED stopPropagation! */}
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); onEditContact(contact); }} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-800 rounded-md"><Edit2 size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteContact(contact); }} className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 dark:bg-slate-800 rounded-md"><Trash2 size={14} /></button>
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-lg font-black text-indigo-600 shrink-0">
                        {(contact.name || "?")[0]}
                      </div>
                      <div className="pr-10">
                        <h3 className="font-bold text-slate-900 dark:text-white uppercase text-sm leading-tight">{contact.name}</h3>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase mt-0.5">{contact.designation}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          <Phone size={12} className="text-slate-400" /> {formatPhone(contact.phone)}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(contact.phone); alert('Copied!'); }} className="text-slate-400 hover:text-indigo-500"><Copy size={14} /></button>                      </div>
                      
                      {(contact.site || contact.state_name) && (
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 px-1">
                          <MapPin size={14} className="text-emerald-500 shrink-0" /> 
                          <span className="truncate">{contact.site ? contact.site : 'Various Sites'} {contact.state_name ? `(${contact.state_name})` : ''}</span>
                        </div>
                      )}

                      {contact.email && (
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 px-1">
                          <Mail size={14} className="text-blue-500 shrink-0" /> <span className="truncate">{contact.email}</span>
                        </div>
                      )}

                      {contact.company && (
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 px-1">
                          <Briefcase size={14} className="text-orange-500 shrink-0" /> <span className="truncate">{contact.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredContacts.length === 0 && (
                  <div className="col-span-full py-20 text-center flex flex-col items-center">
                    <BookOpen size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">No contacts found</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your omni-search terms</p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

// ==========================================
// ✏️ GLOBAL EDIT MODAL
// ==========================================
function EditModal({ record, onClose, onSave }) {
  const [formData, setFormData] = useState(record);
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
          <h3 className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2"><Edit2 size={16} className="text-indigo-600 dark:text-indigo-400" /> Edit Record</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label><input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-bold outline-none focus:border-indigo-500 [color-scheme:light] dark:[color-scheme:dark]" /></div>
            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Shift</label><select value={formData.shift} onChange={(e) => setFormData({...formData, shift: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-bold outline-none focus:border-indigo-500"><option value="Day Shift">Day Shift</option><option value="Night Shift">Night Shift</option></select></div>
          </div>
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Employee Name</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-bold outline-none focus:border-indigo-500 uppercase" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone</label><input type="tel" required pattern="[0-9]{10}" maxLength="10" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-mono font-bold outline-none focus:border-indigo-500" /></div>
            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Designation</label><select value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-bold outline-none focus:border-indigo-500">{DESIGNATIONS.map(d => <option key={d} value={d}>{d.split(' - ')[0]}</option>)}</select></div>
          </div>
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Inside Location</label><select value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-bold outline-none focus:border-indigo-500">{LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg font-bold text-sm bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-lg font-bold text-sm bg-indigo-600 text-white flex items-center justify-center gap-2"><Save size={16} /> Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, type = "select" }) {
  return (
    // ✨ Notice the "w-full sm:w-auto" right here! That's the mobile magic!
    <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 focus-within:border-indigo-500/50">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{label}:</span>
      {type === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-slate-300 outline-none pr-4"><option value="All">All</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
      ) : (
        <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="w-full sm:w-28 bg-transparent text-sm font-bold text-slate-800 dark:text-slate-300 outline-none [color-scheme:light] dark:[color-scheme:dark]" />
      )}
    </div>
  );
}

// ✨ NEW CATCHY INFO POP-UP COMPONENT
function ViewModal({ record, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
        
        {/* Decorative Header Background */}
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 w-full absolute top-0 left-0 opacity-10 dark:opacity-20"></div>
        
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-slate-800 rounded-full transition-all z-[100] cursor-pointer shadow-md"><X size={18} /></button>
        
        <div className="p-6 pt-8 relative z-10">
          <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-2xl font-black text-indigo-600 shadow-inner border border-indigo-100 dark:border-indigo-500/20">
              {(record.name || "?")[0]}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{record.name}</h2>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">{record.designation}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Facility</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{record.site}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Location</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1"><MapPin size={14} className="text-emerald-500"/> {record.location}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Shift Details</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{record.shift}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Contact</span>
              <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{formatPhone(record.phone)}</span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full"><Calendar size={12}/> Logged on: {record.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


function DeleteModal({ record, onClose, onConfirm, type }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
        <Trash2 size={32} className="mx-auto text-red-500 mb-4" />
        {/* ✨ DYNAMIC HEADER! */}
        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Delete {type === 'contact' ? 'Contact' : 'Entry'}?</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Are you sure you want to completely remove {record.name}?</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-lg font-bold text-sm bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-lg font-bold text-sm bg-red-500 text-white hover:bg-red-600">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ✏️ CONTACT FORM MODAL (UPGRADED)
// ==========================================
function ContactFormModal({ record, onClose, onSave }) {
  // ✨ SMART LOGIC: Checks if we are editing someone with a custom designation
  const isCustomInitial = record.designation && !CONTACT_ROLES.includes(record.designation);

  const [formData, setFormData] = useState({
    ...record,
    designationMode: isCustomInitial ? 'Other' : (record.designation || CONTACT_ROLES[0]),
    customDesignation: isCustomInitial ? record.designation : ''
  });

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    // Figure out which designation to save!
    const finalDesignation = formData.designationMode === 'Other' ? formData.customDesignation : formData.designationMode;
    
    // Clean up the data before saving
    const { designationMode, customDesignation, ...dataToSave } = formData;
    dataToSave.designation = finalDesignation.toUpperCase(); // Save it nice and capitalized!
    
    onSave(dataToSave); 
  };
  
  const availableSites = formData.state_name ? (SITES_BY_STATE[formData.state_name] || []) : SITES;

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
          <h3 className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" /> 
            {record.id ? 'Edit Contact' : 'New Contact'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-bold outline-none focus:border-indigo-500 uppercase" placeholder="e.g. MAYANK DWIVEDI" /></div>
          
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone *</label><input type="tel" required pattern="[0-9]{10}" maxLength="10" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-mono font-bold outline-none focus:border-indigo-500" placeholder="10 Digits" /></div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Designation *</label>
              <select required value={formData.designationMode} onChange={(e) => setFormData({...formData, designationMode: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-bold outline-none focus:border-indigo-500">
                {CONTACT_ROLES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* ✨ MAGIC TEXT BOX: Only shows if 'Other' is selected! */}
          {formData.designationMode === 'Other' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-[10px] font-bold text-indigo-500 uppercase mb-1">Custom Designation *</label>
              <input type="text" required placeholder="e.g. HR Manager" value={formData.customDesignation} onChange={(e) => setFormData({...formData, customDesignation: e.target.value})} className="w-full bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg py-2.5 px-3 text-sm font-bold outline-none focus:border-indigo-500" />
            </div>
          )}

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Optional Details</p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State</label>
                <select value={formData.state_name || ''} onChange={(e) => setFormData({...formData, state_name: e.target.value, site: ''})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-bold outline-none focus:border-indigo-500">
                  <option value="">-- None --</option>
                  {Object.keys(SITES_BY_STATE).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Site</label>
                <select value={formData.site || ''} onChange={(e) => setFormData({...formData, site: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-bold outline-none focus:border-indigo-500">
                  <option value="">-- None --</option>
                  {availableSites.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email</label><input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-bold outline-none focus:border-indigo-500" placeholder="name@company.com" /></div>
              <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Work / Company</label><input type="text" value={formData.company || ''} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-bold outline-none focus:border-indigo-500" placeholder="e.g. RBG Security" /></div>
              
              {/* ✨ NEW NOTES SECTION */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                <textarea value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-medium outline-none focus:border-indigo-500 min-h-[80px] resize-y placeholder:text-slate-400" placeholder="Add any important details here..."></textarea>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3 sticky bottom-0 bg-white dark:bg-slate-900 pb-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg font-bold text-sm bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-lg font-bold text-sm bg-indigo-600 text-white flex items-center justify-center gap-2"><Save size={16} /> Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
function KPICard({ title, value }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative overflow-hidden group">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 z-10">{title}</span>
      <span className="text-2xl font-black text-slate-900 dark:text-slate-100 z-10">{value}</span>
    </div>
  );
}

// ==========================================
// ✨ CATCHY CONTACT VIEW POP-UP
// ==========================================
function ContactViewModal({ record, onClose }) {
  const safeName = record.name || "Unknown";
  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
        
        {/* Decorative Header Background */}
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 w-full absolute top-0 left-0 opacity-10 dark:opacity-20"></div>
        
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-800 rounded-full transition-all z-[100] cursor-pointer shadow-md border border-slate-200 dark:border-slate-700"><X size={18} /></button>
        
        <div className="p-6 pt-8 relative z-10 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-2xl font-black text-indigo-600 shadow-inner border border-indigo-100 dark:border-indigo-500/20 shrink-0">
              {safeName[0]}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{safeName}</h2>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">{record.designation}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
               <div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Primary Contact</span>
                 <span className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200">{formatPhone(record.phone)}</span>
               </div>
               <button onClick={() => { navigator.clipboard.writeText(record.phone); alert('Number Copied!'); }} className="p-3 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl text-indigo-500 hover:text-indigo-600 transition-colors"><Copy size={18}/></button>
            </div>

            {(record.state_name || record.site) && (
              <div className="col-span-2 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Assigned Location</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><MapPin size={16} className="text-emerald-500"/> {record.site ? record.site : 'Various Sites'} {record.state_name ? `— ${record.state_name}` : ''}</span>
              </div>
            )}

            {record.email && (
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 break-all">{record.email}</span>
              </div>
            )}

            {record.company && (
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Organization</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{record.company}</span>
              </div>
            )}
          </div>

          {/* ✨ BEAUTIFUL NOTES SECTION */}
          {record.notes && (
            <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100/50 dark:border-amber-500/20">
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <BookOpen size={12} /> Important Notes
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {record.notes}
              </p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}