import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  Plus, Trash2, Calendar, MapPin, Users, Shield, LogOut, 
  Filter, CheckCircle, Smartphone, Monitor, Activity,  Leaf, Zap,Eye, EyeOff, Clock,BarChart2, PieChart, TrendingUp, Target,
  X, Search, ChevronDown, Download, Edit2, Save, Sun, Moon, Lock, Mail,RefreshCw, Copy, BookOpen, Briefcase, Phone, Menu, Unlock, ArrowRight
} from 'lucide-react';
// 👑 THE 26 VIP COMMISSIONED SITES
const COMMISSIONED_SITES = [
  "Vadodara", "Jhajjar 1", "Panipat", "Nagpur", "Nanded", "Hoshiarpur", "Barabanki", "Prayagraj 1", "Satna", "Kakinada 1", "Kota", "Indore", "Nagothane", "Bhopal", "Malegaon", "Raipur", "Jabalpur", "Dhenkanal 1", "Kurkumbh", "Bilaspur", "Hapur", "Nellore", "Akola", "Haidergarh", "Kakinada 2", "Kurnool"
];
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
  const [deletingRecord, setDeletingRecord] = useState(null); 
  const [viewingRecord, setViewingRecord] = useState(null); 
  const [contacts, setContacts] = useState([]); // CONTACTS STATE
  const [editingContact, setEditingContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);
  const [viewingContact, setViewingContact] = useState(null); 
  const [isUnlocking, setIsUnlocking] = useState(false);
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

