import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  Plus, Trash2, Calendar, MapPin, Users, Shield, LogOut, 
  Filter, CheckCircle, Smartphone, Monitor, Activity,  Leaf, Zap,Eye, EyeOff, Clock,BarChart2, PieChart, TrendingUp, Target,
  X, Search, ChevronDown, Download, Edit2, Save, Sun, Moon, Sparkles, Lock, Mail,RefreshCw, Copy, BookOpen, Briefcase, Phone, Menu, Unlock, ArrowRight,ArrowLeft, AlertTriangle, Camera, FileText, Image as ImageIcon,Settings, User, PlusCircle
} from 'lucide-react';

// ✨ THESE CONSTANTS STAY OUTSIDE (Because they are just normal text, no hooks!)
const LOCATIONS = ["Main Gate", "Weigh Bridge", "MTCC", "Patrolling", "SAP Operator", "Other"];
const DESIGNATIONS = ["SS - Security Supervisor", "SG - Security Guard"];
const CONTACT_ROLES = ["State In-Charge", "Plant In-Charge","Safety In-Charge", "Site Store Team", "Operations In-Charge","Microlink", "Other"];

// 📞 HELPER FUNCTION STAYS OUTSIDE TOO!
const formatPhone = (phone) => {
  if (!phone) return "N/A";
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 10) return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  return phone;
};

// 🇮🇳 ✨ THE BULLETPROOF IST TIMEZONE FIXER!
const getISTDate = (offsetDays = 0) => {
  const d = new Date();
  // Force the browser/server to calculate exactly what time it is in India right now
  const istString = d.toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
  const istDate = new Date(istString);
  istDate.setDate(istDate.getDate() + offsetDays);
  
  // Manually construct the YYYY-MM-DD string so UTC never touches it!
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 👑 THE MASTER APP COMPONENT STARTS HERE!
export default function App() {
  // 🧠 OUR NEW DYNAMIC SITES BRAIN
  const [globalSites, setGlobalSites] = useState([]);

  // ✨ THE VIP LISTS: These MUST sit right here so the whole app can see them!
  const SITES = globalSites.map(site => site.name);
  
  const SITES_BY_STATE = globalSites.reduce((acc, site) => {
    const state = site.state_name || 'Unassigned';
    if (!acc[state]) acc[state] = [];
    acc[state].push(site.name);
    return acc;
  }, {});

  const STATE_NAMES = Object.keys(SITES_BY_STATE).filter(k => k !== 'Unassigned').sort();
  
  const commissionedSiteNames = globalSites
    .filter(site => site.status === 'commissioned')
    .map(site => site.name);

  // 📡 THE DATABASE FETCH LOGIC
  const fetchSites = async () => {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('name', { ascending: true });
      
    if (!error && data) {
      setGlobalSites(data);
    } else {
      console.error("Failed to fetch sites:", error);
    }
  };

  // 🚀 Trigger the fetch when the app boots up!
  useEffect(() => {
    fetchSites();
  }, []);

  // ⚙️ Handlers for the Settings Panel
  const handleAddSite = async (newSiteName, newStateName) => {
    const { error } = await supabase.from('sites').insert([{ 
      name: newSiteName.toUpperCase(), 
      state_name: newStateName,
      status: 'project' 
    }]);
    if (!error) fetchSites();
  };

  const handleToggleSiteStatus = async (siteId, currentStatus) => {
    const newStatus = currentStatus === 'commissioned' ? 'project' : 'commissioned';
    const { error } = await supabase.from('sites').update({ status: newStatus }).eq('id', siteId);
    if (!error) fetchSites();
  };

  const handleDeleteSite = async (siteId, siteName) => {
    if (window.confirm(`Are you SURE you want to permanently delete the site "${siteName}"? This cannot be undone!`)) {
      const { error } = await supabase.from('sites').delete().eq('id', siteId);
      if (error) alert(`Vault Error: ${error.message} (Make sure no logs are attached to it first!)`);
      else fetchSites();
    }
  };

  // 👇 YOUR ORIGINAL STATES CONTINUE HERE! 👇
  const [session, setSession] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [theme, setTheme] = useState('light');
  const [deletingRecord, setDeletingRecord] = useState(null); 
  const [viewingRecord, setViewingRecord] = useState(null); 
  const [contacts, setContacts] = useState([]); 
  const [editingContact, setEditingContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);
  const [viewingContact, setViewingContact] = useState(null); 
  const [isUnlocking, setIsUnlocking] = useState(false);
  // ✨ NEW: INCIDENT & WEEKLY COMMAND STATE
  const [incidents, setIncidents] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState([]);
  
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

  // ⚡ ✨ NEW: THE INSTANT LOGOUT MAGIC!
  const handleInstantLogout = async () => {
    // 1. Instantly wipe the local brain so the screen switches to the cinematic login IMMEDIATELY!
    setSession(null);
    setUserProfile(null);
    
    // 2. Let Supabase officially kill the cloud token in the background while the user is already gone!
    supabase.auth.signOut(); 
  };
  const fetchProfile = async (userId) => {
    // Only fetching real roles from the vault!
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    
    if (data) {
      setUserProfile(data);
    } else {
      // If someone logs in but the Admin hasn't given them a role in the database, kick them out!
      alert("Security Protocol: Your account has not been assigned a role by the System Administrator.");
      supabase.auth.signOut(); // Instantly logs them back out!
    }
  };

// --- 🔥 FETCH DEPLOYMENTS, CONTACTS & INCIDENTS ---
useEffect(() => {
    if (userProfile) {
      fetchDeployments();
      fetchIncidents();
      fetchWeeklyReports(); // ✨ NEW: Tell the app to fetch the reports!
      if (userProfile.role === 'admin') fetchContacts();
    }
  }, [userProfile]);

  // ✨ NEW: The actual function that pulls from the vault
  const fetchWeeklyReports = async () => {
    let query = supabase.from('weekly_reports').select('*');
    if (userProfile.role === 'supervisor') query = query.eq('site', userProfile.site);
    const { data } = await query;
    setWeeklyReports(data || []);
  };


  // ✨ NEW: FETCH INCIDENTS ENGINE
  const fetchIncidents = async () => {
    let query = supabase.from('incidents').select('*').order('created_at', { ascending: false });
    if (userProfile.role === 'supervisor') query = query.eq('site', userProfile.site);
    const { data, error } = await query;
    if (!error) setIncidents(data || []);
  };

  const deleteIncident = async (id) => {
    if(window.confirm("🚨 Delete this incident report forever?")) {
      await supabase.from('incidents').delete().eq('id', id);
      fetchIncidents();
    }
  };

const toggleIncidentStatus = async (inc) => {
    const newStatus = inc.status === 'Acknowledged' ? 'Pending' : 'Acknowledged';
    
    // We added the error catcher here!
    const { error } = await supabase.from('incidents').update({status: newStatus}).eq('id', inc.id);
    
    if (error) {
      alert(`🚨 Vault Error: ${error.message}`); // This will snitch if the column is missing!
    } else {
      fetchIncidents();
    }
  };

// ✨ NEW: WEEKLY LEDGER GOD-MODE CONTROLS
  const [editingWeekly, setEditingWeekly] = useState(null);

  const deleteWeeklyReport = async (id) => {
    if(window.confirm("Are you absolutely sure you want to delete this MIS report?")) {
      const { error } = await supabase.from('weekly_reports').delete().eq('id', id);
      if (error) alert(`Vault Error: ${error.message}`);
      else fetchWeeklyReports();
    }
  };

  const updateWeeklyReport = async (updatedData) => {
    const { id, created_at, ...updatePayload } = updatedData;
    const { error } = await supabase.from('weekly_reports').update(updatePayload).eq('id', id);
    
    if (error) {
      alert(`Vault Rejection: ${error.message}`);
    } else {
      fetchWeeklyReports();
      setEditingWeekly(null);
      alert("✅ MIS Report successfully updated and resent to Command!");
    }
  };

  //   1. FETCH DEPLOYMENTS
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
        
        // 1.Sort by shift first
        if (a.shift !== b.shift) return (shiftOrder[a.shift] || 4) - (shiftOrder[b.shift] || 4);
        
        
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

  //   2. FETCH CONTACTS (Properly separated!)
  const fetchContacts = async () => {
    const { data, error } = await supabase.from('contacts').select('*').order('name', { ascending: true });
    if (!error) setContacts(data || []);
  };

  //   3. CSV IMPORT (Zero Cloud Storage Used!
  const handleCSVImport = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = text.split('\n').map(r => r.trim()).filter(r => r);
      // Grabs the first row and makes it lowercase to match database columns
      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());

      const newContacts = [];
      for (let i = 1; i < rows.length; i++) {
        // Smart split that ignores commas inside quotes!
        const values = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
        let contact = {};
        headers.forEach((header, index) => { contact[header] = values[index] || null; });

        if (contact.phone) {
          const cleanPhone = contact.phone.replace(/\D/g, '');
          if (cleanPhone.length === 10) {
            newContacts.push({
              name: contact.name ? contact.name.toUpperCase() : "UNKNOWN",
              phone: cleanPhone,
              designation: contact.designation ? contact.designation.toUpperCase() : "OTHER",
              state_name: contact.state_name || null,
              site: contact.site || null,
              email: contact.email || null,
              company: contact.company || null,
              notes: contact.notes || null
            });
          }
        }
      }

      if (newContacts.length > 0) {
        //   THE UPSERT : 'onConflict' uses the unique phone number we just locked!
        const { error } = await supabase.from('contacts').upsert(newContacts, { onConflict: 'phone' });
        if (error) alert(`Vault Rejection: ${error.message}`);
        else {
          alert(`Boom! 💥 Successfully synced ${newContacts.length} contacts!`);
          fetchContacts(); // Instantly refreshes your screen!
        }
      } else {
        alert("Couldn't find any valid 10-digit phone numbers! Check your CSV headers.");
      }
    };
    reader.readAsText(file);
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

  // DELETE FUNCTION
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
  if (!session || !userProfile || isUnlocking) {
    return <AuthScreen theme={theme} toggleTheme={toggleTheme} setIsUnlocking={setIsUnlocking} />;
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      {/* ✨ GPU-ACCELERATED ANIMATION ENGINE (120FPS) ✨ */}
      <style>{`
        /* ✨ GLOBAL APPLE-STYLE SCROLLBAR ✨ */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.8); }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(148, 163, 184, 0.4) transparent; }

        @keyframes appleFadeUp {
          0% { opacity: 0; transform: translateY(15px) scale(0.99); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-mac-fade {
          animation: appleFadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
        @keyframes androidSwipe {
          0% { opacity: 0; transform: translateX(30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-android-swipe {
          animation: androidSwipe 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          will-change: transform, opacity;
        }
      `}</style>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
        <div className="flex flex-col md:flex-row min-h-screen">
          {userProfile.role === 'admin' ? (
            <AdminDesktopView 
              userProfile={userProfile} 
              deployments={deployments} 
              contacts={contacts} 
              incidents={incidents} 
              weeklyReports={weeklyReports}
              onDeleteSite={handleDeleteSite}
              onDeleteWeekly={deleteWeeklyReport}
              isLoading={isLoadingData} 
              onToggleAck={toggleIncidentStatus} 
              onDeleteIncident={deleteIncident}
              onLogout={handleInstantLogout} 
              onEdit={setEditingRecord} 
              onDelete={setDeletingRecord} 
              onView={setViewingRecord} 
              onAddContact={() => setEditingContact({ name: '', phone: '', designation: '', state_name: '', site: '', email: '', company: '' })} 
              onEditContact={setEditingContact} 
              onDeleteContact={setDeletingContact} 
              onViewContact={setViewingContact}
              onImportCSV={handleCSVImport} 
              theme={theme} 
              toggleTheme={toggleTheme} 
              globalSites={globalSites}
              SITES={SITES}
              COMMISSIONED_SITES={commissionedSiteNames}
              SITES_BY_STATE={SITES_BY_STATE}
              STATE_NAMES={STATE_NAMES}
              onAddSite={handleAddSite}
              onToggleSite={handleToggleSiteStatus}
            />
          ) : (
            <SupervisorMobileView userProfile={userProfile} deployments={deployments} incidents={incidents} weeklyReports={weeklyReports} isLoading={isLoadingData} fetchDeployments={fetchDeployments} fetchIncidents={fetchIncidents} fetchWeeklyReports={fetchWeeklyReports} onEditWeekly={setEditingWeekly} onLogout={handleInstantLogout} onEdit={setEditingRecord} onDelete={setDeletingRecord} onView={setViewingRecord} onToggleAck={toggleIncidentStatus} onDeleteIncident={deleteIncident} onAddContact={() => setEditingContact({ name: '', phone: '', designation: 'SS - Security Supervisor', state_name: '', site: '', email: '', company: '' })} onEditContact={setEditingContact} onDeleteContact={setDeletingContact} theme={theme} toggleTheme={toggleTheme} />
          )}
        </div>
          {/* Modals for Deployments */}
        {editingRecord && <EditModal record={editingRecord} onClose={() => setEditingRecord(null)} onSave={saveEdit} />}
        {deletingRecord && <DeleteModal record={deletingRecord} onClose={() => setDeletingRecord(null)} onConfirm={confirmDelete} type="deployment" />}
        {viewingRecord && <ViewModal record={viewingRecord} onClose={() => setViewingRecord(null)} />}
        
        {/*   NEW: Modals for Contacts! */}
        {editingContact && <ContactFormModal record={editingContact} onClose={() => setEditingContact(null)} onSave={saveContact} SITES={SITES} SITES_BY_STATE={SITES_BY_STATE} STATE_NAMES={STATE_NAMES} />}           {deletingContact && <DeleteModal record={deletingContact} onClose={() => setDeletingContact(null)} onConfirm={confirmDeleteContact} type="contact" />}
        {viewingContact && <ContactViewModal record={viewingContact} onClose={() => setViewingContact(null)} />}
      
        {editingWeekly && <WeeklyEditModal record={editingWeekly} onClose={() => setEditingWeekly(null)} onSave={updateWeeklyReport} />}
      
      </div>
    </div>
  );
}