// --- 🔥 FETCH DEPLOYMENTS & CONTACTS ---
  useEffect(() => {
    if (userProfile) {
      fetchDeployments();
      if (userProfile.role === 'admin') fetchContacts(); // Safe inside the shield! 
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

  // ✨ 2. FETCH CONTACTS (Properly separated!)
  const fetchContacts = async () => {
    const { data, error } = await supabase.from('contacts').select('*').order('name', { ascending: true });
    if (!error) setContacts(data || []);
  };

  // ✨ 3. CSV IMPORT (Zero Cloud Storage Used!
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
        // ✨ THE UPSERT : 'onConflict' uses the unique phone number we just locked!
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
  onViewContact={setViewingContact}
  onImportCSV={handleCSVImport} 
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
// 🔐 AUTHENTICATION SCREEN (CINEMATIC VAULT)
// ==========================================
function AuthScreen({ theme, toggleTheme, setIsUnlocking }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [time, setTime] = useState(new Date());

  // ✨ The Cinematic Login States!
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

      {/* ✨ GORGEOUS BACKGROUND IMAGE WITH SHADOW & OVERLAY ✨ */}
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
         <img src="/biologo.webp" alt="Reliance Logo" className="h-10 sm:h-12 w-auto object-contain drop-shadow-xl transition-transform hover:scale-105" onError={(e) => e.target.style.display='none'} />

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

          {/* ✨ THE BREATHING AURA */}
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

              {/* ✨ EMBOSSED 3D SHIELD ICON */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500/30 blur-2xl animate-pulse rounded-full"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_10px_20px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.4)] border border-slate-200/50 dark:border-slate-700/50 transform rotate-3 hover:rotate-6 transition-transform duration-500 group">
                  <Shield size={36} className="text-emerald-600 dark:text-emerald-400 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>

              <div className="relative inline-block">
                 <h1 className="text-3xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                   Reliance <span className="bg-clip-text text-transparent bg-gradient-to-b from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500">CBG Central</span>
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
                  {/* ✨ DEEP CARVED INPUT */}
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loginPhase !== 'idle'}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 dark:bg-[#0B1120]/80 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)]"
                    placeholder="auth@reliance-cbg.com" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Secure Passkey</label>
                <div className="relative group/input">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors z-10" />
                  {/* ✨ DEEP CARVED INPUT */}
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loginPhase !== 'idle'}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50/80 dark:bg-[#0B1120]/80 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)]"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 z-10">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* ✨ FLOWING ENERGY BUTTON */}
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
function SupervisorMobileView({ userProfile, deployments, isLoading, fetchDeployments, onLogout, onEdit, onDelete, onView, theme, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('form');
  
  // 🎬 THE CINEMATIC INTRO STATES (1: Portal Welcome, 2: Identity Scan, 3: Personal Welcome, 0: Dashboard)
  const [introStage, setIntroStage] = useState(1);
  const [customName, setCustomName] = useState('');
  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if(customName.trim().length > 0) {
      selectName(customName.trim());
    }
  };
  const [fillerName, setFillerName] = useState('');
  
  const allowedSupervisors = userProfile.name ? userProfile.name.split(',').map(n => n.trim()) : [];

  // Auto-advance the first screen after 2.5 seconds
  useEffect(() => {
    if (introStage === 1) {
      const timer = setTimeout(() => setIntroStage(2), 2500);
      return () => clearTimeout(timer);
    }
  }, [introStage]);

  const selectName = (name) => {
    setFillerName(name.toUpperCase());
    setIntroStage(3); // Go to white welcome screen!
    // Show white screen for 2 seconds, then dissolve into the app!
    setTimeout(() => setIntroStage(0), 2000);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-slate-950 max-w-md mx-auto shadow-2xl relative border-x border-slate-200 dark:border-slate-900 transition-colors">
      
      {/* ✨ THE MANDATORY VIP SELECTION POP-UP */}
      <style>
        {`
          @keyframes fade-zoom { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
          .animate-fade-zoom { animation: fade-zoom 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}
      </style>

      {/* 🎬 THE MOVIE SEQUENCE OVERLAY */}
      {introStage > 0 && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-colors duration-1000 ${introStage === 3 ? 'bg-white dark:bg-slate-950' : 'bg-slate-950'}`}>
          
          {/* STAGE 1: Premium Boot Splash */}
          {introStage === 1 && (
            <div className="text-center animate-fade-zoom relative">
              {/* ✨ Glowing Energy Aura behind the logo! */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl animate-pulse z-0"></div>
              
              <div className="relative mb-8 z-10">
                 {/* 🖼️ THE PNG LOGO! (With a genius fallback just in case!) */}
                 <img src="/biologo.webp" alt="Reliance Logo" className="w-28 h-28 mx-auto object-contain drop-shadow-[0_10px_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105" 
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                 
                 {/* 🛡️ The Fallback Shield (Only shows if logo.png is missing) */}
                 <div className="hidden w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-green-600 rounded-3xl flex-col items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.4)] border border-white/20">
                    <Shield size={48} className="text-white drop-shadow-md" />
                 </div>
              </div>

              <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2 drop-shadow-lg relative z-10">
                Reliance <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">CBG</span>
              </h1>
              <h2 className="text-[11px] font-bold text-slate-400 tracking-[0.4em] uppercase mb-12 relative z-10">
                Secure Deployment Network
              </h2>
              
              {/* Sleek Hacker-style Loading Indicator */}
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
                 <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 mx-auto border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                    <Users size={32} />
                 </div>
                 <h2 className="text-2xl font-black text-white tracking-wide mb-1">IDENTITY SCAN</h2>
                 <p className="text-xs text-indigo-300 uppercase tracking-widest font-semibold">Select Authorized Officer</p>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                {allowedSupervisors.map((name, idx) => (
                  <button key={idx} onClick={() => selectName(name)} className="w-full py-5 bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-400/50 rounded-2xl font-black text-sm text-white uppercase transition-all flex justify-between items-center px-6 group shadow-lg">
                    {name} <ArrowRight size={18} className="text-indigo-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
              {/* ⌨️ MANUAL FALLBACK */}
              <div className="mt-6 pt-5 border-t border-indigo-500/20">
                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest text-center mb-3">Not on the list?</p>
                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                  <input type="text" placeholder="Enter Full Name..." value={customName} onChange={(e) => setCustomName(e.target.value)} className="flex-1 bg-black/20 border border-indigo-500/30 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-400 uppercase placeholder:text-indigo-300/50 shadow-inner" />
                  <button type="submit" className="bg-indigo-500 text-white px-5 rounded-xl font-black text-xs hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/25">GO</button>
                </form>
              </div>
            </div>
          )}

          {/* STAGE 3: Personal Welcome (White Screen) */}
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
      )}


      <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-5 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          
          {/* ✨ PREMIUM SHIELD BOX ADDED HERE! */}
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-sm shrink-0">
             <Shield size={20} className="drop-shadow-sm" />
          </div>
          </div>

          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">{userProfile.site} <span className="text-emerald-600 dark:text-emerald-400">Site</span></h1>
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
          <DeploymentMobileForm userProfile={userProfile} fetchDeployments={fetchDeployments} setActiveTab={setActiveTab} fillerName={fillerName} deployments={deployments}/>
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

function DeploymentMobileForm({ userProfile, fetchDeployments, setActiveTab, fillerName, deployments}) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  
  const [personnel, setPersonnel] = useState([{ id: Date.now(), shift: "Day Shift", designation: "SS - Security Supervisor", name: "", phone: "", location: "Main Gate", customLocation: "" }]);

  const addPerson = () => setPersonnel([...personnel, { id: Date.now(), shift: "Day Shift", designation: "SG - Security Guard", name: "", phone: "", location: "Main Gate", customLocation: "" }]);
  const updatePerson = (id, field, value) => setPersonnel(personnel.map(p => p.id === id ? { ...p, [field]: value } : p));
  // ✨ THE TIME-TRAVEL MAGIC WAND!
  const handleAutoFill = () => {
    // 1. Calculate exactly what yesterday's date was!
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // 2. Search the vault for yesterday's logs at this specific site
    const yesterdayLogs = (deployments || []).filter(d => d.date === yesterdayStr);

    if (yesterdayLogs.length === 0) {
      alert("Oops! 🥺 I couldn't find any deployments from yesterday to copy!");
      return;
    }

    // 3. Map the old data into our brand new form boxes!
    const copiedPersonnel = yesterdayLogs.map((log, index) => {
      const isStandardLocation = LOCATIONS.includes(log.location);
      return {
        id: Date.now() + index, // Gives them fresh unique IDs so React doesn't panic!
        shift: log.shift || "Day Shift",
        designation: log.designation || "SG - Security Guard",
        name: log.name || "",
        phone: log.phone || "",
        location: isStandardLocation ? log.location : "Other",
        customLocation: isStandardLocation ? "" : log.location
      };
    });

    // 4. BAM! Populate the form instantly!
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
      
      {/* ✨ THE MAGIC WAND BUTTON */}
      <button type="button" onClick={handleAutoFill} className="w-full py-3.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-xs font-black uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all shadow-sm group">
        <Copy size={16} className="group-hover:scale-110 transition-transform" /> 
        Auto-Fill Yesterday's Shift
      </button>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">

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
// 🖥️ ADMIN VIEW (MASTER PORTAL + COMMAND CENTER)
// ==========================================
function AdminDesktopView({ userProfile, deployments, contacts, isLoading, onLogout, onEdit, onView, onDelete, onAddContact, onEditContact, onDeleteContact, onViewContact, onImportCSV, theme, toggleTheme }) {
  // ✨ TAB STATE TO SWITCH BETWEEN DEPLOYMENTS & CONTACTS
  const [activeTab, setActiveTab] = useState('deployments'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Deployment Filters
  const [filterState, setFilterState] = useState("All");
  const [filterSite, setFilterSite] = useState("All");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterShift, setFilterShift] = useState("All");
  const [filterDesignation, setFilterDesignation] = useState("All");
  const [filterLocation, setFilterLocation] = useState("All"); // ✨ NEW: Location Filter
  const [searchTerm, setSearchTerm] = useState(""); 
  const [siteTier, setSiteTier] = useState("All"); // ✨ NEW: VIP Toggle

  // Contact Omni-Search
  const [contactSearchTerm, setContactSearchTerm] = useState("");

  const availableSites = filterState === "All" ? SITES : SITES_BY_STATE[filterState] || [];
  
  // 🧠 1. THE MASTER FILTER ENGINE
  const filteredData = deployments.filter(d => {
    const stateMatch = filterState === "All" || (SITES_BY_STATE[filterState] && SITES_BY_STATE[filterState].includes(d.site));
    const siteMatch = filterSite === "All" || d.site === filterSite;
    const dateMatch = filterDate === "" || d.date === filterDate;
    const shiftMatch = filterShift === "All" || d.shift === filterShift;
    const designationMatch = filterDesignation === "All" || (d.designation && d.designation.startsWith(filterDesignation));
    const locationMatch = filterLocation === "All" || d.location === filterLocation;
    
    const safeName = d.name || ""; 
    const searchMatch = searchTerm === "" || safeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // ✨ VIP Tier Logic
    const isCommissioned = COMMISSIONED_SITES.includes(d.site);
    const tierMatch = siteTier === "All" || (siteTier === "Commissioned" ? isCommissioned : !isCommissioned);

    return stateMatch && siteMatch && dateMatch && shiftMatch && designationMatch && locationMatch && searchMatch && tierMatch;
  });

// 🫀 2. THE LIVE HEARTBEAT STATS
  const totalBoots = filteredData.length;
  
  // ✨ NEW: Phantom Roster (AWOL) Engine
  const activeSiteNames = new Set(filteredData.map(d => d.site));
  const expectedSites = availableSites.filter(s => {
    if (siteTier === 'Commissioned') return COMMISSIONED_SITES.includes(s);
    if (siteTier === 'Project') return !COMMISSIONED_SITES.includes(s);
    return true;
  });
  const awolSites = expectedSites.filter(s => !activeSiteNames.has(s));

  // ✨ NEW: MTCC Active Node Tracker (With specific counts per site!)
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

// ✨ NEW: THE 4-PILLAR COMPLIANCE ENGINE (Fatigue, Top-Heavy, Gap, Fraud)
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
  const locCounts = { "Main Gate": 0, "MTCC": 0, "Weigh Bridge": 0, "Other": 0 };
  filteredData.forEach(d => {
    const loc = LOCATIONS.includes(d.location) ? d.location : "Other";
    locCounts[loc] = (locCounts[loc] || 0) + 1;
  });
  const maxLocCount = Math.max(...Object.values(locCounts), 1); 
  
  const locationData = [
    { name: "Main Gate", count: locCounts["Main Gate"], color: "from-blue-500 to-cyan-400" },
    { name: "MTCC", count: locCounts["MTCC"], color: "from-amber-500 to-orange-400" },
    { name: "Weigh Bridge", count: locCounts["Weigh Bridge"], color: "from-purple-500 to-pink-400" },
    { name: "Other Posts", count: locCounts["Other"], color: "from-slate-500 to-slate-400" }
  ];

  // ✨ NEW: 2x2 GOD-MODE METRICS MATH
  const dayShiftCount = filteredData.filter(d => (d.shift || '').includes('Day')).length;
  const leaveCount = filteredData.filter(d => (d.shift || '').includes('Off')).length;
  const rogueCount = filteredData.filter(d => d.location === 'Other').length;
  
  const sitePopulation = {};
  filteredData.forEach(d => { sitePopulation[d.site] = (sitePopulation[d.site] || 0) + 1; });
  const top5Sites = Object.entries(sitePopulation).sort((a, b) => b[1] - a[1]).slice(0, 5);
  
  // 🟢 4. THE EXCEL EXPORT MAGIC WAND
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
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-none">{activeTab === 'deployments' ? 'Deployment Command' : 'Global Contacts'}</h1>
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

        <div className="flex-1 overflow-auto p-4 sm:p-6 custom-scrollbar">
          
          {/* ===================================== */}
          {/* 🎯 TAB: DEPLOYMENT MATRIX VIEW (COMMAND CENTER) */}
          {/* ===================================== */}
          {activeTab === 'deployments' && (
            <>
              {/* ✨ THE VIP SWITCH */}
              <div className="mb-6 flex justify-center sm:justify-start">
                <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner w-full sm:w-auto">
                  <button onClick={() => setSiteTier('All')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${siteTier === 'All' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>All 55</button>
                  <button onClick={() => setSiteTier('Commissioned')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${siteTier === 'Commissioned' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'}`}>26 VIP</button>
                  <button onClick={() => setSiteTier('Project')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${siteTier === 'Project' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Projects</button>
                </div>
              </div>

              {/* ✨ RESPONSIVE KPI CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                   <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Users size={12}/> Boots on Ground</p>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white">{totalBoots}</h3>
                </div>
                
                {/* ✨ THE NEW AWOL PHANTOM ROSTER CARD (WITH SECRET HOVER DROP!) */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-visible group cursor-help z-20">
                   <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-xl transition-all ${awolSites.length === 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10 group-hover:bg-rose-500/20'}`}></div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                     <Monitor size={12} className={awolSites.length === 0 ? "text-emerald-500" : "text-rose-500"}/> Reporting Pulse
                   </p>
                   <h3 className={`text-3xl font-black ${awolSites.length === 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
                     {awolSites.length} <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Sites Missing</span>
                   </h3>
                   
                   {/* 🕵️‍♀️ THE MAGIC HOVER REVEAL MENU (NOW SHOWS BOTH!) */}
                   <div className="absolute top-full left-0 w-64 sm:w-72 mt-2 bg-slate-900 dark:bg-slate-950 border border-slate-700 shadow-2xl rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 max-h-56 overflow-y-auto custom-scrollbar translate-y-2 group-hover:translate-y-0 flex gap-4">
                     
                     {/* 🚨 Missing Column */}
                     <div className="flex-1">
                       <p className="text-[9px] text-rose-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-700 pb-1 sticky top-0 bg-slate-900 dark:bg-slate-950 z-10">Missing ({awolSites.length})</p>
                       <ul className="space-y-1.5">
                         {awolSites.map(site => (
                           <li key={`awol-${site}`} className="text-[10px] font-medium text-slate-300 flex items-center gap-1.5 before:content-[''] before:w-1.5 before:h-1.5 before:bg-rose-500 before:rounded-full before:shadow-[0_0_5px_rgba(244,63,94,0.8)] truncate">{site}</li>
                         ))}
                         {awolSites.length === 0 && <li className="text-[9px] text-slate-500 italic">None! 🎉</li>}
                       </ul>
                     </div>

                     {/* 🟢 Present Column */}
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

                {/* ✨ THE NEW MTCC ACTIVE NODES CARD (WITH SECRET HOVER!) */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-visible group cursor-help z-10">
                   <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Target size={12} className="text-amber-500"/> MTCC Active Nodes</p>
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
                
                {/* ✨ THE PRO ENTERPRISE HISTOGRAM! */}
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
                           
                           {/* ✨ THE HORIZONTAL TEXT! */}
                           <span className="absolute -bottom-10 w-16 sm:w-20 text-center text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-[1.1] drop-shadow-sm flex flex-col items-center justify-start">
                             {loc.name}
                           </span>
                         </div>
                       );
                     })}
                   </div>
                </div>

                {/* ✨ THE NEW 2x2 GOD-MODE METRICS GRID! */}
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

                  {/* ✨ THE COMPLIANCE RADAR CARD (4-in-1!) */}
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
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px] sm:min-w-[250px] relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search Guard Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  <FilterSelect label="Date" value={filterDate} onChange={setFilterDate} type="date" />
                  <FilterSelect label="State" value={filterState} onChange={(e) => { setFilterState(e); setFilterSite("All"); }} options={Object.keys(SITES_BY_STATE).sort()} />
                  <FilterSelect label="Site" value={filterSite} onChange={setFilterSite} options={[...availableSites].sort()} />
                  <FilterSelect label="Shift" value={filterShift} onChange={setFilterShift} options={["Day Shift", "Night Shift"]} />
                  <FilterSelect label="Role" value={filterDesignation} onChange={setFilterDesignation} options={["SS", "SG"]} />
                  {/* ✨ LOCATION FILTER BUILT RIGHT IN! */}
                  <FilterSelect label="Loc" value={filterLocation} onChange={setFilterLocation} options={LOCATIONS} />
                  
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 ml-auto">
                    <button onClick={exportToCSV} className="text-xs font-black tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 transform hover:-translate-y-0.5">
                      <Download size={14} /> EXPORT
                    </button>
                    <button onClick={() => { setFilterState("All"); setFilterSite("All"); setFilterDate(new Date().toISOString().split('T')[0]); setFilterShift("All"); setFilterDesignation("All"); setFilterLocation("All"); setSearchTerm(""); }} className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-4 py-2.5 rounded-xl transition-colors hover:bg-slate-300 dark:hover:bg-slate-700">
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