// ==========================================
// 🔐 AUTHENTICATION SCREEN (CINEMATIC VAULT)
// ==========================================
function AuthScreen({ theme, toggleTheme, setIsUnlocking }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [time, setTime] = useState(new Date());

  //   The Cinematic Login States!
  const [loginPhase, setLoginPhase] = useState('idle'); // 'idle' -> 'loading' -> 'unlocked'

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginPhase('loading');
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message);
      setLoginPhase('idle');
    } else {
      // 🎬 MOVIE MAGIC STARTS HERE!
      setIsUnlocking(true); // Tells App.jsx to keep this screen mounted!
      setLoginPhase('unlocked');

      // We wait exactly 2 seconds for the lock to glow and the screen to fade to white!
      setTimeout(() => {
        setIsUnlocking(false); // Releases the gatekeeper to the main App!
      }, 2000);
    }
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-all duration-1000 ${loginPhase === 'unlocked' ? 'bg-white dark:bg-white' : (theme === 'dark' ? 'bg-[#0B1120]' : 'bg-slate-50')}`}>

      {/*   GORGEOUS BACKGROUND IMAGE WITH SHADOW & OVERLAY   */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${loginPhase === 'unlocked' ? 'opacity-0' : 'opacity-100'}`}>
        <img src="/background.webp" alt="Background" className="w-full h-full object-cover opacity-50 dark:opacity-30 mix-blend-luminosity" onError={(e) => e.target.style.display='none'} />
        {/* This creates the dark/light cinematic vignette over the image */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-transparent to-slate-200/90 dark:from-slate-950/90 dark:via-[#0B1120]/60 dark:to-[#0B1120]/95 backdrop-blur-[2px]"></div>
      </div>

      {/* Secret CSS Engine */}
      <style>
        {`
          @keyframes gradient-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          .animate-gradient-flow { background-size: 200% 200%; animation: gradient-flow 4s ease infinite; }
          @keyframes unlock-pop { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1.2); } }
          .animate-unlock-pop { animation: unlock-pop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes laser-sweep { 0% { transform: translateX(-100%); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(200%); opacity: 0; } }
          .animate-laser { animation: laser-sweep 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        `}
      </style>

      {/* 🔝 TOP NAVIGATION: Logo & Theme Toggle */}
      <div className={`absolute top-0 left-0 w-full p-6 sm:p-8 flex justify-between items-start z-50 transition-opacity duration-500 ${loginPhase === 'unlocked' ? 'opacity-0' : 'opacity-100'}`}>
         {/* 🖼️ BRANDING LOGO (biologo.webp) */}
         <img src="/logo.webp" alt="Test Logo" className="h-10 sm:h-12 w-auto object-contain drop-shadow-xl transition-transform hover:scale-105" onError={(e) => e.target.style.display='none'} />

         {/* 🌓 THEME TOGGLE */}
         <button onClick={toggleTheme} className="p-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.5)] border border-white/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all hover:rotate-12">
           {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
         </button>
      </div>

      {/* 💎 CENTERED: THE 3D GLASS CARD */}
      <div className={`relative w-full max-w-md mx-4 p-4 sm:p-6 z-10 transition-all duration-1000 ${loginPhase === 'unlocked' ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}>

        {/* Soft Background Energy Clouds floating around the card */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[0%] w-[80%] h-[80%] bg-emerald-500/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[0%] right-[0%] w-[70%] h-[70%] bg-green-400/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* 🪟 THE PREMIUM CARD WRAPPER */}
        <div className="relative group mt-8 lg:mt-0">

          {/*   THE BREATHING AURA */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-300 to-green-500 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-500 animate-gradient-flow z-0"></div>

          {/* 🧊 THE GLASS CARD CONTENT */}
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-white/60 dark:border-slate-700/50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 sm:p-10 z-10 overflow-hidden">

            {/* The Laser Scanner */}
            <div className="absolute top-0 left-0 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-laser"></div>

            {/* Hidden Watermark Lock */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden rounded-[2.5rem]">
               <Lock size={280} className="text-slate-200/30 dark:text-slate-700/20 transform -rotate-12 translate-x-10 translate-y-10" />
            </div>

            <div className="mb-10 flex flex-col items-center text-center relative z-10">

              {/*   EMBOSSED 3D SHIELD ICON */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500/30 blur-2xl animate-pulse rounded-full"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_10px_20px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.4)] border border-slate-200/50 dark:border-slate-700/50 transform rotate-3 hover:rotate-6 transition-transform duration-500 group">
                  <Shield size={36} className="text-emerald-600 dark:text-emerald-400 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>

              <div className="relative inline-block">
                 <h1 className="text-3xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                   Test <span className="bg-clip-text text-transparent bg-gradient-to-b from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500">CBG Central</span>
                 </h1>
              </div>

              {/* SLEEK & ELEGANT SUBTITLE */}
              <p className="text-slate-500/80 dark:text-slate-400/80 font-bold text-[10px] flex items-center gap-2 justify-center uppercase tracking-[0.25em] mt-3">
                 <Shield size={13} className="text-emerald-500" /> Secure Deployment Access
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              {errorMsg && <div className="p-4 bg-red-50/80 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 font-bold text-center">{errorMsg}</div>}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Site ID / Email</label>
                <div className="relative group/input">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors z-10" />
                  {/*   DEEP CARVED INPUT */}
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loginPhase !== 'idle'}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 dark:bg-[#0B1120]/80 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)]"
                    placeholder="auth@test.cbg.com" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Secure Passkey</label>
                <div className="relative group/input">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors z-10" />
                  {/*   DEEP CARVED INPUT */}
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loginPhase !== 'idle'}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50/80 dark:bg-[#0B1120]/80 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)]"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 z-10">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/*   FLOWING ENERGY BUTTON */}
              <button type="submit" disabled={loginPhase !== 'idle'} className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-600 via-green-400 to-emerald-600 animate-gradient-flow text-white rounded-xl font-black tracking-widest uppercase text-xs transition-transform transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 flex justify-center items-center relative overflow-hidden">
                <span className="flex items-center gap-2 drop-shadow-md z-10">
                  {loginPhase === 'loading' ? <><RefreshCw size={16} className="animate-spin" /> VERIFYING ENCRYPTION...</> : 'AUTHORIZE ACCESS'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 🔓 THE GLOWING UNLOCK ANIMATION (Appears on top when success!) */}
      <div className={`absolute inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none transition-all duration-700 ${loginPhase === 'unlocked' ? 'opacity-100' : 'opacity-0 scale-50'}`}>
         <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center animate-unlock-pop shadow-[0_0_150px_rgba(16,185,129,0.8)] border border-emerald-400/50">
            <Unlock size={64} className="text-emerald-600 dark:text-emerald-400" />
         </div>
         <h2 className="mt-8 text-2xl font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase drop-shadow-md">Vault Unlocked</h2>
      </div>

    </div>
  );
}
// ==========================================
// 📱 SUPERVISOR VIEW (SHARED KIOSK MODE)
// ==========================================
// ==========================================
// 📱 SUPERVISOR iOS-STYLE COMMAND HUB + CINEMATIC INTRO
// ==========================================
function SupervisorMobileView({ userProfile, deployments, incidents, weeklyReports, isLoading, fetchDeployments, fetchIncidents, fetchWeeklyReports, onEditWeekly, onLogout, onEdit, onDelete, onView, onDeleteIncident, theme, toggleTheme }) {
  // ✨ NEW: iOS App States
  const [currentApp, setCurrentApp] = useState('hub'); // 'hub', 'deployment', 'incident', 'weekly'
  const [appTab, setAppTab] = useState('form'); // 'form' or 'history'

  // 🎬 RESTORED: THE CINEMATIC INTRO STATES
  const [introStage, setIntroStage] = useState(1);
  const [customName, setCustomName] = useState('');
  const [fillerName, setFillerName] = useState('');
  const allowedSupervisors = userProfile.name ? userProfile.name.split(',').map(n => n.trim()) : [];

  // 🛡️ ✨ NEW: THE INVISIBLE BACK-BUTTON TRAP!
  useEffect(() => {
    // 1. Push a fake state into their browser history immediately
    window.history.pushState({ noBackExits: true }, '');

    // 2. Listen for them trying to swipe or hit the back button
    const handlePopState = (e) => {
      // Push it AGAIN so they are trapped inside the app!
      window.history.pushState({ noBackExits: true }, '');
      
      // If they are deep in an app, just take them back to the hub!
      if (currentApp !== 'hub') {
        setCurrentApp('hub');
      } else {
        // If they are ALREADY on the hub and trying to leave, maybe show a tiny cute alert?
        // (Optional: You can remove this alert if it's annoying!)
        console.log("Trapped the back button! They must use the logout button to exit.");
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Clean up if the component unmounts
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentApp]); // Re-runs anytime they change apps so the trap resets!

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if(customName.trim().length > 0) selectName(customName.trim());
  };

  // Auto-advance the boot screen
  useEffect(() => {
    if (introStage === 1) {
      const timer = setTimeout(() => setIntroStage(2), 2500);
      return () => clearTimeout(timer);
    }
  }, [introStage]);

  const selectName = (name) => {
    setFillerName(name.toUpperCase());
    setIntroStage(3); // Go to white welcome screen
    setTimeout(() => setIntroStage(0), 2000); // Dissolve into the iOS Hub!
  };


  // 📱 THE PREMIUM APPLE-STYLE COMMAND HUB
  const renderHub = () => (
    // ✨ Notice the exact iOS System Gray (#F2F2F7) background!
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F2F2F7] dark:bg-black p-5 sm:p-8 space-y-8 animate-in fade-in duration-300 relative">
      
      {/* Subtle Apple-style background glow */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

      <div className="flex justify-between items-start pt-2 relative z-10">
        <div>
          <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Security Dashboard</p>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">{fillerName || userProfile.name}</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-indigo-700 dark:text-indigo-300 rounded-full text-sm sm:text-base font-black uppercase tracking-wider shadow-md border border-white/40 dark:border-slate-600/50">
            <MapPin size={16} className="text-indigo-500"/> {userProfile.site}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="p-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl text-slate-600 dark:text-slate-300 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-white/50 dark:border-slate-700/50 hover:scale-105 transition-all active:scale-95">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={onLogout} className="p-3.5 bg-rose-50/80 dark:bg-rose-500/10 backdrop-blur-xl text-rose-600 dark:text-rose-400 rounded-full shadow-[0_4px_15px_rgba(244,63,94,0.1)] border border-rose-100/50 dark:border-rose-500/20 hover:scale-105 transition-all active:scale-95">
            <LogOut size={18}/>
          </button>
        </div>
      </div>

      <div className="relative z-10">
        <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 ml-1">Secure Apps</h2>
        <div className="grid grid-cols-2 gap-4">
          
          {/* ✨ iOS Style Squircle Buttons ✨ */}
          <button onClick={() => { setCurrentApp('deployment'); setAppTab('form'); }} className="aspect-square bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/60 dark:border-slate-700/50 flex flex-col items-center justify-center gap-4 transition-all active:scale-[0.96] hover:shadow-lg group">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300"><Users size={28} className="stroke-[1.5]"/></div>
            <span className="block font-bold text-slate-700 dark:text-white text-base tracking-wide leading-tight">Daily Deployment</span>
          </button>

          <button onClick={() => { setCurrentApp('incident'); setAppTab('form'); }} className="aspect-square bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/60 dark:border-slate-700/50 flex flex-col items-center justify-center gap-4 transition-all active:scale-[0.96] hover:shadow-lg group">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform duration-300"><AlertTriangle size={28} className="stroke-[1.5]"/></div>
            <span className="block font-bold text-slate-700 dark:text-white text-base tracking-wide leading-tight">Incident Report</span>
          </button>

          <button onClick={() => { setCurrentApp('weekly'); setAppTab('form'); }} className="col-span-2 py-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/60 dark:border-slate-700/50 flex flex-row items-center justify-center gap-5 transition-all active:scale-[0.96] hover:shadow-lg group">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300"><BookOpen size={28} className="stroke-[1.5]"/></div>
            <div className="text-left">
              <span className="block font-bold text-slate-900 dark:text-white text-base tracking-wide leading-tight">MIS Report</span>
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Submit Ledger</span>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
    

 // 🛠️ THE OPEN MODULE SCREEN (APPLE STYLE)
  const renderModule = () => (
    <div className="flex flex-col h-full bg-[#F2F2F7] dark:bg-black relative">
      
      {/* ✨ APPLE-STYLE FROSTED GLASS HEADER */}
      <div className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-4 flex items-center gap-4">
        <button onClick={() => setCurrentApp('hub')} className="w-10 h-10 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/20 transition-colors active:scale-90 shrink-0">
          <ArrowLeft size={20}/>
        </button>
        <div className="flex-1">
          <h2 className="font-black text-slate-900 dark:text-white tracking-tight text-lg leading-tight">
            {currentApp === 'deployment' ? 'Live Deployment' : currentApp === 'incident' ? 'Incident Report' : 'MIS Report'}
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{userProfile.site}</p>
        </div>
      </div>

      {/* ✨ APPLE-STYLE SEGMENTED CONTROL */}
      <div className="px-4 pt-5 pb-2 shrink-0 z-40 bg-[#F2F2F7] dark:bg-black">
        <div className="bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-md p-1 rounded-[14px] flex relative shadow-inner border border-black/5 dark:border-white/5">
          
          {/* THE MAGIC SLIDING WHITE PILL */}
          <div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-600 rounded-[10px] shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: appTab === 'form' ? 'translateX(0)' : 'translateX(100%)' }}
          ></div>

          <button onClick={() => setAppTab('form')} className={`flex-1 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors duration-300 relative z-10 ${appTab === 'form' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>New Entry</button>
          <button onClick={() => setAppTab('history')} className={`flex-1 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors duration-300 relative z-10 ${appTab === 'history' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>View Logs</button>
        </div>
      </div>

      {/* ✨ THE HIGH-SPEED ANDROID ANIMATION WRAPPER ✨ */}
      <div key={currentApp + appTab} className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-10 animate-android-swipe">
        
        {currentApp === 'deployment' && appTab === 'form' && <DeploymentMobileForm userProfile={userProfile} fetchDeployments={fetchDeployments} setActiveTab={setAppTab} fillerName={fillerName} deployments={deployments}/>}
        {currentApp === 'deployment' && appTab === 'history' && <SupervisorMobileHistory deployments={deployments} isLoading={isLoading} onEdit={onEdit} onDelete={onDelete} onView={onView}/>}
        
        {currentApp === 'incident' && appTab === 'form' && <IncidentMobileForm userProfile={userProfile} fetchIncidents={fetchIncidents} setActiveTab={setAppTab} />}
        {currentApp === 'incident' && appTab === 'history' && <IncidentMobileHistory incidents={incidents} isLoading={isLoading} onDeleteIncident={onDeleteIncident} />}

        {currentApp === 'weekly' && appTab === 'form' && <WeeklyMobileForm userProfile={userProfile} fetchWeeklyReports={fetchWeeklyReports} setActiveTab={setAppTab} />}
        {currentApp === 'weekly' && appTab === 'history' && <WeeklyMobileHistory weeklyReports={weeklyReports} isLoading={isLoading} onEditWeekly={onEditWeekly} />}
      </div>
    </div>
  );

  // 🎬 MASTER WRAPPER (Handles Movie -> Hub -> Module)
  return (
    <div className="w-full flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 sm:bg-slate-200 sm:dark:bg-slate-900 sm:py-10 flex justify-center items-center">
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-950 sm:rounded-[2.5rem] sm:border-[8px] border-slate-800 dark:border-slate-800 sm:shadow-2xl overflow-hidden relative flex flex-col h-screen sm:h-[850px] sm:max-h-[90vh]">
        
        {/* CSS for the Hollywood fade-zoom */}
        <style>{`
          @keyframes fade-zoom { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
          .animate-fade-zoom { animation: fade-zoom 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

        {/* 🎬 THE MOVIE SEQUENCE OVERLAY */}
        {introStage > 0 ? (
          // ✨ Notice 'absolute inset-0' so it stays INSIDE the phone!
          <div className={`absolute inset-0 z-[100] flex items-center justify-center p-6 transition-colors duration-1000 ${introStage === 3 ? 'bg-white dark:bg-slate-950' : 'bg-slate-950'}`}>
            
            {/* STAGE 1: Premium Boot Splash */}
            {introStage === 1 && (
              <div className="text-center animate-fade-zoom relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl animate-pulse z-0"></div>
                
                <div className="relative mb-8 z-10">
                   <img src="/logo.webp" alt="Test Logo" className="w-28 h-28 mx-auto object-contain drop-shadow-[0_10px_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105" 
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                   <div className="hidden w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-green-600 rounded-3xl flex-col items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.4)] border border-white/20">
                      <Shield size={48} className="text-white drop-shadow-md" />
                   </div>
                </div>

                <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2 drop-shadow-lg relative z-10">
                  Test <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">CBG</span>
                </h1>
                <h2 className="text-[11px] font-bold text-slate-400 tracking-[0.4em] uppercase mb-12 relative z-10">Secure Deployment Network</h2>
                
                <div className="flex justify-center items-center gap-3 relative z-10">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                   <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Establishing Secure Uplink...</span>
                </div>
              </div>
            )}

            {/* STAGE 2: Identity Scan */}
            {introStage === 2 && (
              <div className="w-full max-w-sm animate-fade-zoom">
                <div className="text-center mb-8">
                   <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 mx-auto border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]"><Users size={32} /></div>
                   <h2 className="text-2xl font-black text-white tracking-wide mb-1">IDENTITY SCAN</h2>
                   <p className="text-xs text-indigo-300 uppercase tracking-widest font-semibold">Select Authorized Officer</p>
                </div>

                {/* ✨ DYNAMIC SUPERVISOR BUTTONS (Powered by your comma-separated logic!) */}
        <div className="w-full max-w-sm flex flex-col gap-4 relative z-10 mt-6">
          {allowedSupervisors.map((supName, index) => (
            <button 
              key={index}
              onClick={() => selectName(supName)} 
              className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-black/20 active:scale-95"
            >
              {supName}
            </button>
          ))}
        </div>
                
                <div className="mt-6 pt-5 border-t border-indigo-500/20">
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest text-center mb-3">Not on the list?</p>
                  <form onSubmit={handleCustomSubmit} className="flex gap-2">
                    <input type="text" placeholder="Enter Full Name..." value={customName} onChange={(e) => setCustomName(e.target.value)} className="flex-1 bg-black/20 border border-indigo-500/30 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-400 uppercase placeholder:text-indigo-300/50 shadow-inner" />
                    <button type="submit" className="bg-indigo-500 text-white px-5 rounded-xl font-black text-xs hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/25">GO</button>
                  </form>
                </div>
              </div>
            )}

            {/* STAGE 3: Personal Welcome */}
            {introStage === 3 && (
              <div className="text-center animate-fade-zoom">
                <div className="w-24 h-24 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 shadow-xl border border-emerald-200 dark:border-emerald-800">
                   <CheckCircle size={48} className="text-emerald-500" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Welcome,</h1>
                <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{fillerName}</h2>
                <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Accessing Secure Dashboard...</p>
              </div>
            )}
          </div>
        ) : (
          /* ✨ THE ACTUAL APP VIEWS! */
          currentApp === 'hub' ? renderHub() : renderModule()
        )}

      </div>
    </div>
  );
}
function DeploymentMobileForm({ userProfile, fetchDeployments, setActiveTab, fillerName, deployments}) {
  const today = getISTDate();
  const [date, setDate] = useState(today);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  
  const [personnel, setPersonnel] = useState([{ id: Date.now(), shift: "Day Shift", designation: "SS - Security Supervisor", name: "", phone: "", location: "Main Gate", customLocation: "" }]);

  const addPerson = () => setPersonnel([...personnel, { id: Date.now(), shift: "Day Shift", designation: "SG - Security Guard", name: "", phone: "", location: "Main Gate", customLocation: "" }]);
  const updatePerson = (id, field, value) => setPersonnel(personnel.map(p => p.id === id ? { ...p, [field]: value } : p));
  
  const handleAutoFill = () => {
    const yesterdayStr = getISTDate(-1);
    const yesterdayLogs = (deployments || []).filter(d => d.date === yesterdayStr);

    if (yesterdayLogs.length === 0) {
      alert("No previous deployments found to clone, captain! 🕵️‍♀️");
      return;
    }

    const copiedPersonnel = yesterdayLogs.map((log, index) => {
      const isStandardLocation = LOCATIONS.includes(log.location);
      return {
        id: Date.now() + index,
        shift: log.shift || "Day Shift",
        designation: log.designation || "SG - Security Guard",
        name: log.name || "",
        phone: log.phone || "",
        location: isStandardLocation ? log.location : "Other",
        customLocation: isStandardLocation ? "" : log.location
      };
    });
    setPersonnel(copiedPersonnel);
  };

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

  // 🦋 META-STYLE DESIGN TOKENS
  // Crisp white background, thick visible borders, slight inner shadow, and a bright blue focus glow!
  const inputClass = "w-full bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-medium";
  const labelClass = "block text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl">
      
      {/* 🪄 FAANG AI-Style Magic Wand */}
      <button type="button" onClick={handleAutoFill} className="w-full py-4 bg-white dark:bg-slate-900 border-2 border-transparent bg-clip-padding relative rounded-2xl text-[11px] font-black uppercase tracking-widest flex justify-center items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 group before:absolute before:inset-0 before:-z-10 before:m-[-2px] before:rounded-[18px] before:bg-gradient-to-r before:from-blue-500 before:to-purple-500 text-slate-800 dark:text-white">
        <Sparkles size={16} className="group-hover:scale-110 transition-transform text-blue-500" /> 
        Copy Yesterday's Deployment
      </button>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <label className={labelClass}>Deployment Date</label>
        <div className="relative">
          <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} pl-12 cursor-pointer [color-scheme:light] dark:[color-scheme:dark]`} />
        </div>
      </div>

      <div className="space-y-6">
        {personnel.map((person, index) => (
          <div key={person.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all relative">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center font-black">{index + 1}</div>
                <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Security Data</span>
              </div>
              {personnel.length > 1 && <button type="button" onClick={() => setPersonnel(personnel.filter(p => p.id !== person.id))} className="text-slate-400 hover:text-white hover:bg-rose-500 p-2 rounded-full transition-colors"><X size={16} /></button>}
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Shift</label>
                  <select value={person.shift} onChange={(e) => updatePerson(person.id, 'shift', e.target.value)} className={`${inputClass} cursor-pointer`}>
                    <option value="Day Shift">☀️ Day Shift</option>
                    <option value="Night Shift">🌙 Night Shift</option>
                    <option value="Weekly Off">🏖️ Weekly Off</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Designation</label>
                  <select value={person.designation} onChange={(e) => updatePerson(person.id, 'designation', e.target.value)} className={`${inputClass} cursor-pointer`}>
                    {DESIGNATIONS.map(d => <option key={d} value={d}>{d.split(' - ')[0]}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" required placeholder="Full Name..." value={person.name} onChange={(e) => updatePerson(person.id, 'name', e.target.value)} className={`${inputClass} pl-12 uppercase`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone No.</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" required pattern="[0-9]{10}" placeholder="10 Digits" maxLength="10" value={person.phone} onChange={(e) => updatePerson(person.id, 'phone', e.target.value.replace(/\D/g, ''))} className={`${inputClass} pl-11 font-mono`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <select value={person.location} onChange={(e) => updatePerson(person.id, 'location', e.target.value)} className={`${inputClass} cursor-pointer`}>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {person.location === 'Other' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <input type="text" required placeholder="Specify sector exactly..." value={person.customLocation} onChange={(e) => updatePerson(person.id, 'customLocation', e.target.value)} className={inputClass} />
                </div>
              )}
            </div>
          </div>
        ))}

        <button type="button" onClick={addPerson} className="w-full py-5 rounded-[2rem] border-2 border-dashed border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all text-xs font-black uppercase tracking-widest flex justify-center items-center gap-2">
          <Plus size={18} /> Add another
        </button>
      </div>

      <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl transition-all flex justify-center items-center gap-2 ${successMsg ? 'bg-emerald-500 text-white shadow-emerald-500/25' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/25 active:scale-95'}`}>
        {isSubmitting ? 'ENCRYPTING...' : successMsg ? <><CheckCircle size={20} /> RECORDED</> : 'SUBMIT DEPLOYMENT'}
      </button>
    </form>
  );
}

function SupervisorMobileHistory({ deployments, isLoading, onEdit, onDelete, onView }) {
  const [viewDate, setViewDate] = useState(getISTDate());
  const [isCopied, setIsCopied] = useState(false);

  if (isLoading) return <div className="p-10 text-center text-indigo-500 font-bold animate-pulse">Syncing with cloud vault...</div>;

  const filteredLogs = deployments.filter(d => d.date === viewDate);

  //   THE PRO WHATSAPP EXPORT (With SS Sorting!)
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
      {/*   DATE PICKER & WHATSAPP BUTTON */}
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
        //   SAFETY FIRST: Fallbacks so React never panics!
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
              {/* ✨ NEW: THE VIEW BUTTON! */}
              <button onClick={() => onView(row)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 rounded-lg transition-colors">
                <Eye size={14} /> View 
              </button>
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
// ADMIN VIEW (MASTER PORTAL + COMMAND CENTER)
// ==========================================
function AdminDesktopView({ userProfile, deployments, contacts, incidents, weeklyReports, isLoading, onToggleAck, onDeleteIncident, onLogout, onEdit, onView, onDelete, onAddContact, onEditContact, onDeleteContact, onViewContact, onImportCSV, theme, toggleTheme, globalSites = [], SITES = [], COMMISSIONED_SITES = [], SITES_BY_STATE = {}, STATE_NAMES = [], onAddSite, onToggleSite, onDeleteSite, onDeleteWeekly }) {  const [activeTab, setActiveTab] = useState('deployments'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // ✨ NEW: Settings Toggle!
  
  // ✨ NEW: TODAY'S INCIDENT TRACKER LOGIC
  const todayStr = getISTDate();
  const todaysIncidents = incidents ? incidents.filter(i => (i.created_at || '').startsWith(todayStr)) : [];
  const siteIncidentCounts = {};
  todaysIncidents.forEach(inc => {
    siteIncidentCounts[inc.site] = (siteIncidentCounts[inc.site] || 0) + 1;
  });
  const totalTodaysIncidents = todaysIncidents.length;

  // Deployment Filters
  const [filterState, setFilterState] = useState("All");
  const [filterSite, setFilterSite] = useState("All");
  const [filterDate, setFilterDate] = useState(getISTDate());
  const [filterShift, setFilterShift] = useState("All");
  const [filterDesignation, setFilterDesignation] = useState("All");
  const [filterLocation, setFilterLocation] = useState("All"); //   NEW: Location Filter
  const [searchTerm, setSearchTerm] = useState(""); 
  const [siteTier, setSiteTier] = useState("All"); //   NEW: VIP Toggle

  // Contact Omni-Search
  const [contactSearchTerm, setContactSearchTerm] = useState("");

  // ✨ RESTORED: Your flawless state-to-site logic!
  const availableSites = filterState === "All" ? SITES : SITES_BY_STATE[filterState] || [];
  
  // 🧠 1. THE MASTER FILTER ENGINE
  const filteredData = deployments.filter(d => {
    // ✨ SAFETY NET: Force old database logs to UPPERCASE!
    const safeSiteName = (d.site || "").toUpperCase();

    const stateMatch = filterState === "All" || (SITES_BY_STATE[filterState] && SITES_BY_STATE[filterState].includes(safeSiteName));
    const siteMatch = filterSite === "All" || safeSiteName === filterSite;
    const dateMatch = filterDate === "" || d.date === filterDate;
    const shiftMatch = filterShift === "All" || d.shift === filterShift;
    const designationMatch = filterDesignation === "All" || (d.designation && d.designation.startsWith(filterDesignation));
    const locationMatch = filterLocation === "All" || d.location === filterLocation;
    
    const safeName = d.name || ""; 
    const searchMatch = searchTerm === "" || safeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    //   VIP Tier Logic
    const isCommissioned = COMMISSIONED_SITES.includes(d.site);
    const tierMatch = siteTier === "All" || (siteTier === "Commissioned" ? isCommissioned : !isCommissioned);

    return stateMatch && siteMatch && dateMatch && shiftMatch && designationMatch && locationMatch && searchMatch && tierMatch;
  });

// 🫀 2. THE LIVE HEARTBEAT STATS
  const totalBoots = filteredData.length;
  
  //   NEW: Phantom Roster (AWOL) Engine
  const activeSiteNames = new Set(filteredData.map(d => d.site));
  const expectedSites = availableSites.filter(s => {
    if (siteTier === 'Commissioned') return COMMISSIONED_SITES.includes(s);
    if (siteTier === 'Project') return !COMMISSIONED_SITES.includes(s);
    return true;
  });
  const awolSites = expectedSites.filter(s => !activeSiteNames.has(s));

  //   NEW: MTCC Active Node Tracker (With specific counts per site!)
  const mtccDeployments = filteredData.filter(d => d.location === 'MTCC');
  const mtccSiteMap = {};
  mtccDeployments.forEach(d => {
    mtccSiteMap[d.site] = (mtccSiteMap[d.site] || 0) + 1;
  });
  const mtccActiveSitesCount = Object.keys(mtccSiteMap).length;
  const mtccHoverDetails = Object.entries(mtccSiteMap)
    .map(([site, count]) => ({ site, count }))
    .sort((a, b) => b.count - a.count); // Sorts so the heaviest sites show at the top!

  const nightShiftCount = filteredData.filter(d => (d.shift || '').includes('Night')).length;
  const ssCount = filteredData.filter(d => d.designation && d.designation.startsWith('SS')).length;
  const sgCount = filteredData.filter(d => d.designation && d.designation.startsWith('SG')).length;

//   NEW: THE 4-PILLAR COMPLIANCE ENGINE (Fatigue, Top-Heavy, Gap, Fraud)
  let fatigueRisk = 0, topHeavySites = 0, leadershipGap = 0, fraudCount = 0;
  const phoneShifts = {}; 
  const siteShiftStats = {};

  filteredData.forEach(d => {
    const phoneNum = d.phone || "NoPhone";
    // 1. Fatigue Tracking (Same phone, both Day & Night)
    if (!phoneShifts[phoneNum]) phoneShifts[phoneNum] = new Set();
    if (d.shift && d.shift.includes('Day')) phoneShifts[phoneNum].add('Day');
    if (d.shift && d.shift.includes('Night')) phoneShifts[phoneNum].add('Night');

    // 2. Shift-Specific Site Tracking (Separating Day and Night like you asked!)
    if (d.shift && !d.shift.includes('Off')) {
       const shiftType = d.shift.includes('Day') ? 'Day' : 'Night';
       const key = `${d.site}-${shiftType}`;
       if (!siteShiftStats[key]) siteShiftStats[key] = { ss: 0, sg: 0, phones: new Set() };
       
       if (d.designation && d.designation.includes('SS')) siteShiftStats[key].ss++;
       if (d.designation && d.designation.includes('SG')) siteShiftStats[key].sg++;

       // 3. Fraud Tracking (Same phone, SAME site, SAME shift)
       if (siteShiftStats[key].phones.has(phoneNum)) {
          fraudCount++;
       } else {
          siteShiftStats[key].phones.add(phoneNum);
       }
    }
  });

  // Calculate Finals
  Object.values(phoneShifts).forEach(shifts => { if (shifts.has('Day') && shifts.has('Night')) fatigueRisk++; });
  Object.values(siteShiftStats).forEach(stat => {
    if (stat.sg > 0 && stat.ss === 0) leadershipGap++; // Guards deployed, but NO Supervisor!
    if (stat.ss > 0 && stat.ss >= stat.sg) topHeavySites++; // Too many Supervisors vs Guards!
  });

  // 📊 3. THE 3D ZONE DEFENSE ENGINE
  const locCounts = { "Main Gate": 0, "MTCC": 0, "Weigh Bridge": 0, "Patrolling": 0, "SAP Operator": 0, "Other": 0 };
  filteredData.forEach(d => {
    const loc = LOCATIONS.includes(d.location) ? d.location : "Other";
    locCounts[loc] = (locCounts[loc] || 0) + 1;
  });
  const maxLocCount = Math.max(...Object.values(locCounts), 1); 
  
  const locationData = [
    { name: "Main Gate", count: locCounts["Main Gate"], color: "from-blue-500 to-cyan-400" },
    { name: "MTCC", count: locCounts["MTCC"], color: "from-amber-500 to-orange-400" },
    { name: "Weigh Bridge", count: locCounts["Weigh Bridge"], color: "from-purple-500 to-pink-400" },
    { name: "Patrolling", count: locCounts["Patrolling"], color: "from-indigo-500 to-violet-400" },
    { name: "SAP Operator", count: locCounts["SAP Operator"], color: "from-teal-500 to-emerald-400" },
    { name: "Other Posts", count: locCounts["Other"], color: "from-slate-500 to-slate-400" }
  ];

  //  NEW: 2x2 GOD-MODE METRICS MATH
  const dayShiftCount = filteredData.filter(d => (d.shift || '').includes('Day')).length;
  const leaveCount = filteredData.filter(d => (d.shift || '').includes('Off')).length;
  const rogueCount = filteredData.filter(d => d.location === 'Other').length;
  
  const sitePopulation = {};
  filteredData.forEach(d => { sitePopulation[d.site] = (sitePopulation[d.site] || 0) + 1; });
  const top5Sites = Object.entries(sitePopulation).sort((a, b) => b[1] - a[1]).slice(0, 5);
  
  //  4. THE EXCEL EXPORT MAGIC WAND
  const exportToCSV = () => {
    if (filteredData.length === 0) { alert("Oops! 🥺 No data to export with these filters!"); return; }
    const headers = ['Date', 'Facility', 'Shift', 'Role', 'Employee Name', 'Phone', 'Location', 'Submitted By'];
    const csvRows = filteredData.map(row => {
      const safeLocation = row.location === 'Other' ? row.customLocation : row.location || 'N/A';
      return `"${row.date || ''}","${row.site || ''}","${row.shift || ''}","${(row.designation||'').split(' - ')[0]}","${row.name || ''}","${row.phone || ''}","${safeLocation}","${row.submittedBy || ''}"`;
    });
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CBG_Deployments_${siteTier}_${filterDate || 'All-Time'}.csv`;
    link.click();
  };

  //   OMNI-SEARCH LOGIC FOR CONTACTS
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
      
      {/*   MOBILE BACKDROP FOR SIDEBAR */}
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
            <span className="font-bold text-sm tracking-widest text-white flex items-center gap-2">TEST CBG COMMAND</span>
          </div>
          {/* Mobile Close Button */}
          <button className="md:hidden text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-2 flex-1 mt-2 relative">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Modules</p>
          
          {/* ✨ THE SLIDING MENU CONTAINER */}
          <div className="relative flex flex-col gap-2">
            
            {/* ✨ THE MAGICAL SLIDING BACKGROUND PILL */}
            <div 
              className="absolute left-0 w-full h-12 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-900/20 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 will-change-transform"
              style={{ 
                transform: `translateY(${
                  activeTab === 'deployments' ? '0px' : 
                  activeTab === 'contacts' ? '56px' : 
                  activeTab === 'incidents' ? '112px' : 
                  '168px'
                })` 
              }}
            ></div>

            {/* THE BUTTONS (With transparent backgrounds so the pill shows through!) */}
            <button onClick={() => { setActiveTab('deployments'); setIsMobileMenuOpen(false); }} className={`relative z-10 h-12 w-full flex items-center gap-3 px-4 rounded-xl text-sm font-bold transition-colors duration-300 ${activeTab === 'deployments' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <Activity size={18} /> Deployment Matrix
            </button>
            <button onClick={() => { setActiveTab('contacts'); setIsMobileMenuOpen(false); }} className={`relative z-10 h-12 w-full flex items-center gap-3 px-4 rounded-xl text-sm font-bold transition-colors duration-300 ${activeTab === 'contacts' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <BookOpen size={18} /> Directory
            </button>
            <button onClick={() => { setActiveTab('incidents'); setIsMobileMenuOpen(false); }} className={`relative z-10 h-12 w-full flex items-center gap-3 px-4 rounded-xl text-sm font-bold transition-colors duration-300 ${activeTab === 'incidents' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <AlertTriangle size={18} /> Incident Report
            </button>
            <button onClick={() => { setActiveTab('weekly'); setIsMobileMenuOpen(false); }} className={`relative z-10 h-12 w-full flex items-center gap-3 px-4 rounded-xl text-sm font-bold transition-colors duration-300 ${activeTab === 'weekly' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <Activity size={18} /> MIS Reports
            </button>
          </div>
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 transition-colors w-full">
          <div className="flex items-center gap-3">
            {/* Hamburger Button (Mobile Only) */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors">
              <Menu size={20} />
            </button>
            {/* ✨ SMART HEADER THAT KNOWS EVERY TAB! */}
          <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-none">
            {activeTab === 'deployments' && 'Deployment Command'}
            {activeTab === 'incidents' && 'Incident Report'}
            {activeTab === 'contacts' && 'Directory'}
            {activeTab === 'weekly' && 'MIS Report'}
          </h1>
            <span className="hidden sm:flex bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase items-center gap-1.5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Secure Cloud Vault
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="sm:hidden bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold px-2 py-1 rounded-full uppercase flex items-center shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></div> Live
            </span>

            {/* ✨ THE NEW GOD-MODE SOS PILL */}
            <div className="relative group cursor-pointer">
              <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-sm transition-all duration-300 ${totalTodaysIncidents > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'}`}>
                {totalTodaysIncidents > 0 ? (
                  <><AlertTriangle size={14} className="animate-pulse" /> <span className="hidden sm:inline">{totalTodaysIncidents} SOS Today</span><span className="sm:hidden">{totalTodaysIncidents}</span></>
                ) : (
                  <><CheckCircle size={14} /> <span className="hidden sm:inline">All Clear Today</span></>
                )}
              </div>

              {/* ✨ THE HOVER DROPDOWN MENU */}
              {totalTodaysIncidents > 0 && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform origin-top-right scale-95 group-hover:scale-100">
                  <div className="bg-rose-500 dark:bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 flex justify-between items-center">
                    <span>Live Incidents</span>
                    <span className="bg-white/20 px-1.5 py-0.5 rounded">{totalTodaysIncidents}</span>
                  </div>
                  <div className="p-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                    {Object.entries(siteIncidentCounts).map(([site, count]) => (
                      <div key={site} className="flex justify-between items-center text-xs p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
                        <span className="font-bold text-slate-700 dark:text-slate-300 truncate pr-3">{site}</span>
                        <span className="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 px-2 py-0.5 rounded text-[10px] font-black shrink-0">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ✨ NEW: SETTINGS GEAR BUTTON */}
            <button onClick={() => setShowSettings(true)} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-sm">
               <Settings size={18} />
            </button>
            <button onClick={toggleTheme} className="p-2 text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
               {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 custom-scrollbar">
          
          {/* 🛑 INTERCEPT: SHOW SETTINGS IF ACTIVE! */}
          {showSettings ? (
            <AdminSettingsView userProfile={userProfile} globalSites={globalSites} STATE_NAMES={STATE_NAMES} onAddSite={onAddSite} onToggleStatus={onToggleSite} onDeleteSite={onDeleteSite} onClose={() => setShowSettings(false)} />
          ) : (
            <div key={activeTab} className="animate-mac-fade h-full w-full">
          
          {/* ===================================== */}
          {/* TAB: DEPLOYMENT MATRIX VIEW (COMMAND CENTER) */}
          {/* ===================================== */}
          {activeTab === 'deployments' && (
            <>
              {/* ✨ DYNAMIC VIP SWITCH */}
              <div className="mb-6 flex justify-center sm:justify-start">
                <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner w-full sm:w-auto">
                  <button onClick={() => setSiteTier('All')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${siteTier === 'All' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                    Total {globalSites?.length || 0}
                  </button>
                  <button onClick={() => setSiteTier('Commissioned')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${siteTier === 'Commissioned' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'}`}>
                    Operational - {COMMISSIONED_SITES?.length || 0}
                  </button>
                  <button onClick={() => setSiteTier('Project')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${siteTier === 'Project' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
                    Projects - {(globalSites?.length || 0) - (COMMISSIONED_SITES?.length || 0)}
                  </button>
                </div>
              </div>

              {/*   RESPONSIVE KPI CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                   <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Users size={12}/> Total Manpower on Ground</p>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white">{totalBoots}</h3>
                </div>
                
                {/*   THE NEW AWOL PHANTOM ROSTER CARD (WITH SECRET HOVER DROP!) */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-visible group cursor-help z-20">
                   <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-xl transition-all ${awolSites.length === 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10 group-hover:bg-rose-500/20'}`}></div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                     <Monitor size={12} className={awolSites.length === 0 ? "text-emerald-500" : "text-rose-500"}/> Sites Reporting 
                   </p>
                   <h3 className={`text-3xl font-black ${awolSites.length === 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
                     {awolSites.length} <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Sites Missing</span>
                   </h3>
                   
                   {/*  THE MAGIC HOVER REVEAL MENU (NOW SHOWS BOTH!) */}
                   <div className="absolute top-full left-0 w-64 sm:w-72 mt-2 bg-slate-900 dark:bg-slate-950 border border-slate-700 shadow-2xl rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 max-h-56 overflow-y-auto custom-scrollbar translate-y-2 group-hover:translate-y-0 flex gap-4">
                     
                     
                     <div className="flex-1">
                       <p className="text-[9px] text-rose-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-700 pb-1 sticky top-0 bg-slate-900 dark:bg-slate-950 z-10">Missing ({awolSites.length})</p>
                       <ul className="space-y-1.5">
                         {awolSites.map(site => (
                           <li key={`awol-${site}`} className="text-[10px] font-medium text-slate-300 flex items-center gap-1.5 before:content-[''] before:w-1.5 before:h-1.5 before:bg-rose-500 before:rounded-full before:shadow-[0_0_5px_rgba(244,63,94,0.8)] truncate">{site}</li>
                         ))}
                         {awolSites.length === 0 && <li className="text-[9px] text-slate-500 italic">None! 🎉</li>}
                       </ul>
                     </div>

                     {/*  Present Column */}
                     <div className="flex-1 border-l border-slate-700/50 pl-4">
                       <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-700 pb-1 sticky top-0 bg-slate-900 dark:bg-slate-950 z-10">Active ({expectedSites.length - awolSites.length})</p>
                       <ul className="space-y-1.5">
                         {expectedSites.filter(s => !awolSites.includes(s)).map(site => (
                           <li key={`act-${site}`} className="text-[10px] font-medium text-slate-300 flex items-center gap-1.5 before:content-[''] before:w-1.5 before:h-1.5 before:bg-emerald-500 before:rounded-full before:shadow-[0_0_5px_rgba(16,185,129,0.8)] truncate">{site}</li>
                         ))}
                         {(expectedSites.length - awolSites.length) === 0 && <li className="text-[9px] text-slate-500 italic">None 🥺</li>}
                       </ul>
                     </div>

                   </div>
                </div>

                {/*   THE NEW MTCC ACTIVE NODES CARD (WITH SECRET HOVER!) */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-visible group cursor-help z-10">
                   <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Target size={12} className="text-amber-500"/> MTCC Active Sites</p>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white">{mtccActiveSitesCount} <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Sites Online</span></h3>
                   
                   {/* 🕵️‍♀️ THE MAGIC MTCC HOVER REVEAL */}
                   {mtccActiveSitesCount > 0 && (
                     <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 dark:bg-slate-950 border border-slate-700 shadow-2xl rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 max-h-48 overflow-y-auto custom-scrollbar translate-y-2 group-hover:translate-y-0">
                       <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-700 pb-1 flex justify-between"><span>Site</span><span>Guards</span></p>
                       <ul className="space-y-1.5">
                         {mtccHoverDetails.map((info, idx) => (
                           <li key={idx} className="text-xs font-medium text-slate-300 flex justify-between items-center hover:text-amber-300 transition-colors">
                             <span className="flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-amber-500 before:rounded-full">{info.site}</span>
                             <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 rounded">{info.count}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                   <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2"><TrendingUp size={12} className="text-blue-500"/> Cmd Ratio (SS:SG)</p>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white">{ssCount} <span className="text-sm text-slate-400">: {sgCount}</span></h3>
                </div>
              </div>

              {/* 📊 TIER 2: CINEMATIC GRAPHS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                {/*   THE PRO ENTERPRISE HISTOGRAM! */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center pb-12 relative overflow-hidden">
                   {/* Subtle tech grid background for that enterprise feel! */}
                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px]"></div>
                   
                   <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2 mb-8 relative z-10">
                     <BarChart2 size={16} className="text-blue-500"/> Zone Dominance Matrix
                   </h3>
                   
                   <div className="flex justify-around items-end h-48 border-b-2 border-slate-200 dark:border-slate-700 relative pt-4 z-10">
                     {locationData.map((loc, idx) => {
                       const heightPct = maxLocCount > 0 ? (loc.count / maxLocCount) * 100 : 0;
                       return (
                         <div key={idx} className="flex flex-col items-center justify-end h-full w-full group relative">
                           {/* Clean Number Tooltip */}
                           <span className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-black bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-3 py-1 rounded-md shadow-lg z-20 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                             {loc.count}
                           </span>
                           
                           {/* 📊 THE PRO HISTOGRAM BAR */}
                           <div className="w-8 sm:w-12 bg-slate-100 dark:bg-slate-800/50 rounded-t-md flex items-end h-full relative overflow-hidden">
                             {/* The Animated Fill */}
                             <div 
                               className={`w-full bg-gradient-to-t ${loc.color} rounded-t-md transition-all duration-[1200ms] ease-out shadow-[0_-2px_10px_rgba(0,0,0,0.1)]`} 
                               style={{ height: `${heightPct}%`, minHeight: '4px' }}
                             ></div>
                           </div>
                           
                           {/*   THE HORIZONTAL TEXT! */}
                           <span className="absolute -bottom-10 w-16 sm:w-20 text-center text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-[1.1] drop-shadow-sm flex flex-col items-center justify-start">
                             {loc.name}
                           </span>
                         </div>
                       );
                     })}
                   </div>
                </div>

                {/*   THE NEW 2x2 GOD-MODE METRICS GRID! */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
                  
                  {/* 1. Shift Balance (Miniature) */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center relative group">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Sun size={10} className="text-amber-500"/> Shift <Moon size={10} className="text-indigo-500 ml-auto"/>
                    </p>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex mb-2 shadow-inner">
                       <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${totalBoots ? (dayShiftCount / totalBoots) * 100 : 50}%` }}></div>
                       <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${totalBoots ? (nightShiftCount / totalBoots) * 100 : 50}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-black">
                      <span className="text-amber-500">{dayShiftCount}</span>
                      <span className="text-indigo-500">{nightShiftCount}</span>
                    </div>
                  </div>

                  {/* 2. Leave Liability */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center relative group">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={10} className="text-rose-500"/> Bench Count</p>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{leaveCount} <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Off-Duty</span></h3>
                  </div>

                  {/* 3. Top 5 Density Leaderboard */}
                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative group overflow-hidden">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Activity size={10} className="text-emerald-500"/> Top 5 Load</p>
                     <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                       {top5Sites.map(([site, count], idx) => (
                         <div key={idx} className="flex justify-between items-center text-[9px] font-bold">
                           <span className="text-slate-700 dark:text-slate-300 truncate max-w-[70px] uppercase">{site}</span>
                           <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">{count}</span>
                         </div>
                       ))}
                       {top5Sites.length === 0 && <span className="text-[9px] text-slate-500 italic">No data</span>}
                     </div>
                  </div>

                  {/*   THE COMPLIANCE RADAR CARD (4-in-1!) */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center relative group overflow-hidden">
                   <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-xl transition-all ${(fatigueRisk || topHeavySites || leadershipGap || fraudCount) > 0 ? 'bg-rose-500/10 group-hover:bg-rose-500/20' : 'bg-emerald-500/10'}`}></div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 relative z-10">
                     <Shield size={12} className={(fatigueRisk || topHeavySites || leadershipGap || fraudCount) > 0 ? "text-rose-500" : "text-emerald-500"}/> Risk & Compliance
                   </p>
                   <div className="space-y-1.5 w-full relative z-10">
                     <div className="flex justify-between items-center text-[10px] font-bold border-b border-slate-100 dark:border-slate-800/50 pb-1">
                       <span className="text-slate-600 dark:text-slate-400">Fatigue (24h)</span>
                       <span className={`px-1.5 py-0.5 rounded shadow-sm ${fatigueRisk > 0 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>{fatigueRisk}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-bold border-b border-slate-100 dark:border-slate-800/50 pb-1">
                       <span className="text-slate-600 dark:text-slate-400">Top-Heavy (SS≥SG)</span>
                       <span className={`px-1.5 py-0.5 rounded shadow-sm ${topHeavySites > 0 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>{topHeavySites}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-bold border-b border-slate-100 dark:border-slate-800/50 pb-1">
                       <span className="text-slate-600 dark:text-slate-400">L-Gap (No SS)</span>
                       <span className={`px-1.5 py-0.5 rounded shadow-sm ${leadershipGap > 0 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>{leadershipGap}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-bold">
                       <span className="text-slate-600 dark:text-slate-400">Fraud (Dupes)</span>
                       <span className={`px-1.5 py-0.5 rounded shadow-sm ${fraudCount > 0 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>{fraudCount}</span>
                     </div>
                   </div>
                </div>

                </div>
              </div>

              {/* 🎛️ TIER 3: DATA TABLE & FILTERS */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col mt-6">
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px] sm:min-w-[250px] relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search Guard Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  
                  {/* ✨ FIXED: The Filters now use the live data! */}
                  <FilterSelect label="Date" value={filterDate} onChange={setFilterDate} type="date" />
                  <FilterSelect label="State" value={filterState} onChange={(e) => { setFilterState(e); setFilterSite("All"); }} options={STATE_NAMES} />
                  <FilterSelect label="Site" value={filterSite} onChange={setFilterSite} options={[...availableSites].sort()} />
                  <FilterSelect label="Shift" value={filterShift} onChange={setFilterShift} options={["Day Shift", "Night Shift", "Weekly Off"]} />
                  <FilterSelect label="Role" value={filterDesignation} onChange={setFilterDesignation} options={["SS", "SG"]} />
                  <FilterSelect label="Loc" value={filterLocation} onChange={setFilterLocation} options={LOCATIONS} />
                  
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 ml-auto">
                    <button onClick={exportToCSV} className="text-xs font-black tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 transform hover:-translate-y-0.5">
                      <Download size={14} /> EXPORT
                    </button>
                    <button onClick={() => { setFilterState("All"); setFilterSite("All"); setFilterDate(getISTDate()); setFilterShift("All"); setFilterDesignation("All"); setFilterLocation("All"); setSearchTerm(""); }} className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-4 py-2.5 rounded-xl transition-colors hover:bg-slate-300 dark:hover:bg-slate-700">
                      CLEAR
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
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
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</th>
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
                          
                          const isMTCC = row.location === 'MTCC';

                          return (
                            <tr key={idx} onClick={() => onView(row)} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group cursor-pointer">
                              <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{row.date || "N/A"}</td>
                              <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{row.site || "N/A"}</span></td>
                              <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeClass}`}>{shiftType || "N/A"}</span></td>
                              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-semibold">{(row.designation || "N/A").split(' - ')[0]}</td>
                              <td className="px-6 py-4"><div className="text-sm font-bold uppercase text-slate-900 dark:text-white">{row.name || "Unknown"}</div><div className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">{formatPhone(row.phone)}</div></td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold ${isMTCC ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                                  {row.location === 'Other' ? row.customLocation : row.location}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div className="flex justify-center gap-2">
                                  <button onClick={(e) => { e.stopPropagation(); onEdit(row); }} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800"><Edit2 size={14} /></button>
                                  <button onClick={(e) => { e.stopPropagation(); onDelete(row); }} className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800"><Trash2 size={14} /></button>
                                </div>
                              </td>                    
                            </tr>
                          );
                        })}
                        {filteredData.length === 0 && <tr><td colSpan="7" className="px-6 py-16 text-center text-slate-500 font-semibold italic">No records found for these filters.</td></tr>}
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
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={onAddContact} className="flex-1 md:flex-none py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 transition-all shrink-0">
                  <Plus size={16} /> ADD CONTACT
                </button>
                {/* Secret invisible file input that triggers when you click the label! */}
                <input type="file" accept=".csv" id="csv-upload" className="hidden" onChange={(e) => { onImportCSV(e.target.files[0]); e.target.value = null; }} />
                <label htmlFor="csv-upload" className="flex-1 md:flex-none py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all cursor-pointer">
                  <Download size={16} className="rotate-180" /> IMPORT CSV
                </label>
                
                </div>

              </div>

              {/* Contacts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredContacts.map(contact => (
                <div key={contact.id} onClick={() => onViewContact(contact)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer">                    
                    {/* Actions Menu (Edit/Delete) -   ADDED stopPropagation! */}
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
        {activeTab === 'incidents' && <AdminIncidentView incidents={incidents} isLoading={isLoading} onAcknowledge={onToggleAck} onDelete={onDeleteIncident} SITES={SITES} STATE_NAMES={STATE_NAMES} SITES_BY_STATE={SITES_BY_STATE} />}
        {activeTab === 'weekly' && <AdminWeeklyView weeklyReports={weeklyReports} isLoading={isLoading} COMMISSIONED_SITES={COMMISSIONED_SITES} SITES={SITES} STATE_NAMES={STATE_NAMES} SITES_BY_STATE={SITES_BY_STATE} onDeleteWeekly={onDeleteWeekly} />}
            </div>
          )}
        </div>
        
      </main>
    </div>
  );
}

// ==========================================
// ✏️ GLOBAL EDIT MODAL
// ==========================================
// ==========================================
// ✏️ FAANG-STYLE DEPLOYMENT EDIT MODAL
// ==========================================
function EditModal({ record, onClose, onSave }) {
  // Check if they had a custom location saved so we can populate the dropdown perfectly!
  const isCustomLoc = record.location && !LOCATIONS.includes(record.location);
  
  const [fd, setFd] = useState({
    ...record,
    locationMode: isCustomLoc ? 'Other' : (record.location || LOCATIONS[0]),
    customLocation: isCustomLoc ? record.location : ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalLoc = fd.locationMode === 'Other' ? fd.customLocation : fd.locationMode;
    const { locationMode, customLocation, ...dataToSave } = fd;
    dataToSave.location = finalLoc;
    dataToSave.name = (dataToSave.name || '').toUpperCase();
    onSave(dataToSave);
  };

  // 🦋 META-STYLE DESIGN TOKENS
  const inputClass = "w-full bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-medium";
  const labelClass = "block text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/90 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
        
        {/* Sleek Header */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#0f172a] shrink-0">
          <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-xl uppercase tracking-tight">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center"><Edit2 size={18} /></div>
            Modify Record
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 p-2.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><X size={18} /></button>
        </div>

        {/* 🧠 Connecting the form to the button with an ID! */}
        <form id="edit-deployment-form" onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          
          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            
            <div>
              <label className={labelClass}>Deployment Date</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                <input type="date" required value={fd.date || ''} onChange={(e) => setFd({...fd, date: e.target.value})} className={`${inputClass} pl-12 cursor-pointer [color-scheme:light] dark:[color-scheme:dark]`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Shift</label>
                <select value={fd.shift || ''} onChange={(e) => setFd({...fd, shift: e.target.value})} className={`${inputClass} cursor-pointer`}>
                  <option value="Day Shift">☀️ Day Shift</option>
                  <option value="Night Shift">🌙 Night Shift</option>
                  <option value="Weekly Off">🏖️ Weekly Off</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Designation</label>
                <select value={fd.designation || ''} onChange={(e) => setFd({...fd, designation: e.target.value})} className={`${inputClass} cursor-pointer`}>
                  {DESIGNATIONS.map(d => <option key={d} value={d}>{d.split(' - ')[0]}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" required placeholder="Full Name..." value={fd.name || ''} onChange={(e) => setFd({...fd, name: e.target.value})} className={`${inputClass} pl-12 uppercase`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone No.</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" required pattern="[0-9]{10}" placeholder="10 Digits" maxLength="10" value={fd.phone || ''} onChange={(e) => setFd({...fd, phone: e.target.value.replace(/\D/g, '')})} className={`${inputClass} pl-11 font-mono`} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <select value={fd.locationMode || ''} onChange={(e) => setFd({...fd, locationMode: e.target.value})} className={`${inputClass} cursor-pointer`}>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {fd.locationMode === 'Other' && (
              <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5 ml-1">Specify Location</label>
                <input type="text" required placeholder="e.g. Server Room A" value={fd.customLocation || ''} onChange={(e) => setFd({...fd, customLocation: e.target.value})} className={`${inputClass} border-blue-300 dark:border-blue-500/50 bg-blue-50/30 dark:bg-blue-900/10`} />
              </div>
            )}
            
          </div>
        </form>

        <div className="p-6 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 flex gap-3 shrink-0 rounded-b-[2.5rem]">
          <button type="button" onClick={onClose} className="w-1/3 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Abort</button>
          
          {/* ✨ MAGIC: form="edit-deployment-form" perfectly syncs it! */}
          <button type="submit" form="edit-deployment-form" className="flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-blue-600 text-white flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
            <Save size={16} /> Update Record
          </button>
        </div>
        
      </div>
    </div>
  );
}
function FilterSelect({ label, value, onChange, options, type = "select" }) {
  return (
    //   Notice the "w-full sm:w-auto" right here! That's the mobile magic!
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

// ==========================================
// 🛡️ DIGITAL SECURITY BADGE (DEPLOYMENT VIEW)
// ==========================================
function ViewModal({ record, onClose }) {
  const safeShift = record.shift || "";
  const isNight = safeShift.includes('Night');
  const isOff = safeShift.includes('Off');
  
  // Dynamic Theme based on Shift!
  const themeColor = isOff ? 'slate' : isNight ? 'indigo' : 'amber';
  const ShiftIcon = isOff ? Calendar : isNight ? Moon : Sun;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/90 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-sm overflow-hidden relative animate-in zoom-in-[0.98] duration-300 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
        
        {/* ✨ The Glowing ID Header */}
        <div className={`h-32 bg-gradient-to-br ${isOff ? 'from-slate-400 to-slate-600' : isNight ? 'from-indigo-500 to-purple-700' : 'from-amber-400 to-orange-500'} relative overflow-hidden flex items-start justify-between p-5`}>
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
          
          <span className="relative z-10 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm border border-white/20 flex items-center gap-1.5">
            <ShiftIcon size={12} /> {safeShift}
          </span>
          <button onClick={onClose} className="relative z-10 w-8 h-8 flex items-center justify-center text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition-all active:scale-95"><X size={16} /></button>
        </div>
        
        <div className="px-6 pb-8 relative">
          {/* ✨ Floating Avatar */}
          <div className="absolute -top-12 left-6">
            <div className={`w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border-4 border-white dark:border-[#0f172a] flex items-center justify-center text-3xl font-black text-${themeColor}-500 transform rotate-3`}>
              {(record.name || "?")[0]}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white dark:border-[#0f172a] rounded-full flex items-center justify-center shadow-sm`}>
              <CheckCircle size={12} className="text-white" />
            </div>
          </div>

          <div className="pt-12 mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{record.name}</h2>
            <p className={`text-xs font-bold text-${themeColor}-500 dark:text-${themeColor}-400 uppercase tracking-widest`}>{record.designation}</p>
          </div>

          {/* ✨ Apple Wallet Style Data Pills */}
          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex items-center gap-4 group hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0"><MapPin size={18}/></div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Assigned Post</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">{record.location} <span className="text-slate-400 font-medium text-xs ml-1">({record.site})</span></span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex items-center justify-between group hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0"><Phone size={18}/></div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Commlink</span>
                  <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{formatPhone(record.phone)}</span>
                </div>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(record.phone); alert('Copied!'); }} className="p-2 text-slate-400 hover:text-emerald-500 bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"><Copy size={14}/></button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex items-center gap-4 group hover:border-amber-200 dark:hover:border-amber-500/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0"><Calendar size={18}/></div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Logged Date</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{record.date}</span>
              </div>
            </div>
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
        {/*   DYNAMIC HEADER! */}
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
// 🧊 PREMIUM FROSTED-GLASS CONTACT FORM
// ==========================================
function ContactFormModal({ record, onClose, onSave, SITES = [], SITES_BY_STATE = {}, STATE_NAMES = [] }) {
  const isCustomInitial = record.designation && !CONTACT_ROLES.includes(record.designation);

  const [formData, setFormData] = useState({
    ...record,
    designationMode: isCustomInitial ? 'Other' : (record.designation || CONTACT_ROLES[0]),
    customDesignation: isCustomInitial ? record.designation : ''
  });

  const [selectedStates, setSelectedStates] = useState(record.state_name ? record.state_name.split(', ').filter(Boolean) : []);
  const [selectedSites, setSelectedSites] = useState(record.site ? record.site.split(', ').filter(Boolean) : []);

  const availableSites = selectedStates.length > 0 
    ? selectedStates.reduce((acc, st) => acc.concat(SITES_BY_STATE[st] || []), [])
    : SITES;

  const handleAddState = (e) => {
    const val = e.target.value;
    if (val && !selectedStates.includes(val)) setSelectedStates([...selectedStates, val]);
  };

  const handleAddSite = (e) => {
    const val = e.target.value;
    if (val && !selectedSites.includes(val)) setSelectedSites([...selectedSites, val]);
  };

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    const finalDesignation = formData.designationMode === 'Other' ? formData.customDesignation : formData.designationMode;
    const { designationMode, customDesignation, ...dataToSave } = formData;
    
    dataToSave.designation = finalDesignation.toUpperCase(); 
    dataToSave.state_name = selectedStates.join(', ');
    dataToSave.site = selectedSites.join(', ');
    
    onSave(dataToSave); 
  };
  
  // 💎 HIGH-CONTRAST DESIGN TOKENS (This makes the boxes POP!)
  const inputClass = "w-full bg-white dark:bg-[#0B1120] border-2 border-slate-300 dark:border-slate-600 rounded-2xl py-3.5 px-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder:text-slate-400";
  const labelClass = "block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2 ml-1 drop-shadow-sm";

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      
      {/* ✨ The Floating Glass Container */}
      <div className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_80px_-15px_rgba(79,70,229,0.3)] w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-white/60 dark:border-indigo-500/20 relative animate-in zoom-in-[0.98] duration-300" onClick={e => e.stopPropagation()}>
        
        {/* 🔮 Ambient Background Glows */}
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute top-1/2 -right-32 w-72 h-72 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Sleek Translucent Header */}
        <div className="px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center relative z-10">
          <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-xl uppercase tracking-tight drop-shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center backdrop-blur-md border border-indigo-500/20 shadow-sm"><BookOpen size={18} /></div>
            {record.id ? 'Modify Contact' : 'New Contact'}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors bg-white/50 dark:bg-black/40 backdrop-blur-md p-2.5 rounded-full hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-white/50 dark:border-slate-700/50 active:scale-95"><X size={18} /></button>
        </div>

        <form id="contact-form" onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 relative z-10">
          
          {/* Glass Card 1: Core Data */}
          <div className="bg-white/60 dark:bg-black/40 backdrop-blur-lg p-6 rounded-[2rem] border border-white/50 dark:border-slate-700/50 shadow-sm space-y-5 relative overflow-hidden">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} className={`${inputClass} uppercase`} placeholder="e.g. KRISHNA KUMAR" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone No.</label>
                <div className="relative group">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                  <input type="tel" required pattern="[0-9]{10}" maxLength="10" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className={`${inputClass} pl-11 font-mono tracking-wider`} placeholder="10 Digits" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Designation</label>
                <select required value={formData.designationMode} onChange={(e) => setFormData({...formData, designationMode: e.target.value})} className={`${inputClass} cursor-pointer`}>
                  {CONTACT_ROLES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {formData.designationMode === 'Other' && (
              <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                <label className="block text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5 ml-1">Custom Designation</label>
                <input type="text" required placeholder="e.g. Regional Head" value={formData.customDesignation} onChange={(e) => setFormData({...formData, customDesignation: e.target.value})} className={`${inputClass} !bg-indigo-50/50 dark:!bg-indigo-500/10 !border-indigo-300 dark:!border-indigo-500/50 focus:!ring-indigo-500/30`} />
              </div>
            )}
          </div>

          {/* Glass Card 2: Jurisdiction Tags */}
          <div className="bg-white/60 dark:bg-black/40 backdrop-blur-lg p-6 rounded-[2rem] border border-white/50 dark:border-slate-700/50 shadow-sm relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <h4 className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10"><MapPin size={14} className="text-emerald-500"/> Regional Command Assignments</h4>
            
            <div className="space-y-5 mb-6 relative z-10">
              {/* STATE TAGS */}
              <div>
                <label className={labelClass}>Assigned States</label>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[30px]">
                  {selectedStates.map(st => (
                    <span key={st} className="px-3 py-1.5 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/50 backdrop-blur-sm rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-in zoom-in-95 shadow-sm">
                      {st} <X size={12} className="cursor-pointer hover:text-indigo-900 dark:hover:text-white transition-colors" onClick={() => setSelectedStates(selectedStates.filter(s => s !== st))} />
                    </span>
                  ))}
                </div>
                <select value="" onChange={handleAddState} className={`${inputClass} cursor-pointer text-indigo-600 dark:text-indigo-400`}>
                  <option value="">+ Assign to State...</option>
                  {STATE_NAMES.filter(s => !selectedStates.includes(s)).map(s => <option key={s} value={s} className="text-slate-900 dark:text-slate-200">{s}</option>)}
                </select>
              </div>

              {/* SITE TAGS */}
              <div>
                <label className={labelClass}>Assigned Sites</label>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[30px]">
                  {selectedSites.map(site => (
                    <span key={site} className="px-3 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/50 backdrop-blur-sm rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-in zoom-in-95 shadow-sm">
                      {site} <X size={12} className="cursor-pointer hover:text-emerald-900 dark:hover:text-white transition-colors" onClick={() => setSelectedSites(selectedSites.filter(s => s !== site))} />
                    </span>
                  ))}
                </div>
                <select value="" onChange={handleAddSite} className={`${inputClass} cursor-pointer text-emerald-600 dark:text-emerald-400`}>
                  <option value="">+ Assign to Node...</option>
                  {availableSites.filter(s => !selectedSites.includes(s)).map(s => <option key={s} value={s} className="text-slate-900 dark:text-slate-200">{s}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-5 border-t border-slate-200/50 dark:border-slate-700/50 pt-5 relative z-10">
              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                  <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`${inputClass} pl-11`} placeholder="operative@company.com" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Organization</label>
                <div className="relative group">
                  <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                  <input type="text" value={formData.company || ''} onChange={(e) => setFormData({...formData, company: e.target.value})} className={`${inputClass} pl-11`} placeholder="e.g. RBG Security" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Notes</label>
                <textarea value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} className={`${inputClass} min-h-[100px] resize-y py-4`} placeholder="Add strategic details here..."></textarea>
              </div>
            </div>
          </div>
        </form>

        {/* 🕹️ Translucent Footer */}
        <div className="p-6 bg-white/40 dark:bg-black/40 backdrop-blur-xl border-t border-white/50 dark:border-slate-700/50 flex gap-3 shrink-0 rounded-b-[2.5rem] relative z-10">
          <button type="button" onClick={onClose} className="w-1/3 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm transition-all active:scale-95">Abort</button>
          
          <button type="submit" form="contact-form" className="flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-indigo-600 text-white flex items-center justify-center gap-2 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all overflow-hidden relative group border border-indigo-500/50">
            <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
            <Save size={16} className="relative z-10" /> <span className="relative z-10">Save Contact</span>
          </button>
        </div>
        
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
// 🕶️ CYBER-DOSSIER (COOL CONTACT VIEW)
// ==========================================
function ContactViewModal({ record, onClose }) {
  const safeName = record.name || "Unknown";
  
  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_80px_-15px_rgba(79,70,229,0.4)] w-full max-w-md max-h-[90vh] overflow-hidden relative animate-in zoom-in-[0.95] duration-500 border border-white/50 dark:border-indigo-500/30 flex flex-col group" onClick={e => e.stopPropagation()}>
        
        {/* ✨ Cyber-Glowing Orbs Background */}
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-600/30 transition-all duration-700"></div>
        <div className="absolute top-1/4 -right-32 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all active:scale-90 z-50"><X size={18} /></button>

        {/* 🛸 Holographic Header */}
        <div className="pt-12 pb-6 px-8 flex flex-col items-center relative z-10 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="relative mb-6">
            {/* Radar Rings */}
            <div className="absolute inset-0 border border-indigo-500/30 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute -inset-4 border border-indigo-500/10 rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
            
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-[0_0_40px_rgba(99,102,241,0.4)] border-4 border-white/80 dark:border-[#0B1120] flex items-center justify-center text-5xl font-black text-white relative z-10 transform hover:scale-105 transition-transform duration-500">
              {safeName[0]}
            </div>
            {record.company && (
               <div className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 dark:bg-slate-800 rounded-full border-2 border-white dark:border-[#0B1120] flex items-center justify-center shadow-lg z-20">
                 <Briefcase size={14} className="text-cyan-400" />
               </div>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2 drop-shadow-md">{safeName}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-200/50 dark:border-indigo-500/30">
              {record.designation}
            </div>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 relative z-10 space-y-5">
          
          {/* ✨ Quick Actions (Cyber Style) */}
          <div className="flex gap-3 mb-2">
            <button onClick={() => { navigator.clipboard.writeText(record.phone); alert('Secure Commlink Copied!'); }} className="flex-1 py-3 bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/50 dark:border-slate-700/50 flex flex-col items-center justify-center gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all group active:scale-95 shadow-sm">
              <Phone size={18} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mt-1">Copy Number</span>
            </button>
            {record.email && (
              <button onClick={() => { navigator.clipboard.writeText(record.email); alert('Encrypted Email Copied!'); }} className="flex-1 py-3 bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/50 dark:border-slate-700/50 flex flex-col items-center justify-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all group active:scale-95 shadow-sm">
                <Mail size={18} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-blue-600 dark:group-hover:text-blue-400 mt-1">Copy Mail</span>
              </button>
            )}
          </div>

          {/* Data Blocks */}
          <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/50 dark:border-slate-700/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
            <div>
              <span className="text-[10px] font-black text-indigo-900/50 dark:text-indigo-300/50 uppercase tracking-widest block mb-1">Phone No.</span>
              <span className="text-2xl font-mono font-black text-slate-800 dark:text-slate-200 tracking-wider">{formatPhone(record.phone)}</span>
            </div>
            {record.email && (
              <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
                <span className="text-[10px] font-black text-indigo-900/50 dark:text-indigo-300/50 uppercase tracking-widest block mb-1"> Mail ID</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-300 truncate block">{record.email}</span>
              </div>
            )}
            {record.company && (
              <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
                <span className="text-[10px] font-black text-indigo-900/50 dark:text-indigo-300/50 uppercase tracking-widest block mb-1 flex items-center gap-1"><Briefcase size={12}/> Organization</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-300 uppercase">{record.company}</span>
              </div>
            )}
          </div>

          {/* Jurisdiction Card */}
          {(record.state_name || record.site) && (
            <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/50 dark:border-slate-700/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] space-y-4 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
              <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5 relative z-10"><MapPin size={14} className="text-emerald-500"/> Regional Jurisdiction</h4>
              
              {record.state_name && (
                <div className="relative z-10">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block mb-2">Assigned State</span>
                  <div className="flex flex-wrap gap-2">
                    {record.state_name.split(',').map(s => <span key={s} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">{s.trim()}</span>)}
                  </div>
                </div>
              )}
              
              {record.site && (
                <div className={`relative z-10 ${record.state_name ? "border-t border-slate-200/50 dark:border-slate-700/50 pt-4 mt-2" : ""}`}>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block mb-2">Assigned Site(s)</span>
                  <div className="flex flex-wrap gap-2">
                    {record.site.split(',').map(s => <span key={s} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>{s.trim()}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes Card */}
          {record.notes && (
            <div className="bg-amber-50/50 dark:bg-amber-500/5 backdrop-blur-md p-5 rounded-[1.5rem] border border-amber-200/50 dark:border-amber-500/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl"></div>
              <span className="text-[11px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mb-2 relative z-10">
                <BookOpen size={14} /> Note
              </span>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap relative z-10">
                {record.notes}
              </p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🚨 INCIDENT REPORTING MODULE (PREMIUM iOS STYLE)
// ==========================================

function IncidentMobileForm({ userProfile, fetchIncidents, setActiveTab }) {
  const [formData, setFormData] = useState({
    incidentName: '', timeOfIncident: '', reportedBy: '', epNumber: '', pincode: '', incidentLocation: '', details: '', findings: '', actionsTaken: '', recommendations: '', photos: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    const base64Photos = await Promise.all(files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
    }));
    setFormData({ ...formData, photos: [...formData.photos, ...base64Photos] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newIncident = {
      site: userProfile.site,
      incident_name: formData.incidentName,
      time_of_incident: formData.timeOfIncident.replace('T', ' '),
      time_of_reporting: new Date().toLocaleString('en-IN'),
      reported_by: formData.reportedBy,
      ep_number: formData.epNumber,
      pincode: formData.pincode,
      incident_location: formData.incidentLocation,
      details: formData.details,
      findings: formData.findings,
      actions_taken: formData.actionsTaken,
      recommendations: formData.recommendations,
      photos: formData.photos,
      status: 'Pending'
    };

    const { error } = await supabase.from('incidents').insert([newIncident]);
    setIsSubmitting(false);
    if (error) alert(`Error: ${error.message}`);
    else {
      alert("🚨 Official Incident Logged to Command Center!");
      fetchIncidents();
      setActiveTab('history'); // Switched to match your Apple segmented control!
    }
  };

  // 🌹 SOS-THEMED PREMIUM DESIGN TOKENS
  const inputClass = "w-full bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500 dark:focus:border-rose-400 focus:ring-4 focus:ring-rose-500/20 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-medium";
  const labelClass = "block text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      
      {/* ✨ Gorgeous Gradient Header Card */}
      <div className="bg-gradient-to-br from-rose-500 to-red-600 p-6 rounded-3xl shadow-lg shadow-rose-500/30 text-white relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        <h2 className="font-black uppercase tracking-widest text-lg flex items-center gap-2 relative z-10"><AlertTriangle size={22}/> Incident Report</h2>
        <p className="text-xs font-bold text-rose-100 mt-1 relative z-10">Direct uplink to Command Center.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
        
        {/* ✨ Highlighted Crisis Field */}
        <div>
          <label className={labelClass}>Incident Type / Name</label>
          <input type="text" required placeholder="e.g. Theft, Fire, Breach..." value={formData.incidentName} onChange={(e) => setFormData({...formData, incidentName: e.target.value})} className={`${inputClass} !border-rose-200 dark:!border-rose-500/30 focus:!border-rose-500 !bg-rose-50/50 dark:!bg-rose-500/5 text-rose-700 dark:text-rose-400 uppercase placeholder-rose-300 dark:placeholder-rose-800`} />
        </div>

        <div>
          <label className={labelClass}>Occurrence Date & Time</label>
          <input type="datetime-local" required value={formData.timeOfIncident} onChange={(e) => setFormData({...formData, timeOfIncident: e.target.value})} className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Reported By</label><input type="text" required placeholder="Officer Name" value={formData.reportedBy} onChange={(e) => setFormData({...formData, reportedBy: e.target.value})} className={`${inputClass} uppercase`} /></div>
          <div><label className={labelClass}>EP Number</label><input type="text" required placeholder="ID Number" value={formData.epNumber} onChange={(e) => setFormData({...formData, epNumber: e.target.value})} className={`${inputClass} uppercase`} /></div>
        </div>

        <div className="grid grid-cols-3 gap-4 items-end">
          <div className="col-span-2">
            <label className={labelClass}>Site Name</label>
            <div className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl py-3.5 px-4 text-sm font-black text-slate-500 uppercase">{userProfile.site}</div>
          </div>
          <div><label className={labelClass}>Pincode</label><input type="text" required placeholder="Code" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className={`${inputClass} uppercase`} /></div>
        </div>

        <div><label className={labelClass}>Location of Incident</label><input type="text" required placeholder="Specific spot on site..." value={formData.incidentLocation} onChange={(e) => setFormData({...formData, incidentLocation: e.target.value})} className={inputClass} /></div>

        {/* ✨ Bouncy, Deep Textareas */}
        <div><label className={labelClass}>Details of Incident</label><textarea required placeholder="What exactly happened? Provide full context." value={formData.details} onChange={(e) => setFormData({...formData, details: e.target.value})} className={`${inputClass} min-h-[100px] resize-y py-4`} /></div>
        
        <div><label className={labelClass}>Findings</label><textarea required placeholder="Investigative findings..." value={formData.findings} onChange={(e) => setFormData({...formData, findings: e.target.value})} className={`${inputClass} min-h-[80px] resize-y py-4`} /></div>
        
        <div><label className={labelClass}>Action Taken</label><textarea required placeholder="Immediate response deployed..." value={formData.actionsTaken} onChange={(e) => setFormData({...formData, actionsTaken: e.target.value})} className={`${inputClass} min-h-[80px] resize-y py-4`} /></div>
        
        <div><label className={labelClass}>Follow-up & Recommendations</label><textarea required placeholder="Suggested protocols to prevent recurrence..." value={formData.recommendations} onChange={(e) => setFormData({...formData, recommendations: e.target.value})} className={`${inputClass} min-h-[80px] resize-y py-4`} /></div>

        {/* ✨ Modern Apple-Style Photo Upload */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className={labelClass}>Photographic Evidence</label>
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {formData.photos.map((p, i) => <img key={i} src={p} className="h-20 w-20 object-cover rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm shrink-0" alt="Incident" />)}
            <label className="h-20 w-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shrink-0 active:scale-95">
              <Camera size={24} className="mb-1" /> <span className="text-[9px] font-black uppercase tracking-widest">Attach</span>
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </div>

      </div>

      {/* ✨ The Satisfying Submit Button */}
      <button type="submit" disabled={isSubmitting} className="w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-600/25 transition-all flex justify-center items-center gap-2 bg-rose-600 text-white hover:bg-rose-700 active:scale-95">
        {isSubmitting ? 'ENCRYPTING UPLINK...' : <><AlertTriangle size={20} /> SUBMIT REPORT</>}
      </button>
    </form>
  );
}

function IncidentMobileHistory({ incidents, isLoading }) {
  const [viewDate, setViewDate] = useState(getISTDate());
  const [viewingInc, setViewingInc] = useState(null);

  const filtered = viewDate ? incidents.filter(i => (i.created_at || '').startsWith(viewDate)) : incidents;

  const copyToWhatsApp = (e, inc) => {
    e.stopPropagation();
    let msg = `🚨 *${(inc.incident_name || 'INCIDENT REPORT').toUpperCase()}* 🚨\n\n` +
      `🕒 *Occurrence Date & Time:* ${inc.time_of_incident}\n` +
      `⏱️ *Reporting Date & Time:* ${inc.time_of_reporting}\n` +
      `👤 *Reported by:* ${inc.reported_by} (EP: ${inc.ep_number || 'N/A'})\n` +
      `🏢 *Site Name & Pincode:* ${inc.site} - ${inc.pincode || 'N/A'}\n` +
      `📍 *Location of incident:* ${inc.incident_location}\n\n` +
      `📝 *Details of incident:*\n${inc.details}\n\n` +
      `🔍 *Findings:*\n${inc.findings || 'N/A'}\n\n` +
      `⚡ *Action Taken:*\n${inc.actions_taken}\n\n` +
      `💡 *Follow-up Actions & Recommendations:*\n${inc.recommendations}`;
    
    navigator.clipboard.writeText(msg).then(() => alert("Copied format for WhatsApp! 🟢"));
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      
      {/* Search Header */}
      <div className="bg-white dark:bg-[#0f172a] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center mb-2">
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Date Filter</span>
        <div className="flex gap-2 items-center">
          {viewDate && <button onClick={() => setViewDate('')} className="text-[10px] font-black tracking-widest text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-500/20 transition-all active:scale-95">CLEAR</button>}
          <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold outline-none [color-scheme:light] dark:[color-scheme:dark]" />
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        {filtered.map(inc => (
          <div key={inc.id} onClick={() => setViewingInc(inc)} className="bg-white dark:bg-[#0f172a] p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-slate-100 dark:border-slate-800 relative cursor-pointer active:scale-[0.98] transition-transform overflow-hidden group">
            
            <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
            
            <div className="absolute top-4 right-4">
               {inc.status === 'Acknowledged' && <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm"><CheckCircle size={10}/> Admin Seen</span>}
            </div>

            <div className="pl-3">
              <h4 className="font-black text-rose-600 dark:text-rose-400 uppercase text-base mb-1.5 pr-24 leading-tight">{inc.incident_name || 'Incident'}</h4>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-4 flex items-center gap-1.5"><MapPin size={12} className="text-rose-400"/> {inc.incident_location}</p>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mb-5 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">{inc.details}</div>
              
              <button onClick={(e) => copyToWhatsApp(e, inc)} className="w-full py-3.5 rounded-xl text-[11px] font-black tracking-widest uppercase bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800/50 flex justify-center items-center gap-2 hover:bg-green-100 transition-colors shadow-sm">
                 <Copy size={16} /> WA COPY
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-slate-500 text-sm mt-10 font-bold italic">No incidents found for this date.</p>}
      </div>

      {/* ✨ THE UPGRADED SUPERVISOR iOS MODAL */}
      {viewingInc && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/90 backdrop-blur-sm z-[150] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200" onClick={() => setViewingInc(null)}>
          <div className="bg-white dark:bg-[#0f172a] w-full sm:max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            
            <div className="h-1.5 w-12 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden shrink-0"></div>
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start shrink-0 bg-white dark:bg-[#0f172a]">
               <div className="pr-4">
                 <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm ${viewingInc.status === 'Acknowledged' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800'}`}>
                   {viewingInc.status === 'Acknowledged' ? '✅ Admin Acknowledged' : '🚨 Pending Review'}
                 </span>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4 uppercase tracking-tight leading-none">{viewingInc.incident_name || 'Incident Report'}</h2>
               </div>
               <button onClick={() => setViewingInc(null)} className="p-2.5 text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X size={18} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 bg-slate-50/50 dark:bg-slate-900/20">
               
               {/* 🚨 THE NEW TIME MATRIX */}
               <div className="grid grid-cols-2 gap-3">
                 <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-2xl border-2 border-rose-100 dark:border-rose-500/20 shadow-sm relative overflow-hidden">
                   <Clock className="absolute -right-2 -bottom-2 text-rose-200 dark:text-rose-500/20 w-16 h-16" />
                   <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-1.5 relative z-10">Time Occurred</span>
                   <span className="text-sm font-black text-rose-700 dark:text-rose-400 leading-tight relative z-10">{viewingInc.time_of_incident}</span>
                 </div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                   <Activity className="absolute -right-2 -bottom-2 text-slate-100 dark:text-slate-700 w-16 h-16" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 relative z-10">Time Reported</span>
                   <span className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight relative z-10">{viewingInc.time_of_reporting}</span>
                 </div>
               </div>

               {/* Meta Data Box */}
               <div className="grid grid-cols-2 gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
                 <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reported By</span><span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{viewingInc.reported_by}</span></div>
                 <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">EP Number</span><span className="font-mono font-bold text-indigo-500">{viewingInc.ep_number}</span></div>
                 <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-1"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Location</span><span className="font-bold text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500"/> {viewingInc.incident_location}</span></div>
               </div>

               {/* The Long Text Boxes */}
               <div className="space-y-4">
                 <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><strong className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><FileText size={14}/> Details</strong><p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{viewingInc.details}</p></div>
                 <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><strong className="text-[10px] font-black text-purple-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Search size={14}/> Findings</strong><p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{viewingInc.findings}</p></div>
                 <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><strong className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Activity size={14}/> Action Taken</strong><p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{viewingInc.actions_taken}</p></div>
                 <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><strong className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Shield size={14}/> Recommendations</strong><p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{viewingInc.recommendations}</p></div>
               </div>
               
               {/* Photos */}
               {(viewingInc.photos && viewingInc.photos.length > 0) && (
                 <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                   <strong className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3"><ImageIcon size={14}/> Evidence Attached</strong>
                   <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                     {viewingInc.photos.map((p, i) => (
                       <img key={i} src={p} alt="evidence" className="h-28 w-28 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0" />
                     ))}
                   </div>
                 </div>
               )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] shrink-0 rounded-b-[2.5rem]">
               <button onClick={(e) => { copyToWhatsApp(e, viewingInc); setViewingInc(null); }} className="w-full py-4 rounded-2xl text-xs font-black bg-green-500 text-white flex justify-center items-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-500/30 uppercase tracking-widest active:scale-95">
                 <Copy size={18} /> Copy Full Report
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminIncidentView({ incidents, isLoading, onAcknowledge, onDelete, SITES = [], STATE_NAMES = [], SITES_BY_STATE = {} }) {
  const [filterDate, setFilterDate] = useState(getISTDate());
  const [filterState, setFilterState] = useState("All");
  const [filterSite, setFilterSite] = useState("All");
  const [searchTerm, setSearchTerm] = useState(""); 
  const [viewingInc, setViewingInc] = useState(null);

  const availableSites = filterState === "All" ? SITES : SITES_BY_STATE[filterState] || [];
  
  const filtered = incidents.filter(i => {
    const dMatch = filterDate === '' || (i.created_at || '').startsWith(filterDate);
    const safeSiteName = (i.site || "").toUpperCase();
    const stMatch = filterState === "All" || (SITES_BY_STATE[filterState] && SITES_BY_STATE[filterState].includes(safeSiteName));
    const siMatch = filterSite === "All" || safeSiteName === filterSite;
    
    const q = searchTerm.toLowerCase();
    const searchMatch = searchTerm === "" || 
      (i.incident_name || "").toLowerCase().includes(q) ||
      (i.incident_location || "").toLowerCase().includes(q) ||
      (i.reported_by || "").toLowerCase().includes(q) ||
      (i.details || "").toLowerCase().includes(q);

    return dMatch && stMatch && siMatch && searchMatch;
  });

  const downloadPhoto = (e, url, idx) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = url;
    a.download = `Incident_${viewingInc.site}_Photo_${idx+1}.jpg`;
    a.click();
  };

  const downloadReport = (inc) => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Incident Report</title></head><body style='font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;'>";
    const footer = "</body></html>";
    
    const content = `
      <p style="font-weight: bold; margin-bottom: 5px;">Occurrence Date & Time: <span style="font-weight: normal;">${inc.time_of_incident}</span></p>
      <p style="font-weight: bold; margin-bottom: 5px;">Reporting Date & Time: <span style="font-weight: normal;">${inc.time_of_reporting}</span></p>
      <p style="font-weight: bold; margin-bottom: 5px;">Reported by: <span style="font-weight: normal;">${inc.reported_by} (EP: ${inc.ep_number || 'N/A'})</span></p>
      <p style="font-weight: bold; margin-bottom: 5px;">Site Name & Pincode: <span style="font-weight: normal;">${inc.site} - ${inc.pincode || ''}</span></p>
      <p style="font-weight: bold; margin-bottom: 20px;">Location of incident: <span style="font-weight: normal;">${inc.incident_location}</span></p>
      
      <p style="font-weight: bold; margin-bottom: 5px;">Details of incident:</p>
      <p style="white-space: pre-wrap; margin-bottom: 20px;">${inc.details}</p>
      
      <p style="font-weight: bold; margin-bottom: 5px;">Findings:</p>
      <p style="white-space: pre-wrap; margin-bottom: 20px;">${inc.findings || 'N/A'}</p>
      
      <p style="font-weight: bold; margin-bottom: 5px;">Action Taken:</p>
      <p style="white-space: pre-wrap; margin-bottom: 20px;">${inc.actions_taken}</p>
      
      <p style="font-weight: bold; margin-bottom: 5px;">Follow-up Actions & Recommendations:</p>
      <p style="white-space: pre-wrap; margin-bottom: 30px;">${inc.recommendations}</p>
      
      <p style="font-weight: bold;">Photo and Report attached for reference: <span style="font-weight: normal;">${(inc.photos && inc.photos.length > 0) ? 'Yes' : 'No'}</span></p>
    `;

    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Incident_Report_${inc.site.replace(/\s+/g, '_')}_${inc.time_of_incident.split(' ')[0]}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-5 sm:p-6 flex flex-wrap gap-4 items-end">
        
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search Incidents (Name, Location, Reporter)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all" />
        </div>

        <FilterSelect label="Date" value={filterDate} onChange={setFilterDate} type="date" />
        <FilterSelect label="State" value={filterState} onChange={e => {setFilterState(e); setFilterSite("All");}} options={STATE_NAMES} />
        <FilterSelect label="Site" value={filterSite} onChange={setFilterSite} options={[...availableSites].sort()} />
        
        <button onClick={() => { setFilterDate(''); setFilterState('All'); setFilterSite('All'); setSearchTerm(''); }} className="text-[11px] font-black tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">CLEAR</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(inc => (
          <div key={inc.id} onClick={() => setViewingInc(inc)} className="bg-white dark:bg-[#0f172a] rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1 transition-all group relative">
            
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 to-red-600"></div>
            
            <div className="absolute top-5 right-5 z-10">
              {inc.status === 'Acknowledged' ? 
                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5"><CheckCircle size={12}/> Acknowledged</span> 
                : 
                <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5"><AlertTriangle size={12}/> Pending</span>
              }
            </div>

            <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30">
               <span className="text-[11px] font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">{inc.site}</span>
               
               <h3 className="font-black text-rose-600 dark:text-rose-400 mt-4 uppercase text-lg leading-tight pr-24">{inc.incident_name || inc.incident_location}</h3>
               
               <div className="mt-3 flex flex-col gap-1.5">
                 <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><MapPin size={12}/> {inc.incident_location}</p>
                 <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1.5"><Clock size={12}/> {inc.time_of_incident}</p>
               </div>
            </div>
            <div className="p-6 flex-1 text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
               {inc.details}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-24 text-center text-slate-500 font-bold flex flex-col items-center"><CheckCircle size={56} className="text-slate-300 dark:text-slate-700 mb-5"/> No incidents reported! All clear! 🟢</div>}
      </div>

      {/* ✨ GOD-MODE ADMIN INCIDENT MODAL ✨ */}
      {viewingInc && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/90 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setViewingInc(null)}>
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
             
             {/* Sleek Header */}
             <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-white dark:bg-[#0f172a] shrink-0">
               <div>
                 <span className="text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm">{viewingInc.site} - {viewingInc.pincode}</span>
                 <h2 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-4 uppercase tracking-tight">{viewingInc.incident_name || 'Incident Report'}</h2>
               </div>
               <button onClick={() => setViewingInc(null)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all"><X size={18} /></button>
             </div>
             
             <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-6 flex-1 bg-slate-50/50 dark:bg-slate-900/20">
               
               {/* 🚨 THE ADMIN TIME MATRIX */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-rose-50 dark:bg-rose-500/10 p-5 rounded-[2rem] border-2 border-rose-100 dark:border-rose-500/20 shadow-sm relative overflow-hidden">
                   <Clock className="absolute -right-2 -bottom-2 text-rose-200 dark:text-rose-500/20 w-24 h-24" />
                   <span className="text-[11px] font-black text-rose-500 uppercase tracking-widest block mb-2 relative z-10">Time Occurred</span>
                   <span className="text-base font-black text-rose-700 dark:text-rose-400 leading-tight relative z-10">{viewingInc.time_of_incident}</span>
                 </div>
                 <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                   <Activity className="absolute -right-2 -bottom-2 text-slate-100 dark:text-slate-700 w-24 h-24" />
                   <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2 relative z-10">Time Reported</span>
                   <span className="text-base font-black text-slate-800 dark:text-slate-200 leading-tight relative z-10">{viewingInc.time_of_reporting}</span>
                 </div>
               </div>

               {/* Meta Info */}
               <div className="flex flex-wrap gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                 <div className="flex-1 min-w-[150px]"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reported By</span><span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">{viewingInc.reported_by} <span className="text-indigo-500 font-mono ml-1">(EP: {viewingInc.ep_number})</span></span></div>
                 <div className="flex-1 min-w-[150px]"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Exact Location</span><span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500"/> {viewingInc.incident_location}</span></div>
               </div>

               {/* Large Content Blocks */}
               <div className="space-y-4">
                 <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"><strong className="text-[11px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 mb-3"><FileText size={16}/> Details of incident</strong><p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{viewingInc.details}</p></div>
                 <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-purple-500"><strong className="text-[11px] font-black text-purple-500 uppercase tracking-widest flex items-center gap-2 mb-3"><Search size={16}/> Findings</strong><p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{viewingInc.findings}</p></div>
                 <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-indigo-500"><strong className="text-[11px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 mb-3"><Activity size={16}/> Action Taken</strong><p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{viewingInc.actions_taken}</p></div>
                 <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-500"><strong className="text-[11px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-3"><Shield size={16}/> Recommendations</strong><p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{viewingInc.recommendations}</p></div>
               </div>
               
               {/* Admin Photo Grid */}
               {(viewingInc.photos && viewingInc.photos.length > 0) && (
                 <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                   <strong className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4"><ImageIcon size={16}/> Photographic Evidence</strong>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                     {viewingInc.photos.map((p, i) => (
                       <div key={i} className="relative group rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 aspect-square shadow-sm">
                         <img src={p} alt="evidence" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                         <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                           <button onClick={(e) => downloadPhoto(e, p, i)} className="bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xl hover:scale-105 transition-transform"><Download size={14}/> Save</button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>

             {/* Admin Bottom Controls */}
             <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-wrap justify-between gap-4 shrink-0 rounded-b-[2.5rem]">
               <button onClick={() => { onDelete(viewingInc.id); setViewingInc(null); }} className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-all shadow-sm border border-red-200 dark:border-red-800 uppercase tracking-widest w-full sm:w-auto active:scale-95">
                 <Trash2 size={16}/> Delete
               </button>
               
               <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                 <button onClick={() => downloadReport(viewingInc)} className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition-all shadow-sm border border-indigo-200 dark:border-indigo-800 uppercase tracking-widest active:scale-95">
                   <Download size={18} /> Get .DOC
                 </button>
                 <button onClick={() => { onAcknowledge(viewingInc); setViewingInc({...viewingInc, status: viewingInc.status === 'Acknowledged' ? 'Pending' : 'Acknowledged'}); }} className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${viewingInc.status === 'Acknowledged' ? 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30'}`}>
                   <Shield size={18}/> {viewingInc.status === 'Acknowledged' ? 'Mark Pending' : 'Acknowledge SOS'}
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 📋 WEEKLY LEDGER REPORT MODULE (EXACT PAPER COPY)
// ==========================================

function WeeklyMobileForm({ userProfile, fetchWeeklyReports, setActiveTab }) {
  const [fd, setFd] = useState({
    dateFrom: '', dateTo: '', srNo: '',
    dispSolid: '', dispGas: '', dispScrap: '',
    recCompany: '', recContractor: '',
    ogpNRGP: '', ogpRmgp: '', ogpRmgpIn: '',
    vehContractor: '', vehCompany: '',
    footContractor: '', footRil: '', footVisitor: '', footGov: '',
    depDaySS: '', depDaySG: '', depNightSS: '', depNightSG: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newReport = {
      site: userProfile.site,
      date_from: fd.dateFrom, date_to: fd.dateTo, sr_no: fd.srNo,
      disp_solid: fd.dispSolid, disp_gas: fd.dispGas, disp_scrap: fd.dispScrap,
      rec_company: fd.recCompany, rec_contractor: fd.recContractor,
      ogp_nrgp: fd.ogpNRGP, ogp_rmgp: fd.ogpRmgp, ogp_rmgp_in: fd.ogpRmgpIn,
      veh_contractor: fd.vehContractor, veh_company: fd.vehCompany,
      foot_contractor: fd.footContractor, foot_ril: fd.footRil, foot_visitor: fd.footVisitor, foot_gov: fd.footGov,
      dep_day_ss: fd.depDaySS, dep_day_sg: fd.depDaySG, dep_night_ss: fd.depNightSS, dep_night_sg: fd.depNightSG
    };

    const { error } = await supabase.from('weekly_reports').insert([newReport]);
    setIsSubmitting(false);
    if (error) alert(`Error: ${error.message}`);
    else {
      alert("✅ Official MIS Report synced to Command Center!");
      fetchWeeklyReports();
      setActiveTab('history');
    }
  };

  // ✨ THE FIX: Changing this to a regular helper function so React stops unmounting it!
  const renderInput = (valKey) => (
    <td className="border border-slate-300 dark:border-slate-700 p-0">
      <input type="number" required value={fd[valKey]} onChange={(e) => setFd({...fd, [valKey]: e.target.value})} className="w-14 sm:w-20 bg-transparent text-center py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:bg-emerald-50 dark:focus:bg-emerald-900/30 transition-colors" />
    </td>
  );

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      <div className="bg-emerald-50 dark:bg-emerald-500/10 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
        <h3 className="font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest text-xs mb-3 flex items-center gap-2"><Calendar size={16}/> Select MIS Report Dates</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[9px] font-black text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mb-1">Date From</label><input type="date" required value={fd.dateFrom} onChange={(e) => setFd({...fd, dateFrom: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-lg py-2.5 px-3 text-sm font-bold outline-none text-emerald-800 dark:text-emerald-200 [color-scheme:light] dark:[color-scheme:dark]" /></div>
          <div><label className="block text-[9px] font-black text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mb-1">Date To</label><input type="date" required value={fd.dateTo} onChange={(e) => setFd({...fd, dateTo: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-lg py-2.5 px-3 text-sm font-bold outline-none text-emerald-800 dark:text-emerald-200 [color-scheme:light] dark:[color-scheme:dark]" /></div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"><h4 className="font-black text-slate-700 dark:text-slate-300 text-xs uppercase tracking-widest flex items-center gap-2"><FileText size={16}/> Official Register</h4></div>
        
        <div className="overflow-x-auto custom-scrollbar p-2">
          <table className="w-max border-collapse border border-slate-300 dark:border-slate-700 text-center text-[10px] font-black uppercase tracking-widest">
            <thead>
              <tr className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 min-w-[60px]">Sr. No.</th>
                <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 min-w-[120px]">SITE</th>
                <th colSpan="3" className="border border-slate-300 dark:border-slate-700 p-2 bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400">DISPATCH</th>
                <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 bg-indigo-100/50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400">RECEIPT</th>
                <th colSpan="3" className="border border-slate-300 dark:border-slate-700 p-2 bg-amber-100/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400">OGP</th>
                <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 bg-blue-100/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">VEHICLE</th>
                <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 bg-purple-100/50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">CONTRACTOR/ RIL STAFF</th>
                <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 text-rose-600 dark:text-rose-400">VISITOR</th>
                <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 text-rose-600 dark:text-rose-400">GOV.<br/>OFFICIAL</th>
                <th colSpan="4" className="border border-slate-300 dark:border-slate-700 p-2 bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white">DEPLOYMENT</th>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                <th className="border border-slate-300 dark:border-slate-700 p-2">SOLID</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2">GAS</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2">SCRAP</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2">COMPANY</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2">CONTRACTOR</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2">NRGP</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2">RMGP</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2">RMGP IN</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2 leading-tight px-1">CONTRACTOR<br/>VEHICLE</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2 leading-tight px-1">COMPANY/<br/>EMP. VEHICLE</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2 leading-tight px-1">CONTRACTOR<br/>WORKER</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2 leading-tight px-1">RIL<br/>EMPLOYE</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2">Day SS</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2">Day SG</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2">Night SS</th>
                <th className="border border-slate-300 dark:border-slate-700 p-2">Night SG</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <td className="border border-slate-300 dark:border-slate-700 p-0"><input type="text" required value={fd.srNo} onChange={(e) => setFd({...fd, srNo: e.target.value})} className="w-16 sm:w-20 bg-transparent text-center py-3 text-sm font-bold outline-none" /></td>
                <td className="border border-slate-300 dark:border-slate-700 p-3 text-xs font-black text-slate-400">{userProfile.site}</td>
                {/* ✨ AND HERE IS THE FIX IMPLEMENTED! */}
                {renderInput('dispSolid')}{renderInput('dispGas')}{renderInput('dispScrap')}
                {renderInput('recCompany')}{renderInput('recContractor')}
                {renderInput('ogpNRGP')}{renderInput('ogpRmgp')}{renderInput('ogpRmgpIn')}
                {renderInput('vehContractor')}{renderInput('vehCompany')}
                {renderInput('footContractor')}{renderInput('footRil')}
                {renderInput('footVisitor')}{renderInput('footGov')}
                {renderInput('depDaySS')}{renderInput('depDaySG')}
                {renderInput('depNightSS')}{renderInput('depNightSG')}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-xl font-black text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 flex justify-center items-center gap-2 uppercase tracking-widest mt-6">
        {isSubmitting ? 'SYNCING...' : <><BookOpen size={18} /> SUBMIT Report</>}
      </button>
    </form>
  );
}
function WeeklyMobileHistory({ weeklyReports, isLoading, onEditWeekly }) {
  const [viewingRep, setViewingRep] = useState(null); // ✨ NEW: The Modal Brain!

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading ledgers...</div>;
  
  return (
    <div className="p-4 space-y-4 pb-24">
      {weeklyReports.map(rep => (
        <div key={rep.id} onClick={() => setViewingRep(rep)} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border-l-4 border-emerald-500 border-y border-r border-y-slate-200 border-r-slate-200 dark:border-y-slate-800 dark:border-r-slate-800 relative cursor-pointer active:scale-95 transition-transform group">
          <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest px-2 py-1 rounded">Sr. {rep.sr_no}</div>
          <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm mb-1">{rep.site}</h4>
          <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-4"><Calendar size={10} className="inline mr-1"/>{rep.date_from} TO {rep.date_to}</p>
          
          <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-center border-t border-slate-100 dark:border-slate-800 pt-3 mb-3">
            <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded"><span className="text-slate-400 block mb-1">Dispatch</span><span className="text-slate-700 dark:text-slate-300">{(parseInt(rep.disp_solid||0) + parseInt(rep.disp_gas||0) + parseInt(rep.disp_scrap||0))} Total</span></div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded"><span className="text-slate-400 block mb-1">Receipt</span><span className="text-slate-700 dark:text-slate-300">{(parseInt(rep.rec_company||0) + parseInt(rep.rec_contractor||0))} Total</span></div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded"><span className="text-slate-400 block mb-1">Footfall</span><span className="text-slate-700 dark:text-slate-300">{(parseInt(rep.foot_contractor||0) + parseInt(rep.foot_ril||0) + parseInt(rep.foot_visitor||0) + parseInt(rep.foot_gov||0))} Total</span></div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {/* ✨ THE NEW EDIT BUTTON */}
            <button onClick={(e) => { e.stopPropagation(); onEditWeekly(rep); }} className="w-full py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 flex justify-center items-center gap-1.5 hover:bg-indigo-100 transition-colors shadow-sm border border-indigo-100 dark:border-indigo-800/50">
               <Edit2 size={14}/> Edit / Resend
            </button>
            <button onClick={() => setViewingRep(rep)} className="w-full py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 flex justify-center items-center gap-1.5 hover:bg-emerald-100 transition-colors shadow-sm border border-emerald-100 dark:border-emerald-800/50">
               <Eye size={14}/> View Report
            </button>
          </div>
        </div>
      ))}
      {weeklyReports.length === 0 && <p className="text-center text-slate-500 text-sm mt-10 font-medium">No weekly ledgers found.</p>}

      {/* ✨ THE MAGICAL MOBILE MODAL FOR SUPERVISORS */}
      {viewingRep && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200" onClick={() => setViewingRep(null)}>
          {/* ✨ Notice: Made it max-w-5xl so the table has room to breathe on tablets! */}
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-5xl h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="h-1.5 w-12 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden shrink-0"></div>
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-950/50 shrink-0">
               <div>
                 <span className="text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">Sr No. {viewingRep.sr_no}</span>
                 <h2 className="text-lg font-black text-slate-900 dark:text-white mt-3 uppercase leading-tight">{viewingRep.site}</h2>
                 <p className="text-[10px] font-bold text-slate-500 mt-1">Logged: {viewingRep.date_from} to {viewingRep.date_to}</p>
               </div>
               <button onClick={() => setViewingRep(null)} className="p-2 text-slate-400 hover:text-emerald-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm"><X size={16} /></button>
            </div>
            
            {/* 📋 THE GLORIOUS HORIZONTAL SCROLL TABLE! */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
               <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm custom-scrollbar pb-2">
                 <table className="w-max min-w-full border-collapse text-center text-[10px] font-black uppercase tracking-widest">
                   <thead>
                     <tr className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                       <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-3 min-w-[60px]">Sr. No.</th>
                       <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-3 min-w-[100px]">SITE</th>
                       <th colSpan="3" className="border border-slate-300 dark:border-slate-700 p-3 bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400">DISPATCH</th>
                       <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-3 bg-indigo-100/50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400">RECEIPT</th>
                       <th colSpan="3" className="border border-slate-300 dark:border-slate-700 p-3 bg-amber-100/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400">OGP</th>
                       <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-3 bg-blue-100/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">VEHICLE</th>
                       <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-3 bg-purple-100/50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">CON/RIL STAFF</th>
                       <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-3 text-rose-600 dark:text-rose-400">VISITOR</th>
                       <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-3 text-rose-600 dark:text-rose-400">GOV.<br/>OFF.</th>
                       <th colSpan="4" className="border border-slate-300 dark:border-slate-700 p-3 bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white">DEPLOYMENT</th>
                     </tr>
                     <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                       <th className="border border-slate-300 dark:border-slate-700 p-2">SOLID</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">GAS</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">SCRAP</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">COMPANY</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">CONTRACTOR</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">NRGP</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">RMGP</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">RMGP IN</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2 px-1">CON.<br/>VEH</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2 px-1">CO.<br/>VEH</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2 px-1">CON.<br/>WORKER</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2 px-1">RIL<br/>EMP.</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">Day SS</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">Day SG</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">Night SS</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">Night SG</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr className="text-slate-900 dark:text-white bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                       <td className="border border-slate-300 dark:border-slate-700 p-3">{viewingRep.sr_no}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3 text-emerald-600 dark:text-emerald-400">{viewingRep.site}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3">{viewingRep.disp_solid || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3">{viewingRep.disp_gas || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3 text-rose-500">{viewingRep.disp_scrap || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3">{viewingRep.rec_company || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3">{viewingRep.rec_contractor || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3">{viewingRep.ogp_nrgp || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3 text-amber-500">{viewingRep.ogp_rmgp || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3 text-emerald-500">{viewingRep.ogp_rmgp_in || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3">{viewingRep.veh_contractor || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3">{viewingRep.veh_company || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3">{viewingRep.foot_contractor || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3">{viewingRep.foot_ril || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3 text-purple-500">{viewingRep.foot_visitor || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3 text-purple-500">{viewingRep.foot_gov || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3">{viewingRep.dep_day_ss || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3">{viewingRep.dep_day_sg || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3">{viewingRep.dep_night_ss || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-3">{viewingRep.dep_night_sg || 0}</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 📈 VIP OPERATIONS & THREAT MATRIX (CSO DASHBOARD)
// ==========================================

// ==========================================
// 📈 VIP OPERATIONS & THREAT MATRIX (CSO DASHBOARD)
// ==========================================

function AdminWeeklyView({ weeklyReports, isLoading, COMMISSIONED_SITES = [], SITES = [], STATE_NAMES = [], SITES_BY_STATE = {} ,onDeleteWeekly }) {
  const [filterDate, setFilterDate] = useState('');
  const [filterState, setFilterState] = useState("All"); // ✨ NEW: State Filter!
  const [filterSite, setFilterSite] = useState("All");
  const [viewingRep, setViewingRep] = useState(null);

  // ✨ FIXED: Cascading Site List so it never shows garbage states again!
  const availableSites = filterState === "All" ? SITES : SITES_BY_STATE[filterState] || [];

  // 1. FILTER ENGINE (STRICT POSTING DATE & NEW STATE LOGIC)
  const filtered = weeklyReports.filter(r => {
    const dMatch = filterDate === '' || (r.created_at && r.created_at.startsWith(filterDate));
    
    // ✨ SAFETY NET: Force old database logs to UPPERCASE!
    const safeSiteName = (r.site || "").toUpperCase();

    const stMatch = filterState === "All" || (SITES_BY_STATE[filterState] && SITES_BY_STATE[filterState].includes(safeSiteName));
    const sMatch = filterSite === "All" || safeSiteName === filterSite;
    return dMatch && stMatch && sMatch;
  });

  // 2. MATH HELPERS
  const num = (v) => parseInt(v) || 0;

  // ✨ THE FIX: We added "1" to Math.max so it never divides by zero and breaks the CSS!
  const maxOgp = Math.max(1, ...filtered.map(r => Math.max(num(r.ogp_rmgp), num(r.ogp_rmgp_in))));
  const maxTraffic = Math.max(1, ...filtered.map(r => Math.max(num(r.foot_contractor), num(r.veh_contractor))));
  const maxDispatch = Math.max(1, ...filtered.map(r => num(r.disp_solid) + num(r.disp_gas) + num(r.disp_scrap)));

  let totalDispatch = 0;

  // 🧠 3. CSO METRIC CALCULATORS (The Ultimate 5-in-4 Matrix!)
  let tSolid = 0, tGas = 0, tScrap = 0;
  let recCo = 0, recCon = 0;
  let nrgp = 0, rmgpOut = 0, rmgpIn = 0;
  let vehCon = 0, vehCo = 0;
  let footCon = 0, footRil = 0;
  
  let tGov = 0;
  const govVisitsList = [];
  
  // ✨ NEW: Strict Deficit Tracker! (No hiding behind other sites!)
  let totalStrictDeficit = 0;

  // This uses "filtered", so it perfectly obeys your site dropdown!
  filtered.forEach(r => {
    // 1. DISPATCH
    tSolid += num(r.disp_solid);
    tGas += num(r.disp_gas);
    tScrap += num(r.disp_scrap);

    // 2. RECEIPT
    recCo += num(r.rec_company);
    recCon += num(r.rec_contractor);

    // 3. OGP
    nrgp += num(r.ogp_nrgp);
    const rOut = num(r.ogp_rmgp);
    const rIn = num(r.ogp_rmgp_in);
    rmgpOut += rOut;
    rmgpIn += rIn;
    
    // ✨ ADD TO STRICT DEFICIT ONLY IF IT'S A LOSS!
    if (rOut > rIn) {
      totalStrictDeficit += (rOut - rIn);
    }

    // 4. VEHICLES
    vehCon += num(r.veh_contractor);
    vehCo += num(r.veh_company);

    // 5. STAFF / WORKERS
    footCon += num(r.foot_contractor);
    footRil += num(r.foot_ril);

    // GOV VISITS
    const govCount = num(r.foot_gov);
    tGov += govCount;
    if (govCount > 0) {
      const existing = govVisitsList.find(x => x.site === r.site);
      if (existing) existing.count += govCount;
      else govVisitsList.push({ site: r.site, count: govCount });
    }
  });

  // Use the STRICT deficit so the alarm triggers perfectly!
  const assetDeficit = totalStrictDeficit;
  const grandTotalDispatch = tSolid + tGas + tScrap;
  const isAssetAlert = assetDeficit > 0;

  // 📋 COMPLIANCE LOGIC (Stays Global, ignores the filter!)
  const commissionedSites = typeof COMMISSIONED_SITES !== 'undefined' ? COMMISSIONED_SITES : uniqueSites;
  const submittedSitesList = [...new Set(weeklyReports.map(r => r.site))]; // Uses ALL reports
  const pendingSitesList = commissionedSites.filter(s => !submittedSitesList.includes(s));
  const complianceRate = Math.round((submittedSitesList.length / commissionedSites.length) * 100) || 0;

  // 4. THE MASTER EXCEL EXPORTER! 🟢
  const exportMasterAudit = () => {
    const row1 = ["Sr_No", "SITE", "Date_From", "Date_To", "DISPATCH", "", "", "RECEIPT", "", "OGP", "", "", "VEHICLE", "", "CONTRACTOR/ RIL STAFF", "", "VISITOR", "GOV. OFFICIAL", "DEPLOYMENT", "", "", ""];
    const row2 = ["", "", "", "", "SOLID", "GAS", "SCRAP", "COMPANY", "CONTRACTOR", "NRGP", "RMGP", "RMGP IN", "CONTRACTOR VEHICLE", "COMPANY/ EMP. VEHICLE", "CONTRACTOR WORKER", "RIL EMPLOYE", "", "", "Day SS", "Day SG", "Night SS", "Night SG"];
    
    const csvRows = [row1.join(','), row2.join(',')];
    
    filtered.forEach(r => {
      csvRows.push([r.sr_no, r.site, r.date_from, r.date_to, r.disp_solid, r.disp_gas, r.disp_scrap, r.rec_company, r.rec_contractor, r.ogp_nrgp, r.ogp_rmgp, r.ogp_rmgp_in, r.veh_contractor, r.veh_company, r.foot_contractor, r.foot_ril, r.foot_visitor, r.foot_gov, r.dep_day_ss, r.dep_day_sg, r.dep_night_ss, r.dep_night_sg].map(v => `"${v || 0}"`).join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CSO_Master_Audit_${getISTDate()}.csv`;
    a.click();
  };
// ✨ NEW: THE ANOMALY DETECTOR (Week-over-Week Spikes!)
  const anomalies = [];
  // We use all reports (unfiltered) to find anomalies across the whole network
  const allSites = [...new Set(weeklyReports.map(r => r.site))];

  allSites.forEach(site => {
    // Sort reports for this site by newest first
    const siteReps = weeklyReports.filter(r => r.site === site).sort((a, b) => num(b.sr_no) - num(a.sr_no));
    
    if (siteReps.length >= 2) {
      const curr = siteReps[0]; // This Week
      const prev = siteReps[1]; // Last Week

      const checkSpike = (key, label) => {
        const diff = num(curr[key]) - num(prev[key]);
        if (diff >= 50) anomalies.push({ site, label, prev: num(prev[key]), curr: num(curr[key]), diff });
      };

      // Check for drastic jumps!
      checkSpike('disp_scrap', 'Scrap');
      checkSpike('disp_gas', 'Gas/Slurry');
      checkSpike('rec_company', 'Receipts (Co)');
      checkSpike('rec_contractor', 'Receipts (Con)');
    }
  });
  // Sort biggest spikes to the top
  anomalies.sort((a, b) => b.diff - a.diff);

  return (
    <div className="space-y-6">
      
      {/* 🟢 ZONE 1: COMMAND BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 flex flex-wrap justify-between items-end gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <div className="flex flex-wrap gap-3 relative z-10">
          <FilterSelect label="Filter Date" value={filterDate} onChange={setFilterDate} type="date" />
          {/* ✨ FIXED: Proper State and Site cascading dropdowns! */}
          <FilterSelect label="State" value={filterState} onChange={e => {setFilterState(e); setFilterSite("All");}} options={STATE_NAMES} />
          <FilterSelect label="VIP Site" value={filterSite} onChange={setFilterSite} options={[...availableSites].sort()} />
          <button onClick={() => { setFilterDate(''); setFilterState('All'); setFilterSite('All'); }} className="text-[10px] font-black tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors h-max mb-0.5">CLEAR</button>
        </div>
        <button onClick={exportMasterAudit} className="relative z-10 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95">
          <Download size={16} /> Export Master Audit
        </button>
      </div>

      {/* 🚨 ZONE 2: SECURITY KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border-t-4 shadow-sm transition-all ${isAssetAlert ? 'border-rose-500 dark:shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-indigo-500 border-slate-200 dark:border-slate-800'}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Leakage</h3>
            <Shield size={16} className={isAssetAlert ? 'text-rose-500' : 'text-indigo-500'}/>
          </div>
          <div className={`text-2xl font-black ${isAssetAlert ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{assetDeficit > 0 ? `-${assetDeficit}` : 'SECURE'}</div>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">RMGP Deficit</p>
        </div>

        {/* CHART 2: GOVT OFFICIALS VISIT 🏛️ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative group">
           <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Govt Officials Visit</h3>
               <p className="text-[9px] font-bold text-amber-500 uppercase mt-1">
                 {filterSite === "All" ? "Global Network" : `Site: ${filterSite}`}
               </p>
             </div>
             <AlertTriangle size={16} className={tGov > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}/>
           </div>

           <div className="flex items-end gap-3">
             <div className="text-3xl font-black text-slate-900 dark:text-white">{tGov}</div>
             <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${tGov > 0 ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
               {tGov > 0 ? 'Alert' : 'Clear'}
             </div>
           </div>

           {/* ✨ MAGICAL HOVER TOOLTIP FOR GOVT VISITS */}
           {govVisitsList.length > 0 && (
             <div className="absolute top-[80%] left-0 mt-2 w-full bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black p-4 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-2xl border border-slate-700 flex flex-col gap-2 transform translate-y-2 group-hover:translate-y-0">
               <span className="text-amber-400 dark:text-amber-600 border-b border-slate-600 dark:border-slate-300 pb-1.5 mb-1 uppercase tracking-widest">Visit Logs</span>
               {govVisitsList.map((v, i) => (
                 <div key={i} className="flex justify-between items-center">
                   <span className="uppercase">{v.site}</span>
                   <span className="text-amber-400 dark:text-amber-600">{v.count} Officials</span>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* CHART 3: COMPLIANCE ROLLCALL 📋 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative group">
           <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compliance Status</h3>
               <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1">Submission Rollcall</p>
             </div>
             <CheckCircle size={16} className="text-indigo-500"/>
           </div>

           <div>
             <div className="flex justify-between items-end mb-2">
               <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{complianceRate}%</span>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 {submittedSitesList.length} / {commissionedSites.length}
               </span>
             </div>
             <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-slate-700">
               <div style={{width: `${complianceRate}%`}} className={`h-full transition-all duration-1000 ${complianceRate === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
             </div>
           </div>

           {/* ✨ MASSIVE HOVER TOOLTIP FOR COMPLIANCE */}
           <div className="absolute top-[80%] right-0 mt-2 w-72 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 p-4 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-2xl border border-slate-700 flex flex-col gap-4 transform translate-y-2 group-hover:translate-y-0">
             
             <div className="flex flex-col gap-1.5">
               <span className="text-[10px] font-black text-emerald-400 dark:text-emerald-600 border-b border-slate-600 dark:border-slate-300 pb-1.5 uppercase tracking-widest">Submitted ({submittedSitesList.length})</span>
               <div className="flex flex-wrap gap-1 mt-1">
                 {submittedSitesList.length === 0 ? <span className="text-[9px] text-slate-400">None</span> : submittedSitesList.map(s => <span key={s} className="text-[8.5px] font-bold uppercase tracking-wider bg-slate-700 dark:bg-slate-200 px-2 py-1 rounded">{s}</span>)}
               </div>
             </div>

             <div className="flex flex-col gap-1.5">
               <span className="text-[10px] font-black text-rose-400 dark:text-rose-600 border-b border-slate-600 dark:border-slate-300 pb-1.5 uppercase tracking-widest">Pending ({pendingSitesList.length})</span>
               <div className="flex flex-wrap gap-1 mt-1">
                 {pendingSitesList.length === 0 ? <span className="text-[9px] text-slate-400">All Clear!</span> : pendingSitesList.map(s => <span key={s} className="text-[8.5px] font-bold uppercase tracking-wider bg-slate-700 dark:bg-slate-200 px-2 py-1 rounded">{s}</span>)}
               </div>
             </div>
            </div>
            </div>
          {/* KPI 4: SURGE ANOMALIES (Fills the empty space!) 🚨 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative group cursor-help">
           <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Surge Anomalies</h3>
               <p className="text-[9px] font-bold text-rose-500 uppercase mt-1">Wk/Wk Spikes &gt; 50</p>
             </div>
             <TrendingUp size={16} className={anomalies.length > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}/>
           </div>

           <div className="flex items-end gap-3">
             <div className="text-3xl font-black text-slate-900 dark:text-white">{anomalies.length}</div>
             <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shadow-sm ${anomalies.length > 0 ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
               {anomalies.length > 0 ? 'Detected' : 'Clear'}
             </div>
           </div>

           {/* ✨ MASSIVE HOVER TOOLTIP FOR ANOMALIES */}
           {anomalies.length > 0 && (
             <div className="absolute top-[80%] right-0 mt-2 w-max min-w-[200px] bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 p-4 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-2xl border border-slate-700 flex flex-col gap-2 transform translate-y-2 group-hover:translate-y-0">
               <span className="text-[10px] font-black text-rose-400 dark:text-rose-600 border-b border-slate-600 dark:border-slate-300 pb-1.5 mb-1 uppercase tracking-widest">Drastic Changes Detected</span>
               {anomalies.map((a, i) => (
                 <div key={i} className="flex flex-col bg-slate-700 dark:bg-slate-200 p-2 rounded-lg">
                   <div className="flex justify-between items-center border-b border-slate-600 dark:border-slate-300 pb-1 mb-1">
                     <span className="text-[9px] font-black uppercase">{a.site}</span>
                     <span className="text-[9px] font-black text-rose-400 dark:text-rose-600">+{a.diff}</span>
                   </div>
                   <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{a.label}: <span className="line-through opacity-70">{a.prev}</span> ➔ {a.curr}</span>
                 </div>
               ))}
             </div>
           )}
        </div>

      </div>

      {/* 📊 ZONE 3: THE TRIPLE-THREAT VISUAL MATRIX */}
      <div >
        
        {/* 🚨 THE SYMMETRICAL 4-CHART EXECUTIVE ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        
        {/* CHART 1: MATERIAL FLOW (DISPATCH) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-[300px] group">
           <div className="flex justify-between items-start mb-6 shrink-0">
             <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Dispatch</h3>
               <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1 flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>{filterSite === "All" ? "Global Network" : filterSite}</p>
             </div>
             <Activity size={16} className="text-emerald-500"/>
           </div>
           <div className="flex-1 relative flex items-end justify-around gap-4 px-2 pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2 pb-2 opacity-[0.05] dark:opacity-[0.1]">{[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-slate-900 dark:border-slate-100"></div>)}</div>
              {/* Bars */}
              <div className="flex-1 flex flex-col items-center group/bar h-full justify-end relative z-10">
                <div className="mb-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 bg-slate-800 text-white text-[10px] font-black py-1 px-2 rounded-lg pointer-events-none shadow-xl border border-white/10">{tSolid}</div>
                <div style={{ height: `${(tSolid / (Math.max(tSolid, tGas, tScrap, 1))) * 100}%`, minHeight: tSolid > 0 ? '4px' : '0' }} className="w-full max-w-[28px] bg-slate-400 dark:bg-slate-500 rounded-t-lg transition-all duration-1000 group-hover/bar:brightness-110"></div>
                <span className="mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Solid</span>
              </div>
              <div className="flex-1 flex flex-col items-center group/bar h-full justify-end relative z-10">
                <div className="mb-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 bg-indigo-600 text-white text-[10px] font-black py-1 px-2 rounded-lg pointer-events-none shadow-xl border border-white/10">{tGas}</div>
                <div style={{ height: `${(tGas / (Math.max(tSolid, tGas, tScrap, 1))) * 100}%`, minHeight: tGas > 0 ? '4px' : '0' }} className="w-full max-w-[28px] bg-indigo-500 rounded-t-lg transition-all duration-1000 group-hover/bar:brightness-110"></div>
                <span className="mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Gas</span>
              </div>
              <div className="flex-1 flex flex-col items-center group/bar h-full justify-end relative z-10">
                <div className="mb-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 bg-rose-600 text-white text-[10px] font-black py-1 px-2 rounded-lg pointer-events-none shadow-xl border border-white/10">{tScrap}</div>
                <div style={{ height: `${(tScrap / (Math.max(tSolid, tGas, tScrap, 1))) * 100}%`, minHeight: tScrap > 0 ? '4px' : '0' }} className="w-full max-w-[28px] bg-rose-500 rounded-t-lg transition-all duration-1000 shadow-[0_-2px_10px_rgba(244,63,94,0.3)] group-hover/bar:brightness-110"></div>
                <span className="mt-3 text-[9px] font-black text-rose-500 uppercase tracking-widest text-center animate-pulse">Scrap</span>
              </div>
           </div>
        </div>

        {/* CHART 2: INBOUND RECEIPTS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-[300px] group">
           <div className="flex justify-between items-start mb-6 shrink-0">
             <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Receipts</h3>
               <p className="text-[9px] font-bold text-blue-500 uppercase mt-1 flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></div>{filterSite === "All" ? "Global Network" : filterSite}</p>
             </div>
             <Activity size={16} className="text-blue-500"/>
           </div>
           <div className="flex-1 relative flex items-end justify-around gap-6 px-4 pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-4 pb-2 opacity-[0.05] dark:opacity-[0.1]">{[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-slate-900 dark:border-slate-100"></div>)}</div>
              {/* Bars */}
              <div className="flex flex-col items-center group/bar h-full justify-end relative z-10 w-16">
                <div className="mb-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 bg-blue-600 text-white text-[10px] font-black py-1 px-2 rounded-lg pointer-events-none shadow-xl border border-white/10">{recCo}</div>
                <div style={{ height: `${(recCo / (Math.max(recCo, recCon, 1))) * 100}%`, minHeight: recCo > 0 ? '4px' : '0' }} className="w-full max-w-[32px] bg-blue-400 dark:bg-blue-500 rounded-t-lg transition-all duration-1000 group-hover/bar:brightness-110"></div>
                <span className="mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Company</span>
              </div>
              <div className="flex flex-col items-center group/bar h-full justify-end relative z-10 w-16">
                <div className="mb-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 bg-slate-700 text-white text-[10px] font-black py-1 px-2 rounded-lg pointer-events-none shadow-xl border border-white/10">{recCon}</div>
                <div style={{ height: `${(recCon / (Math.max(recCo, recCon, 1))) * 100}%`, minHeight: recCon > 0 ? '4px' : '0' }} className="w-full max-w-[32px] bg-slate-400 dark:bg-slate-600 rounded-t-lg transition-all duration-1000 group-hover/bar:brightness-110"></div>
                <span className="mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Contractor</span>
              </div>
           </div>
        </div>

        {/* CHART 3: ASSET RECOVERY (OGP) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-[300px] group">
           <div className="flex justify-between items-start mb-6 shrink-0">
             <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">OGP Assets</h3>
               <p className="text-[9px] font-bold text-amber-500 uppercase mt-1 flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></div>{filterSite === "All" ? "Global Network" : filterSite}</p>
             </div>
             <Shield size={16} className="text-amber-500"/>
           </div>
           <div className="flex-1 relative flex items-end justify-around gap-4 px-2 pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2 pb-2 opacity-[0.05] dark:opacity-[0.1]">{[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-slate-900 dark:border-slate-100"></div>)}</div>
              {/* Bars */}
              <div className="flex-1 flex flex-col items-center group/bar h-full justify-end relative z-10">
                <div className="mb-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 bg-slate-800 text-white text-[10px] font-black py-1 px-2 rounded-lg pointer-events-none shadow-xl border border-white/10">{rmgpOut}</div>
                <div style={{ height: `${(rmgpOut / (Math.max(rmgpOut, rmgpIn, nrgp, 1))) * 100}%`, minHeight: rmgpOut > 0 ? '4px' : '0' }} className="w-full max-w-[28px] bg-amber-400 dark:bg-amber-500 rounded-t-lg transition-all duration-1000 group-hover/bar:brightness-110"></div>
                <span className="mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">RMGP Out</span>
              </div>
              <div className="flex-1 flex flex-col items-center group/bar h-full justify-end relative z-10">
                <div className="mb-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 bg-emerald-600 text-white text-[10px] font-black py-1 px-2 rounded-lg pointer-events-none shadow-xl border border-white/10">{rmgpIn}</div>
                <div style={{ height: `${(rmgpIn / (Math.max(rmgpOut, rmgpIn, nrgp, 1))) * 100}%`, minHeight: rmgpIn > 0 ? '4px' : '0' }} className="w-full max-w-[28px] bg-emerald-500 rounded-t-lg transition-all duration-1000 group-hover/bar:brightness-110"></div>
                <span className="mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">RMGP In</span>
              </div>
              <div className="flex-1 flex flex-col items-center group/bar h-full justify-end relative z-10">
                <div className="mb-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 bg-rose-600 text-white text-[10px] font-black py-1 px-2 rounded-lg pointer-events-none shadow-xl border border-white/10">{nrgp}</div>
                <div style={{ height: `${(nrgp / (Math.max(rmgpOut, rmgpIn, nrgp, 1))) * 100}%`, minHeight: nrgp > 0 ? '4px' : '0' }} className="w-full max-w-[28px] bg-rose-500 rounded-t-lg transition-all duration-1000 group-hover/bar:brightness-110 shadow-[0_-2px_10px_rgba(244,63,94,0.3)]"></div>
                <span className="mt-3 text-[9px] font-black text-rose-500 uppercase tracking-widest text-center">NRGP</span>
              </div>
           </div>
        </div>

        {/* CHART 4: OPERATIONS (STAFF & VEHICLES) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-[300px] group">
           <div className="flex justify-between items-start mb-6 shrink-0">
             <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Site Presence</h3>
               <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1 flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"></div>{filterSite === "All" ? "Global Network" : filterSite}</p>
             </div>
             <Users size={16} className="text-indigo-500"/>
           </div>
           <div className="flex-1 relative flex items-end justify-around gap-2 px-1 pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-1 pb-2 opacity-[0.05] dark:opacity-[0.1]">{[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-slate-900 dark:border-slate-100"></div>)}</div>
              {/* Bars (4 of them!) */}
              <div className="flex-1 flex flex-col items-center group/bar h-full justify-end relative z-10">
                <div className="mb-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 bg-slate-800 text-white text-[9px] font-black py-1 px-1.5 rounded-lg pointer-events-none shadow-xl border border-white/10">{footCon}</div>
                <div style={{ height: `${(footCon / (Math.max(footCon, footRil, vehCon, vehCo, 1))) * 100}%`, minHeight: footCon > 0 ? '4px' : '0' }} className="w-full max-w-[20px] bg-blue-400 dark:bg-blue-500 rounded-t-lg transition-all duration-1000 group-hover/bar:brightness-110"></div>
                <span className="mt-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Con<br/>Wrk</span>
              </div>
              <div className="flex-1 flex flex-col items-center group/bar h-full justify-end relative z-10">
                <div className="mb-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 bg-indigo-600 text-white text-[9px] font-black py-1 px-1.5 rounded-lg pointer-events-none shadow-xl border border-white/10">{footRil}</div>
                <div style={{ height: `${(footRil / (Math.max(footCon, footRil, vehCon, vehCo, 1))) * 100}%`, minHeight: footRil > 0 ? '4px' : '0' }} className="w-full max-w-[20px] bg-indigo-500 rounded-t-lg transition-all duration-1000 group-hover/bar:brightness-110"></div>
                <span className="mt-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">RIL<br/>Emp</span>
              </div>
              <div className="flex-1 flex flex-col items-center group/bar h-full justify-end relative z-10">
                <div className="mb-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 bg-slate-600 text-white text-[9px] font-black py-1 px-1.5 rounded-lg pointer-events-none shadow-xl border border-white/10">{vehCon}</div>
                <div style={{ height: `${(vehCon / (Math.max(footCon, footRil, vehCon, vehCo, 1))) * 100}%`, minHeight: vehCon > 0 ? '4px' : '0' }} className="w-full max-w-[20px] bg-slate-400 dark:bg-slate-600 rounded-t-lg transition-all duration-1000 group-hover/bar:brightness-110"></div>
                <span className="mt-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Con<br/>Veh</span>
              </div>
              <div className="flex-1 flex flex-col items-center group/bar h-full justify-end relative z-10">
                <div className="mb-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 bg-teal-600 text-white text-[9px] font-black py-1 px-1.5 rounded-lg pointer-events-none shadow-xl border border-white/10">{vehCo}</div>
                <div style={{ height: `${(vehCo / (Math.max(footCon, footRil, vehCon, vehCo, 1))) * 100}%`, minHeight: vehCo > 0 ? '4px' : '0' }} className="w-full max-w-[20px] bg-teal-500 rounded-t-lg transition-all duration-1000 group-hover/bar:brightness-110"></div>
                <span className="mt-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Co<br/>Veh</span>
              </div>
           </div>
        </div>

      </div>
      </div>

      {/* 🗂️ ZONE 4: TACTICAL LEDGER WALL (The Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(r => {
          // Card Anomaly Logic
          const r_rmgpOut = num(r.ogp_rmgp);
          const r_rmgpIn = num(r.ogp_rmgp_in);
          const r_scrap = num(r.disp_scrap);
          const isLeakage = r_rmgpOut > r_rmgpIn;
          const isHighScrap = r_scrap > 50; 
          const hasAnomaly = isLeakage || isHighScrap;

          return (
            <div key={r.id} onClick={() => setViewingRep(r)} className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border cursor-pointer hover:-translate-y-1 transition-all group relative overflow-hidden ${hasAnomaly ? 'border-rose-400 dark:border-rose-500/50 shadow-sm dark:shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'}`}>
              
              {hasAnomaly && <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 blur-xl rounded-full"></div>}
              
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm">{r.site}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Sr. {r.sr_no}</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase px-2 py-1 rounded">{r.date_from}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 p-2 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Dispatch</span>
                  <span className={`text-xs font-black ${isHighScrap ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>{num(r.disp_solid)+num(r.disp_gas)+r_scrap}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 p-2 rounded-lg">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">RMGP Delta</span>
                  <span className={`text-xs font-black ${isLeakage ? 'text-rose-500' : 'text-emerald-500'}`}>{isLeakage ? `-${r_rmgpOut - r_rmgpIn}` : '0 Loss'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 📄 ZONE 5: THE DEEP DIVE MODAL */}
      {viewingRep && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setViewingRep(null)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
             <div className="h-2 bg-emerald-500 w-full shrink-0"></div>
             
             <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-950/50 shrink-0">
               <div>
                 <span className="text-[10px] font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded uppercase tracking-widest">Sr No. {viewingRep.sr_no}</span>
                 <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2 uppercase">{viewingRep.site}</h2>
                 <p className="text-xs font-bold text-slate-500 mt-1">Date: {viewingRep.date_from} TO {viewingRep.date_to}</p>
               </div>
               <button onClick={() => setViewingRep(null)} className="p-2 text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"><X size={16} /></button>
             </div>
             
             <div className="p-6 overflow-y-auto custom-scrollbar">
               <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-xl">
                 <table className="w-max min-w-full border-collapse text-center text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900">
                   <thead>
                     <tr className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                       <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-2">Sr. No.</th>
                       <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-2">SITE</th>
                       <th colSpan="3" className="border border-slate-300 dark:border-slate-700 p-2 bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400">DISPATCH</th>
                       <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 bg-indigo-100/50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400">RECEIPT</th>
                       <th colSpan="3" className="border border-slate-300 dark:border-slate-700 p-2 bg-amber-100/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400">OGP</th>
                       <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 bg-blue-100/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">VEHICLE</th>
                       <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 bg-purple-100/50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">CONTRACTOR/ RIL STAFF</th>
                       <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 text-rose-600 dark:text-rose-400">VISITOR</th>
                       <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 text-rose-600 dark:text-rose-400">GOV.<br/>OFFICIAL</th>
                       <th colSpan="4" className="border border-slate-300 dark:border-slate-700 p-2 bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white">DEPLOYMENT</th>
                     </tr>
                     <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                       <th className="border border-slate-300 dark:border-slate-700 p-2">SOLID</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">GAS</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">SCRAP</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">COMPANY</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">CONTRACTOR</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">NRGP</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">RMGP</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">RMGP IN</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">CONTRACTOR<br/>VEHICLE</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">COMPANY/<br/>EMP. VEHICLE</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">CONTRACTOR<br/>WORKER</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">RIL<br/>EMPLOYE</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">Day SS</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">Day SG</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">Night SS</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">Night SG</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.sr_no}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.site}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.disp_solid || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.disp_gas || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4 text-rose-500">{viewingRep.disp_scrap || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.rec_company || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.rec_contractor || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.ogp_nrgp || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4 text-amber-500">{viewingRep.ogp_rmgp || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4 text-emerald-500">{viewingRep.ogp_rmgp_in || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.veh_contractor || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.veh_company || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.foot_contractor || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.foot_ril || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4 text-purple-500">{viewingRep.foot_visitor || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4 text-purple-500">{viewingRep.foot_gov || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.dep_day_ss || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.dep_day_sg || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.dep_night_ss || 0}</td>
                       <td className="border border-slate-300 dark:border-slate-700 p-4">{viewingRep.dep_night_sg || 0}</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
             </div>

             <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-between shrink-0">
               {/* ✨ THE NEW ADMIN DELETE BUTTON! */}
               <button onClick={() => { onDeleteWeekly(viewingRep.id); setViewingRep(null); }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors shadow-sm border border-rose-200 dark:border-rose-800 uppercase tracking-widest">
                 <Trash2 size={16} /> Delete
               </button>

               <button onClick={() => {
                  const r = viewingRep;
                  const row1 = ["Sr_No", "SITE", "Date_From", "Date_To", "DISPATCH", "", "", "RECEIPT", "", "OGP", "", "", "VEHICLE", "", "CONTRACTOR/ RIL STAFF", "", "VISITOR", "GOV. OFFICIAL", "DEPLOYMENT", "", "", ""];
                  const row2 = ["", "", "", "", "SOLID", "GAS", "SCRAP", "COMPANY", "CONTRACTOR", "NRGP", "RMGP", "RMGP IN", "CONTRACTOR VEHICLE", "COMPANY/ EMP. VEHICLE", "CONTRACTOR WORKER", "RIL EMPLOYE", "", "", "Day SS", "Day SG", "Night SS", "Night SG"];
                  const row3 = [r.sr_no, r.site, r.date_from, r.date_to, r.disp_solid, r.disp_gas, r.disp_scrap, r.rec_company, r.rec_contractor, r.ogp_nrgp, r.ogp_rmgp, r.ogp_rmgp_in, r.veh_contractor, r.veh_company, r.foot_contractor, r.foot_ril, r.foot_visitor, r.foot_gov, r.dep_day_ss, r.dep_day_sg, r.dep_night_ss, r.dep_night_sg].map(v => `"${v || 0}"`);
                  
                  const csv = [row1.join(','), row2.join(','), row3.join(',')].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                  a.download = `Ledger_${r.site}_${r.date_from}.csv`; a.click();
               }} className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition-colors shadow-sm border border-indigo-200 dark:border-indigo-800 uppercase tracking-widest">
                 <Download size={16} /> Download Single CSV
               </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// ⚙️ GOD-MODE SETTINGS PANEL (UPGRADED!)
// ==========================================
function AdminSettingsView({ userProfile, globalSites, STATE_NAMES, onAddSite, onToggleStatus, onDeleteSite, onClose }) {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Site Form States
  const [newSiteInput, setNewSiteInput] = useState('');
  const [newStateSelection, setNewStateSelection] = useState(''); 
  const [customStateInput, setCustomStateInput] = useState(''); 
  
  // ✨ The Network Filter & Search Brain!
  const [networkFilter, setNetworkFilter] = useState('All');
  const [siteSearchTerm, setSiteSearchTerm] = useState(''); // 🔍 NEW: Omni-search state!

  // ✨ NEW: User Roster States
  const [allProfiles, setAllProfiles] = useState([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // 📡 FETCH ALL PROFILES WHEN PROFILE TAB OPENS!
  useEffect(() => {
    if (activeTab === 'profile') {
      const fetchProfiles = async () => {
        setIsLoadingProfiles(true);
        const { data, error } = await supabase.from('profiles').select('*').order('role', { ascending: true });
        if (!error && data) setAllProfiles(data);
        setIsLoadingProfiles(false);
      };
      fetchProfiles();
    }
  }, [activeTab]);

  const submitNewSite = (e) => {
    e.preventDefault();
    if (newSiteInput.trim()) {
      const finalState = newStateSelection === 'NEW' ? customStateInput.trim() : newStateSelection;
      if (!finalState) return alert("Please select or enter a state!");
      
      onAddSite(newSiteInput.trim(), finalState);
      setNewSiteInput('');
      setNewStateSelection('');
      setCustomStateInput('');
    }
  };

  // 🗺️ ✨ MAGIC: Filter & Segregate all sites beautifully by State!
  const displaySites = globalSites.filter(s => {
    const matchesFilter = networkFilter === 'All' ? true : s.status === networkFilter;
    const matchesSearch = siteSearchTerm === '' || s.name.toLowerCase().includes(siteSearchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const groupedSites = displaySites.reduce((acc, site) => {
    const state = site.state_name || 'UNASSIGNED';
    if (!acc[state]) acc[state] = [];
    acc[state].push(site);
    return acc;
  }, {});
  const sortedStates = Object.keys(groupedSites).sort();

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 animate-in fade-in duration-300 h-full">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <Settings className="text-indigo-500" /> System Control
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Admin Access</p>
        </div>
        <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95 shadow-sm border border-slate-200 dark:border-slate-700">
          <X size={20} />
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-8 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl w-max border border-slate-200 dark:border-slate-800 shadow-inner mx-auto sm:mx-0">
        <button onClick={() => setActiveTab('profile')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>MANAGE PROFILE</button>
        <button onClick={() => setActiveTab('sites')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'sites' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>Site Network</button>
      </div>

      {/* 👤 TAB 1: SYSTEM ACCESS ROSTER */}
      {activeTab === 'profile' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          
          {/* YOUR PROFILE (THE BOSS) */}
          <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20 shadow-lg shadow-indigo-500/30">
              <User size={40} />
            </div>
            <div>
              <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">ADMINISTRATOR</h2>
              <p className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-none mb-2">{userProfile.name}</p>
              <div className="flex gap-2">
                <span className="inline-block bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">Site: {userProfile.site}</span>
                <span className="inline-block bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">Lvl: {userProfile.role}</span>
              </div>
            </div>
          </div>

          {/* EVERYONE ELSE'S PROFILES */}
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2"><Users size={16}/> Global Security Roster</h3>
            
            {isLoadingProfiles ? (
              <div className="p-10 text-center font-bold text-indigo-500 animate-pulse">Decrypting User Vault...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allProfiles.map(profile => (
                  <div key={profile.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-black text-xl shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-600 transition-colors">
                      {profile.name ? profile.name[0] : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase truncate leading-tight">{profile.name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 truncate flex items-center gap-1"><MapPin size={10}/> {profile.site}</p>
                    </div>
                    <div className="shrink-0">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${profile.role === 'admin' ? 'bg-rose-500 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'}`}>
                        {profile.role === 'admin' ? 'Admin' : 'Officer'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🌍 TAB 2: SITE NETWORK MANAGER */}
      {activeTab === 'sites' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          
          {/* THE DEPLOYMENT WIDGET */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden max-w-3xl">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10"><PlusCircle size={18} className="text-indigo-500"/> Establish New Tracking Site</h3>
            
            <form onSubmit={submitNewSite} className="flex flex-col gap-3 relative z-10">
              {/* ✨ STATE DROPDOWN */}
              <select value={newStateSelection} onChange={e => setNewStateSelection(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white uppercase focus:border-indigo-500 outline-none shadow-inner">
                <option value="">-- SELECT STATE --</option>
                {STATE_NAMES?.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="NEW">+ ADD NEW STATE</option>
              </select>
              
              {/* ✨ THE MAGIC REVEAL BOX FOR NEW STATES! */}
              {newStateSelection === 'NEW' && (
                <div className="w-full animate-in fade-in slide-in-from-top-2">
                  <input type="text" placeholder="ENTER NEW STATE NAME..." value={customStateInput} onChange={e => setCustomStateInput(e.target.value)} className="w-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white uppercase focus:border-indigo-500 outline-none shadow-inner" />
                </div>
              )}
              
              {/* ✨ SITE NAME & DEPLOY BUTTON */}
              <div className="flex gap-2">
                <input type="text" value={newSiteInput} onChange={(e) => setNewSiteInput(e.target.value)} placeholder="ENTER SITE NAME..." className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white uppercase focus:border-indigo-500 outline-none shadow-inner" />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-indigo-500/25 shrink-0 flex items-center gap-2">
                  <Zap size={14}/> Deploy
                </button>
              </div>
            </form>
          </div>

          {/* ✨ THE GORGEOUS STATE-SEGREGATED NETWORK GRID */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 ml-1">
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><MapPin size={16}/> Global Network Map</h3>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Viewing: {displaySites.length} Total Sites</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* 🔍 ✨ THE NEW SEARCH BAR! */}
                <div className="relative w-full sm:w-48">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search Site..." value={siteSearchTerm} onChange={(e) => setSiteSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors shadow-sm" />
                </div>

                {/* ✨ YOUR VIEW FILTERS! */}
                <div className="inline-flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner w-full sm:w-auto shrink-0">
                  <button onClick={() => setNetworkFilter('All')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${networkFilter === 'All' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>All</button>
                <button onClick={() => setNetworkFilter('commissioned')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${networkFilter === 'commissioned' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'}`}>Commissioned</button>
                <button onClick={() => setNetworkFilter('project')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${networkFilter === 'project' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-slate-500 hover:text-amber-600 dark:hover:text-amber-400'}`}>Projects</button>
              </div>
            </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedStates.map(stateName => {
                const sitesInState = groupedSites[stateName].sort((a,b) => a.name.localeCompare(b.name));
                const commissionedCount = sitesInState.filter(s => s.status === 'commissioned').length;
                
                return (
                  <div key={stateName} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col max-h-[400px]">
                    
                    {/* STATE HEADER */}
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{stateName}</h4>
                      <span className="text-[9px] font-black text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md uppercase tracking-widest">
                        {commissionedCount}/{sitesInState.length} Live
                      </span>
                    </div>

                    {/* SITES LIST */}
                    <div className="p-3 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                      {sitesInState.map(site => (
                        <div key={site.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/50 group hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                          <div className="flex items-center gap-3">
                            {/* The Glowing Status Dot */}
                            <div className={`w-2 h-2 rounded-full shadow-sm ${site.status === 'commissioned' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-amber-400'}`}></div>
                            <span className={`text-xs font-black uppercase ${site.status === 'commissioned' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>{site.name}</span>
                          </div>
                          
                          {/* The Action Buttons */}
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => onToggleStatus(site.id, site.status)} className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all active:scale-95 ${site.status === 'commissioned' ? 'bg-slate-200 text-slate-500 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-900/40 dark:hover:text-rose-400' : 'bg-indigo-50 text-indigo-600 hover:bg-emerald-500 hover:text-white dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm border border-indigo-200 dark:border-indigo-500/20'}`}>
                              {site.status === 'commissioned' ? 'Revert' : 'Commission'}
                            </button>
                            
                            {/* ✨ THE NEW DELETE BUTTON */}
                            <button onClick={() => onDeleteSite(site.id, site.name)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ==========================================
// ✏️ WEEKLY LEDGER EDIT MODAL
// ==========================================
function WeeklyEditModal({ record, onClose, onSave }) {
  const [fd, setFd] = useState({...record});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(fd);
    setIsSubmitting(false);
  };

  const renderInput = (valKey) => (
    <td className="border border-slate-300 dark:border-slate-700 p-0">
      <input type="number" required value={fd[valKey] || ''} onChange={(e) => setFd({...fd, [valKey]: e.target.value})} className="w-14 sm:w-20 bg-transparent text-center py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:bg-indigo-50 dark:focus:bg-indigo-900/30 transition-colors" />
    </td>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-950/30 shrink-0">
          <div>
            <h3 className="font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-2 uppercase tracking-widest text-sm sm:text-base"><Edit2 size={18} /> Edit & Resend Report</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{record.site} • Sr No. {record.sr_no}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-800 rounded-full shadow-sm"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 overflow-y-auto overflow-x-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-slate-950/50">
            <table className="w-max min-w-full border-collapse border border-slate-300 dark:border-slate-700 text-center text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900">
              <thead>
                <tr className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 min-w-[60px]">Sr. No.</th>
                  <th colSpan="3" className="border border-slate-300 dark:border-slate-700 p-2 bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400">DISPATCH</th>
                  <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 bg-indigo-100/50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400">RECEIPT</th>
                  <th colSpan="3" className="border border-slate-300 dark:border-slate-700 p-2 bg-amber-100/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400">OGP</th>
                  <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 bg-blue-100/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">VEHICLE</th>
                  <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 bg-purple-100/50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">CON/RIL STAFF</th>
                  <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 text-rose-600 dark:text-rose-400">VISITOR</th>
                  <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 text-rose-600 dark:text-rose-400">GOV.<br/>OFF.</th>
                  <th colSpan="4" className="border border-slate-300 dark:border-slate-700 p-2 bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white">DEPLOYMENT</th>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                  <th className="border border-slate-300 dark:border-slate-700 p-2">SOLID</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2">GAS</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2">SCRAP</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2">COMPANY</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2">CONTRACTOR</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2">NRGP</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2">RMGP</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2">RMGP IN</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2 px-1">CON.<br/>VEH</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2 px-1">CO.<br/>VEH</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2 px-1">CON.<br/>WORKER</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2 px-1">RIL<br/>EMP.</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2">Day SS</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2">Day SG</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2">Night SS</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-2">Night SG</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="border border-slate-300 dark:border-slate-700 p-0"><input type="text" required value={fd.sr_no || ''} onChange={(e) => setFd({...fd, sr_no: e.target.value})} className="w-16 sm:w-20 bg-transparent text-center py-3 text-sm font-bold outline-none focus:bg-indigo-50 dark:focus:bg-indigo-900/30" /></td>
                  {renderInput('disp_solid')}{renderInput('disp_gas')}{renderInput('disp_scrap')}
                  {renderInput('rec_company')}{renderInput('rec_contractor')}
                  {renderInput('ogp_nrgp')}{renderInput('ogp_rmgp')}{renderInput('ogp_rmgp_in')}
                  {renderInput('veh_contractor')}{renderInput('veh_company')}
                  {renderInput('foot_contractor')}{renderInput('foot_ril')}
                  {renderInput('foot_visitor')}{renderInput('foot_gov')}
                  {renderInput('dep_day_ss')}{renderInput('dep_day_sg')}
                  {renderInput('dep_night_ss')}{renderInput('dep_night_sg')}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 shrink-0">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest bg-indigo-600 text-white flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-900/20 transition-all">
              {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <><Save size={40} /> Update MIS Report</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}