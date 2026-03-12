import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  Plus, Trash2, Calendar, MapPin, Users, Shield, LogOut, ShieldCheck, Droplet, Wind,Globe2, Truck,
  Filter, CheckCircle, Smartphone, Monitor, Activity,  Leaf, Zap,Eye, EyeOff, Clock,BarChart2, PieChart, TrendingUp, Target, Megaphone, Send, Radio, BellRing, CheckCheck, 
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

// ==========================================
// 🌍 THE MULTI-LINGUAL TRANSLATION BRAIN (UPGRADED FOR V2.0!)
// ==========================================
// 🌍 THE MULTI-LINGUAL TRANSLATION BRAIN
// ==========================================
const TRANSLATIONS = {
  en: {
    hub: { title: "Security Dashboard", apps: "Secure Apps", dep: "Daily Deployment", inc: "Incident Report", mis: "MIS Report", misSub: "Submit Ledger", leave: "Leave", leaveSub: "Request Leaves", notice: "Notice", noticeSub: "Directives", overview: "Overview", nh: "Night Hault", nhSub: "Silent Hour Veh. Log" },
    nav: { back: "Back", newEntry: "New Entry", viewLogs: "View Logs", clear: "CLEAR", dateFilter: "Date Filter" },
    dep: { clone: "Copy Yesterday's Deployment", date: "Deployment Date", shift: "Shift", desig: "Designation", name: "Full Name", phone: "Phone No.", loc: "Location", customLoc: "Specify sector exactly...", addAnother: "Add another", submit: "SUBMIT DEPLOYMENT", encrypting: "ENCRYPTING...", recorded: "RECORDED", noLogs: "No deployment logs found for this date.", secData: "Security Data", day: "Day Shift", night: "Night Shift", off: "Weekly Off" },
    inc: { title: "Incident Report", subtitle: "Direct uplink to Command Center.", type: "Incident Type / Name", occDate: "Occurrence Date & Time", repBy: "Reported By", ep: "EP Number", site: "Site Name", pin: "Pincode", exactLoc: "Location of Incident", details: "Details of Incident", findings: "Findings", action: "Action Taken", reco: "Follow-up & Recommendations", photo: "Photographic Evidence", attach: "Attach", submit: "SUBMIT REPORT", adminSeen: "Admin Acknowledged", pending: "Pending Review", timeOcc: "Time Occurred", timeRep: "Time Reported", copyWA: "COPY FOR WHATSAPP", copyFull: "Copy Full Report", noInc: "No incidents found for this date.", encrypting: "ENCRYPTING UPLINK...", 
      phType: "e.g. Theft, Fire, Breach...", phRepBy: "Officer Name", phEp: "ID Number", phPin: "Code", phLoc: "Specific spot on site...", phDetails: "What exactly happened? Provide full context.", phFindings: "Investigative findings...", phAction: "Immediate response deployed...", phReco: "Suggested protocols to prevent recurrence..."
    },
    mis: { selectDates: "Select MIS Report Dates", dateFrom: "Date From", dateTo: "Date To", register: "Official Register", submit: "SUBMIT Report", syncing: "SYNCING...", decrypting: "Decrypting Ledgers...", viewMaster: "View Master", editResend: "Edit / Resend", noLedgers: "No weekly ledgers found.", delete: "Delete Ledger", download: "Download .CSV" },
    filter: { today: "Today", yesterday: "Yesterday", last7: "Last 7 Days", thisMonth: "This Month", last90: "Last 90 Days", clearAll: "Clear All", custom: "Custom Date Selection", from: "From Date", to: "To Date (Optional Range)", apply: "Apply Filter" },
    nh: { date: "Report Date", vehNo: "Vehicle Number", material: "Material", loc: "Location", purpose: "Purpose", addVeh: "Add Another Vehicle", submit: "Submit Report", markNil: "Declare NIL (0 Vehicles)", enc: "Transmitting..." }
  },
  hi: {
    hub: { title: "सुरक्षा डैशबोर्ड", apps: "सिक्योर ऐप्स", dep: "डेली ड्यूटी (Deployment)", inc: "घटना रिपोर्ट (Incident)", mis: "MIS रिपोर्ट", misSub: "लेजर सबमिट करें", leave: "छुट्टी", leaveSub: "छुट्टी का आवेदन", notice: "सूचना", noticeSub: "कमांड निर्देश", overview: "अवलोकन", nh: "नाइट हॉल्ट", nhSub: "साइलेंट ऑवर रिपोर्ट" },
    nav: { back: "पीछे", newEntry: "नई एंट्री", viewLogs: "पुराने लॉग्स", clear: "साफ़ करें", dateFilter: "तारीख चुनें" },
    dep: { clone: "कल की ड्यूटी कॉपी करें", date: "ड्यूटी की तारीख", shift: "शिफ्ट", desig: "पद ", name: "पूरा नाम", phone: "मोबाइल नंबर", loc: "लोकेशन", customLoc: "लोकेशन का नाम लिखें...", addAnother: "एक और जोड़ें", submit: "ड्यूटी सबमिट करें", encrypting: "सबमिट हो रहा है...", recorded: "सेव हो गया", noLogs: "इस तारीख की कोई ड्यूटी नहीं मिली।", secData: "सुरक्षा गार्ड डेटा", day: "डे शिफ्ट (Day)", night: "नाईट शिफ्ट (Night)", off: "वीकली ऑफ (Off)" },
    inc: { title: "घटना रिपोर्ट", subtitle: "कमांड सेंटर को डायरेक्ट रिपोर्ट।", type: "घटना का प्रकार / नाम", occDate: "घटना की तारीख और समय", repBy: "रिपोर्ट करने वाले का नाम", ep: "EP नंबर", site: "साइट का नाम", pin: "पिनकोड", exactLoc: "घटना की सटीक लोकेशन", details: "घटना की पूरी जानकारी", findings: "जांच के नतीजे (Findings)", action: "क्या एक्शन लिया गया", reco: "सुझाव (Recommendations)", photo: "फोटो / सबूत", attach: "फोटो जोड़ें", submit: "रिपोर्ट सबमिट करें", adminSeen: "एडमिन ने देख लिया", pending: "अभी पेंडिंग है", timeOcc: "घटना का समय", timeRep: "रिपोर्ट करने का समय", copyWA: "WA कॉपी", copyFull: "पूरी रिपोर्ट कॉपी करें", noInc: "इस तारीख की कोई घटना नहीं मिली।", encrypting: "रिपोर्ट जा रही है...",
      phType: "जैसे: चोरी, आग, लड़ाई...", phRepBy: "ऑफिसर का नाम", phEp: "आईडी नंबर", phPin: "पिनकोड", phLoc: "साइट पर किस जगह...", phDetails: "क्या हुआ था? पूरी जानकारी दें।", phFindings: "जांच में क्या पता चला...", phAction: "तुरंत क्या कदम उठाए गए...", phReco: "आगे से रोकने के सुझाव..."
    },
    mis: { selectDates: "MIS रिपोर्ट की तारीख चुनें", dateFrom: "कब से (From)", dateTo: "कब तक (To)", register: "ऑफिशियल रजिस्टर", submit: "रिपोर्ट सबमिट करें", syncing: "सिंक हो रहा है...", decrypting: "लेजर लोड हो रहा है...", viewMaster: "मास्टर देखें", editResend: "एडिट / रीसेंड", noLedgers: "कोई MIS लेजर नहीं मिला।", delete: "डिलीट करें", download: "CSV डाउनलोड करें" },
    filter: { today: "आज", yesterday: "कल (बीता हुआ)", last7: "पिछले 7 दिन", thisMonth: "इस महीने", last90: "पिछले 90 दिन", clearAll: "सब साफ़ करें", custom: "तारीख चुनें", from: "कब से", to: "कब तक (वैकल्पिक)", apply: "फ़िल्टर लगाएं" },
    nh: { date: "रिपोर्ट की तारीख", vehNo: "गाड़ी नंबर", material: "मटेरियल", loc: "लोकेशन", purpose: "उद्देश्य", addVeh: "एक और गाड़ी जोड़ें", submit: "रिपोर्ट सबमिट करें", markNil: "NIL घोषित करें (0 गाड़ियां)", enc: "सबमिट हो रहा है..." }
  },
  mr: {
    hub: { title: "सुरक्षा डॅशबोर्ड", apps: "सिक्योर ॲप्स", dep: "डेली ड्युटी (Deployment)", inc: "घटना रिपोर्ट (Incident)", mis: "MIS रिपोर्ट", misSub: "लेजर सबमिट करा", leave: "सुट्टी", leaveSub: "सुट्टीचा अर्ज", notice: "सूचना", noticeSub: "कमांड निर्देश", overview: "आढावा" },
    nav: { back: "मागे", newEntry: "नवीन एंट्री", viewLogs: "जुने लॉग्स", clear: "क्लिअर", dateFilter: "तारीख निवडा" },
    dep: { clone: "कालची ड्युटी कॉपी करा", date: "ड्युटीची तारीख", shift: "शिफ्ट", desig: "पद", name: "पूर्ण नाव", phone: "मोबाईल नंबर", loc: "लोकेशन", customLoc: "लोकेशनचे नाव लिहा...", addAnother: "आणखी एक जोडा", submit: "ड्युटी सबमिट करा", encrypting: "सबमिट होत आहे...", recorded: "सेव्ह झाले", noLogs: "या तारखेची कोणतीही ड्युटी आढळली नाही.", secData: "सुरक्षा रक्षक डेटा", day: "डे शिफ्ट (Day)", night: "नाईट शिफ्ट (Night)", off: "वीकली ऑफ (Off)" },
    inc: { title: "घटना रिपोर्ट", subtitle: "कमांड सेंटरला डायरेक्ट रिपोर्ट.", type: "घटनेचा प्रकार / नाव", occDate: "घटनेची तारीख आणि वेळ", repBy: "रिपोर्ट करणाऱ्याचे नाव", ep: "EP नंबर", site: "साईटचे नाव", pin: "पिनकोड", exactLoc: "घटनेची नेमकी लोकेशन", details: "घटनेची संपूर्ण माहिती", findings: "तपासाचे निष्कर्ष (Findings)", action: "काय ॲक्शन घेतली", reco: "सूचना (Recommendations)", photo: "फोटो / पुरावा", attach: "फोटो जोडा", submit: "रिपोर्ट सबमिट करा", adminSeen: "ॲडमिनने पाहिले", pending: "अजून पेंडिंग आहे", timeOcc: "घटनेची वेळ", timeRep: "रिपोर्ट केल्याची वेळ", copyWA: "WA कॉपी", copyFull: "संपूर्ण रिपोर्ट कॉपी करा", noInc: "या तारखेची कोणतीही घटना आढळली नाही.", encrypting: "रिपोर्ट जात आहे...",
      phType: "उदा: चोरी, आग, भांडण...", phRepBy: "अधिकाऱ्याचे नाव", phEp: "आयडी क्रमांक", phPin: "पिनकोड", phLoc: "नेमकी कोणती जागा...", phDetails: "नेमके काय घडले? संपूर्ण माहिती द्या.", phFindings: "तपासात काय आढळले...", phAction: "त्वरित काय कारवाई केली...", phReco: "पुढे असे घडू नये म्हणून सूचना..."
    },
    mis: { selectDates: "MIS रिपोर्टची तारीख निवडा", dateFrom: "कधीपासून (From)", dateTo: "कधीपर्यंत (To)", register: "ऑफिशियल रजिस्टर", submit: "रिपोर्ट सबमिट करा", syncing: "सिंक होत आहे...", decrypting: "लेजर लोड होत आहे...", viewMaster: "मास्टर पहा", editResend: "एडिट / रीसेंड", noLedgers: "कोणतेही MIS लेजर आढळले नाही.", delete: "डिलीट करा", download: "CSV डाउनलोड करा" },
    filter: { today: "आज", yesterday: "काल", last7: "मागील 7 दिवस", thisMonth: "या महिन्यात", last90: "मागील 90 दिवस", clearAll: "सर्व क्लिअर करा", custom: "तारीख निवडा", from: "कधीपासून", to: "कधीपर्यंत (पर्यायी)", apply: "फिल्टर लावा" }
  },
  te: {
    hub: { title: "సెక్యూరిటీ డాష్‌బోర్డ్", apps: "సెక్యూర్ యాప్స్", dep: "డైలీ డ్యూటీ (Deployment)", inc: "సంఘటన రిపోర్ట్ (Incident)", mis: "MIS రిపోర్ట్", misSub: "లెడ్జర్ సబ్మిట్ చేయండి", leave: "సెలవు", leaveSub: "సెలవు దరఖాస్తు", notice: "నోటీసు", noticeSub: "కమాండ్ సూచనలు", overview: "అవలోకనం" },
    nav: { back: "వెనుకకు", newEntry: "కొత్త ఎంట్రీ", viewLogs: "పాత లాగ్స్", clear: "క్లియర్", dateFilter: "తేదీ ఎంచుకోండి" },
    dep: { clone: "నిన్నటి డ్యూటీ కాపీ చేయండి", date: "డ్యూటీ తేదీ", shift: "షిఫ్ట్", desig: "హోదా", name: "పూర్తి పేరు", phone: "మొబైల్ నంబర్", loc: "లోకేషన్", customLoc: "లోకేషన్ పేరు రాయండి...", addAnother: "ఇంకొకటి జోడించండి", submit: "డ్యూటీ సబ్మిట్ చేయండి", encrypting: "సబ్మిట్ అవుతోంది...", recorded: "సేవ్ చేయబడింది", noLogs: "ఈ తేదీకి డ్యూటీ రికార్డ్ లేదు.", secData: "సెక్యూరిటీ గార్డ్ డేటా", day: "డే షిఫ్ట్ (Day)", night: "నైట్ షిఫ్ట్ (Night)", off: "వీక్లీ ఆఫ్ (Off)" },
    inc: { title: "సంఘటన రిపోర్ట్", subtitle: "కమాండ్ సెంటర్‌కు డైరెక్ట్ రిపోర్ట్.", type: "సంఘటన రకం / పేరు", occDate: "సంఘటన తేదీ మరియు సమయం", repBy: "రిపోర్ట్ చేసినవారి పేరు", ep: "EP నంబర్", site: "సైట్ పేరు", pin: "పిన్‌కోడ్", exactLoc: "సంఘటన జరిగిన ప్రదేశం", details: "సంఘటన పూర్తి వివరాలు", findings: "పరిశోధనలు (Findings)", action: "తీసుకున్న చర్య", reco: "సూచనలు (Recommendations)", photo: "ఫోటో / ఆధారం", attach: "ఫోటో జోడించండి", submit: "రిపోర్ట్ సబ్మిట్ చేయండి", adminSeen: "అడ్మిన్ చూశారు", pending: "ఇంకా పెండింగ్‌లో ఉంది", timeOcc: "సంఘటన సమయం", timeRep: "రిపోర్ట్ చేసిన సమయం", copyWA: "WA కాపీ", copyFull: "పూర్తి రిపోర్ట్ కాపీ చేయండి", noInc: "ఈ తేదీకి ఎలాంటి సంఘటన లేదు.", encrypting: "అప్‌లోడ్ అవుతోంది...",
      phType: "ఉదా: దొంగతనం, అగ్నిప్రమాదం...", phRepBy: "ఆఫీసర్ పేరు", phEp: "ID నంబర్", phPin: "పిన్‌కోడ్", phLoc: "కచ్చితమైన ప్రదేశం...", phDetails: "ఏం జరిగింది? పూర్తి వివరాలు రాయండి.", phFindings: "విచారణలో ఏం తేలింది...", phAction: "వెంటనే తీసుకున్న చర్యలు...", phReco: "మళ్లీ జరగకుండా సూచనలు..."
    },
    mis: { selectDates: "MIS రిపోర్ట్ తేదీని ఎంచుకోండి", dateFrom: "ఎప్పటినుండి (From)", dateTo: "ఎప్పటివరకు (To)", register: "అధికారిక రిజిస్టర్", submit: "రిపోర్ట్ సబ్మిట్ చేయండి", syncing: "సింక్ అవుతోంది...", decrypting: "లెడ్జర్ లోడ్ అవుతోంది...", viewMaster: "మాస్టర్ చూడండి", editResend: "ఎడిట్ / రీసెండ్", noLedgers: "ఎలాంటి MIS లెడ్జర్ లేదు.", delete: "డిలీట్ చేయండి", download: "CSV డౌన్‌లోడ్" },
    filter: { today: "నేడు", yesterday: "నిన్న", last7: "గత 7 రోజులు", thisMonth: "ఈ నెల", last90: "గత 90 రోజులు", clearAll: "అన్నీ క్లియర్ చేయండి", custom: "తేదీ ఎంచుకోండి", from: "నుండి", to: "వరకు (ఐచ్ఛికం)", apply: "ఫిల్టర్ చేయండి" }
  },
  pa: {
    hub: { title: "ਸੁਰੱਖਿਆ ਡੈਸ਼ਬੋਰਡ", apps: "ਸੁਰੱਖਿਅਤ ਐਪਸ", dep: "ਰੋਜ਼ਾਨਾ ਡਿਊਟੀ (Deployment)", inc: "ਘਟਨਾ ਰਿਪੋਰਟ (Incident)", mis: "MIS ਰਿਪੋਰਟ", misSub: "ਲੇਜਰ ਜਮ੍ਹਾਂ ਕਰੋ", leave: "ਛੁੱਟੀ", leaveSub: "ਛੁੱਟੀ ਦੀ ਅਰਜ਼ੀ", notice: "ਨੋਟਿਸ", noticeSub: "ਕਮਾਂਡ ਨਿਰਦੇਸ਼", overview: "ਸੰਖੇਪ ਜਾਣਕਾਰੀ" },
    nav: { back: "ਪਿੱਛੇ", newEntry: "ਨਵੀਂ ਐਂਟਰੀ", viewLogs: "ਪੁਰਾਣੇ ਲੌਗ", clear: "ਸਾਫ਼ ਕਰੋ", dateFilter: "ਤਾਰੀਖ ਚੁਣੋ" },
    dep: { clone: "ਕੱਲ੍ਹ ਦੀ ਡਿਊਟੀ ਕਾਪੀ ਕਰੋ", date: "ਡਿਊਟੀ ਦੀ ਤਾਰੀਖ", shift: "ਸ਼ਿਫਟ", desig: "ਅਹੁਦਾ ", name: "ਪੂਰਾ ਨਾਮ", phone: "ਮੋਬਾਈਲ ਨੰਬਰ", loc: "ਲੋਕੇਸ਼ਨ", customLoc: "ਲੋਕੇਸ਼ਨ ਦਾ ਨਾਮ ਲਿਖੋ...", addAnother: "ਇੱਕ ਹੋਰ ਜੋੜੋ", submit: "ਡਿਊਟੀ ਜਮ੍ਹਾਂ ਕਰੋ", encrypting: "ਜਮ੍ਹਾਂ ਹੋ ਰਿਹਾ ਹੈ...", recorded: "ਸੇਵ ਹੋ ਗਿਆ", noLogs: "ਇਸ ਤਾਰੀਖ ਦੀ ਕੋਈ ਡਿਊਟੀ ਨਹੀਂ ਮਿਲੀ।", secData: "ਸੁਰੱਖਿਆ ਡੇਟਾ", day: "ਡੇ ਸ਼ਿਫਟ (Day)", night: "ਨਾਈਟ ਸ਼ਿਫਟ (Night)", off: "ਵੀਕਲੀ ਆਫ (Off)" },
    inc: { title: "ਘਟਨਾ ਰਿਪੋਰਟ", subtitle: "ਕਮਾਂਡ ਸੈਂਟਰ ਨੂੰ ਸਿੱਧੀ ਰਿਪੋਰਟ।", type: "ਘਟਨਾ ਦੀ ਕਿਸਮ / ਨਾਮ", occDate: "ਘਟਨਾ ਦੀ ਤਾਰੀਖ ਅਤੇ ਸਮਾਂ", repBy: "ਰਿਪੋਰਟ ਕਰਨ ਵਾਲੇ ਦਾ ਨਾਮ", ep: "EP ਨੰਬਰ", site: "ਸਾਈਟ ਦਾ ਨਾਮ", pin: "ਪਿਨਕੋਡ", exactLoc: "ਘਟਨਾ ਦੀ ਸਹੀ ਲੋਕੇਸ਼ਨ", details: "ਘਟਨਾ ਦੀ ਪੂਰੀ ਜਾਣਕਾਰੀ", findings: "ਜਾਂਚ ਦੇ ਨਤੀਜੇ (Findings)", action: "ਕੀ ਕਾਰਵਾਈ ਕੀਤੀ ਗਈ", reco: "ਸੁਝਾਅ (Recommendations)", photo: "ਫੋਟੋ / ਸਬੂਤ", attach: "ਫੋਟੋ ਜੋੜੋ", submit: "ਰਿਪੋਰਟ ਜਮ੍ਹਾਂ ਕਰੋ", adminSeen: "ਐਡਮਿਨ ਨੇ ਦੇਖ ਲਿਆ", pending: "ਅਜੇ ਪੈਂਡਿੰਗ ਹੈ", timeOcc: "ਘਟਨਾ ਦਾ ਸਮਾਂ", timeRep: "ਰਿਪੋਰਟ ਕਰਨ ਦਾ ਸਮਾਂ", copyWA: "WA ਕਾਪੀ", copyFull: "ਪੂਰੀ ਰਿਪੋਰਟ ਕਾਪੀ ਕਰੋ", noInc: "ਇਸ ਤਾਰੀਖ ਦੀ ਕੋਈ ਘਟਨਾ ਨਹੀਂ ਮਿਲੀ।", encrypting: "ਅੱਪਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
      phType: "ਜਿਵੇਂ: ਚੋਰੀ, ਅੱਗ, ਲੜਾਈ...", phRepBy: "ਅਫਸਰ ਦਾ ਨਾਮ", phEp: "ਆਈਡੀ ਨੰਬਰ", phPin: "ਪਿਨਕੋਡ", phLoc: "ਸਾਈਟ 'ਤੇ ਕਿਹੜੀ ਜਗ੍ਹਾ...", phDetails: "ਕੀ ਹੋਇਆ ਸੀ? ਪੂਰੀ ਜਾਣਕਾਰੀ ਦਿਓ।", phFindings: "ਜਾਂਚ ਵਿੱਚ ਕੀ ਪਤਾ ਲੱਗਾ...", phAction: "ਤੁਰੰਤ ਕੀ ਕਾਰਵਾਈ ਕੀਤੀ ਗਈ...", phReco: "ਅੱਗੇ ਤੋਂ ਰੋਕਣ ਲਈ ਸੁਝਾਅ..."
    },
    mis: { selectDates: "MIS ਰਿਪੋਰਟ ਦੀ ਤਾਰੀਖ ਚੁਣੋ", dateFrom: "ਕਦੋਂ ਤੋਂ (From)", dateTo: "ਕਦੋਂ ਤੱਕ (To)", register: "ਅਧਿਕਾਰਤ ਰਜਿਸਟਰ", submit: "ਰਿਪੋਰਟ ਜਮ੍ਹਾਂ ਕਰੋ", syncing: "ਸਿੰਕ ਹੋ ਰਿਹਾ ਹੈ...", decrypting: "ਲੇਜਰ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", viewMaster: "ਮਾਸਟਰ ਦੇਖੋ", editResend: "ਐਡਿਟ / ਰੀਸੈਂਡ", noLedgers: "ਕੋਈ MIS ਲੇਜਰ ਨਹੀਂ ਮਿਲਿਆ।", delete: "ਮਿਟਾਓ", download: "CSV ਡਾਊਨਲੋਡ" },
    filter: { today: "ਅੱਜ", yesterday: "ਕੱਲ੍ਹ", last7: "ਪਿਛਲੇ 7 ਦਿਨ", thisMonth: "ਇਸ ਮਹੀਨੇ", last90: "ਪਿਛਲੇ 90 ਦਿਨ", clearAll: "ਸਭ ਸਾਫ਼ ਕਰੋ", custom: "ਤਾਰੀਖ ਚੁਣੋ", from: "ਕਦੋਂ ਤੋਂ", to: "ਕਦੋਂ ਤੱਕ (ਵਿਕਲਪਿਕ)", apply: "ਫਿਲਟਰ ਲਗਾਓ" }
  }
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

// ✨ NEW: Converts ANY Cloud UTC timestamp directly into a clean YYYY-MM-DD IST string!
const getISTDateString = (utcTimestamp) => {
  if (!utcTimestamp) return "";
  const d = new Date(utcTimestamp);
  if (isNaN(d.getTime())) return "";
  const istString = d.toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
  const istDate = new Date(istString);
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 👑 THE MASTER APP COMPONENT STARTS HERE!
export default function App() {
  // 🧠 OUR NEW DYNAMIC SITES BRAIN
  const [globalSites, setGlobalSites] = useState([]);

  // ✨ THE OPERATIONAL LISTS: These MUST sit right here so the whole app can see them!
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
  const [broadcasts, setBroadcasts] = useState([]); // 📢 The Directives
  const [acks, setAcks] = useState([]); // 🧾 The Receipts
  const [nightHaults, setNightHaults] = useState([]); // 🚛 The Silent Hour App
  // ✨ NIGHT HAULT GOD-MODE CONTROLS
  const [editingNightHault, setEditingNightHault] = useState(null);
  const [deletingNightHault, setDeletingNightHault] = useState(null);

  const saveNightHaultEdit = async (updatedRecord) => {
    const { id, created_at, ...updateData } = updatedRecord;
    const { error } = await supabase.from('night_haults').update(updateData).eq('id', id);
    if (error) alert(`Vault Rejection: ${error.message}`);
    else {
      fetchNightHaults();
      setEditingNightHault(null);
    }
  };

  const confirmDeleteNightHault = async () => {
    if (!deletingNightHault) return;
    const { error } = await supabase.from('night_haults').delete().eq('id', deletingNightHault.id);
    if (error) alert(`Vault Error: ${error.message}`);
    else {
      fetchNightHaults();
      setDeletingNightHault(null);
    }
  };

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
      fetchWeeklyReports();
      if (userProfile.role === 'admin') fetchContacts();
    }
  }, [userProfile]);

  // ✨ NEW: THE UNIVERSAL SYNC ENGINE!
  const fetchBroadcasts = async () => {
    const [bRes, aRes] = await Promise.all([
      supabase.from('broadcasts').select('*').order('created_at', { ascending: false }),
      supabase.from('broadcast_acknowledgments').select('*')
    ]);
    if (bRes.data) setBroadcasts(bRes.data);
    if (aRes.data) setAcks(aRes.data);
  };

  const handleGlobalSync = async () => {
    setIsLoadingData(true); 
    await Promise.all([
      fetchDeployments(), fetchIncidents(), fetchWeeklyReports(), fetchSites(), fetchBroadcasts(),fetchNightHaults(),
      userProfile?.role === 'admin' ? fetchContacts() : Promise.resolve()
    ]);
    setIsLoadingData(false); 
  };

  // Also make sure fetchBroadcasts runs on boot!
  useEffect(() => {
    if (userProfile) {
      fetchDeployments(); fetchIncidents(); fetchWeeklyReports(); fetchBroadcasts(); fetchNightHaults();
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

  // ✨ NEW: FETCH NIGHT HAULT ENGINE
  const fetchNightHaults = async () => {
    let query = supabase.from('night_haults').select('*').order('created_at', { ascending: false });
    if (userProfile.role === 'supervisor') query = query.eq('site', userProfile.site);
    const { data } = await query;
    if (data) setNightHaults(data);
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

  // ✨ FAANG FILE-EXPLORER QUICK MOVE ENGINE!
  const quickUpdateContact = async (id, updateData) => {
    const { data, error } = await supabase.from('contacts').update(updateData).eq('id', id).select();
    if (!error && data) setContacts(contacts.map(c => c.id === id ? data[0] : c));
    else if (error) alert(`Vault Rejection: ${error.message}`);
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
              nightHaults={nightHaults} // 👈 ADD THIS!
              onEditNightHault={setEditingNightHault}
              onDeleteNightHault={setDeletingNightHault}
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
              onQuickUpdateContact={quickUpdateContact} // 👈 ADD THIS NEW LINE HERE!
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
              onSync={handleGlobalSync}
              broadcasts={broadcasts} 
              acks={acks} 
              fetchBroadcasts={fetchBroadcasts}
            />
          ) : (
        <SupervisorMobileView userProfile={userProfile} deployments={deployments} incidents={incidents} weeklyReports={weeklyReports} nightHaults={nightHaults} isLoading={isLoadingData} fetchDeployments={fetchDeployments} fetchIncidents={fetchIncidents} fetchWeeklyReports={fetchWeeklyReports} fetchNightHaults={fetchNightHaults} onEditWeekly={setEditingWeekly} onEditNightHault={setEditingNightHault} onDeleteNightHault={setDeletingNightHault} onLogout={handleInstantLogout} onEdit={setEditingRecord} onDelete={setDeletingRecord} onView={setViewingRecord} onToggleAck={toggleIncidentStatus} onDeleteIncident={deleteIncident} onAddContact={() => setEditingContact({ name: '', phone: '', designation: 'SS - Security Supervisor', state_name: '', site: '', email: '', company: '' })} onEditContact={setEditingContact} onDeleteContact={setDeletingContact} theme={theme} toggleTheme={toggleTheme} broadcasts={broadcasts} acks={acks} fetchBroadcasts={fetchBroadcasts} />          )}
        </div>
          {/* Modals for Deployments */}
        {editingRecord && <EditModal record={editingRecord} onClose={() => setEditingRecord(null)} onSave={saveEdit} />}
        {deletingRecord && <DeleteModal record={deletingRecord} onClose={() => setDeletingRecord(null)} onConfirm={confirmDelete} type="deployment" />}
        {viewingRecord && <ViewModal record={viewingRecord} onClose={() => setViewingRecord(null)} />}
        
        {/*   NEW: Modals for Contacts! */}
        {editingContact && <ContactFormModal record={editingContact} onClose={() => setEditingContact(null)} onSave={saveContact} SITES={SITES} SITES_BY_STATE={SITES_BY_STATE} STATE_NAMES={STATE_NAMES} />}           {deletingContact && <DeleteModal record={deletingContact} onClose={() => setDeletingContact(null)} onConfirm={confirmDeleteContact} type="contact" />}
        {viewingContact && <ContactViewModal record={viewingContact} onClose={() => setViewingContact(null)} />}
      
        {editingWeekly && <WeeklyEditModal record={editingWeekly} onClose={() => setEditingWeekly(null)} onSave={updateWeeklyReport} />}
            {/* ✨ NEW: Night Hault Admin Modals! */}
        {editingNightHault && <NightHaultEditModal record={editingNightHault} onClose={() => setEditingNightHault(null)} onSave={saveNightHaultEdit} />}
        {deletingNightHault && <DeleteModal record={deletingNightHault} onClose={() => setDeletingNightHault(null)} onConfirm={confirmDeleteNightHault} type="night hault" />}

      </div>
    </div>
  );
}

// ==========================================
// 🔐 AUTHENTICATION SCREEN (RESPONSIVE FAANG EDITION 📱/💻)
// ==========================================
// ==========================================
// 🔐 AUTHENTICATION SCREEN (RESPONSIVE FAANG EDITION 📱/💻)
// ==========================================
// ==========================================
// 🔐 AUTHENTICATION SCREEN (RESPONSIVE FAANG EDITION 📱/💻)
// ==========================================
function AuthScreen({ theme, toggleTheme, setIsUnlocking }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 🎬 The Cinematic Login States!
  const [loginPhase, setLoginPhase] = useState('idle'); // 'idle' -> 'loading' -> 'unlocked'

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginPhase('loading');
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message);
      setLoginPhase('idle');
    } else {
      setIsUnlocking(true); 
      setLoginPhase('unlocked');
      setTimeout(() => {
        setIsUnlocking(false); 
      }, 2000);
    }
  };

  return (
    <>
      {/* 🧪 THE MASTER CSS ENGINE (Consolidated for pure performance!) */}
      <style>
        {`
          /* The giant unlock pop for the success screen! */
          @keyframes unlock-pop { 
            0% { transform: scale(0.5); opacity: 0; } 
            50% { transform: scale(1.3); opacity: 1; } 
            100% { transform: scale(1.1); opacity: 1; } 
          }
          .animate-unlock-pop { animation: unlock-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

          /* ✨ The glossy button shine! */
          @keyframes button-shine {
            0% { transform: translateX(-150%) skewX(-20deg); }
            100% { transform: translateX(200%) skewX(-20deg); }
          }
          .animate-button-shine { animation: button-shine 3s infinite cubic-bezier(0.4, 0, 0.2, 1); }
        `}
      </style>

      {/* ========================================== */}
      {/* 📱 MOBILE VIEW (Sleek App Card Aesthetic) */}
      {/* ========================================== */}
      <div className={`md:hidden flex flex-col min-h-[100dvh] bg-slate-50 dark:bg-[#020806] transition-all duration-1000 relative ${loginPhase === 'unlocked' ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Top Vibrant Gradient Header */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 h-[40vh] flex flex-col items-center justify-center relative pt-8 pb-12 shrink-0 overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
                    <img src="/logo.webp" alt="Test Logo" className="h-10 sm:h-20 w-auto object-contain drop-shadow-xl transition-transform hover:scale-150" onError={(e) => e.target.style.display='none'} />

           <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                 <ShieldCheck size={20} className="text-white" />
              </div>
           </div>

           <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md mt-4 relative z-10">CBG COMMAND</h1>
           <p className="text-emerald-100/80 text-[10px] font-bold mt-2 tracking-[0.2em] uppercase relative z-10">Secure Portal Access</p>
        </div>

        {/* The Overlapping White Card */}
        <div className="flex-1 bg-white dark:bg-slate-900 -mt-10 rounded-t-[2.5rem] px-6 sm:px-10 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-10 flex flex-col relative border-t border-white/50 dark:border-slate-800">
           <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">Welcome </h2>
           <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-8">Enter your details below</p>

           {errorMsg && (
              <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-bold text-center border border-rose-100 dark:border-rose-500/20 animate-in shake">
                {errorMsg}
              </div>
           )}

           <form onSubmit={handleLogin} className="space-y-5 flex-1 flex flex-col">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Site ID </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loginPhase !== 'idle'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder-slate-400"
                  placeholder="name@company.com"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loginPhase !== 'idle'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-4 pr-12 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder-slate-400"
                    placeholder="••••••••"
                  />
                 
                </div>
              </div>

              <div className="mt-auto pt-6 pb-4">
                {/* ✨ MOBILE GREEN SHINY BUTTON */}
                <button
                  type="submit"
                  disabled={loginPhase !== 'idle'}
                  className={`relative overflow-hidden w-full bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] flex justify-center items-center gap-2 group ${loginPhase !== 'idle' ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/20 to-transparent animate-button-shine pointer-events-none"></div>
                  <span className="relative z-10 flex items-center gap-2 drop-shadow-sm">
                    {loginPhase === 'loading' ? <RefreshCw size={18} className="animate-spin" /> : 'Sign in'}
                  </span>
                </button>

                {/* ✨ OFFICIAL CONTACT BADGE */}
                <div className="mt-6 text-center flex flex-col gap-1.5">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Forgot your password?</span>
                   <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg inline-block w-max mx-auto border border-emerald-100 dark:border-emerald-500/20">Contact Control Room</span>
                </div>
              </div>
           </form>
        </div>
      </div>

      {/* ========================================== */}
      {/* 💻 DESKTOP VIEW (FAANG Minimalist Enterprise) */}
      {/* ========================================== */}
      <div className={`hidden md:flex relative min-h-[100dvh] items-center justify-center overflow-hidden transition-colors duration-1000 ${loginPhase === 'unlocked' ? 'bg-white dark:bg-[#0B1120]' : 'bg-slate-100 dark:bg-[#0B1120]'}`}>

        {/* 🌿 REFINED BACKGROUND 🌿 */}
        <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${loginPhase === 'unlocked' ? 'opacity-0' : 'opacity-100'}`}>
          <img src="/background.webp" alt="Background" className="w-full h-full object-cover opacity-75 dark:opacity-100 saturate-150" onError={(e) => e.target.style.display='none'} />
        </div>

        {/* 🔝 TOP NAVIGATION: Logo & Theme Toggle */}
        <div className={`absolute top-0 left-0 w-full p-8 flex justify-between items-start z-50 transition-opacity duration-500 ${loginPhase === 'unlocked' ? 'opacity-0' : 'opacity-100'}`}>
         <img src="/logo.webp" alt="Test Logo" className="h-10 sm:h-20 w-auto object-contain drop-shadow-xl transition-transform hover:scale-150" onError={(e) => e.target.style.display='none'} />
        </div>

        {/* 💎 CENTERED: THE CLEAN FAANG ACCESS TERMINAL */}
        <div className={`relative w-full max-w-[450px] mx-4 z-10 transition-all duration-1000 ${loginPhase === 'unlocked' ? 'scale-105 opacity-5' : 'scale-100 opacity-100'}`}>
          <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white dark:border-slate-800 rounded-[2rem] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-colors duration-1000">
            
            {/* Hidden Watermark Lock */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden rounded-[2.5rem]">
               <Lock size={280} className="text-slate-200/30 dark:text-slate-700/20 transform -rotate-12 translate-x-10 translate-y-10" />
            </div>
            <div className="flex justify-center mb-8">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200/50 dark:border-slate-700 shadow-sm">
                 <ShieldCheck size={45} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              
            </div>

            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                CBG COMMAND CENTER
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Sign in to your enterprise dashboard
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-center animate-in shake">
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">SITE ID</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loginPhase !== 'idle'}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50/80 dark:bg-[#0B1120]/80 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)]"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1 pr-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">PASSWORD</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loginPhase !== 'idle'}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50/80 dark:bg-[#0B1120]/80 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)]"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                {/* ✨ DESKTOP GREEN SHINY BUTTON */}
                <button
                  type="submit"
                  disabled={loginPhase !== 'idle'}
                  className={`relative overflow-hidden w-full bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-emerald-500/20 group ${loginPhase !== 'idle' ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/20 to-transparent animate-button-shine pointer-events-none"></div>

                  <span className="relative z-10 flex items-center gap-2 drop-shadow-sm">
                    {loginPhase === 'loading' ? (
                      <><RefreshCw size={16} className="animate-spin" /> Verifying...</>
                    ) : (
                      'Sign In'
                    )}
                  </span>
                </button>
              </div>

              {/* ✨ OFFICIAL CONTACT BADGE */}
              <div className="text-center pt-4 flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Forgot your password?
                </span>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg inline-block w-max mx-auto border border-emerald-100 dark:border-emerald-500/20">
                  Contact Control Room
                </span>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🔓 THE GLOBAL UNLOCK ANIMATION (Applies to both views!) */}
      {/* ========================================== */}
      <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center pointer-events-none transition-all duration-700 ${loginPhase === 'unlocked' ? 'opacity-100' : 'opacity-0 scale-50'}`}>
         <div className={`w-32 h-32 bg-emerald-100 dark:bg-emerald-900/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_150px_rgba(16,185,129,0.8)] border-2 border-emerald-400/50 ${loginPhase === 'unlocked' ? 'animate-unlock-pop' : ''}`}>
            <Unlock size={56} className="text-emerald-600 dark:text-emerald-400 drop-shadow-lg" />
         </div>
         <h2 className="mt-8 text-2xl font-black tracking-widest text-emerald-700 dark:text-emerald-400 uppercase drop-shadow-md">Access Granted</h2>
      </div>
    </>
  );
}
// ==========================================
// 📱 SUPERVISOR iOS-STYLE COMMAND HUB + CINEMATIC INTRO
// ==========================================

function SupervisorMobileView({ userProfile, deployments, incidents, weeklyReports, nightHaults, isLoading, fetchDeployments, fetchIncidents, fetchWeeklyReports, fetchNightHaults, onEditWeekly, onLogout, onEdit, onDelete, onView, onDeleteIncident, onEditNightHault,onDeleteNightHault, theme, toggleTheme, broadcasts, acks, fetchBroadcasts }) {
  const [currentApp, setCurrentApp] = useState('hub'); 
  const [appTab, setAppTab] = useState('form'); 

  const [introStage, setIntroStage] = useState(1);
  const [customName, setCustomName] = useState('');
  const [fillerName, setFillerName] = useState('');
// 🚨 ✨ THE BROADCAST GATEKEEPER BRAIN ✨ 🚨
  const [unreadBroadcasts, setUnreadBroadcasts] = useState([]);
  const [isAcking, setIsAcking] = useState(false);
  const [viewingBroadcast, setViewingBroadcast] = useState(null); // ✨ NEW: Pop-View Modal State!
  
  // ✨ NEW: Supervisor Broadcast Filters
  const [broadcastSearch, setBroadcastSearch] = useState('');
  const [broadcastDate, setBroadcastDate] = useState(getISTDate());

  useEffect(() => {
    const fetchBroadcasts = async () => {
      // 1. Grab ALL broadcasts (Oldest first)
      const { data: broadcasts, error: bError } = await supabase
        .from('broadcasts')
        .select('*')
        .order('created_at', { ascending: true });

      // 2. Grab ALL the receipts this specific site has already signed
      const { data: acks, error: aError } = await supabase
        .from('broadcast_acknowledgments')
        .select('broadcast_id')
        .eq('site', userProfile.site);

      if (!bError && !aError && broadcasts) {
        const ackedIds = new Set(acks.map(a => a.broadcast_id));
        
        // ✨ THE GHOST BUSTER: Force the Supervisor's site to UPPERCASE and trim invisible spaces!
        const safeUserSite = (userProfile.site || "").toUpperCase().trim();
        
        // 3. Filter down to ONLY the flashcards they haven't read yet!
        const unread = broadcasts.filter(b => {
          let isTargeted = false;
          try {
            // Unpack the JSON array from Supabase
            const rawTargets = typeof b.target_sites === 'string' ? JSON.parse(b.target_sites) : b.target_sites;
            
            // ✨ BULLETPROOF MATCHING: Force every target site in the list to UPPERCASE and trim!
            const safeTargets = (Array.isArray(rawTargets) ? rawTargets : []).map(t => String(t).toUpperCase().trim());
            
            if (safeTargets.includes('ALL') || safeTargets.includes(safeUserSite)) {
                isTargeted = true;
            }
          } catch(e) { 
              console.error("Broadcast parsing error:", e); 
              isTargeted = false; 
          }
          
          return isTargeted && !ackedIds.has(b.id); // Targeted AND Unread!
        });
        setUnreadBroadcasts(unread);
      }
    };
    
    if (userProfile?.site) fetchBroadcasts();
  }, [userProfile]);

  const handleAcknowledge = async (broadcastId) => {
    setIsAcking(true);
    await supabase.from('broadcast_acknowledgments').insert([{
      broadcast_id: broadcastId,
      site: userProfile.site,
      acknowledged_by: fillerName || userProfile.name
    }]);
    setIsAcking(false);
    // ✨ MAGIC: Slice the top card off the deck! The next one instantly appears!
    setUnreadBroadcasts(prev => prev.filter(b => b.id !== broadcastId));
  };


  const allowedSupervisors = userProfile.name ? userProfile.name.split(',').map(n => n.trim()) : [];

  
  // ✨ THE MULTI-LINGUAL STATE BRAIN!
  const [language, setLanguage] = useState(localStorage.getItem('cbg_lang') || 'en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  const handleLangChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('cbg_lang', lang);
    setShowLangMenu(false);
  };

  useEffect(() => {
    window.history.pushState({ noBackExits: true }, '');
    const handlePopState = (e) => {
      window.history.pushState({ noBackExits: true }, '');
      if (currentApp !== 'hub') setCurrentApp('hub');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentApp]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if(customName.trim().length > 0) selectName(customName.trim());
  };

  useEffect(() => {
    if (introStage === 1) {
      const timer = setTimeout(() => setIntroStage(2), 2500);
      return () => clearTimeout(timer);
    }
  }, [introStage]);

  const selectName = (name) => {
    setFillerName(name.toUpperCase());
    setIntroStage(3); 
    setTimeout(() => setIntroStage(0), 2000); 
  };

  const renderHub = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F2F2F7] dark:bg-black p-5 sm:p-8 space-y-8 animate-in fade-in duration-300 relative">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

      <div className="flex justify-between items-start pt-2 relative z-[999]">
        <div>
          <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{t.hub.overview}</p>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">{fillerName || userProfile.name}</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-indigo-700 dark:text-indigo-300 rounded-full text-base sm:text-base font-black uppercase tracking-wider shadow-md border border-white/40 dark:border-slate-600/50">
            <MapPin size={16} className="text-indigo-500"/> {userProfile.site}
          </div>
        </div>
        
        {/* ✨ THE NEW GLOBE TOGGLE MENU! */}
        <div className="flex gap-2 relative">
          <div className="relative">
            <button onClick={() => setShowLangMenu(!showLangMenu)} className="w-12 h-12 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl text-slate-600 dark:text-slate-300 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-white/50 dark:border-slate-700/50 hover:scale-105 transition-all active:scale-95 text-xl">
              🌍
            </button>
            {showLangMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden w-36 z-50 animate-in fade-in zoom-in-95 duration-200">
                <button onClick={() => handleLangChange('en')} className={`px-4 py-3.5 text-sm font-bold text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${language === 'en' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-700 dark:text-slate-300'}`}>🇺🇸 English</button>
                <button onClick={() => handleLangChange('hi')} className={`px-4 py-3.5 text-sm font-bold text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${language === 'hi' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-700 dark:text-slate-300'}`}>🇮🇳 हिन्दी</button>
                <button onClick={() => handleLangChange('mr')} className={`px-4 py-3.5 text-sm font-bold text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${language === 'mr' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-700 dark:text-slate-300'}`}>🚩 मराठी</button>
                <button onClick={() => handleLangChange('te')} className={`px-4 py-3.5 text-sm font-bold text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${language === 'te' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-700 dark:text-slate-300'}`}>🌺 తెలుగు</button>
                <button onClick={() => handleLangChange('pa')} className={`px-4 py-3.5 text-sm font-bold text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${language === 'pa' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-700 dark:text-slate-300'}`}>🌾 ਪੰਜਾਬੀ</button>
              </div>
            )}
          </div>
          
          <button onClick={toggleTheme} className="w-12 h-12 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl text-slate-600 dark:text-slate-300 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-white/50 dark:border-slate-700/50 hover:scale-105 transition-all active:scale-95">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={onLogout} className="w-12 h-12 flex items-center justify-center bg-rose-50/80 dark:bg-rose-500/10 backdrop-blur-xl text-rose-600 dark:text-rose-400 rounded-full shadow-[0_4px_15px_rgba(244,63,94,0.1)] border border-rose-100/50 dark:border-rose-500/20 hover:scale-105 transition-all active:scale-95">
            <LogOut size={18}/>
          </button>
        </div>
      </div>

      <div className="relative z-10">
        <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 ml-1">{t.hub.apps}</h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setCurrentApp('deployment'); setAppTab('form'); }} className="aspect-square bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/60 dark:border-slate-700/50 flex flex-col items-center justify-center gap-4 transition-all active:scale-[0.96] hover:shadow-lg group">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300"><Users size={28} className="stroke-[1.5]"/></div>
            <span className="block font-bold text-slate-700 dark:text-white text-sm sm:text-base tracking-wide leading-tight px-2 text-center">{t.hub.dep}</span>
          </button>

          <button onClick={() => { setCurrentApp('incident'); setAppTab('form'); }} className="aspect-square bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/60 dark:border-slate-700/50 flex flex-col items-center justify-center gap-4 transition-all active:scale-[0.96] hover:shadow-lg group">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform duration-300"><AlertTriangle size={28} className="stroke-[1.5]"/></div>
            <span className="block font-bold text-slate-700 dark:text-white text-sm sm:text-base tracking-wide leading-tight px-2 text-center">{t.hub.inc}</span>
          </button>

          {/* ✨ Fixed Weekly App to be a square! */}
          <button onClick={() => { setCurrentApp('weekly'); setAppTab('form'); }} className="aspect-square bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/60 dark:border-slate-700/50 flex flex-col items-center justify-center gap-4 transition-all active:scale-[0.96] hover:shadow-lg group">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300"><BookOpen size={28} className="stroke-[1.5]"/></div>
            <span className="block font-bold text-slate-700 dark:text-white text-sm sm:text-base tracking-wide leading-tight px-2 text-center">{t.hub.mis}</span>
          </button>

          {/* ✨ NEW DIRECTIVES INBOX APP! */}
          <button onClick={() => { setCurrentApp('broadcasts'); }} className="aspect-square bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/60 dark:border-slate-700/50 flex flex-col items-center justify-center gap-4 transition-all active:scale-[0.96] hover:shadow-lg group relative overflow-hidden">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300"><Megaphone size={28} className="stroke-[1.5]"/></div>
            <span className="block font-bold text-slate-700 dark:text-white text-sm sm:text-base tracking-wide leading-tight px-2 text-center">Notice</span>
          </button>

          {/* ✨ NEW TIME-OFF APP (Spans 2 columns at the bottom!) */}
          <button onClick={() => { setCurrentApp('leave'); setAppTab('form'); }} className="aspect-square bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/60 dark:border-slate-700/50 flex flex-col items-center justify-center gap-4 transition-all active:scale-[0.96] hover:shadow-lg group">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300"><Calendar size={28} className="stroke-[1.5]"/></div>
            <div className="text-left">
              <span className="block font-bold text-slate-900 dark:text-white text-base tracking-wide leading-tight">{t.hub?.leave || 'Leave'}</span>
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{t.hub?.leaveSub || 'Request Leaves'}</span>
            </div>
          </button>

          {/* ✨ NEW NIGHT HAULT APP! */}
          <button onClick={() => { setCurrentApp('nighthault'); setAppTab('form'); }} className="aspect-square bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/60 dark:border-slate-700/50 flex flex-col items-center justify-center gap-4 transition-all active:scale-[0.96] hover:shadow-lg group relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-slate-800/5 dark:bg-slate-500/10 rounded-full blur-2xl group-hover:bg-slate-800/10 transition-all"></div>
            <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/30 group-hover:scale-110 transition-transform duration-300"><Truck size={28} className="stroke-[1.5]"/></div>
            <span className="block font-bold text-slate-700 dark:text-white text-sm sm:text-base tracking-wide leading-tight px-2 text-center">{t.hub.nh || "Night Hault"}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderModule = () => (
    <div className="flex flex-col h-full bg-[#F2F2F7] dark:bg-black relative">
      <div className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-4 flex items-center gap-4">
        <button onClick={() => setCurrentApp('hub')} className="w-10 h-10 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/20 transition-colors active:scale-90 shrink-0">
          <ArrowLeft size={20}/>
        </button>
        <div className="flex-1">
          <h2 className="font-black text-slate-900 dark:text-white tracking-tight text-lg leading-tight">
            {currentApp === 'deployment' ? t.hub.dep : currentApp === 'incident' ? t.hub.inc : currentApp === 'broadcasts' ? 'Command Directives' : currentApp === 'leave' ? (t.hub?.leave || 'Leave') : currentApp === 'nighthault' ? (t.hub?.nh || 'Night Hault') : t.hub.mis}
          </h2>
          <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
            <MapPin size={12} /> {userProfile.site}
          </p>
        </div>
      </div>

      {/* Only show New Entry/Logs toggle if it's NOT the Directives app! */}
      {currentApp !== 'broadcasts' && (
        <div className="px-4 pt-5 pb-2 shrink-0 z-40 bg-[#F2F2F7] dark:bg-black">
          <div className="bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-md p-1 rounded-[14px] flex relative shadow-inner border border-black/5 dark:border-white/5">
            <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-600 rounded-[10px] shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ transform: appTab === 'form' ? 'translateX(0)' : 'translateX(100%)' }}></div>
            <button onClick={() => setAppTab('form')} className={`flex-1 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors duration-300 relative z-10 ${appTab === 'form' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>{t.nav.newEntry}</button>
            <button onClick={() => setAppTab('history')} className={`flex-1 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors duration-300 relative z-10 ${appTab === 'history' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>{t.nav.viewLogs}</button>
          </div>
        </div>
      )}

      {/* ✨ FIXED: Changed overflow-x-hidden to overflow-visible so the dropdown can escape the mobile frame! */}
      <div key={currentApp + appTab + language} className="flex-1 overflow-y-auto overflow-visible custom-scrollbar pb-10 animate-android-swipe">
        {currentApp === 'deployment' && appTab === 'form' && <DeploymentMobileForm userProfile={userProfile} fetchDeployments={fetchDeployments} setActiveTab={setAppTab} fillerName={fillerName} deployments={deployments} language={language}/>}
        {currentApp === 'deployment' && appTab === 'history' && <SupervisorMobileHistory deployments={deployments} isLoading={isLoading} onEdit={onEdit} onDelete={onDelete} onView={onView} language={language}/>}
        
        {currentApp === 'incident' && appTab === 'form' && <IncidentMobileForm userProfile={userProfile} fetchIncidents={fetchIncidents} setActiveTab={setAppTab} language={language}/>}
        {currentApp === 'incident' && appTab === 'history' && <IncidentMobileHistory incidents={incidents} isLoading={isLoading} language={language}/>}

        {currentApp === 'weekly' && appTab === 'form' && <WeeklyMobileForm userProfile={userProfile} fetchWeeklyReports={fetchWeeklyReports} setActiveTab={setAppTab} language={language}/>}
        {currentApp === 'weekly' && appTab === 'history' && <WeeklyMobileHistory weeklyReports={weeklyReports} isLoading={isLoading} onEditWeekly={onEditWeekly} language={language}/>}
      
        {/* ✨ NEW LEAVE ROUTERS */}
        {currentApp === 'leave' && appTab === 'form' && <LeaveMobileForm userProfile={userProfile} fillerName={fillerName} setActiveTab={setAppTab} />}
        {currentApp === 'leave' && appTab === 'history' && <LeaveMobileHistory userProfile={userProfile} />}

        {/* ✨ NIGHT HAULT ROUTERS */}
        {currentApp === 'nighthault' && appTab === 'form' && <NightHaultMobileForm userProfile={userProfile} fetchNightHaults={fetchNightHaults} setActiveTab={setAppTab} fillerName={fillerName} language={language} />}
        {/* ✨ फिक्स: Supervisor को सही NightHault Edit/Delete प्रॉप्स दे दिए! */}
        {currentApp === 'nighthault' && appTab === 'history' && <NightHaultMobileHistory nightHaults={nightHaults} isLoading={isLoading} language={language} onEdit={onEditNightHault} onDelete={onDeleteNightHault} />}


      {/* ✨ THE NEW DIRECTIVES INBOX LIST */}
        {currentApp === 'broadcasts' && (
          <div className="p-4 space-y-4 pt-4 pb-24">
            
            {/* ✨ NATIVE SUPERVISOR BROADCAST FILTERS */}
            <div className="bg-white dark:bg-[#0B1120] p-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3 mb-2 relative overflow-hidden">
               <div className="flex justify-between items-center">
                 <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Search size={14} className="text-orange-500"/> Search Inbox</span>
                 {(broadcastDate || broadcastSearch) && <button onClick={() => {setBroadcastDate(''); setBroadcastSearch('');}} className="text-[9px] font-black tracking-widest text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-lg hover:bg-orange-100 transition-colors">CLEAR</button>}
               </div>
               <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search..." value={broadcastSearch} onChange={e => setBroadcastSearch(e.target.value)} className="w-full pl-7 pr-2 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-orange-500 shadow-inner text-slate-700 dark:text-slate-300 transition-colors" />
                  </div>
                  <input type="date" value={broadcastDate} onChange={e => setBroadcastDate(e.target.value)} className="w-28 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 shadow-inner [color-scheme:light] dark:[color-scheme:dark]" title="Filter Date" />
               </div>
            </div>

            {(() => {
              const mySite = (userProfile.site || "").toUpperCase().trim();
              const myBroadcasts = broadcasts?.filter(b => {
                let targets = [];
                try { targets = typeof b.target_sites === 'string' ? JSON.parse(b.target_sites) : b.target_sites; } catch(e){}
                const safeTargets = (Array.isArray(targets) ? targets : []).map(t => String(t).toUpperCase().trim());
                const isTargeted = safeTargets.includes('ALL') || safeTargets.includes(mySite);
                
                // ✨ Apply the Date & Search Math! (NOW WITH IST TIMEZONE FIX!)
                const bDateIST = getISTDateString(b.created_at);
                const matchDate = broadcastDate === '' || bDateIST === broadcastDate;
                const q = broadcastSearch.toLowerCase();
                const matchSearch = q === '' || (b.title || '').toLowerCase().includes(q) || (b.message || '').toLowerCase().includes(q);

                return isTargeted && matchDate && matchSearch;
              }).sort((a,b) => new Date(b.created_at) - new Date(a.created_at)) || [];

              if(myBroadcasts.length === 0) return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center flex flex-col items-center shadow-sm">
                  <CheckCircle size={32} className="text-slate-300 dark:text-slate-600 mb-4"/>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{(broadcastDate || broadcastSearch) ? 'No Results' : 'Inbox Zero'}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{(broadcastDate || broadcastSearch) ? 'Try clearing your filters.' : 'No directives at this time.'}</p>
                </div>
              );

              return myBroadcasts.map(broadcast => {
                const hasAck = acks?.some(a => a.broadcast_id === broadcast.id && a.site === userProfile.site);
                return (
                  <div key={broadcast.id} onClick={() => setViewingBroadcast(broadcast)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-5 shadow-sm relative overflow-hidden active:scale-95 transition-all cursor-pointer">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${hasAck ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                    <div className="ml-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-2 border ${hasAck ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400'}`}>
                        {hasAck ? 'Acknowledged' : 'Pending Action'}
                      </span>
                      <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-base mb-1 truncate">{broadcast.title || "Security Alert"}</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(broadcast.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                )
              });
            })()}
          </div>
        )}
      
      </div>
    </div>
  );

  return (
    <div className="w-full flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 sm:bg-slate-200 sm:dark:bg-slate-900 sm:py-10 flex justify-center items-center">
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-950 sm:rounded-[2.5rem] sm:border-[8px] border-slate-800 dark:border-slate-800 sm:shadow-2xl overflow-hidden relative flex flex-col h-screen sm:h-[850px] sm:max-h-[90vh]">
        <style>{`@keyframes fade-zoom { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } } .animate-fade-zoom { animation: fade-zoom 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`}</style>
        {introStage > 0 ? (
          <div className={`absolute inset-0 z-[100] flex items-center justify-center p-6 transition-colors duration-1000 ${introStage === 3 ? 'bg-white dark:bg-slate-950' : 'bg-slate-950'}`}>
            {introStage === 1 && (
              <div className="text-center animate-fade-zoom relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl animate-pulse z-0"></div>
                <div className="relative mb-8 z-10">
                   <img src="/logo.webp" alt="Test Logo" className="w-28 h-28 mx-auto object-contain drop-shadow-[0_10px_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                   <div className="hidden w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-green-600 rounded-3xl flex-col items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.4)] border border-white/20"><Shield size={48} className="text-white drop-shadow-md" /></div>
                </div>
                <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2 drop-shadow-lg relative z-10">Test <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">CBG</span></h1>
                <h2 className="text-[11px] font-bold text-slate-400 tracking-[0.4em] uppercase mb-12 relative z-10">Secure Deployment Network</h2>
                <div className="flex justify-center items-center gap-3 relative z-10"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div><span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Establishing Secure Uplink...</span></div>
              </div>
            )}
            {introStage === 2 && (
              <div className="w-full max-w-sm animate-fade-zoom">
                <div className="text-center mb-8"><div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 mx-auto border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]"><Users size={32} /></div><h2 className="text-2xl font-black text-white tracking-wide mb-1">IDENTITY SCAN</h2><p className="text-xs text-indigo-300 uppercase tracking-widest font-semibold">Select Authorized Officer</p></div>
                <div className="w-full max-w-sm flex flex-col gap-4 relative z-10 mt-6">{allowedSupervisors.map((supName, index) => (<button key={index} onClick={() => selectName(supName)} className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-black/20 active:scale-95">{supName}</button>))}</div>
                <div className="mt-6 pt-5 border-t border-indigo-500/20"><p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest text-center mb-3">Not on the list?</p><form onSubmit={handleCustomSubmit} className="flex gap-2"><input type="text" placeholder="Enter Full Name..." value={customName} onChange={(e) => setCustomName(e.target.value)} className="flex-1 bg-black/20 border border-indigo-500/30 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-indigo-400 uppercase placeholder:text-indigo-300/50 shadow-inner" /><button type="submit" className="bg-indigo-500 text-white px-5 rounded-xl font-black text-xs hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/25">GO</button></form></div>
              </div>
            )}
            {introStage === 3 && (
              <div className="text-center animate-fade-zoom">
                <div className="w-24 h-24 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 shadow-xl border border-emerald-200 dark:border-emerald-800"><CheckCircle size={48} className="text-emerald-500" /></div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Welcome,</h1>
                <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{fillerName}</h2>
                <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Accessing Secure Dashboard...</p>
              </div>
            )}
          </div>
    
      ) : ( currentApp === 'hub' ? renderHub() : renderModule() )}
      </div>

      {/* 🚨 THE ZERO-ESCAPE GATEKEEPER MODAL 🚨 */}
      {unreadBroadcasts.length > 0 && introStage === 0 && (
        <div className="fixed inset-0 bg-slate-900/95 dark:bg-black/95 backdrop-blur-2xl z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-[#0B1120] w-full max-w-md rounded-[2.5rem] shadow-[0_0_100px_rgba(225,29,72,0.4)] border-4 border-rose-500 overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-500">
              
              {/* Flashing Red Alert Header */}
              <div className="bg-rose-600 p-6 text-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-button-shine pointer-events-none"></div>
                 <AlertTriangle className="mx-auto text-white mb-2 drop-shadow-md animate-pulse" size={48} />
                 <h2 className="text-white font-black uppercase tracking-widest text-xl drop-shadow-md">Urgent Notice</h2>
                 <div className="inline-block mt-3 px-3 py-1 bg-black/30 rounded-full text-rose-100 text-[10px] font-black uppercase tracking-widest shadow-inner">
                    Message {1} of {unreadBroadcasts.length}
                 </div>
              </div>

              {/* The Custom Message Box */}
              <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{unreadBroadcasts[0].title}</h3>
                 <p className="text-sm font-bold text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-left w-full bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                   {unreadBroadcasts[0].message}
                 </p>
              </div>

              {/* The Trap Button */}
              <div className="p-6 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                 <button
                   onClick={() => handleAcknowledge(unreadBroadcasts[0].id)}
                   disabled={isAcking}
                   className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-rose-600/30 transition-all active:scale-95 flex justify-center items-center gap-2 group"
                 >
                   {isAcking ? <RefreshCw className="animate-spin" size={20} /> : (
                     <><CheckCircle size={20} className="group-hover:scale-110 transition-transform"/> I Have Read & Understood</>
                   )}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* ✨ NEW: SUPERVISOR POP-VIEW MODAL */}
      {viewingBroadcast && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200" onClick={() => setViewingBroadcast(null)}>
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            
            <div className="bg-slate-100 dark:bg-slate-900 p-5 flex justify-between items-start border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 mb-2 border border-orange-200 dark:border-orange-500/30"><Megaphone size={10}/> Directive Details</span>
                <h3 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight leading-tight pr-4">{viewingBroadcast.title || "Security Alert"}</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Sent: {new Date(viewingBroadcast.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setViewingBroadcast(null)} className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full shadow-sm active:scale-95 transition-all border border-slate-200 dark:border-slate-700 shrink-0"><X size={14} /></button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {viewingBroadcast.message}
              </p>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}


function DeploymentMobileForm({ userProfile, fetchDeployments, setActiveTab, fillerName, deployments, language}) {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
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
    if (yesterdayLogs.length === 0) { alert("No previous deployments found to clone, captain! 🕵️‍♀️"); return; }
    const copiedPersonnel = yesterdayLogs.map((log, index) => {
      const isStandardLocation = LOCATIONS.includes(log.location);
      return { id: Date.now() + index, shift: log.shift || "Day Shift", designation: log.designation || "SG - Security Guard", name: log.name || "", phone: log.phone || "", location: isStandardLocation ? log.location : "Other", customLocation: isStandardLocation ? "" : log.location };
    });
    setPersonnel(copiedPersonnel);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newRecords = personnel.map(p => ({
      date, site: userProfile.site, shift: p.shift, designation: p.designation,
      name: p.name.toUpperCase(), phone: p.phone, location: p.location === 'Other' ? p.customLocation : p.location, submittedBy: fillerName || userProfile.name
    }));
    const { error } = await supabase.from('deployments').insert(newRecords);
    setIsSubmitting(false);
    if (error) { alert(`Vault Error: ${error.message} (Code: ${error.code})`); } 
    else {
      setSuccessMsg(true); fetchDeployments();
      setTimeout(() => { setSuccessMsg(false); setPersonnel([{ id: Date.now(), shift: "Day Shift", designation: "SS - Security Supervisor", name: "", phone: "", location: "Main Gate", customLocation: "" }]); setActiveTab('history'); }, 1200);
    }
  };

  const inputClass = "w-full bg-white dark:bg-[#0B1120] border-2 border-slate-300 dark:border-slate-600 rounded-2xl py-3.5 px-4 text-base font-black text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 hover:border-slate-400 dark:hover:border-slate-500 transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder:text-slate-400 placeholder:font-medium";
  const labelClass = "block text-xs sm:text-base font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl">
      <button type="button" onClick={handleAutoFill} className="w-full py-4 bg-white dark:bg-slate-900 border-2 border-transparent bg-clip-padding relative rounded-2xl text-[11px] font-black uppercase tracking-widest flex justify-center items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 group before:absolute before:inset-0 before:-z-10 before:m-[-2px] before:rounded-[18px] before:bg-gradient-to-r before:from-blue-500 before:to-purple-500 text-slate-800 dark:text-white">
        <Sparkles size={16} className="group-hover:scale-110 transition-transform text-blue-500" /> {t.dep.clone}
      </button>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <label className={labelClass}>{t.dep.date}</label>
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
                <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t.dep.secData}</span>
              </div>
              {personnel.length > 1 && <button type="button" onClick={() => setPersonnel(personnel.filter(p => p.id !== person.id))} className="text-slate-400 hover:text-white hover:bg-rose-500 p-2 rounded-full transition-colors"><X size={16} /></button>}
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.dep.shift}</label>
                  {/* Database needs English values to stay clean! */}
                  <select value={person.shift} onChange={(e) => updatePerson(person.id, 'shift', e.target.value)} className={`${inputClass} cursor-pointer`}>
                    <option value="Day Shift">☀️ {t.dep.day}</option>
                    <option value="Night Shift">🌙 {t.dep.night}</option>
                    <option value="Weekly Off">🏖️ {t.dep.off}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t.dep.desig}</label>
                  <select value={person.designation} onChange={(e) => updatePerson(person.id, 'designation', e.target.value)} className={`${inputClass} cursor-pointer`}>
                    {DESIGNATIONS.map(d => <option key={d} value={d}>{d.split(' - ')[0]}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>{t.dep.name}</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" required placeholder="Full Name..." value={person.name} onChange={(e) => updatePerson(person.id, 'name', e.target.value)} className={`${inputClass} pl-12 uppercase`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.dep.phone}</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" required pattern="[0-9]{10}" placeholder="10 Digits" maxLength="10" value={person.phone} onChange={(e) => updatePerson(person.id, 'phone', e.target.value.replace(/\D/g, ''))} className={`${inputClass} pl-11 font-mono`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t.dep.loc}</label>
                  <select value={person.location} onChange={(e) => updatePerson(person.id, 'location', e.target.value)} className={`${inputClass} cursor-pointer`}>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {person.location === 'Other' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <input type="text" required placeholder={t.dep.customLoc} value={person.customLocation} onChange={(e) => updatePerson(person.id, 'customLocation', e.target.value)} className={inputClass} />
                </div>
              )}
            </div>
          </div>
        ))}

        <button type="button" onClick={addPerson} className="w-full py-5 rounded-[2rem] border-2 border-dashed border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all text-xs font-black uppercase tracking-widest flex justify-center items-center gap-2">
          <Plus size={18} /> {t.dep.addAnother}
        </button>
      </div>

      <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-[1.5rem] font-black text-base uppercase tracking-widest shadow-xl transition-all flex justify-center items-center gap-2 ${successMsg ? 'bg-emerald-500 text-white shadow-emerald-500/25' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/25 active:scale-95'}`}>
        {isSubmitting ? t.dep.encrypting : successMsg ? <><CheckCircle size={20} /> {t.dep.recorded}</> : t.dep.submit}
      </button>
    </form>
  );
}

function SupervisorMobileHistory({ deployments, isLoading, onEdit, onDelete, onView, language }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const [viewDate, setViewDate] = useState(getISTDate());
  const [isCopied, setIsCopied] = useState(false);
  
// ✨ THE TIMELOCK BRAIN 🧠
  const checkIsEditable = (createdAt) => {
    if (!createdAt) return true; // ✨ FIXED: Brand new unsynced records are ALWAYS editable!
    const recordTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    if (isNaN(recordTime)) return true; // Safety net!
    const hoursPassed = (currentTime - recordTime) / (1000 * 60 * 60);
    return hoursPassed >= -24 && hoursPassed <= 24; 
  };

  if (isLoading) return <div className="p-10 text-center text-indigo-500 font-bold animate-pulse">Syncing...</div>;
  const filteredLogs = deployments.filter(d => d.date === viewDate);

  const handleCopyWhatsApp = () => {
    if (filteredLogs.length === 0) return alert("No logs to copy!");
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
      setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="p-4 space-y-3">
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.nav?.dateFilter || "Filter Date"}</span>
          <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold outline-none [color-scheme:light] dark:[color-scheme:dark]" />
        </div>
        <button onClick={handleCopyWhatsApp} className={`w-full py-2.5 rounded-lg text-xs font-bold flex justify-center items-center gap-2 transition-all ${isCopied ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800'}`}>
          {isCopied ? <><CheckCircle size={16} /> {t.dep?.recorded || "Copied!"}</> : <><Copy size={16} /> {t.inc?.copyWA || "Copy for WhatsApp"}</>}
        </button>
      </div>

      {filteredLogs.map((row, idx) => {
        // ✨ STEP 2: WE CALL THE BRAIN HERE FOR EACH ROW!
        const canEdit = checkIsEditable(row.created_at);

        const safeShift = row.shift || "";
        const safeDesignation = row.designation || "";
        const safeName = row.name || "Unknown";
        const shiftType = safeShift.includes('Off') ? 'OFF' : safeShift.split(' ')[0];
        let badgeClasses = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
        if (safeShift.includes(' WEEKLY Off')) badgeClasses = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
        else if (safeShift.includes('Night')) badgeClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400';

        return (
          <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative group overflow-hidden">
            
            {/* ✨ Adding that cute colored ribbon on the left to show if it's locked! */}
            <div className={`absolute top-0 left-0 w-1 h-full ${canEdit ? 'bg-indigo-400' : 'bg-slate-300 dark:bg-slate-600'}`}></div>

            <div className="flex justify-between items-start mb-3 pl-2">
              <div className="pr-4">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-base">{safeName}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{safeDesignation}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${badgeClasses}`}>{shiftType || "N/A"}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50 mt-2 mb-3 ml-2">
              <span className="flex items-center gap-1.5 font-medium"><Calendar size={12}/> {row.date || "N/A"}</span>
              <span className="flex items-center gap-1.5 font-medium"><MapPin size={12}/> {row.location || "N/A"}</span>
              <span className="flex items-center gap-1.5 font-mono font-bold col-span-2 text-slate-700 dark:text-slate-300">{formatPhone(row.phone)}</span>
            </div>

            <div className="flex justify-end border-t border-slate-100 dark:border-slate-800/50 pt-3 mt-1 gap-2 ml-2">
              {/* Eye Button always stays visible! */}
              <button onClick={() => onView(row)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 rounded-lg transition-colors"><Eye size={14} /></button>
              
              {/* ✨ THE MAGIC PADLOCK LOGIC */}
              {canEdit ? (
                <>
                  <button onClick={() => onEdit(row)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 rounded-lg transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => onDelete(row)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 dark:bg-slate-800 dark:hover:text-red-400 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </>
              ) : (
                <div className="flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase tracking-widest font-black text-slate-400 bg-slate-100 dark:bg-slate-800/50 rounded-lg cursor-not-allowed border border-slate-200 dark:border-slate-700/50 shadow-inner">
                  <Lock size={12}/> Expired
                </div>
              )}
            </div>
          </div>
        );
      })}
      {filteredLogs.length === 0 && <p className="text-center text-slate-500 text-base mt-10 font-medium">{t.dep?.noLogs || "No logs found."}</p>}
    </div>
  );
}
// ==========================================
// ADMIN VIEW (MASTER PORTAL + COMMAND CENTER)
// ==========================================
function AdminDesktopView({ userProfile, deployments, contacts, incidents, weeklyReports, nightHaults, isLoading, onToggleAck, onDeleteIncident, onLogout, onEdit, onView, onDelete, onAddContact, onEditContact, onDeleteContact, onViewContact, onImportCSV, theme, toggleTheme, globalSites = [], SITES = [], COMMISSIONED_SITES = [], SITES_BY_STATE = {}, STATE_NAMES = [], onAddSite, onToggleSite, onDeleteSite, onDeleteWeekly, onSync, onQuickUpdateContact, onEditNightHault, onDeleteNightHault }) {   const [activeTab, setActiveTab] = useState('deployments'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false); 
  const [movingContact, setMovingContact] = useState(null); // 👈 THE NEW FILE EXPLORER STATE!
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
  const [filterStartDate, setFilterStartDate] = useState(getISTDate());
  const [filterEndDate, setFilterEndDate] = useState(getISTDate());
  const [filterShift, setFilterShift] = useState("All");
  const [filterDesignation, setFilterDesignation] = useState("All");
  const [filterLocation, setFilterLocation] = useState("All"); //   NEW: Location Filter
  const [searchTerm, setSearchTerm] = useState(""); 
  const [siteTier, setSiteTier] = useState("All"); //   NEW: OPERATIONAL Toggle

  // Contact Omni-Search & Folder Brain 🧠
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(null);

  // ✨ RESTORED: Your flawless state-to-site logic!
  const availableSites = filterState === "All" ? SITES : SITES_BY_STATE[filterState] || [];
  
  // 🧠 1. THE MASTER FILTER ENGINE
  const filteredData = deployments.filter(d => {
    // ✨ SAFETY NET 2.0: Force uppercase AND trim sneaky invisible spaces!
    const safeSiteName = (d.site || "").toUpperCase().trim();

    // Make sure our state map checks against uppercase too!
    const stateMatch = filterState === "All" || (SITES_BY_STATE[filterState] && SITES_BY_STATE[filterState].map(s => s.toUpperCase().trim()).includes(safeSiteName));
    const siteMatch = filterSite === "All" || safeSiteName === filterSite.toUpperCase().trim();
    const dateMatch = (!filterStartDate || d.date >= filterStartDate) && (!filterEndDate || d.date <= filterEndDate);
    const shiftMatch = filterShift === "All" || d.shift === filterShift;
    const designationMatch = filterDesignation === "All" || (d.designation && d.designation.startsWith(filterDesignation));
    const locationMatch = filterLocation === "All" || d.location === filterLocation;
    
    const safeName = d.name || ""; 
    const searchMatch = searchTerm === "" || safeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // ✨ THE GHOST BUSTER: Force the entire Commissioned list to uppercase before checking!
    const safeCommissionedList = COMMISSIONED_SITES.map(s => (s || "").toUpperCase().trim());
    const isCommissioned = safeCommissionedList.includes(safeSiteName);
    
    const tierMatch = siteTier === "All" || (siteTier === "Commissioned" ? isCommissioned : !isCommissioned);

    return stateMatch && siteMatch && dateMatch && shiftMatch && designationMatch && locationMatch && searchMatch && tierMatch;
  });

// 🫀 2. THE LIVE HEARTBEAT STATS
  const totalBoots = filteredData.length;
  
  // ✨ FIXED: Phantom Roster (AWOL) Engine is now CASE-INSENSITIVE!
  const activeSiteNames = new Set(filteredData.map(d => (d.site || "").toUpperCase()));
  const expectedSites = availableSites.filter(s => {
    if (siteTier === 'Commissioned') return COMMISSIONED_SITES.includes(s);
    if (siteTier === 'Project') return !COMMISSIONED_SITES.includes(s);
    return true;
  });
  // Check against the uppercase safety net!
  const awolSites = expectedSites.filter(s => !activeSiteNames.has((s || "").toUpperCase()));

  // ✨ FIXED: MTCC Active Node Tracker (Also Case-Insensitive!)
  const mtccDeployments = filteredData.filter(d => d.location === 'MTCC');
  const mtccSiteMap = {};
  mtccDeployments.forEach(d => {
    const safeSite = (d.site || "").toUpperCase();
    mtccSiteMap[safeSite] = (mtccSiteMap[safeSite] || 0) + 1;
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
  
  // ✨ EXORCISED: Top 5 Load now perfectly merges lowercase and uppercase!
  const sitePopulation = {};
  filteredData.forEach(d => { 
    const safePopSite = (d.site || "").toUpperCase();
    sitePopulation[safePopSite] = (sitePopulation[safePopSite] || 0) + 1; 
  });
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
            
            {/* ✨ THE MAGICAL SLIDING BACKGROUND PILL (NOW 7 TABS!) */}
            <div 
              className={`absolute left-0 w-full h-12 rounded-xl shadow-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 will-change-transform ${
                activeTab === 'deployments' ? 'bg-indigo-600 shadow-indigo-900/20' : 
                activeTab === 'contacts' ? 'bg-blue-600 shadow-blue-900/20' : 
                activeTab === 'incidents' ? 'bg-rose-600 shadow-rose-900/20' : 
                activeTab === 'weekly' ? 'bg-emerald-600 shadow-emerald-900/20' :
                activeTab === 'nighthault' ? 'bg-slate-700 shadow-slate-900/40' : /* Night Hault Color! */
                activeTab === 'broadcasts' ? 'bg-amber-500 shadow-amber-900/20' :
                'bg-purple-600 shadow-purple-900/20' /* The Leave Color! */
              }`}
              style={{ 
                transform: `translateY(${
                  activeTab === 'deployments' ? '0px' : 
                  activeTab === 'contacts' ? '56px' : 
                  activeTab === 'incidents' ? '112px' : 
                  activeTab === 'weekly' ? '168px' :
                  activeTab === 'nighthault' ? '224px' :
                  activeTab === 'broadcasts' ? '280px' : /* Bumped down 56px! */
                  '336px' /* Bumped down 56px for the 7th tab! */
                })` 
              }}
            ></div>

            <button onClick={() => { setActiveTab('deployments'); setIsMobileMenuOpen(false); }} className={`relative z-10 h-12 w-full flex items-center gap-3 px-4 rounded-xl text-sm font-bold transition-colors duration-300 ${activeTab === 'deployments' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}><Activity size={18} /> Deployment Matrix</button>
            <button onClick={() => { setActiveTab('contacts'); setIsMobileMenuOpen(false); }} className={`relative z-10 h-12 w-full flex items-center gap-3 px-4 rounded-xl text-sm font-bold transition-colors duration-300 ${activeTab === 'contacts' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}><BookOpen size={18} /> Directory</button>
            <button onClick={() => { setActiveTab('incidents'); setIsMobileMenuOpen(false); }} className={`relative z-10 h-12 w-full flex items-center gap-3 px-4 rounded-xl text-sm font-bold transition-colors duration-300 ${activeTab === 'incidents' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}><AlertTriangle size={18} /> Incident Report</button>
            <button onClick={() => { setActiveTab('weekly'); setIsMobileMenuOpen(false); }} className={`relative z-10 h-12 w-full flex items-center gap-3 px-4 rounded-xl text-sm font-bold transition-colors duration-300 ${activeTab === 'weekly' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}><FileText size={18} /> MIS Reports</button>
            <button onClick={() => { setActiveTab('nighthault'); setIsMobileMenuOpen(false); }} className={`relative z-10 h-12 w-full flex items-center gap-3 px-4 rounded-xl text-sm font-bold transition-colors duration-300 ${activeTab === 'nighthault' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}><Truck size={18} /> Night Hault</button>
            <button onClick={() => { setActiveTab('broadcasts'); setIsMobileMenuOpen(false); }} className={`relative z-10 h-12 w-full flex items-center gap-3 px-4 rounded-xl text-sm font-bold transition-colors duration-300 ${activeTab === 'broadcasts' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}><Megaphone size={18} /> Directives</button>
            <button onClick={() => { setActiveTab('leave'); setIsMobileMenuOpen(false); }} className={`relative z-10 h-12 w-full flex items-center gap-3 px-4 rounded-xl text-sm font-bold transition-colors duration-300 ${activeTab === 'leave' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}><Calendar size={18} /> Absence Command</button>
          </div>
        </div>


       {/* ✨ BRIGHT & CLASSY SIDEBAR PROFILE WIDGET */}
        <div className="p-4 mx-3 mb-4 mt-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-lg border border-indigo-100 dark:border-indigo-500/20 shrink-0">
                {userProfile.name.charAt(0)}
              </div>
              <div className="min-w-0 pr-2">
                <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase truncate tracking-tight">{userProfile.name}</p>
                <p className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-0.5">Administrator</p>
              </div>
            </div>
            
            {/* ✨ SETTINGS ICON BESIDE NAME! */}
            <button onClick={() => { setShowSettings(true); setIsMobileMenuOpen(false); }} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
              <Settings size={18} />
            </button>
          </div>

          <button onClick={onLogout} className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:border-rose-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all shadow-sm active:scale-95 group/logout">
            <LogOut size={14} className="group-hover/logout:text-rose-500 transition-colors" /> Disconnect
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
            {activeTab === 'nighthault' && 'Silent Hour Report'} {/* 👈 NEW */}
            {activeTab === 'broadcasts' && 'Command Broadcasts'}
            {activeTab === 'leave' && 'Absence Command'}
          </h1>
            <span className="hidden sm:flex bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Secure Cloud Vault
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

            {/* ✨ NEW: UNIVERSAL SYNC BUTTON */}
            <button 
              onClick={onSync} 
              disabled={isLoading}
              className={`p-2 rounded-lg border transition-colors shadow-sm flex items-center justify-center ${isLoading ? 'bg-indigo-50 text-indigo-500 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30' : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 active:scale-95'}`}
              title="Sync Data"
            >
               <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>

            {/* THEME TOGGLE */}
            <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-sm">
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
              {/* ✨ DYNAMIC OPERATIONAL SWITCH (FAANG SLIDING PILL EDITION!) */}
              <div className="mb-6 flex justify-center sm:justify-start">
                <div className="relative flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner w-full sm:w-[420px]">
                  
                  {/* ✨ THE SLIDING PILL */}
                  <div 
                    className={`absolute top-1 bottom-1 w-[calc(33.333%-2.66px)] rounded-lg shadow-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 ${
                      siteTier === 'All' ? 'bg-slate-800 dark:bg-slate-700 shadow-slate-500/20' : 
                      siteTier === 'Commissioned' ? 'bg-emerald-500 shadow-emerald-500/30' : 
                      'bg-indigo-500 shadow-indigo-500/30'
                    }`}
                    style={{ 
                      transform: `translateX(${
                        siteTier === 'All' ? '0%' : 
                        siteTier === 'Commissioned' ? 'calc(100% + 4px)' : 
                        'calc(200% + 8px)'
                      })` 
                    }}
                  ></div>

                  {/* TRANSPARENT BUTTONS */}
                  <button onClick={() => setSiteTier('All')} className={`flex-1 relative z-10 px-2 py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors duration-300 ${siteTier === 'All' ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}>
                    Total {globalSites?.length || 0}
                  </button>
                  <button onClick={() => setSiteTier('Commissioned')} className={`flex-1 relative z-10 px-2 py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors duration-300 ${siteTier === 'Commissioned' ? 'text-white' : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'}`}>
                    Operational - {COMMISSIONED_SITES?.length || 0}
                  </button>
                  <button onClick={() => setSiteTier('Project')} className={`flex-1 relative z-10 px-2 py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors duration-300 ${siteTier === 'Project' ? 'text-white' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
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
              {/* ✨ FIXED: overflow-visible lets the dropdown escape! */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-visible flex flex-col mt-6 relative z-30">
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-wrap gap-3 items-end rounded-t-2xl">
                  <div className="flex-1 min-w-[200px] sm:min-w-[250px] relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search Guard Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  
                  {/* ✨ FIXED: The Filters now use the live data! */}
                  <SmartDateFilter startDate={filterStartDate} setStartDate={setFilterStartDate} endDate={filterEndDate} setEndDate={setFilterEndDate} />
                  <FilterSelect label="State" value={filterState} onChange={(e) => { setFilterState(e); setFilterSite("All"); }} options={STATE_NAMES} />
                  <FilterSelect label="Site" value={filterSite} onChange={setFilterSite} options={[...availableSites].sort()} />
                  <FilterSelect label="Shift" value={filterShift} onChange={setFilterShift} options={["Day Shift", "Night Shift", "Weekly Off"]} />
                  <FilterSelect label="Role" value={filterDesignation} onChange={setFilterDesignation} options={["SS", "SG"]} />
                  <FilterSelect label="Loc" value={filterLocation} onChange={setFilterLocation} options={LOCATIONS} />
                  
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 ml-auto">
                    <button onClick={exportToCSV} className="text-xs font-black tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 transform hover:-translate-y-0.5">
                      <Download size={14} /> EXPORT
                    </button>
                    {/* ✨ FIXED: CLEAR button now correctly targets the new Start/End date states! */}
                    <button onClick={() => { setFilterState("All"); setFilterSite("All"); setFilterStartDate(getISTDate()); setFilterEndDate(getISTDate()); setFilterShift("All"); setFilterDesignation("All"); setFilterLocation("All"); setSearchTerm(""); }} className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-4 py-2.5 rounded-xl transition-colors hover:bg-slate-300 dark:hover:bg-slate-700">
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
          {/* 📖 TAB: GLOBAL CONTACTS VIEW (FOLDERS EDITION 📁) */}
          {/* ===================================== */}
          {activeTab === 'contacts' && (() => {
            // 🧠 Folder Math: Automatically groups contacts by their Role/Designation!
            const folders = [...new Set((contacts || []).map(c => c.designation || 'Uncategorized'))].sort();
            
            // If we are IN a folder, only show contacts from that folder!
            let displayedContacts = filteredContacts;
            if (selectedFolder) {
              displayedContacts = filteredContacts.filter(c => (c.designation || 'Uncategorized') === selectedFolder);
            }

            return (
            <>
              {/* Contacts Header & Action Buttons */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div className="relative w-full md:w-96">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder={selectedFolder ? `Search in ${selectedFolder}...` : "Omni-Search All Contacts..."} 
                    value={contactSearchTerm} 
                    onChange={(e) => setContactSearchTerm(e.target.value)} 
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={onAddContact} className="flex-1 md:flex-none py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 transition-all shrink-0">
                    <Plus size={16} /> ADD CONTACT
                  </button>
                  <input type="file" accept=".csv" id="csv-upload" className="hidden" onChange={(e) => { onImportCSV(e.target.files[0]); e.target.value = null; }} />
                  <label htmlFor="csv-upload" className="flex-1 md:flex-none py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all cursor-pointer">
                    <Download size={16} className="rotate-180" /> IMPORT CSV
                  </label>
                </div>
              </div>

              {/* ✨ THE FOLDER NAVIGATION BREADCRUMB */}
              {selectedFolder && (
                <div className="mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-left-4">
                  <button onClick={() => {setSelectedFolder(null); setContactSearchTerm('');}} className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 rounded-xl transition-all shadow-sm">
                    <ArrowLeft size={14} /> Folders
                  </button>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div> {selectedFolder}
                  </span>
                </div>
              )}

              {/* ✨ VIEW SWITCHER: Folders vs Contacts */}
              {!selectedFolder && contactSearchTerm === "" ? (
                /* 📁 GRID OF FOLDERS */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-300">
                  {folders.map(folder => {
                    const count = (contacts || []).filter(c => (c.designation || 'Uncategorized') === folder).length;
                    return (
                      <div key={folder} onClick={() => setSelectedFolder(folder)} className="bg-white dark:bg-[#0f172a] p-5 sm:p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                          <BookOpen size={24} />
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm mb-1 truncate">{folder}</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{count} {count === 1 ? 'Contact' : 'Contacts'}</p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* 📇 GRID OF ACTUAL CONTACTS */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {displayedContacts.map(contact => (
                    <div key={contact.id} onClick={() => onViewContact(contact)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer">                   
                      {/* FAANG Actions Menu */}
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setMovingContact(contact); }} className="p-1.5 text-slate-400 hover:text-emerald-600 bg-slate-50 dark:bg-slate-800 rounded-md shadow-sm border border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all" title="Move to Folder"><ArrowRight size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onEditContact(contact); }} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-800 rounded-md shadow-sm border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all" title="Edit Contact"><Edit2 size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteContact(contact); }} className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-slate-800 rounded-md shadow-sm border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 transition-all" title="Delete Contact"><Trash2 size={14} /></button>
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
                          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(contact.phone); alert('Copied!'); }} className="text-slate-400 hover:text-indigo-500"><Copy size={14} /></button>                      
                        </div>
                        
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
                  
                  {displayedContacts.length === 0 && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center">
                      <BookOpen size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">No contacts found</h3>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search terms</p>
                    </div>
                  )}
                </div>
              )}
            </>
          );})()}
        {activeTab === 'incidents' && <AdminIncidentView incidents={incidents} isLoading={isLoading} onAcknowledge={onToggleAck} onDelete={onDeleteIncident} SITES={SITES} STATE_NAMES={STATE_NAMES} SITES_BY_STATE={SITES_BY_STATE} />}
        {activeTab === 'weekly' && <AdminWeeklyView weeklyReports={weeklyReports} isLoading={isLoading} COMMISSIONED_SITES={COMMISSIONED_SITES} SITES={SITES} STATE_NAMES={STATE_NAMES} SITES_BY_STATE={SITES_BY_STATE} onDeleteWeekly={onDeleteWeekly} />}
        {/* ✨ फिक्स: Admin पैनल को Edit और Delete के प्रॉप्स पास कर दिए! */}
        {activeTab === 'nighthault' && <AdminNightHaultView nightHaults={nightHaults} isLoading={isLoading} SITES={SITES} STATE_NAMES={STATE_NAMES} SITES_BY_STATE={SITES_BY_STATE} COMMISSIONED_SITES={COMMISSIONED_SITES} onEdit={onEditNightHault} onDelete={onDeleteNightHault} />}
        {activeTab === 'broadcasts' && <AdminBroadcastView SITES={SITES} globalSites={globalSites} userProfile={userProfile} />}
        {/* ✨ NEW: ROUTE FOR THE LEAVE MODULE */}
        {activeTab === 'leave' && <AdminLeaveView />}
            </div>
          )}
        </div>

        {/* 📁 FAANG FILE EXPLORER: MOVE MODAL */}
        {movingContact && (
          <MoveContactModal 
            contact={movingContact} 
            folders={[...new Set((contacts || []).map(c => c.designation || 'Uncategorized'))].sort()} 
            onClose={() => setMovingContact(null)} 
            onMove={async (newFolder) => {
              await onQuickUpdateContact(movingContact.id, { designation: newFolder.toUpperCase() });
              setMovingContact(null);
            }} 
          />
        )}
      </main>
    </div>
  );
}

// ==========================================
// 📁 FAANG-STYLE FILE EXPLORER MODAL (MOVE CONTACT)
// ==========================================
function MoveContactModal({ contact, folders, onClose, onMove }) {
  const [selectedFolder, setSelectedFolder] = useState(contact.designation || folders[0] || '');
  const [newFolderInput, setNewFolderInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalFolder = selectedFolder === 'NEW_FOLDER' ? newFolderInput : selectedFolder;
    if (!finalFolder.trim()) return alert("Please select or name a folder!");
    onMove(finalFolder.trim());
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-indigo-500/30 rounded-[2.5rem] shadow-[0_20px_80px_-15px_rgba(79,70,229,0.3)] w-full max-w-md overflow-hidden relative animate-in zoom-in-[0.95] duration-300" onClick={e => e.stopPropagation()}>
        
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none"></div>

        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center relative z-10 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-lg uppercase tracking-tight">
              <BookOpen size={18} className="text-emerald-500" /> Move Contact
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Transferring: <span className="text-indigo-500">{contact.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-full shadow-sm transition-all active:scale-95"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 relative z-10">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Select Destination Folder</label>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {folders.map(folder => (
                <label key={folder} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedFolder === folder ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-700/50 hover:border-emerald-300 dark:hover:border-emerald-500/30'}`}>
                  <span className={`text-xs font-bold uppercase tracking-wide ${selectedFolder === folder ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>{folder}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedFolder === folder ? 'border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                    {selectedFolder === folder && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                  </div>
                  <input type="radio" name="folder" value={folder} checked={selectedFolder === folder} onChange={() => setSelectedFolder(folder)} className="hidden" />
                </label>
              ))}
              
              <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedFolder === 'NEW_FOLDER' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/30'}`}>
                <span className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${selectedFolder === 'NEW_FOLDER' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}><Plus size={14}/> Create New Folder</span>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedFolder === 'NEW_FOLDER' ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                  {selectedFolder === 'NEW_FOLDER' && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
                </div>
                <input type="radio" name="folder" value="NEW_FOLDER" checked={selectedFolder === 'NEW_FOLDER'} onChange={() => setSelectedFolder('NEW_FOLDER')} className="hidden" />
              </label>
            </div>
          </div>

          {selectedFolder === 'NEW_FOLDER' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <input type="text" required placeholder="Name new folder..." value={newFolderInput} onChange={(e) => setNewFolderInput(e.target.value)} className="w-full bg-indigo-50/50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-500/50 rounded-xl py-3 px-4 text-xs font-bold text-indigo-900 dark:text-indigo-100 uppercase outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder-indigo-300 dark:placeholder-indigo-500/50" />
            </div>
          )}

          <button type="submit" className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-emerald-500 text-white flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all">
            <ArrowRight size={16} /> Move Contact
          </button>
        </form>
      </div>
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
const inputClass = "w-full bg-white dark:bg-[#0B1120] border-2 border-slate-300 dark:border-slate-600 rounded-2xl py-3.5 px-4 text-base font-black text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 hover:border-slate-400 dark:hover:border-slate-500 transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder:text-slate-400 placeholder:font-medium";
  const labelClass = "block text-xs sm:text-base font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1";

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
          <button type="button" onClick={onClose} className="w-1/3 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
          
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
// 📅 FAANG DATE RANGE PICKER COMPONENT
// ==========================================
function DateRangeFilter({ startDate, setStartDate, endDate, setEndDate }) {
  const [isOpen, setIsOpen] = useState(false);

  const applyPreset = (daysBack, type) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (type === 'today') {
      // just today
    } else if (type === 'yesterday') {
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
    } else if (type === 'last7') {
      start.setDate(today.getDate() - 7);
    } else if (type === 'last30') {
      start.setDate(today.getDate() - 30);
    } else if (type === 'lastMonth') {
      start.setMonth(today.getMonth() - 1);
      start.setDate(1);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    } else if (type === 'all') {
      setStartDate(''); setEndDate(''); setIsOpen(false); return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full sm:w-auto">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between gap-3 w-full sm:w-auto bg-white dark:bg-[#0B1120] border-2 border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 hover:border-indigo-500 transition-colors shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300 h-[42px]">
        <span className="flex items-center gap-2"><Calendar size={14} className="text-indigo-500"/> {startDate && endDate ? `${startDate} to ${endDate}` : startDate ? `From ${startDate}` : endDate ? `Until ${endDate}` : 'Filter Dates'}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full mt-2 right-0 sm:left-0 sm:right-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col sm:flex-row w-[280px] sm:w-[480px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-slate-50 dark:bg-slate-800/50 p-2 sm:w-1/3 flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800">
                <button onClick={() => applyPreset(0, 'today')} className="text-[10px] font-black uppercase tracking-widest text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition-colors">Today</button>
                <button onClick={() => applyPreset(1, 'yesterday')} className="text-[10px] font-black uppercase tracking-widest text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition-colors">Yesterday</button>
                <button onClick={() => applyPreset(7, 'last7')} className="text-[10px] font-black uppercase tracking-widest text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition-colors">Last 7 Days</button>
                <button onClick={() => applyPreset(30, 'last30')} className="text-[10px] font-black uppercase tracking-widest text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition-colors">Last 30 Days</button>
                <button onClick={() => applyPreset(0, 'lastMonth')} className="text-[10px] font-black uppercase tracking-widest text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition-colors">Last Month</button>
                <button onClick={() => applyPreset(0, 'all')} className="text-[10px] font-black uppercase tracking-widest text-left px-3 py-2.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 transition-colors mt-auto">All Time</button>
             </div>
             <div className="p-5 sm:w-2/3 flex flex-col gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> Custom Range</span>
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">From Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 [color-scheme:light] dark:[color-scheme:dark] shadow-inner" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">To Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 [color-scheme:light] dark:[color-scheme:dark] shadow-inner" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => setIsOpen(false)} className="w-full py-3 text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95">Apply Filter</button>
                </div>
             </div>
          </div>
        </>
      )}
    </div>
  )
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
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Phone No.</span>
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
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Are you sure you want to completely remove {record.veh_no || record.name || 'this record'}?</p>

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
          <button type="button" onClick={onClose} className="w-1/3 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-sm transition-all active:scale-95">Cancel</button>
          
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
            <button onClick={() => { navigator.clipboard.writeText(record.phone); alert(' Phone No. Copied!'); }} className="flex-1 py-3 bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/50 dark:border-slate-700/50 flex flex-col items-center justify-center gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all group active:scale-95 shadow-sm">
              <Phone size={18} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mt-1">Copy Number</span>
            </button>
            {record.email && (
              <button onClick={() => { navigator.clipboard.writeText(record.email); alert('Email Copied!'); }} className="flex-1 py-3 bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/50 dark:border-slate-700/50 flex flex-col items-center justify-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all group active:scale-95 shadow-sm">
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
                    {record.site.split(',').map(s => <span key={s} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{s.trim()}</span>)}
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

function IncidentMobileForm({ userProfile, fetchIncidents, setActiveTab, language }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
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
      site: userProfile.site, incident_name: formData.incidentName, time_of_incident: formData.timeOfIncident.replace('T', ' '),
      time_of_reporting: new Date().toLocaleString('en-IN'), reported_by: formData.reportedBy, ep_number: formData.epNumber,
      pincode: formData.pincode, incident_location: formData.incidentLocation, details: formData.details, findings: formData.findings,
      actions_taken: formData.actionsTaken, recommendations: formData.recommendations, photos: formData.photos, status: 'Pending'
    };
    const { error } = await supabase.from('incidents').insert([newIncident]);
    setIsSubmitting(false);
    if (error) alert(`Error: ${error.message}`);
    else { fetchIncidents(); setActiveTab('history'); }
  };

  const inputClass = "w-full bg-white dark:bg-[#0B1120] border-2 border-slate-300 dark:border-slate-600 rounded-2xl py-3.5 px-4 text-base font-black text-slate-900 dark:text-white outline-none focus:border-rose-500 dark:focus:border-rose-400 focus:ring-4 focus:ring-rose-500/20 hover:border-slate-400 dark:hover:border-slate-500 transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder:text-slate-400 placeholder:font-medium";
  const labelClass = "block text-xs sm:text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      <div className="bg-gradient-to-br from-rose-500 to-red-600 p-6 rounded-3xl shadow-lg shadow-rose-500/30 text-white relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        <h2 className="font-black uppercase tracking-widest text-lg flex items-center gap-2 relative z-10"><AlertTriangle size={22}/> {t.inc.title}</h2>
        <p className="text-xs font-bold text-rose-100 mt-1 relative z-10">{t.inc.subtitle}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
        <div>
          <label className={labelClass}>{t.inc.type}</label>
          <input type="text" required placeholder={t.inc.phType} value={formData.incidentName} onChange={(e) => setFormData({...formData, incidentName: e.target.value})} className={`${inputClass} !border-rose-200 dark:!border-rose-500/30 focus:!border-rose-500 !bg-rose-50/50 dark:!bg-rose-500/5 text-rose-700 dark:text-rose-400 uppercase placeholder-rose-300 dark:placeholder-rose-800`} />
        </div>
        <div>
          <label className={labelClass}>{t.inc.occDate}</label>
          <input type="datetime-local" required value={formData.timeOfIncident} onChange={(e) => setFormData({...formData, timeOfIncident: e.target.value})} className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>{t.inc.repBy}</label><input type="text" required placeholder={t.inc.phRepBy} value={formData.reportedBy} onChange={(e) => setFormData({...formData, reportedBy: e.target.value})} className={`${inputClass} uppercase`} /></div>
          <div><label className={labelClass}>{t.inc.ep}</label><input type="text" required placeholder={t.inc.phEp} value={formData.epNumber} onChange={(e) => setFormData({...formData, epNumber: e.target.value})} className={`${inputClass} uppercase`} /></div>
        </div>

        <div className="grid grid-cols-3 gap-4 items-end">
          <div className="col-span-2"><label className={labelClass}>{t.inc.site}</label><div className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl py-3.5 px-4 text-base font-black text-slate-500 uppercase">{userProfile.site}</div></div>
          <div><label className={labelClass}>{t.inc.pin}</label><input type="text" required placeholder={t.inc.phPin} value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className={`${inputClass} uppercase`} /></div>
        </div>

        <div><label className={labelClass}>{t.inc.exactLoc}</label><input type="text" required placeholder={t.inc.phLoc} value={formData.incidentLocation} onChange={(e) => setFormData({...formData, incidentLocation: e.target.value})} className={inputClass} /></div>

        <div><label className={labelClass}>{t.inc.details}</label><textarea required placeholder={t.inc.phDetails} value={formData.details} onChange={(e) => setFormData({...formData, details: e.target.value})} className={`${inputClass} min-h-[100px] resize-y py-4`} /></div>
        <div><label className={labelClass}>{t.inc.findings}</label><textarea required placeholder={t.inc.phFindings} value={formData.findings} onChange={(e) => setFormData({...formData, findings: e.target.value})} className={`${inputClass} min-h-[80px] resize-y py-4`} /></div>
        <div><label className={labelClass}>{t.inc.action}</label><textarea required placeholder={t.inc.phAction} value={formData.actionsTaken} onChange={(e) => setFormData({...formData, actionsTaken: e.target.value})} className={`${inputClass} min-h-[80px] resize-y py-4`} /></div>
        <div><label className={labelClass}>{t.inc.reco}</label><textarea required placeholder={t.inc.phReco} value={formData.recommendations} onChange={(e) => setFormData({...formData, recommendations: e.target.value})} className={`${inputClass} min-h-[80px] resize-y py-4`} /></div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className={labelClass}>{t.inc.photo}</label>
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {formData.photos.map((p, i) => <img key={i} src={p} className="h-20 w-20 object-cover rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm shrink-0" alt="Incident" />)}
            <label className="h-20 w-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shrink-0 active:scale-95">
              <Camera size={24} className="mb-1" /> <span className="text-[9px] font-black uppercase tracking-widest">{t.inc.attach}</span>
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-600/25 transition-all flex justify-center items-center gap-2 bg-rose-600 text-white hover:bg-rose-700 active:scale-95">
        {isSubmitting ? t.inc.encrypting : <><AlertTriangle size={20} /> {t.inc.submit}</>}
      </button>
    </form>
  );
}

function IncidentMobileHistory({ incidents, isLoading, language, onEdit, onDelete }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const [viewDate, setViewDate] = useState(getISTDate());
  const [viewingInc, setViewingInc] = useState(null);

  // ✨ THE GPS TRACKER 📍
  const [scrollPos, setScrollPos] = useState(0);

 // ✨ THE TIMELOCK BRAIN 🧠
  const checkIsEditable = (createdAt) => {
    if (!createdAt) return true; // ✨ FIXED: Brand new unsynced records are ALWAYS editable!
    const recordTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    if (isNaN(recordTime)) return true; // Safety net!
    const hoursPassed = (currentTime - recordTime) / (1000 * 60 * 60);
    return hoursPassed >= -24 && hoursPassed <= 24; 
  };

  // ✨ THE BACKGROUND LOCK! 🔒 (Stops the background sandwich spilling!)
  React.useEffect(() => {
    if (viewingInc) {
       setScrollPos(window.scrollY); // Locks onto your exact screen position!
       document.body.style.overflow = 'hidden'; 
    } else {
       document.body.style.overflow = 'auto'; 
    }
    return () => { document.body.style.overflow = 'auto'; }; 
  }, [viewingInc]);

  const filtered = viewDate ? incidents.filter(i => (i.created_at || '').startsWith(viewDate)) : incidents;

  const copyToWhatsApp = (e, inc) => {
    e.stopPropagation();
    let msg = `🚨 *${(inc.incident_name || 'INCIDENT REPORT').toUpperCase()}* 🚨\n\n` +
      `🕒 *${t.inc?.occDate || 'Occurred'}:* ${inc.time_of_incident}\n` +
      `⏱️ *${t.inc?.timeRep || 'Reported'}:* ${inc.time_of_reporting}\n` +
      `👤 *${t.inc?.repBy || 'Reported By'}:* ${inc.reported_by} (EP: ${inc.ep_number || 'N/A'})\n` +
      `🏢 *${t.inc?.site || 'Site'} & ${t.inc?.pin || 'Pin'}:* ${inc.site} - ${inc.pincode || 'N/A'}\n` +
      `📍 *${t.inc?.exactLoc || 'Location'}:* ${inc.incident_location}\n\n` +
      `📝 *${t.inc?.details || 'Details'}:*\n${inc.details}\n\n` +
      `🔍 *${t.inc?.findings || 'Findings'}:*\n${inc.findings || 'N/A'}\n\n` +
      `⚡ *${t.inc?.action || 'Actions'}:*\n${inc.actions_taken}\n\n` +
      `💡 *${t.inc?.reco || 'Recommendations'}:*\n${inc.recommendations}`;
    navigator.clipboard.writeText(msg).then(() => alert("Copied! 🟢"));
  };

  if (isLoading) return <div className="p-10 text-center text-rose-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Syncing...</div>;

  return (
    <div className="p-4 space-y-4 pb-24 relative">
      <div className="bg-white dark:bg-[#0f172a] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center mb-2">
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t.nav?.dateFilter || 'Date'}</span>
        <div className="flex gap-2 items-center">
          {viewDate && <button onClick={() => setViewDate('')} className="text-[10px] font-black tracking-widest text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-500/20 transition-all active:scale-95">{t.nav?.clear || 'Clear'}</button>}
          <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-base font-bold outline-none [color-scheme:light] dark:[color-scheme:dark]" />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(inc => {
          const canEdit = checkIsEditable(inc.created_at);

          return (
            <div key={inc.id} onClick={() => setViewingInc(inc)} className="bg-white dark:bg-[#0f172a] p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-slate-100 dark:border-slate-800 relative cursor-pointer active:scale-[0.98] transition-transform overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${canEdit ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
              <div className="absolute top-4 right-4">
                 {inc.status === 'Acknowledged' && <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm"><CheckCircle size={10}/> {t.inc?.adminSeen || 'SEEN'}</span>}
              </div>

              <div className="pl-3">
                <h4 className={`font-black uppercase text-base mb-1.5 pr-24 leading-tight ${canEdit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>{inc.incident_name || 'Incident'}</h4>
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-4 flex items-center gap-1.5"><MapPin size={12} className={canEdit ? 'text-rose-400' : 'text-slate-400'}/> {inc.incident_location}</p>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mb-2 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">{inc.details}</div>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                  <button onClick={(e) => copyToWhatsApp(e, inc)} className="flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex justify-center items-center gap-1.5 hover:bg-emerald-100 transition-colors shadow-sm">
                     <Copy size={14} /> {t.inc?.copyWA || 'Copy'}
                  </button>
                  
                  {canEdit ? (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(inc); }} className="p-3 text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"><Edit2 size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(inc); }} className="p-3 text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"><Trash2 size={14} /></button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 px-4 py-3 text-[9px] uppercase tracking-widest font-black text-slate-400 bg-slate-100 dark:bg-slate-800/50 rounded-xl cursor-not-allowed border border-slate-200 dark:border-slate-700/50 shadow-inner">
                      <Lock size={12}/> Expired
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-slate-500 text-base mt-10 font-bold italic">{t.inc?.noInc || 'No Incidents'}</p>}
      </div>

      {/* ✨ THE UPGRADED SUPERVISOR iOS MODAL (FIXED FOR MOBILE SCROLLING) */}
      {viewingInc && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/90 backdrop-blur-sm z-[150] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200" onClick={() => setViewingInc(null)}>
          
          {/* THE FIX: Swapped hard h-[90vh] for a flexible max-h-[85vh] and ensured w-full doesn't break boundaries! */}
          <div className="bg-white dark:bg-[#0f172a] w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 border-t sm:border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            
            <div className="h-1.5 w-12 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden shrink-0"></div>
            
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start shrink-0 bg-white dark:bg-[#0f172a]">
               <div className="pr-4 flex-1">
                 <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm ${viewingInc.status === 'Acknowledged' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800'}`}>
                   {viewingInc.status === 'Acknowledged' ? '✅ Admin Acknowledged' : '🚨 Pending Review'}
                 </span>
                 {/* break-words stops long titles from stretching the screen! */}
                 <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-3 uppercase tracking-tight leading-tight break-words">{viewingInc.incident_name || 'Incident Report'}</h2>
               </div>
               <button onClick={() => setViewingInc(null)} className="p-2.5 text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors shrink-0"><X size={18} /></button>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1 bg-slate-50/50 dark:bg-slate-900/20">
               
               {/* Time Matrix */}
               <div className="grid grid-cols-2 gap-3">
                 <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-2xl border-2 border-rose-100 dark:border-rose-500/20 shadow-sm relative overflow-hidden">
                   <Clock className="absolute -right-2 -bottom-2 text-rose-200 dark:text-rose-500/20 w-12 h-12 sm:w-16 sm:h-16" />
                   <span className="text-[9px] sm:text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-1.5 relative z-10">Time Occurred</span>
                   <span className="text-xs sm:text-sm font-black text-rose-700 dark:text-rose-400 leading-tight relative z-10 break-words">{viewingInc.time_of_incident}</span>
                 </div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                   <Activity className="absolute -right-2 -bottom-2 text-slate-100 dark:text-slate-700 w-12 h-12 sm:w-16 sm:h-16" />
                   <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 relative z-10">Time Reported</span>
                   <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 leading-tight relative z-10 break-words">{viewingInc.time_of_reporting}</span>
                 </div>
               </div>

               {/* Meta Data Box - Fixed layout so it doesn't break out horizontally! */}
               <div className="flex flex-col gap-3 bg-white dark:bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
                 <div className="grid grid-cols-2 gap-3">
                   <div className="min-w-0"><span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Reported By</span><span className="font-bold text-slate-800 dark:text-slate-200 uppercase truncate block">{viewingInc.reported_by}</span></div>
                   <div className="min-w-0"><span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">EP Number</span><span className="font-mono font-bold text-indigo-500 truncate block">{viewingInc.ep_number}</span></div>
                 </div>
                 <div className="border-t border-slate-100 dark:border-slate-800 pt-3"><span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Location</span><span className="font-bold text-slate-800 dark:text-slate-200 uppercase flex items-start gap-1.5 break-words"><MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5"/> <span>{viewingInc.incident_location}</span></span></div>
               </div>

               {/* Details Blocks with break-words to prevent spill! */}
               <div className="space-y-4">
                 <div className="bg-white dark:bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><strong className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><FileText size={14}/> Details</strong><p className="whitespace-pre-wrap text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed break-words">{viewingInc.details}</p></div>
                 <div className="bg-white dark:bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><strong className="text-[10px] font-black text-purple-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Search size={14}/> Findings</strong><p className="whitespace-pre-wrap text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed break-words">{viewingInc.findings}</p></div>
                 <div className="bg-white dark:bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><strong className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Activity size={14}/> Action Taken</strong><p className="whitespace-pre-wrap text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed break-words">{viewingInc.actions_taken}</p></div>
                 <div className="bg-white dark:bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><strong className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Shield size={14}/> Recommendations</strong><p className="whitespace-pre-wrap text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed break-words">{viewingInc.recommendations}</p></div>
               </div>
               
               {/* Photos */}
               {(viewingInc.photos && viewingInc.photos.length > 0) && (
                 <div className="bg-white dark:bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                   <strong className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3"><ImageIcon size={14}/> Evidence Attached</strong>
                   <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                     {viewingInc.photos.map((p, i) => (
                       <img key={i} src={p} alt="evidence" className="h-24 w-24 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0" />
                     ))}
                   </div>
                 </div>
               )}
            </div>
            
            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] shrink-0 sm:rounded-b-[2.5rem]">
               <button onClick={(e) => { copyToWhatsApp(e, viewingInc); setViewingInc(null); }} className="w-full py-3.5 sm:py-4 rounded-2xl text-[11px] sm:text-xs font-black bg-green-500 text-white flex justify-center items-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-500/30 uppercase tracking-widest active:scale-95">
                 <Copy size={18} /> Copy Full Report
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ==========================================
// 🚨 FAANG ADMIN INCIDENT VIEW (UPGRADED DUAL-DATE)
// ==========================================
function AdminIncidentView({ incidents, isLoading, onAcknowledge, onDelete, SITES = [], STATE_NAMES = [], SITES_BY_STATE = {} }) {
  // ✨ FAANG DATE RANGE ENGINE!
  const [filterStartDate, setFilterStartDate] = useState(getISTDate());
  const [filterEndDate, setFilterEndDate] = useState(getISTDate());
  
  const [filterState, setFilterState] = useState("All");
  const [filterSite, setFilterSite] = useState("All");
  const [searchTerm, setSearchTerm] = useState(""); 
  const [viewingInc, setViewingInc] = useState(null);

  const availableSites = filterState === "All" ? SITES : SITES_BY_STATE[filterState] || [];
  
  // ✨ THE SMART DATE RANGE FILTER!
  const filtered = incidents.filter(i => {
    const safeSiteName = (i.site || "").toUpperCase();
    const stMatch = filterState === "All" || (SITES_BY_STATE[filterState] && SITES_BY_STATE[filterState].includes(safeSiteName));
    const siMatch = filterSite === "All" || safeSiteName === filterSite;
    
    const q = searchTerm.toLowerCase();
    const searchMatch = searchTerm === "" || 
      (i.incident_name || "").toLowerCase().includes(q) ||
      (i.incident_location || "").toLowerCase().includes(q) ||
      (i.reported_by || "").toLowerCase().includes(q) ||
      (i.details || "").toLowerCase().includes(q);

    // ⏱️ The Time-Travel Math!
    let dMatch = true;
    if (filterStartDate || filterEndDate) {
      // Safely grab the "YYYY-MM-DD" part of the incident date
      const rawDate = i.time_of_incident || i.created_at || "";
      const incDateStr = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate.split(' ')[0];
      
      if (filterStartDate && filterEndDate) {
        dMatch = incDateStr >= filterStartDate && incDateStr <= filterEndDate;
      } else if (filterStartDate) {
        dMatch = incDateStr >= filterStartDate;
      } else if (filterEndDate) {
        dMatch = incDateStr <= filterEndDate;
      }
    }

    return dMatch && stMatch && siMatch && searchMatch;
  });

  const downloadPhoto = (e, url, idx) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = url;
    a.download = `Incident_${viewingInc.site}_Photo_${idx+1}.jpg`;
    a.click();
  };

  // ✨ FAANG BULK EXPORT ENGINE!
  const exportIncidentsCSV = () => {
    if (filtered.length === 0) return alert("Oops! 🥺 No incidents to export with these filters!");
    
    const headers = ['Date Occurred', 'Date Reported', 'Site', 'Pincode', 'Incident Type', 'Exact Location', 'Reported By', 'EP Number', 'Status', 'Details', 'Findings', 'Action Taken', 'Recommendations'];
    
    const csvRows = filtered.map(i => {
      const clean = (text) => `"${(text || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      return [
        clean(i.time_of_incident), clean(i.time_of_reporting), clean(i.site), clean(i.pincode),
        clean(i.incident_name), clean(i.incident_location), clean(i.reported_by), clean(i.ep_number),
        clean(i.status), clean(i.details), clean(i.findings), clean(i.actions_taken), clean(i.recommendations)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CBG_Bulk_Incidents_${filterSite}_RangeExport.csv`;
    link.click();
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

        <SmartDateFilter startDate={filterStartDate} setStartDate={setFilterStartDate} endDate={filterEndDate} setEndDate={setFilterEndDate} />

        <FilterSelect label="State" value={filterState} onChange={e => {setFilterState(e); setFilterSite("All");}} options={STATE_NAMES} />
        <FilterSelect label="Site" value={filterSite} onChange={setFilterSite} options={[...availableSites].sort()} />
        
        <div className="flex gap-2 w-full xl:w-auto mt-2 xl:mt-0 ml-auto">
          <button onClick={exportIncidentsCSV} className="text-[11px] font-black tracking-widest text-white bg-rose-600 hover:bg-rose-500 px-5 py-3 rounded-2xl transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-95 flex-1 sm:flex-none">
            <Download size={14} /> BULK EXPORT
          </button>
          
          {/* ✨ फिक्स: क्लियर बटन अब 'Today' पर रीसेट होगा! */}
          <button onClick={() => { setFilterStartDate(getISTDate()); setFilterEndDate(getISTDate()); setFilterState('All'); setFilterSite('All'); setSearchTerm(''); }} className="text-[11px] font-black tracking-widest text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-5 py-3 rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex-1 sm:flex-none">
            CLEAR
          </button>
        </div>
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
        {filtered.length === 0 && <div className="col-span-full py-24 text-center text-slate-500 font-bold flex flex-col items-center"><CheckCircle size={56} className="text-slate-300 dark:text-slate-700 mb-5"/> No incidents reported in this timeframe! 🟢</div>}
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

function WeeklyMobileForm({ userProfile, fetchWeeklyReports, setActiveTab, language }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const [fd, setFd] = useState({
    dateFrom: '', dateTo: '', srNo: '', dispSolid: '', dispGas: '', dispScrap: '', recCompany: '', recContractor: '',
    ogpNRGP: '', ogpRmgp: '', ogpRmgpIn: '', vehContractor: '', vehCompany: '', footContractor: '', footRil: '', footVisitor: '', footGov: '',
    depDaySS: '', depDaySG: '', depNightSS: '', depNightSG: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    const newReport = {
      site: userProfile.site, date_from: fd.dateFrom, date_to: fd.dateTo, sr_no: fd.srNo, disp_solid: fd.dispSolid, disp_gas: fd.dispGas, disp_scrap: fd.dispScrap,
      rec_company: fd.recCompany, rec_contractor: fd.recContractor, ogp_nrgp: fd.ogpNRGP, ogp_rmgp: fd.ogpRmgp, ogp_rmgp_in: fd.ogpRmgpIn,
      veh_contractor: fd.vehContractor, veh_company: fd.vehCompany, foot_contractor: fd.footContractor, foot_ril: fd.footRil, foot_visitor: fd.footVisitor, foot_gov: fd.footGov,
      dep_day_ss: fd.depDaySS, dep_day_sg: fd.depDaySG, dep_night_ss: fd.depNightSS, dep_night_sg: fd.depNightSG
    };
    const { error } = await supabase.from('weekly_reports').insert([newReport]);
    setIsSubmitting(false);
    if (error) alert(`Error: ${error.message}`);
    else { fetchWeeklyReports(); setActiveTab('history'); }
  };

  const renderInput = (valKey) => (
    <td className="border border-slate-300 dark:border-slate-700 p-0">
      <input type="number" required value={fd[valKey]} onChange={(e) => setFd({...fd, [valKey]: e.target.value})} className="w-14 sm:w-20 bg-transparent text-center py-3 text-base font-bold text-slate-900 dark:text-white outline-none focus:bg-emerald-50 dark:focus:bg-emerald-900/30 transition-colors" />
    </td>
  );

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      <div className="bg-emerald-50 dark:bg-emerald-500/10 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
        <h3 className="font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest text-xs mb-3 flex items-center gap-2"><Calendar size={16}/> {t.mis.selectDates}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[9px] font-black text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mb-1">{t.mis.dateFrom}</label><input type="date" required value={fd.dateFrom} onChange={(e) => setFd({...fd, dateFrom: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-lg py-2.5 px-3 text-sm font-bold outline-none text-emerald-800 dark:text-emerald-200 [color-scheme:light] dark:[color-scheme:dark]" /></div>
          <div><label className="block text-[9px] font-black text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mb-1">{t.mis.dateTo}</label><input type="date" required value={fd.dateTo} onChange={(e) => setFd({...fd, dateTo: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-lg py-2.5 px-3 text-sm font-bold outline-none text-emerald-800 dark:text-emerald-200 [color-scheme:light] dark:[color-scheme:dark]" /></div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"><h4 className="font-black text-slate-700 dark:text-slate-300 text-xs uppercase tracking-widest flex items-center gap-2"><FileText size={16}/> {t.mis.register}</h4></div>
        <div className="overflow-x-auto custom-scrollbar p-2">
          {/* Note: Table headers are kept in English as they are standardized global tags/acronyms (RMGP, NRGP, etc) */}
          <table className="w-max border-collapse border border-slate-300 dark:border-slate-700 text-center text-[10px] font-black uppercase tracking-widest">
            <thead>
              <tr className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 min-w-[60px]">Sr. No.</th>
                <th rowSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 min-w-[120px]">SITE</th>
                <th colSpan="3" className="border border-slate-300 dark:border-slate-700 p-2 bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400">DISPATCH</th>
                <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 bg-indigo-100/50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400">RECEIPT</th>
                <th colSpan="3" className="border border-slate-300 dark:border-slate-700 p-2 bg-amber-100/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400">OGP</th>
                <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 bg-blue-100/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">VEHICLE</th>
                <th colSpan="2" className="border border-slate-300 dark:border-slate-700 p-2 bg-purple-100/50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">CON/RIL STAFF</th>
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
                <td className="border border-slate-300 dark:border-slate-700 p-0"><input type="text" required value={fd.srNo} onChange={(e) => setFd({...fd, srNo: e.target.value})} className="w-16 sm:w-20 bg-transparent text-center py-3 text-base font-bold outline-none" /></td>
                <td className="border border-slate-300 dark:border-slate-700 p-3 text-xs font-black text-slate-400">{userProfile.site}</td>
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

      <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-xl font-black text-base bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 flex justify-center items-center gap-2 uppercase tracking-widest mt-6">
        {isSubmitting ? t.mis.syncing : <><BookOpen size={18} /> {t.mis.submit}</>}
      </button>
    </form>
  );
}
// ==========================================
// 📋 WEEKLY LEDGER REPORT MODULE (PREMIUM iOS VIEW + 24H LOCK 🔒)
// ==========================================
function WeeklyMobileHistory({ weeklyReports, isLoading, onEditWeekly }) {
  const [viewingRep, setViewingRep] = useState(null);

  // ✨ THE TIMELOCK BRAIN: Checks if the report is older than 24 hours! 🧠
  const checkIsEditable = (createdAt) => {
    if (!createdAt) return false;
    const recordTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    const hoursPassed = (currentTime - recordTime) / (1000 * 60 * 60);
    return hoursPassed <= 24; // If it's been less than 24 hours, they can edit!
  };

  if (isLoading) return <div className="p-8 text-center text-emerald-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Decrypting Ledgers...</div>;
  
  return (
    <div className="p-4 space-y-5 pb-24">
      {weeklyReports.map(rep => {
        const canEdit = checkIsEditable(rep.created_at); // 🔒 Check the lock status!

        return (
          <div key={rep.id} onClick={() => setViewingRep(rep)} className="bg-white dark:bg-[#0f172a] p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-slate-100 dark:border-slate-800 relative cursor-pointer active:scale-[0.98] transition-transform group overflow-hidden">
            
            {/* Aesthetic Side Ribbon */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${canEdit ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'}`}></div>

            <div className="absolute top-5 right-5 bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-black text-[9px] uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">Sr. {rep.sr_no}</div>
            
            <div className="pl-2">
              <h4 className="font-black text-slate-900 dark:text-white uppercase text-lg mb-1 tracking-tight pr-16">{rep.site}</h4>
              <p className={`text-[10px] font-bold tracking-widest uppercase mb-5 flex items-center gap-1.5 ${canEdit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                <Calendar size={12}/> {rep.date_from} ➔ {rep.date_to}
              </p>
              
              {/* Sleek Data Grid */}
              <div className="grid grid-cols-3 gap-3 text-[10px] font-bold text-center border-t border-slate-100 dark:border-slate-800 pt-4 mb-5">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm"><span className="text-slate-400 block mb-1 uppercase tracking-widest text-[8px]">Dispatch</span><span className="text-slate-800 dark:text-slate-200 text-sm">{(parseInt(rep.disp_solid||0) + parseInt(rep.disp_gas||0) + parseInt(rep.disp_scrap||0))}</span></div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm"><span className="text-slate-400 block mb-1 uppercase tracking-widest text-[8px]">Receipt</span><span className="text-slate-800 dark:text-slate-200 text-sm">{(parseInt(rep.rec_company||0) + parseInt(rep.rec_contractor||0))}</span></div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm"><span className="text-slate-400 block mb-1 uppercase tracking-widest text-[8px]">Footfall</span><span className="text-slate-800 dark:text-slate-200 text-sm">{(parseInt(rep.foot_contractor||0) + parseInt(rep.foot_ril||0) + parseInt(rep.foot_visitor||0) + parseInt(rep.foot_gov||0))}</span></div>
              </div>

              {/* ✨ THE TIMELOCKED BUTTONS */}
              <div className="grid grid-cols-2 gap-3">
                {canEdit ? (
                  <button onClick={(e) => { e.stopPropagation(); onEditWeekly(rep); }} className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 flex justify-center items-center gap-1.5 hover:bg-indigo-100 transition-colors shadow-sm border border-indigo-200 dark:border-indigo-500/30">
                     <Edit2 size={14}/> Edit / Resend
                  </button>
                ) : (
                  <div className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500 flex justify-center items-center gap-1.5 border border-slate-200 dark:border-slate-700/50 cursor-not-allowed shadow-inner">
                     <Lock size={14}/> Expired
                  </div>
                )}
                <button onClick={() => setViewingRep(rep)} className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white flex justify-center items-center gap-1.5 hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20 border border-emerald-600">
                   <Eye size={14}/> View Master
                </button>
              </div>
            </div>
          </div>
        );
      })}
      {weeklyReports.length === 0 && <p className="text-center text-slate-500 text-sm mt-10 font-bold italic">No weekly ledgers found.</p>}

      {/* ✨ CYBER-GLASS MOBILE MODAL FOR SUPERVISORS */}
      {viewingRep && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-md z-[150] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200" onClick={() => setViewingRep(null)}>
          
          <div className="bg-white/90 dark:bg-[#0B1120]/80 backdrop-blur-3xl border border-white/50 dark:border-emerald-500/20 w-full sm:max-w-5xl max-h-[85vh] sm:max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_0_80px_-15px_rgba(16,185,129,0.2)] overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500" onClick={e => e.stopPropagation()}>
            
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="h-1.5 w-12 bg-slate-300/50 dark:bg-slate-700/50 rounded-full mx-auto mt-3 sm:hidden shrink-0 relative z-20"></div>
            
            {/* Sleek Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-start relative z-10">
               <div>
                 <span className="text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-sm">Sr No. {viewingRep.sr_no}</span>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3 uppercase tracking-tight leading-none drop-shadow-sm">{viewingRep.site}</h2>
                 <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5"><Calendar size={12}/> {viewingRep.date_from} to {viewingRep.date_to}</p>
               </div>
               <button onClick={() => setViewingRep(null)} className="p-2.5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 bg-white/50 dark:bg-black/40 backdrop-blur-md rounded-full shadow-sm border border-white/50 dark:border-slate-700/50 transition-colors active:scale-95"><X size={18} /></button>
            </div>
            
            {/* 📊 THE HIGH-CONTRAST CRISP TABLE WRAPPER */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar relative z-10">
               <div className="overflow-x-auto border-2 border-slate-300 dark:border-slate-600 rounded-[1.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] bg-white dark:bg-[#0B1120] custom-scrollbar pb-2">
                 
                 <table className="w-max min-w-full border-collapse text-center text-[10px] font-black uppercase tracking-widest">
                   <thead>
                     <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                       <th rowSpan="2" className="border-2 border-slate-300 dark:border-slate-700 p-3 min-w-[60px]">Sr. No.</th>
                       <th rowSpan="2" className="border-2 border-slate-300 dark:border-slate-700 p-3 min-w-[100px]">SITE</th>
                       <th colSpan="3" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-400">DISPATCH</th>
                       <th colSpan="2" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-400">RECEIPT</th>
                       <th colSpan="3" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-400">OGP</th>
                       <th colSpan="2" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-400">VEHICLE</th>
                       <th colSpan="2" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-400">CON/RIL STAFF</th>
                       <th rowSpan="2" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400">VISITOR</th>
                       <th rowSpan="2" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400">GOV.<br/>OFF.</th>
                       <th colSpan="4" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-slate-300 dark:bg-slate-700/80 text-slate-900 dark:text-white">DEPLOYMENT</th>
                     </tr>
                     <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300">
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">SOLID</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">GAS</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">SCRAP</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">COMPANY</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">CONTRACTOR</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">NRGP</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">RMGP</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">RMGP IN</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2 px-1">CON.<br/>VEH</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2 px-1">CO.<br/>VEH</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2 px-1">CON.<br/>WORKER</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2 px-1">RIL<br/>EMP.</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">Day SS</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">Day SG</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">Night SS</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">Night SG</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr className="text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-black">{viewingRep.sr_no}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-black text-emerald-700 dark:text-emerald-400">{viewingRep.site}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.disp_solid || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.disp_gas || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-black text-rose-600 dark:text-rose-400">{viewingRep.disp_scrap || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.rec_company || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.rec_contractor || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.ogp_nrgp || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-black text-amber-600 dark:text-amber-500">{viewingRep.ogp_rmgp || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-black text-emerald-600 dark:text-emerald-500">{viewingRep.ogp_rmgp_in || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.veh_contractor || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.veh_company || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.foot_contractor || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.foot_ril || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-black text-purple-600 dark:text-purple-400">{viewingRep.foot_visitor || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-black text-purple-600 dark:text-purple-400">{viewingRep.foot_gov || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.dep_day_ss || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.dep_day_sg || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.dep_night_ss || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.dep_night_sg || 0}</td>
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
// 📈 OPERATIONAL OPERATIONS & THREAT MATRIX (CSO DASHBOARD)
// ==========================================
function AdminWeeklyView({ weeklyReports, isLoading, COMMISSIONED_SITES = [], SITES = [], STATE_NAMES = [], SITES_BY_STATE = {}, onDeleteWeekly }) {
  const [filterStartDate, setFilterStartDate] = useState(getISTDate());
  const [filterEndDate, setFilterEndDate] = useState(getISTDate());
  const [filterState, setFilterState] = useState("All"); 
  const [filterSite, setFilterSite] = useState("All");
  const [viewingRep, setViewingRep] = useState(null);

  // ✨ NEW: THE GPS TRACKER & BACKGROUND LOCK! 📍
  const [scrollPos, setScrollPos] = useState(0);
  React.useEffect(() => {
    if (viewingRep) {
       setScrollPos(window.scrollY); // Locks onto your exact screen position!
       document.body.style.overflow = 'hidden'; // Freezes the background scroll!
    } else {
       document.body.style.overflow = 'auto'; // Unfreezes when closed
    }
    return () => { document.body.style.overflow = 'auto'; }; // Safety cleanup
  }, [viewingRep]);

  // ✨ OPERATIONAL FILTER MAGIC: We ONLY want operational/commissioned sites in this dropdown!
  const baseSites = filterState === "All" ? SITES : SITES_BY_STATE[filterState] || [];
  const availableSites = baseSites.filter(site => (COMMISSIONED_SITES || []).includes(site));

  // ✨ OPERATIONAL STATE MAGIC: Only show states that actually have commissioned sites!
  const operationalStates = STATE_NAMES.filter(st => 
    (SITES_BY_STATE[st] || []).some(site => (COMMISSIONED_SITES || []).includes(site))
  );

  const filtered = weeklyReports.filter(r => {
    // ✨ MAGIC: Filter MIS Reports by the date they were SUBMITTED to the vault!
    const rDate = getISTDateString(r.created_at); 
    const dMatch = (!filterStartDate || rDate >= filterStartDate) && (!filterEndDate || rDate <= filterEndDate);
    const safeSiteName = (r.site || "").toUpperCase();
    const stMatch = filterState === "All" || (SITES_BY_STATE[filterState] && SITES_BY_STATE[filterState].includes(safeSiteName));
    const sMatch = filterSite === "All" || safeSiteName === filterSite;
    return dMatch && stMatch && sMatch;
  });

  const num = (v) => parseInt(v) || 0;

  // ✨ THE MEMORY BRAINS
  let totalStrictDeficit = 0;
  const siteDeficits = []; 
  
  let tSolid = 0, tGas = 0, tScrap = 0;
  let recCo = 0, recCon = 0;
  let nrgp = 0, rmgpOut = 0, rmgpIn = 0;
  let vehCon = 0, vehCo = 0;
  let footCon = 0, footRil = 0;
  let tGov = 0;
  const govVisitsList = [];

  filtered.forEach(r => {
    tSolid += num(r.disp_solid);
    tGas += num(r.disp_gas);
    tScrap += num(r.disp_scrap);

    recCo += num(r.rec_company);
    recCon += num(r.rec_contractor);

    nrgp += num(r.ogp_nrgp);
    const rOut = num(r.ogp_rmgp);
    const rIn = num(r.ogp_rmgp_in);
    rmgpOut += rOut;
    rmgpIn += rIn;
    
    if (rOut > rIn) {
      const deficit = rOut - rIn;
      totalStrictDeficit += deficit;
      
      const existing = siteDeficits.find(x => x.site === r.site);
      if (existing) existing.deficit += deficit;
      else siteDeficits.push({ site: r.site, deficit });
    }

    vehCon += num(r.veh_contractor);
    vehCo += num(r.veh_company);

    footCon += num(r.foot_contractor);
    footRil += num(r.foot_ril);

    const govCount = num(r.foot_gov);
    tGov += govCount;
    if (govCount > 0) {
      const existing = govVisitsList.find(x => x.site === r.site);
      if (existing) existing.count += govCount;
      else govVisitsList.push({ site: r.site, count: govCount });
    }
  });

  siteDeficits.sort((a, b) => b.deficit - a.deficit);

  const assetDeficit = totalStrictDeficit;
  const isAssetAlert = assetDeficit > 0;

  // ✨ FIXED: The Compliance math now perfectly respects the Date & State filters!
  let expectedCommissionedSites = availableSites.filter(s => (COMMISSIONED_SITES || []).includes(s));
  if (filterSite !== "All") expectedCommissionedSites = expectedCommissionedSites.filter(s => s === filterSite);
  
  const submittedSitesList = [...new Set(filtered.map(r => (r.site || "").toUpperCase()))]; 
  const pendingSitesList = expectedCommissionedSites.filter(s => !submittedSitesList.includes((s || "").toUpperCase()));
  const complianceRate = expectedCommissionedSites.length > 0 ? Math.round((submittedSitesList.length / expectedCommissionedSites.length) * 100) : 0;

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

  const anomalies = [];
  const allSites = [...new Set(weeklyReports.map(r => (r.site || "").toUpperCase()))];

  allSites.forEach(site => {
    const siteReps = weeklyReports.filter(r => (r.site || "").toUpperCase() === site).sort((a, b) => num(b.sr_no) - num(a.sr_no));
    if (siteReps.length >= 2) {
      const curr = siteReps[0]; 
      const prev = siteReps[1]; 

      const checkSpike = (key, label) => {
        const diff = num(curr[key]) - num(prev[key]);
        if (diff >= 50) anomalies.push({ site, label, prev: num(prev[key]), curr: num(curr[key]), diff });
      };

      checkSpike('disp_scrap', 'Scrap');
      checkSpike('disp_gas', 'Gas/Slurry');
      checkSpike('rec_company', 'Receipts (Co)');
      checkSpike('rec_contractor', 'Receipts (Con)');
    }
  });
  anomalies.sort((a, b) => b.diff - a.diff);

  return (
    <div className="space-y-6 relative">
      
    {/* 🟢 COMMAND BAR */}
      {/* ✨ फिक्स: z-[100] इसे Asset Leakage कार्ड के बिल्कुल ऊपर रखेगा! */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 flex flex-wrap justify-between items-end gap-4 relative overflow-visible z-[100]">
        
        {/* ✨ FIXED: Trap the glow inside an absolute hidden div, free the dropdown! */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full"></div>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10">
          <SmartDateFilter startDate={filterStartDate} setStartDate={setFilterStartDate} endDate={filterEndDate} setEndDate={setFilterEndDate} />
          <FilterSelect label="State" value={filterState} onChange={e => {setFilterState(e); setFilterSite("All");}} options={operationalStates} />
          <FilterSelect label="OPERATIONAL Site" value={filterSite} onChange={setFilterSite} options={[...availableSites].sort()} />
          
          {/* ✨ FIXED: CLEAR button now correctly resets the new date states! */}
          <button onClick={() => { setFilterStartDate(getISTDate()); setFilterEndDate(getISTDate()); setFilterState('All'); setFilterSite('All'); }} className="text-[10px] font-black tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors h-max mb-0.5">CLEAR</button>
        </div>
        <button onClick={exportMasterAudit} className="relative z-10 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95">
          <Download size={16} /> Export Master Audit
        </button>
      </div>

      {/* 🚨 SECURITY KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CHART 1: ASSET LEAKAGE */}
        <div className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border-t-4 shadow-sm transition-all relative group cursor-help z-40 ${isAssetAlert ? 'border-rose-500 dark:shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-indigo-500 border-slate-200 dark:border-slate-800'}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Leakage</h3>
            <Shield size={16} className={isAssetAlert ? 'text-rose-500 animate-pulse' : 'text-indigo-500'}/>
          </div>
          <div className={`text-2xl font-black ${isAssetAlert ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{assetDeficit > 0 ? `-${assetDeficit}` : 'SECURE'}</div>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">RMGP Deficit</p>

          {siteDeficits.length > 0 && (
            <div className="absolute top-[80%] left-0 mt-2 w-full bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black p-4 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-2xl border border-slate-700 flex flex-col gap-2 transform translate-y-2 group-hover:translate-y-0">
              <span className="text-rose-400 dark:text-rose-600 border-b border-slate-600 dark:border-slate-300 pb-1.5 mb-1 uppercase tracking-widest">Leaking Nodes</span>
              <div className="max-h-32 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                {siteDeficits.map((sd, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="uppercase truncate pr-2">{sd.site}</span>
                    <span className="bg-rose-500/20 text-rose-300 dark:bg-rose-500/10 dark:text-rose-600 px-2 py-0.5 rounded shadow-sm shrink-0">-{sd.deficit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CHART 2: GOVT OFFICIALS VISIT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative group z-30">
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

        {/* CHART 3: COMPLIANCE ROLLCALL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative group z-20">
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
                 {submittedSitesList.length} / {expectedCommissionedSites.length}
               </span>
             </div>
             <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-slate-700">
               <div style={{width: `${complianceRate}%`}} className={`h-full transition-all duration-1000 ${complianceRate === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
             </div>
           </div>

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

        {/* CHART 4: SURGE ANOMALIES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative group cursor-help z-10">
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

      {/* 📊 THE TRIPLE-THREAT VISUAL MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        
        {/* CHART 1: DISPATCH */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-[300px] group">
           <div className="flex justify-between items-start mb-6 shrink-0">
             <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Dispatch</h3>
               <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1 flex items-center gap-1.5"> <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>{filterSite === "All" ? "Global Network" : filterSite}</p>
             </div>
             <Activity size={16} className="text-emerald-500"/>
           </div>
           <div className="flex-1 relative flex items-end justify-around gap-4 px-2 pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2 pb-2 opacity-[0.05] dark:opacity-[0.1]">{[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-slate-900 dark:border-slate-100"></div>)}</div>
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

        {/* CHART 2: RECEIPTS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-[300px] group">
           <div className="flex justify-between items-start mb-6 shrink-0">
             <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Receipts</h3>
               <p className="text-[9px] font-bold text-blue-500 uppercase mt-1 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>{filterSite === "All" ? "Global Network" : filterSite}</p>
             </div>
             <Activity size={16} className="text-blue-500"/>
           </div>
           <div className="flex-1 relative flex items-end justify-around gap-6 px-4 pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-4 pb-2 opacity-[0.05] dark:opacity-[0.1]">{[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-slate-900 dark:border-slate-100"></div>)}</div>
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

        {/* CHART 3: OGP */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-[300px] group">
           <div className="flex justify-between items-start mb-6 shrink-0">
             <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">OGP Assets</h3>
               <p className="text-[9px] font-bold text-amber-500 uppercase mt-1 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>{filterSite === "All" ? "Global Network" : filterSite}</p>
             </div>
             <Shield size={16} className="text-amber-500"/>
           </div>
           <div className="flex-1 relative flex items-end justify-around gap-4 px-2 pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2 pb-2 opacity-[0.05] dark:opacity-[0.1]">{[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-slate-900 dark:border-slate-100"></div>)}</div>
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

        {/* CHART 4: OPERATIONS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-[300px] group">
           <div className="flex justify-between items-start mb-6 shrink-0">
             <div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Site Presence</h3>
               <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"></span>{filterSite === "All" ? "Global Network" : filterSite}</p>
             </div>
             <Users size={16} className="text-indigo-500"/>
           </div>
           <div className="flex-1 relative flex items-end justify-around gap-2 px-1 pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-1 pb-2 opacity-[0.05] dark:opacity-[0.1]">{[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-slate-900 dark:border-slate-100"></div>)}</div>
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

      {/* 🗂️ TACTICAL LEDGER WALL (PREMIUM UPGRADE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(r => {
          const r_rmgpOut = num(r.ogp_rmgp);
          const r_rmgpIn = num(r.ogp_rmgp_in);
          const r_scrap = num(r.disp_scrap);
          const isLeakage = r_rmgpOut > r_rmgpIn;
          const isHighScrap = r_scrap > 50; 
          const hasAnomaly = isLeakage || isHighScrap;

          return (
            <div key={r.id} onClick={() => setViewingRep(r)} className={`bg-white dark:bg-[#0f172a] p-6 rounded-[2rem] border-2 cursor-pointer hover:-translate-y-1.5 transition-all group relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${hasAnomaly ? 'border-rose-200 dark:border-rose-500/30' : 'border-slate-100 dark:border-slate-800'}`}>
              
              {hasAnomaly && <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 blur-2xl rounded-full pointer-events-none"></div>}
              {hasAnomaly && <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>}
              {!hasAnomaly && <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>}
              
              <div className="flex justify-between items-start mb-4 pl-2">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Sr. {r.sr_no}</p>
                  <h4 className="font-black text-slate-900 dark:text-white uppercase text-xl leading-none">{r.site}</h4>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
                  <Calendar size={10} /> {r.date_from}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5 pl-2">
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl shadow-sm relative overflow-hidden">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Dispatch</span>
                  <span className={`text-xl font-black relative z-10 ${isHighScrap ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>{num(r.disp_solid)+num(r.disp_gas)+r_scrap}</span>
                  {isHighScrap && <AlertTriangle size={16} className="absolute right-3 bottom-3 text-rose-500/20" />}
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl shadow-sm relative overflow-hidden">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">RMGP Delta</span>
                  <span className={`text-xl font-black relative z-10 ${isLeakage ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{isLeakage ? `-${r_rmgpOut - r_rmgpIn}` : '0 Loss'}</span>
                  {isLeakage && <Shield size={16} className="absolute right-3 bottom-3 text-rose-500/20" />}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 📄 CYBER-GLASS DEEP DIVE MODAL (GPS TRACKED FOR MOBILE!) */}
      {viewingRep && (
        <div 
          className="absolute left-0 w-full z-[150] bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-300" 
          style={{ top: `${scrollPos}px`, height: '100dvh' }}
          onClick={() => setViewingRep(null)}
        >
          {/* ✨ The Premium Floating Glass Container */}
          <div className="bg-white/90 dark:bg-[#0B1120]/80 backdrop-blur-3xl border-t sm:border border-white/50 dark:border-emerald-500/20 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_0_80px_-15px_rgba(16,185,129,0.3)] w-full max-w-5xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-[0.95] duration-500" onClick={e => e.stopPropagation()}>
             
             {/* 🔮 Ambient Background Glows */}
             <div className="absolute -top-32 -left-32 w-72 h-72 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none"></div>
             <div className="absolute top-1/2 -right-32 w-72 h-72 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

             <div className="h-1.5 w-12 bg-slate-300/50 dark:bg-slate-700/50 rounded-full mx-auto mt-3 sm:hidden shrink-0 relative z-20"></div>

             {/* Sleek Translucent Header */}
             <div className="p-5 sm:p-8 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-start relative z-10">
               <div>
                 <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-sm px-3 py-1.5 rounded-lg uppercase tracking-widest">Sr No. {viewingRep.sr_no}</span>
                 <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-4 uppercase tracking-tight drop-shadow-sm leading-none">{viewingRep.site}</h2>
                 <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5"><Calendar size={12}/> Logged: {viewingRep.date_from} TO {viewingRep.date_to}</p>
               </div>
               <button onClick={() => setViewingRep(null)} className="p-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white/50 dark:bg-black/40 backdrop-blur-md rounded-full shadow-sm border border-white/50 dark:border-slate-700/50 transition-all active:scale-95"><X size={18} /></button>
             </div>
             
             {/* 📊 THE HIGH-CONTRAST CRISP TABLE WRAPPER */}
             <div className="p-4 sm:p-8 overflow-y-auto custom-scrollbar relative z-10">
               {/* Made the table background solid and gave it a juicy drop-shadow so it pops off the glass! */}
               <div className="overflow-x-auto border-2 border-slate-300 dark:border-slate-600 rounded-[1.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] bg-white dark:bg-[#0B1120] custom-scrollbar pb-2">
                 
                 {/* Thick borders, stark text, solid colors! */}
                 <table className="w-max min-w-full border-collapse text-center text-[10px] font-black uppercase tracking-widest">
                   <thead>
                     <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                       <th rowSpan="2" className="border-2 border-slate-300 dark:border-slate-700 p-3">Sr. No.</th>
                       <th rowSpan="2" className="border-2 border-slate-300 dark:border-slate-700 p-3">SITE</th>
                       <th colSpan="3" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-400">DISPATCH</th>
                       <th colSpan="2" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-400">RECEIPT</th>
                       <th colSpan="3" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-400">OGP</th>
                       <th colSpan="2" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-400">VEHICLE</th>
                       <th colSpan="2" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-400">CON/RIL STAFF</th>
                       <th rowSpan="2" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400">VISITOR</th>
                       <th rowSpan="2" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400">GOV.<br/>OFF.</th>
                       <th colSpan="4" className="border-2 border-slate-300 dark:border-slate-700 p-3 bg-slate-300 dark:bg-slate-700/80 text-slate-900 dark:text-white">DEPLOYMENT</th>
                     </tr>
                     <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300">
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">SOLID</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">GAS</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">SCRAP</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">COMPANY</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">CONTRACTOR</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">NRGP</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">RMGP</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">RMGP IN</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">CON.<br/>VEH</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">CO.<br/>VEH</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">CON.<br/>WORKER</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">RIL<br/>EMP.</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">Day SS</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">Day SG</th>
                       <th className="border border-slate-300 dark:border-slate-700 p-2">Night SS</th>
                       <th className="border-2 border-slate-300 dark:border-slate-700 p-2">Night SG</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr className="text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-black">{viewingRep.sr_no}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-black text-emerald-700 dark:text-emerald-400">{viewingRep.site}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.disp_solid || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.disp_gas || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-black text-rose-600 dark:text-rose-400">{viewingRep.disp_scrap || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.rec_company || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.rec_contractor || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.ogp_nrgp || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-black text-amber-600 dark:text-amber-500">{viewingRep.ogp_rmgp || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-black text-emerald-600 dark:text-emerald-500">{viewingRep.ogp_rmgp_in || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.veh_contractor || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.veh_company || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.foot_contractor || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.foot_ril || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-black text-purple-600 dark:text-purple-400">{viewingRep.foot_visitor || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-black text-purple-600 dark:text-purple-400">{viewingRep.foot_gov || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.dep_day_ss || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.dep_day_sg || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.dep_night_ss || 0}</td>
                       <td className="border-2 border-slate-300 dark:border-slate-700 p-4 font-bold">{viewingRep.dep_night_sg || 0}</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
             </div>

             {/* 🕹️ Translucent Footer */}
             <div className="p-4 sm:p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-black/40 backdrop-blur-xl flex flex-col sm:flex-row justify-between gap-3 shrink-0 sm:rounded-b-[2.5rem] relative z-10">
               
               {/* 🚨 THE ULTIMATE GOD-MODE SNIPER BUTTON */}
               <button onClick={async () => { 
                  if(window.confirm("🚨 Are you absolutely sure you want to permanently delete this ledger?")) {
                    try {
                        // ✨ THE FIX: We target the exact Site and Sr_No so Supabase CANNOT miss it!
                        const targetSrNo = viewingRep.sr_no;
                        const targetSite = viewingRep.site;
                        const targetId = viewingRep.id;

                        // Build the sniper query!
                        let query = supabase.from('weekly_reports').delete();
                        
                        if (targetId) {
                            query = query.eq('id', targetId);
                        } else {
                            query = query.eq('sr_no', targetSrNo).eq('site', targetSite);
                        }

                        // We add .select() so Supabase is forced to hand us back the ashes of what it deleted!
                        const { data, error } = await query.select();
                        
                        if (error) {
                           alert("Hold up babe! Database error: " + error.message);
                        } else if (!data || data.length === 0) {
                           alert("🚨 Ghost Record! Supabase couldn't find this exact row to delete. Check your Row Level Security (RLS) settings in Supabase!");
                        } else {
                           // 2. Clear it from the local screen memory
                           if (typeof onDeleteWeekly === 'function') {
                              onDeleteWeekly(targetId || targetSrNo); 
                           }
                           setViewingRep(null);
                           alert("✅ Ledger permanently vaporized from the vault!");
                           
                           // 3. Force the blink refresh!
                           window.location.reload();
                        }
                    } catch (err) {
                        alert("Oops! Something glitched: " + err.message);
                    }
                  }
               }} className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl text-[11px] sm:text-xs font-black text-rose-600 bg-white/60 dark:bg-black/50 hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-200/50 dark:border-rose-500/30 uppercase tracking-widest w-full sm:w-auto active:scale-95">
                 <Trash2 size={16} /> Delete Ledger
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
               }} className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl text-[11px] sm:text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 border border-indigo-500/50 uppercase tracking-widest active:scale-95">
                 <Download size={16} /> Download .CSV
               </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
// ==========================================
// ⚙️ THE ULTIMATE HORIZONTAL SETTINGS DASHBOARD
// ==========================================
function AdminSettingsView({ userProfile, globalSites, STATE_NAMES, onAddSite, onToggleStatus, onDeleteSite, onClose }) {
  const [activeTab, setActiveTab] = useState('profile'); 
  
  // Site Form States
  const [newSiteInput, setNewSiteInput] = useState('');
  const [newStateSelection, setNewStateSelection] = useState(''); 
  const [customStateInput, setCustomStateInput] = useState(''); 
  
  const [networkFilter, setNetworkFilter] = useState('All');
  const [siteSearchTerm, setSiteSearchTerm] = useState('');

  const [allProfiles, setAllProfiles] = useState([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [rosterSearch, setRosterSearch] = useState(''); 

  const [editingProfileId, setEditingProfileId] = useState(null);
  const [editProfileName, setEditProfileName] = useState('');

  const [newCred, setNewCred] = useState({ email: '', password: '', site: '', names: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (activeTab === 'profile' || activeTab === 'roster') {
      const fetchProfiles = async () => {
        setIsLoadingProfiles(true);
        const { data, error } = await supabase.from('profiles').select('*').order('role', { ascending: true });
        if (!error && data) setAllProfiles(data);
        setIsLoadingProfiles(false);
      };
      fetchProfiles();
    }
  }, [activeTab]);

  const handleCreateCredential = async (e) => {
    e.preventDefault();
    if (!newCred.site) return alert("Please select a site!");
    setIsGenerating(true);
    
    const { data, error } = await supabase.functions.invoke('create-site-user', {
      body: { email: newCred.email, password: newCred.password, site: newCred.site, names: newCred.names.toUpperCase() }
    });

    setIsGenerating(false);

    if (error || (data && data.error)) {
      alert(`Vault Rejection: ${error?.message || data?.error}`);
    } else {
      alert("✅ Site Terminal Access Granted!");
      setNewCred({ email: '', password: '', site: '', names: '' });
      const { data: newProfiles } = await supabase.from('profiles').select('*').order('role', { ascending: true });
      if (newProfiles) setAllProfiles(newProfiles);
    }
  };

  const handleSaveProfileEdit = async (id) => {
    const { error } = await supabase.from('profiles').update({ name: editProfileName.toUpperCase() }).eq('id', id);
    if (!error) {
      setAllProfiles(allProfiles.map(p => p.id === id ? { ...p, name: editProfileName.toUpperCase() } : p));
      setEditingProfileId(null);
    }
  };

  const handleDeleteProfile = async (id, name, role) => {
    if (role === 'admin') return alert("You cannot delete an Admin from this UI. 🛡️");
    if(window.confirm(`🚨 Revoke access for ${name}?`)) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) setAllProfiles(allProfiles.filter(p => p.id !== id));
    }
  };

  const submitNewSite = (e) => {
    e.preventDefault();
    if (newSiteInput.trim()) {
      const finalState = newStateSelection === 'NEW' ? customStateInput.trim() : newStateSelection;
      if (!finalState) return alert("Please select or enter a state!");
      onAddSite(newSiteInput.trim(), finalState);
      setNewSiteInput(''); setNewStateSelection(''); setCustomStateInput('');
    }
  };

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
    <div className="flex flex-col h-full w-full animate-in fade-in duration-300">
      
      {/* ✨ THE GORGEOUS HORIZONTAL HEADER & SLIDING TABS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-4 sm:p-6 shadow-sm mb-6 flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden shrink-0">
        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Title Area */}
        <div className="relative z-10 flex items-center justify-between w-full xl:w-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
              <Settings className="text-indigo-500" /> System Preferences
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Enterprise Configuration Vault</p>
          </div>
          {/* Mobile Close Button */}
          <button onClick={onClose} className="xl:hidden p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-rose-100 hover:text-rose-600 transition-colors shadow-sm border border-slate-200 dark:border-slate-700">
            <X size={20} />
          </button>
        </div>

        {/* ✨ THE DYNAMIC COLOR-CHANGING SLIDING PILL TABS! */}
        <div className="relative flex bg-slate-100 dark:bg-[#0B1120] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner w-full xl:w-[550px] z-10">
          <div className={`absolute top-1.5 bottom-1.5 w-[calc(33.333%-4px)] rounded-xl shadow-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 ${
            activeTab === 'profile' ? 'bg-indigo-500 shadow-indigo-500/30' :
            activeTab === 'roster' ? 'bg-emerald-500 shadow-emerald-500/30' :
            'bg-blue-500 shadow-blue-500/30'
          }`} style={{ transform: `translateX(${activeTab === 'profile' ? '0%' : activeTab === 'roster' ? 'calc(100% + 6px)' : 'calc(200% + 12px)'})`}}></div>

          <button onClick={() => setActiveTab('profile')} className={`flex-1 relative z-10 py-3.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors duration-300 ${activeTab === 'profile' ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>My Profile</button>
          <button onClick={() => setActiveTab('roster')} className={`flex-1 relative z-10 py-3.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors duration-300 ${activeTab === 'roster' ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>Profile Manager</button>
          <button onClick={() => setActiveTab('sites')} className={`flex-1 relative z-10 py-3.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors duration-300 ${activeTab === 'sites' ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>Site Network</button>
        </div>

        {/* Desktop Close Button */}
        <button onClick={onClose} className="hidden xl:block relative z-10 p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 transition-colors active:scale-95 shadow-sm border border-slate-200 dark:border-slate-700">
          <X size={20} />
        </button>
      </div>

      {/* ✨ CONTENT CANVAS */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 px-1">
        
        {/* 👤 TAB 1: MY PROFILE (THE CLASSY BLACK CARD) */}
        {activeTab === 'profile' && (
          <div className="animate-in slide-in-from-bottom-4 flex justify-center">
            <div className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-[#0B1120] to-black rounded-[2.5rem] p-10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] border border-slate-800 relative overflow-hidden flex flex-col group mt-10">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700"></div>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

              <div className="flex justify-between items-start relative z-10 mb-10">
                <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg border border-white/20 text-4xl font-black text-white">
                  {userProfile.name.charAt(0)}
                </div>
                <div className="text-right">
                  <ShieldCheck size={28} className="text-indigo-400 ml-auto mb-2" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Clearance Level</p>
                  <p className="text-sm font-black text-indigo-400 uppercase tracking-widest">God-Mode / Admin</p>
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Authorized Official</p>
                <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight leading-none mb-6 drop-shadow-md">{userProfile.name}</h2>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2.5 shadow-sm">
                    <MapPin size={16} className="text-emerald-400"/>
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">{userProfile.site} Base</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2.5 shadow-sm">
                    <Activity size={16} className="text-rose-400"/>
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Network Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔐 TAB 2: PROFILE MANAGER (CLASSY ROSTER) */}
        {activeTab === 'roster' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            
            {/* THE GENERATOR UI */}
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                <ShieldCheck size={18} className="text-emerald-500"/> Issue New Node Access
              </h3>
              
              <form onSubmit={handleCreateCredential} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 relative z-10 items-end">
                <div className="xl:col-span-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Site Terminal</label>
                  <select required value={newCred.site} onChange={(e) => setNewCred({...newCred, site: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white uppercase focus:border-emerald-500 outline-none shadow-sm cursor-pointer">
                    <option value="">Select Node...</option>
                    {globalSites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="xl:col-span-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Mail ID</label>
                  <input type="email" required placeholder="site@cbg.com" value={newCred.email} onChange={(e) => setNewCred({...newCred, email: e.target.value.toLowerCase()})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white focus:border-emerald-500 outline-none shadow-sm placeholder-slate-400" />
                </div>
                <div className="xl:col-span-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Secure Password</label>
                  <input type="text" required placeholder="Min 6 chars" minLength="6" value={newCred.password} onChange={(e) => setNewCred({...newCred, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white focus:border-emerald-500 outline-none shadow-sm placeholder-slate-400" />
                </div>
                <div className="xl:col-span-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Officers (Comma separated)</label>
                  <input type="text" required placeholder="Rahul, Amit" value={newCred.names} onChange={(e) => setNewCred({...newCred, names: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white focus:border-emerald-500 outline-none shadow-sm placeholder-slate-400 uppercase" />
                </div>
                <div className="xl:col-span-1">
                  <button type="submit" disabled={isGenerating} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
                    {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <><Unlock size={16}/> Grant Access</>}
                  </button>
                </div>
              </form>
            </div>

            {/* THE MANAGE ROSTER GRID */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2"><Users size={18} className="text-emerald-500"/> Active Roster</h3>
                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search Officers or Sites..." value={rosterSearch} onChange={(e) => setRosterSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors shadow-sm" />
                </div>
              </div>
              
              {isLoadingProfiles ? (
                <div className="p-10 text-center font-bold text-emerald-500 animate-pulse uppercase tracking-widest text-[10px]">Decrypting User Vault...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {allProfiles.filter(p => p.name?.toLowerCase().includes(rosterSearch.toLowerCase()) || p.site?.toLowerCase().includes(rosterSearch.toLowerCase())).map(profile => (
                    <div key={profile.id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-[2rem] shadow-sm hover:shadow-lg transition-all group flex flex-col justify-center min-h-[110px] relative overflow-hidden">
                      
                      {/* INLINE EDIT MODE */}
                      {editingProfileId === profile.id ? (
                        <div className="flex flex-col gap-3 w-full animate-in fade-in duration-200 relative z-10">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Edit Officer Names</label>
                          <input type="text" value={editProfileName} onChange={(e) => setEditProfileName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 uppercase shadow-inner" />
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => handleSaveProfileEdit(profile.id)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1 active:scale-95 transition-transform"><Save size={14}/> Save</button>
                            <button onClick={() => setEditingProfileId(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl shadow-sm active:scale-95 transition-transform">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        /* NORMAL VIEW MODE */
                        <div className="flex items-center gap-5 w-full relative z-10">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 transition-colors shadow-inner border ${profile.role === 'admin' ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white border-rose-400 shadow-rose-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 group-hover:bg-emerald-50 group-hover:border-emerald-200 dark:group-hover:bg-emerald-500/10 dark:group-hover:border-emerald-500/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'}`}>
                            {profile.name ? profile.name[0] : '?'}
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase truncate leading-tight mb-2">{profile.name}</h4>
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] font-bold text-slate-500 uppercase truncate flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700/50"><MapPin size={10}/> {profile.site}</p>
                              {profile.role === 'admin' && <span className="bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-rose-200 dark:border-rose-500/30 shadow-sm">Admin</span>}
                            </div>
                          </div>

                          {/* HOVER ACTIONS */}
                          <div className="shrink-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingProfileId(profile.id); setEditProfileName(profile.name); }} className="p-2.5 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-900 rounded-xl hover:shadow-sm transition-all border border-slate-200 dark:border-slate-800" title="Edit Names"><Edit2 size={14}/></button>
                            {profile.role !== 'admin' && (
                              <button onClick={() => handleDeleteProfile(profile.id, profile.name, profile.role)} className="p-2.5 text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-slate-900 rounded-xl hover:shadow-sm transition-all border border-slate-200 dark:border-slate-800" title="Revoke Access"><Trash2 size={14}/></button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🌍 TAB 3: SITE NETWORK MANAGER */}
        {activeTab === 'sites' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Site Network</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global base station tracking</p>
              </div>
            </div>
            
            {/* THE DEPLOYMENT WIDGET */}
            <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <h3 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10"><PlusCircle size={18} className="text-blue-500"/> Establish New Tracking Site</h3>
              
              <form onSubmit={submitNewSite} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end relative z-10">
                <div className="xl:col-span-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Region / State</label>
                  <select value={newStateSelection} onChange={e => setNewStateSelection(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white uppercase focus:border-blue-500 outline-none shadow-sm cursor-pointer">
                    <option value="">-- SELECT STATE --</option>
                    {STATE_NAMES?.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="NEW">+ ADD NEW STATE</option>
                  </select>
                </div>
                
                {newStateSelection === 'NEW' && (
                  <div className="xl:col-span-1 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2 ml-1">New State Name</label>
                    <input type="text" placeholder="Enter here..." value={customStateInput} onChange={e => setCustomStateInput(e.target.value)} className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white uppercase focus:border-blue-500 outline-none shadow-sm placeholder-blue-300 dark:placeholder-blue-700" />
                  </div>
                )}
                
                <div className={`xl:col-span-${newStateSelection === 'NEW' ? '1' : '2'}`}>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Facility Name</label>
                  <input type="text" value={newSiteInput} onChange={(e) => setNewSiteInput(e.target.value)} placeholder="ENTER SITE NAME..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white uppercase focus:border-blue-500 outline-none shadow-sm placeholder-slate-400" />
                </div>
                
                <div className="xl:col-span-1">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                    <Zap size={16}/> Deploy Node
                  </button>
                </div>
              </form>
            </div>

            {/* THE NETWORK GRID */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2"><MapPin size={18} className="text-blue-500"/> Global Matrix</h3>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Viewing: {displaySites.length} Total Sites</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search Site..." value={siteSearchTerm} onChange={(e) => setSiteSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors shadow-sm placeholder-slate-400" />
                  </div>

                  <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner w-full sm:w-auto shrink-0">
                    <button onClick={() => setNetworkFilter('All')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${networkFilter === 'All' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>All</button>
                    <button onClick={() => setNetworkFilter('commissioned')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${networkFilter === 'commissioned' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-emerald-600 dark:text-emerald-400'}`}>Active</button>
                    <button onClick={() => setNetworkFilter('project')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${networkFilter === 'project' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-amber-600 dark:text-amber-400'}`}>Project</button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedStates.map(stateName => {
                  const sitesInState = groupedSites[stateName].sort((a,b) => a.name.localeCompare(b.name));
                  const commissionedCount = sitesInState.filter(s => s.status === 'commissioned').length;
                  
                  return (
                    <div key={stateName} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden flex flex-col max-h-[400px]">
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{stateName}</h4>
                        <span className="text-[9px] font-black text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md uppercase tracking-widest border border-slate-300 dark:border-slate-700">
                          {commissionedCount}/{sitesInState.length} Live
                        </span>
                      </div>

                      <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3 bg-slate-50/30 dark:bg-slate-900/30">
                        {sitesInState.map(site => (
                          <div key={site.id} className="flex justify-between items-center p-3.5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800 group hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${site.status === 'commissioned' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-amber-400'}`}></div>
                              <span className={`text-xs font-black uppercase tracking-wide ${site.status === 'commissioned' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>{site.name}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button onClick={() => onToggleStatus(site.id, site.status)} className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all active:scale-95 ${site.status === 'commissioned' ? 'bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-900/40 dark:hover:text-rose-400' : 'bg-blue-50 text-blue-600 hover:bg-emerald-500 hover:text-white dark:bg-blue-500/10 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-500/20'}`}>
                                {site.status === 'commissioned' ? 'Revert' : 'Commission'}
                              </button>
                              <button onClick={() => onDeleteSite(site.id, site.name)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-500/10 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-sm">
                                <Trash2 size={14} />
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
      <input type="number" required value={fd[valKey] || ''} onChange={(e) => setFd({...fd, [valKey]: e.target.value})} className="w-14 sm:w-20 bg-transparent text-center py-3 text-base font-bold text-slate-900 dark:text-white outline-none focus:bg-indigo-50 dark:focus:bg-indigo-900/30 transition-colors" />
    </td>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-950/30 shrink-0">
          <div>
            <h3 className="font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-2 uppercase tracking-widest text-base sm:text-base"><Edit2 size={18} /> Edit & Resend Report</h3>
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
                  <td className="border border-slate-300 dark:border-slate-700 p-0"><input type="text" required value={fd.sr_no || ''} onChange={(e) => setFd({...fd, sr_no: e.target.value})} className="w-16 sm:w-20 bg-transparent text-center py-3 text-base font-bold outline-none focus:bg-indigo-50 dark:focus:bg-indigo-900/30" /></td>
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

// ==========================================
// 📢 FAANG ADMIN BROADCAST VIEW (WITH SCHEDULER!)
// ==========================================
function AdminBroadcastView({ SITES = [], globalSites = [], userProfile }) {
  const safeSites = SITES.length > 0 ? SITES : (globalSites || []).map(s => s.name);

  const [title, setTitle] = useState('');
  const [messageEng, setMessageEng] = useState('');
  const [messageReg, setMessageReg] = useState('');
  const [targetMode, setTargetMode] = useState('ALL');
  const [selectedSites, setSelectedSites] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);
  
  const [pastBroadcasts, setPastBroadcasts] = useState([]);
  const [acks, setAcks] = useState([]);

  // ✨ NEW: DIRECTIVE FILTERS
  const [filterStartDate, setFilterStartDate] = useState(getISTDate());
  const [filterEndDate, setFilterEndDate] = useState(getISTDate());
  const [searchQuery, setSearchQuery] = useState('');

  // ✨ FAANG SCHEDULER STATES ✨
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [repeatType, setRepeatType] = useState('none'); 
  const [repeatCount, setRepeatCount] = useState(1);

  const [siteSearch, setSiteSearch] = useState('');
  const [viewingBroadcast, setViewingBroadcast] = useState(null);

  const displaySites = safeSites.filter(s => s.toLowerCase().includes(siteSearch.toLowerCase()));

  const fetchBroadcastData = async () => {
     const { data: bData } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false });
     const { data: aData } = await supabase.from('broadcast_acknowledgments').select('*');
     if(bData) setPastBroadcasts(bData);
     if(aData) setAcks(aData);
  }

  React.useEffect(() => { fetchBroadcastData(); }, []);

  const toggleSite = (site) => {
     if (selectedSites.includes(site)) setSelectedSites(selectedSites.filter(s => s !== site));
     else setSelectedSites([...selectedSites, site]);
  };

  const handleDeploy = async (e) => {
    e.preventDefault();
    if(targetMode === 'SPECIFIC' && selectedSites.length === 0) return alert("Babe, select at least one site first! 🛑");
    if(isScheduled && (!scheduleDate || !scheduleTime)) return alert("Cutie, you forgot to pick a date or time for the schedule! ⏰");
    
    setIsDeploying(true);
    const finalMessage = messageReg.trim() ? `${messageEng}\n\n---\n\n${messageReg}` : messageEng;
    const targetSitesPayload = targetMode === 'ALL' ? ['ALL'] : selectedSites;

    // ✨ Bundle the schedule data for the vault!
    const insertPayload = {
       title: title.toUpperCase(),
       message: finalMessage,
       target_sites: targetSitesPayload,
       created_by: userProfile.name,
       is_scheduled: isScheduled,
       scheduled_time: isScheduled ? `${scheduleDate}T${scheduleTime}:00` : null,
       repeat_type: isScheduled ? repeatType : 'none',
       repeat_count: isScheduled && repeatType !== 'none' ? parseInt(repeatCount) : 0
    };

    const { error } = await supabase.from('broadcasts').insert([insertPayload]);
    
    setIsDeploying(false);
    if(error) alert("Vault Error: " + error.message);
    else {
       setTitle(''); setMessageEng(''); setMessageReg(''); setSelectedSites([]); 
       setTargetMode('ALL'); setIsScheduled(false); setScheduleDate(''); setScheduleTime(''); setRepeatType('none'); setRepeatCount(1);
       fetchBroadcastData();
       alert(`🚀 ${isScheduled ? 'Scheduled Routine' : 'Immediate Directive'} Deployed to ${targetSitesPayload.includes('ALL') ? 'Global Network' : targetSitesPayload.length + ' targets'}!`);
    }
  };

  const deleteBroadcast = async (id) => {
     if(window.confirm("🚨 Permanently recall this directive?")) {
        await supabase.from('broadcasts').delete().eq('id', id);
        fetchBroadcastData();
     }
  }

  return (
     <>
     <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full pb-20">
        {/* LEFT: THE MEGAPHONE */}
        <div className="flex flex-col gap-4">
           
           <div className={`p-6 rounded-3xl shadow-lg relative overflow-hidden group transition-all duration-500 ${isScheduled ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30' : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30'} text-white`}>
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
              <h2 className="font-black uppercase tracking-widest text-xl flex items-center gap-2 relative z-10">
                {isScheduled ? <><Clock size={24}/> Routine Scheduler</> : <><Zap size={24}/> Global Megaphone</>}
              </h2>
              <p className="text-xs font-bold text-white/80 mt-1 relative z-10">
                {isScheduled ? 'Automated Time-Released Directives' : 'Air-Gapped Confidential Broadcasting'}
              </p>
           </div>

           <form onSubmit={handleDeploy} className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-6">
              
              {/* ✨ IMMEDIATE VS SCHEDULED TOGGLE */}
              <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl shadow-inner relative">
                <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl transition-all duration-300 shadow-md ${!isScheduled ? 'bg-amber-500 translate-x-0 shadow-amber-500/20' : 'bg-indigo-500 translate-x-[calc(100%+4px)] shadow-indigo-500/20'}`}></div>
                <button type="button" onClick={() => setIsScheduled(false)} className={`flex-1 py-3 flex justify-center items-center gap-2 text-xs font-black uppercase tracking-widest relative z-10 transition-colors ${!isScheduled ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}><Zap size={14}/> Instant Action</button>
                <button type="button" onClick={() => setIsScheduled(true)} className={`flex-1 py-3 flex justify-center items-center gap-2 text-xs font-black uppercase tracking-widest relative z-10 transition-colors ${isScheduled ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}><Clock size={14}/> Schedule Time</button>
              </div>

              {/* ✨ THE GORGEOUS SCHEDULER UI! */}
              {isScheduled && (
                <div className="bg-indigo-50 dark:bg-indigo-500/5 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-inner animate-in slide-in-from-top-2">
                  <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Calendar size={12}/> Time & Repeat Configuration</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Trigger Date</label>
                      <input type="date" required={isScheduled} value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Trigger Time</label>
                      <input type="time" required={isScheduled} value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Recurrence Pattern</label>
                      <select value={repeatType} onChange={e => setRepeatType(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 uppercase">
                        <option value="none">Onetime Alert</option>
                        <option value="daily">Every Day</option>
                        <option value="weekly">Every Week</option>
                      </select>
                    </div>
                    {repeatType !== 'none' && (
                      <div className="animate-in fade-in">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Repeat Count</label>
                        <input type="number" min="1" max="365" value={repeatCount} onChange={e => setRepeatCount(e.target.value)} placeholder="e.g. 5 times" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Target Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl shadow-inner relative mt-2">
                <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl transition-all duration-300 ${targetMode === 'ALL' ? 'bg-slate-400 dark:bg-slate-600 translate-x-0 shadow-md' : 'bg-slate-400 dark:bg-slate-600 translate-x-[calc(100%+4px)] shadow-md'}`}></div>
                <button type="button" onClick={() => setTargetMode('ALL')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${targetMode === 'ALL' ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}>Global Network</button>
                <button type="button" onClick={() => setTargetMode('SPECIFIC')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${targetMode === 'SPECIFIC' ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}>Specific Sites</button>
              </div>

              {/* The Specific Sites Selector Grid with Search! */}
              {targetMode === 'SPECIFIC' && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner animate-in slide-in-from-top-2">
                  <div className="flex flex-col gap-3 mb-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12}/> Select Targets</span>
                      <div className="space-x-3">
                        <button type="button" onClick={() => setSelectedSites([...safeSites])} className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black tracking-widest hover:underline">SELECT ALL</button>
                        <button type="button" onClick={() => setSelectedSites([])} className="text-[10px] text-rose-500 dark:text-rose-400 font-black tracking-widest hover:underline">CLEAR</button>
                      </div>
                    </div>
                    {/* THE SEARCH BAR */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Search specific sites..." value={siteSearch} onChange={e => setSiteSearch(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors shadow-sm placeholder-slate-400 uppercase" />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {displaySites.map(site => {
                      const isSel = selectedSites.includes(site);
                      return (
                        <button type="button" key={site} onClick={() => toggleSite(site)} className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isSel ? 'bg-slate-700 text-white border-slate-800 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}>
                          {site}
                        </button>
                      )
                    })}
                    {displaySites.length === 0 && <span className="text-xs text-slate-400 italic font-medium p-2">No matching sites found. 🥺</span>}
                  </div>
                </div>
              )}

              {/* Input Fields */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Directive Subject</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. MANDATORY HELMET CHECK" className="w-full bg-slate-50 dark:bg-[#0B1120] border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm font-black text-slate-900 dark:text-white focus:border-amber-500 outline-none uppercase transition-all" />
              </div>

              {/* Dual Box */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Primary Instruction (English)</label>
                <textarea required value={messageEng} onChange={e => setMessageEng(e.target.value)} placeholder="Type confidential instruction here..." className="w-full bg-slate-50 dark:bg-[#0B1120] border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:border-amber-500 outline-none min-h-[100px] resize-y transition-all"></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5"><Activity size={12}/> Regional Translation (Optional)</label>
                <textarea value={messageReg} onChange={e => setMessageReg(e.target.value)} placeholder="Type Hindi/Regional translation here..." className="w-full bg-amber-50/50 dark:bg-amber-500/5 border-2 border-amber-200 dark:border-amber-500/30 rounded-xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:border-amber-500 outline-none min-h-[80px] resize-y placeholder-amber-700/40 dark:placeholder-amber-500/40 transition-all"></textarea>
              </div>

              <button type="submit" disabled={isDeploying} className={`w-full py-4 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg flex justify-center items-center gap-2 active:scale-95 transition-all ${isScheduled ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'}`}>
                 {isDeploying ? <RefreshCw size={18} className="animate-spin" /> : (
                   isScheduled ? <><Clock size={18}/> Arm Schedule in Vault</> : <><Zap size={18}/> Deploy to Vault</>
                 )}
              </button>
           </form>
        </div>

        {/* RIGHT: THE LIVE RECEIPTS DASHBOARD */}
        <div className="flex flex-col gap-4 mt-6 xl:mt-0">
           <div className="flex flex-col gap-3 px-2">
             <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
               <CheckCircle size={20} className="text-emerald-500" /> Dispatch History
             </h2>
             
             {/* ✨ NEW: ADMIN BROADCAST FILTERS */}
             <div className="flex gap-2">
               <div className="relative flex-1">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="text" placeholder="Search Directive..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors shadow-sm" />
               </div>
              <SmartDateFilter startDate={filterStartDate} setStartDate={setFilterStartDate} endDate={filterEndDate} setEndDate={setFilterEndDate} />
               {/* ✨ फिक्स: ब्रॉडकास्ट क्लियर बटन भी अब 'Today' पर रीसेट होगा! */}
               {(filterStartDate !== getISTDate() || filterEndDate !== getISTDate() || searchQuery) && <button onClick={() => {setFilterStartDate(getISTDate()); setFilterEndDate(getISTDate()); setSearchQuery('');}} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black hover:bg-rose-100 hover:text-rose-600 transition-colors">CLEAR</button>}
             </div>
           </div>
           
           <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 h-full pb-10">
              {(() => {
                 // ✨ Filter Math runs right here! (NOW WITH IST TIMEZONE FIX!)
                 const filteredAdminBroadcasts = pastBroadcasts.filter(b => {
                    const bDateIST = getISTDateString(b.created_at);
                    const matchDate = (!filterStartDate || bDateIST >= filterStartDate) && (!filterEndDate || bDateIST <= filterEndDate);
                    const q = searchQuery.toLowerCase();
                    const matchSearch = q === '' || (b.title || '').toLowerCase().includes(q) || (b.message || '').toLowerCase().includes(q);
                    return matchDate && matchSearch;
                 });

                 if (filteredAdminBroadcasts.length === 0) {
                    return <p className="text-center text-slate-500 text-sm font-bold italic mt-10">No directives found.</p>;
                 }

                 return filteredAdminBroadcasts.map(b => {
                 const bAcks = acks.filter(a => a.broadcast_id === b.id);
                 let tCount = 0;
                 let targetList = [];
                 try {
                    targetList = typeof b.target_sites === 'string' ? JSON.parse(b.target_sites) : b.target_sites;
                    tCount = targetList.includes('ALL') ? safeSites.length : targetList.length;
                 } catch(e) {}
                 
                 const pct = tCount === 0 ? 0 : Math.round((bAcks.length / tCount) * 100);
                 const isFullyRead = pct >= 100;

                 return (
                    <div key={b.id} className="bg-white dark:bg-[#0f172a] p-5 rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                      <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${b.is_scheduled ? 'bg-indigo-500' : (isFullyRead ? 'bg-emerald-500' : 'bg-amber-400')}`}></div>
                      
                      {/* FAANG ACTION BUTTONS (VIEW & DELETE) */}
                      <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                        <button onClick={() => setViewingBroadcast(b)} className="p-2 text-slate-400 hover:text-indigo-500 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-500/10 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700">
                           <Eye size={14}/>
                        </button>
                        <button onClick={() => deleteBroadcast(b.id)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-500/10 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700">
                           <Trash2 size={14}/>
                        </button>
                      </div>

                      <div className="pl-3 pr-10">
                        <div className="flex items-center gap-2 mb-2">
                          {b.is_scheduled ? (
                            <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1"><Clock size={10}/> Scheduled</span>
                          ) : (
                            <span className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-500/30 flex items-center gap-1"><Zap size={10}/> Instant</span>
                          )}
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(b.created_at).toLocaleString('en-IN')}</span>
                        </div>

                        <h4 className="font-black text-slate-900 dark:text-white uppercase text-base mb-4 leading-tight pr-10">{b.title}</h4>
                        
                        {b.is_scheduled && (
                           <div className="mb-4 bg-indigo-50/50 dark:bg-indigo-500/5 p-2 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                             <p className="text-[9px] font-bold text-indigo-500 uppercase flex items-center gap-1.5"><Calendar size={12}/> Next Run: {new Date(b.scheduled_time).toLocaleString('en-IN')}</p>
                             {b.repeat_type !== 'none' && <p className="text-[9px] font-bold text-indigo-400 uppercase mt-1">Repeats: {b.repeat_type} ({b.repeat_count}x)</p>}
                           </div>
                        )}

                        {!b.is_scheduled && (
                          <>
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                 <Users size={12}/> Acknowledged: {bAcks.length} / {tCount}
                              </span>
                              <span className={`text-xs font-black ${isFullyRead ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'}`}>{pct}%</span>
                            </div>
                            
                            <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                              <div style={{width: `${pct}%`}} className={`h-full transition-all duration-1000 ${isFullyRead ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-amber-400'}`}></div>
                            </div>
                          </>
                        )}

                        {bAcks.length > 0 && !b.is_scheduled && (
                           <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Signed By:</p>
                              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                                 {bAcks.map(a => (
                                    <span key={a.id} className="text-[9px] font-bold px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1">
                                       <CheckCircle size={10} className="text-emerald-500"/> {a.site}
                                    </span>
                                 ))}
                              </div>
                           </div>
                        )}
                      </div>
                    </div>
                 )
              })
            })()} {/* ✨ THIS MAGICAL LINE EXECUTES THE FILTER ENGINE! */}
           </div>
        </div>
     </div>

     {/* ✨ FAANG BROADCAST VIEW MODAL */}
     {viewingBroadcast && (
       <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewingBroadcast(null)}>
         <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-[0_20px_80px_-15px_rgba(0,0,0,0.5)] w-full max-w-2xl overflow-hidden relative animate-in zoom-in-[0.95] duration-300" onClick={e => e.stopPropagation()}>
           
           <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${viewingBroadcast.is_scheduled ? 'bg-indigo-500/10' : 'bg-amber-500/10'}`}></div>
           
           <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-start relative z-10 bg-slate-50/50 dark:bg-slate-900/50">
             <div>
               <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest mb-3 border ${viewingBroadcast.is_scheduled ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'}`}>
                 {viewingBroadcast.is_scheduled ? <><Clock size={10}/> Scheduled Routine</> : <><Megaphone size={10}/> Official Directive</>}
               </span>
               <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tight">{viewingBroadcast.title || "Security Alert"}</h3>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Sent: {new Date(viewingBroadcast.created_at).toLocaleString()}</p>
             </div>
             <button onClick={() => setViewingBroadcast(null)} className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-full shadow-sm transition-all active:scale-95 border border-slate-200 dark:border-slate-700"><X size={16} /></button>
           </div>

           <div className="p-6 sm:p-8 space-y-6 relative z-10">
             
             {viewingBroadcast.is_scheduled && (
                <div className="flex gap-4 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/10">
                   <div>
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Initial Trigger</p>
                     <p className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{new Date(viewingBroadcast.scheduled_time).toLocaleString()}</p>
                   </div>
                   <div className="w-px bg-indigo-200 dark:bg-indigo-500/30"></div>
                   <div>
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Pattern</p>
                     <p className="text-sm font-bold text-indigo-600 dark:text-indigo-300 uppercase">{viewingBroadcast.repeat_type !== 'none' ? `${viewingBroadcast.repeat_type} (${viewingBroadcast.repeat_count}x)` : 'One-Time'}</p>
                   </div>
                </div>
             )}

             <div className="bg-slate-50 dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/50">
               <p className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{viewingBroadcast.message}</p>
             </div>

             <div>
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Target Nodes</h4>
               <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                 {(() => {
                    let targets = [];
                    try { targets = typeof viewingBroadcast.target_sites === 'string' ? JSON.parse(viewingBroadcast.target_sites) : viewingBroadcast.target_sites; } catch(e){}
                    if(targets.includes('ALL')) return <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-500/30">ALL GLOBAL SITES</span>;
                    return targets.map(site => (
                      <span key={site} className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                        <MapPin size={10} className="text-slate-400"/> {site}
                      </span>
                    ))
                 })()}
               </div>
             </div>
           </div>
         </div>
       </div>
     )}
     </>
  )
}


// ==========================================
// 📱 MOBILE SUPERVISOR LEAVE FORM
// ==========================================
function LeaveMobileForm({ userProfile, fillerName, setActiveTab }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return alert("Please select your dates! 📅");
    
    setIsSubmitting(true);
    const { error } = await supabase.from('leaves').insert([{
      site: userProfile.site,
      supervisor_name: fillerName || userProfile.name,
      start_date: startDate,
      end_date: endDate,
      leave_type: leaveType,
      reason: reason
    }]);
    setIsSubmitting(false);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setActiveTab('history');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-5 animate-in fade-in slide-in-from-right-4 duration-300 max-w-md mx-auto">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg leading-tight">Request Leave</h3>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Official Channel</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">From Date</label>
              <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500 shadow-inner" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">To Date</label>
              <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500 shadow-inner" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Leave Category</label>
            <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white uppercase focus:border-purple-500 outline-none shadow-inner cursor-pointer">
              <option value="Casual Leave">Casual Leave (Planned)</option>
              <option value="Sick Leave">Medical / Sick Leave</option>
              <option value="Emergency Leave">Emergency / Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5">Reason for Absence</label>
            <textarea required value={reason} onChange={e => setReason(e.target.value)} placeholder="Provide brief details for control room review..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs font-medium text-slate-900 dark:text-white focus:border-purple-500 outline-none min-h-[100px] resize-y shadow-inner"></textarea>
          </div>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-500/30 flex justify-center items-center gap-2 active:scale-95 transition-all">
        {isSubmitting ? 'Sending Request...' : 'Submit to Command'}
      </button>
    </form>
  );
}

// ==========================================
// 🌴 ADMIN LEAVE COMMAND CENTER
// ==========================================
function AdminLeaveView() {
  const [leaves, setLeaves] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState(''); 
  
  // ✨ Native Date Ranges!
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('leaves').select('*').order('created_at', { ascending: false });
      if (!error && data) setLeaves(data);
      setIsLoading(false);
    };
    fetchLeaves();
  }, []);

  const updateLeaveStatus = async (id, newStatus) => {
    const { error } = await supabase.from('leaves').update({ status: newStatus }).eq('id', id);
    if (!error) setLeaves(leaves.map(l => l.id === id ? { ...l, status: newStatus } : l));
    else alert(`Vault Error: ${error.message}`);
  };

  const filteredLeaves = leaves.filter(l => {
    const matchStatus = filterStatus === 'All' || l.status === filterStatus;
    const matchSearch = searchTerm === '' || (l.supervisor_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // ✨ MAGIC: Now filtering by the EXACT date they pressed 'Submit'!
    const lDate = getISTDateString(l.created_at);
    let matchDate = true;
    if (startDate && endDate) matchDate = lDate >= startDate && lDate <= endDate;
    else if (startDate) matchDate = lDate >= startDate;
    else if (endDate) matchDate = lDate <= endDate;

    return matchStatus && matchSearch && matchDate;
  });

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;

  return (
    // ✨ FIXED SCROLLING: Removed h-full and flex-col so it scrolls naturally on mobile!
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-[2rem] p-8 shadow-lg shadow-purple-500/20 text-white relative overflow-hidden flex items-center justify-between">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Absence Command</h2>
            <p className="text-[10px] font-bold text-purple-200 uppercase tracking-widest">Time-Off & Resource Tracking</p>
          </div>
          <div className="relative z-10 text-right">
            <div className="text-4xl font-black">{pendingCount}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-200">Pending Requests</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-5 shadow-sm flex flex-col justify-center gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors shadow-inner placeholder-slate-400 uppercase h-[42px]" />
            </div>
          </div>

          <div className="flex gap-2 items-center">
             <SmartDateFilter startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl shadow-inner mt-1 overflow-x-auto custom-scrollbar">
            <button onClick={() => setFilterStatus('Pending')} className={`flex-1 min-w-[70px] py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === 'Pending' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>Pending</button>
            <button onClick={() => setFilterStatus('Approved')} className={`flex-1 min-w-[75px] py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === 'Approved' ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>Approved</button>
            
            {/* ✨ THE NEW REJECTED TAB! */}
            <button onClick={() => setFilterStatus('Rejected')} className={`flex-1 min-w-[75px] py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === 'Rejected' ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>Rejected</button>
            
            <button onClick={() => setFilterStatus('All')} className={`flex-1 min-w-[70px] py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === 'All' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>All Logs</button>
          </div>
        </div>
      </div>

      <div>
        {isLoading ? ( <div className="py-20 text-center text-purple-500 font-bold animate-pulse uppercase tracking-widest text-xs">Scanning Vault...</div> ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredLeaves.map(leave => (
              <div key={leave.id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${leave.status === 'Approved' ? 'bg-emerald-500' : leave.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-400'}`}></div>
                <div className="ml-2 flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded uppercase tracking-widest mb-2 inline-block shadow-sm">{leave.site} Node</span>
                    <h4 className="font-black text-slate-900 dark:text-white uppercase text-base leading-tight">{leave.supervisor_name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">{leave.leave_type}</p>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-inner">Posted: {getISTDateString(leave.created_at)}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30' : leave.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30' : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 animate-pulse'}`}>{leave.status}</span>
                </div>
                <div className="ml-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 mb-4 grid grid-cols-2 gap-2">
                  <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1"><Calendar size={10}/> From</p><p className="text-xs font-bold text-slate-700 dark:text-slate-300">{leave.start_date}</p></div>
                  <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1"><Calendar size={10}/> To</p><p className="text-xs font-bold text-slate-700 dark:text-slate-300">{leave.end_date}</p></div>
                </div>
                <div className="ml-2 mb-5 flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Provided Reason:</p>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-2 italic">"{leave.reason}"</p>
                </div>
                {leave.status === 'Pending' && (
                  <div className="ml-2 grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
                    <button onClick={() => updateLeaveStatus(leave.id, 'Approved')} className="bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"><CheckCircle size={14}/> Approve</button>
                    <button onClick={() => updateLeaveStatus(leave.id, 'Rejected')} className="bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"><X size={14}/> Deny</button>
                  </div>
                )}
              </div>
            ))}
            {filteredLeaves.length === 0 && <div className="col-span-full py-16 text-center text-slate-500 text-sm font-bold uppercase tracking-widest">No requests found.</div>}
          </div>
        )}
      </div>
    </div>
  );
}


// ==========================================
// 📱 MOBILE SUPERVISOR LEAVE HISTORY
// ==========================================
function LeaveMobileHistory({ userProfile }) {
  const [myLeaves, setMyLeaves] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyLeaves = async () => {
      const { data } = await supabase.from('leaves').select('*').eq('site', userProfile.site).order('created_at', { ascending: false });
      if (data) setMyLeaves(data);
      setIsLoading(false);
    };
    fetchMyLeaves();
  }, [userProfile.site]);

  if (isLoading) return <div className="p-10 text-center text-purple-500 font-bold animate-pulse text-xs uppercase tracking-widest">Loading History...</div>;

  const filteredLeaves = myLeaves.filter(l => {
    // ✨ MAGIC: Filtering by the exact date the request was logged!
    const lDate = getISTDateString(l.created_at);
    if (startDate && endDate) return lDate >= startDate && lDate <= endDate;
    else if (startDate) return lDate >= startDate;
    else if (endDate) return lDate <= endDate;
    return true;
  });

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto animate-in fade-in slide-in-from-left-4 duration-300 pb-20 relative z-[100]">
      
      {/* ✨ SMART MOBILE DATE FILTER */}
      {/* ✨ FIXED: Changed to overflow-visible and z-[120] so it pops OVER all the cards below it! */}
      <div className="bg-white dark:bg-[#0B1120] p-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3 mb-2 relative overflow-visible z-[120]">
         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={14} className="text-purple-500"/> Audit Filters</span>
         <div className="w-full relative">
            <SmartDateFilter startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
         </div>
      </div>

      {filteredLeaves.length === 0 ? (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center flex flex-col items-center shadow-sm">
          <Calendar size={32} className="text-slate-300 dark:text-slate-600 mb-4"/>
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{(startDate || endDate) ? "No Logs" : "Perfect Attendance"}</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{(startDate || endDate) ? "No requests match dates." : "No past requests found."}</p>
        </div>
      ) : (
        filteredLeaves.map(leave => (
          <div key={leave.id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col active:scale-[0.98] transition-transform">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${leave.status === 'Approved' ? 'bg-emerald-500' : leave.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-400'}`}></div>
            <div className="ml-2 flex justify-between items-start mb-3">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm leading-tight mb-1">{leave.leave_type}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Posted: {getISTDateString(leave.created_at)}</p>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border shadow-sm ${leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30' : leave.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30' : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30'}`}>{leave.status}</span>
            </div>
            <div className="ml-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400"/> {leave.start_date}</span>
              <span className="text-slate-300 dark:text-slate-600">➔</span>
              <span>{leave.end_date}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
// ==========================================
// 📅 FAANG SMART DATE FILTER (PRESETS + CUSTOM)
// ==========================================
function SmartDateFilter({ startDate, setStartDate, endDate, setEndDate }) {
  const [isOpen, setIsOpen] = useState(false);

  const applyPreset = (type) => {
    const getIST = (d) => new Date(d.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    let start = getIST(new Date());
    let end = getIST(new Date());

    if (type === 'today') {
       // already set
    } else if (type === 'yesterday') {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
    } else if (type === 'last7') {
      start.setDate(start.getDate() - 7);
    } else if (type === 'thisMonth') {
      start.setDate(1);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    } else if (type === 'last90') {
      start.setDate(start.getDate() - 90);
    } else if (type === 'all') {
      setStartDate(''); setEndDate(''); setIsOpen(false); return;
    }

    const fmt = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    setStartDate(fmt(start));
    setEndDate(fmt(end));
    setIsOpen(false);
  };

  let displayText = "All Time";
  if (startDate && endDate) {
    if (startDate === endDate) displayText = startDate;
    else displayText = `${startDate} to ${endDate}`;
  } else if (startDate) displayText = `From ${startDate}`;
  else if (endDate) displayText = `Until ${endDate}`;

  return (
    <div className="relative w-full sm:w-auto z-[60]">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between gap-3 w-full sm:w-auto bg-white dark:bg-[#0B1120] border-2 border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 hover:border-indigo-500 transition-colors shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300 h-[42px]">
        <span className="flex items-center gap-2 whitespace-nowrap"><Calendar size={14} className="text-indigo-500"/> {displayText}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          {/* ✨ FIXED: Absolute positioning with z-[9999] so it breaks out of ALL containers! */}
          <div className="absolute top-full mt-2 right-0 sm:left-0 sm:right-auto w-[280px] sm:w-[420px] max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[9999] flex flex-col sm:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             
             {/* LEFT SIDEBAR (PRESETS) */}
             <div className="bg-slate-50 dark:bg-slate-800/50 p-2 sm:w-[140px] flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 shrink-0">
                <button onClick={() => applyPreset('today')} className="text-[10px] font-black uppercase tracking-widest text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition-colors">Today</button>
                <button onClick={() => applyPreset('yesterday')} className="text-[10px] font-black uppercase tracking-widest text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition-colors">Yesterday</button>
                <button onClick={() => applyPreset('last7')} className="text-[10px] font-black uppercase tracking-widest text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition-colors">Last 7 Days</button>
                <button onClick={() => applyPreset('thisMonth')} className="text-[10px] font-black uppercase tracking-widest text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition-colors">This Month</button>
                <button onClick={() => applyPreset('last90')} className="text-[10px] font-black uppercase tracking-widest text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition-colors">Last 90 Days</button>
                <button onClick={() => applyPreset('all')} className="text-[10px] font-black uppercase tracking-widest text-left px-3 py-2.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 transition-colors mt-auto">Clear All</button>
             </div>

             {/* RIGHT SIDEBAR (CUSTOM DATES) */}
             <div className="p-5 flex-1 flex flex-col gap-4 justify-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> Select Custom Date</span>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">From Date</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={e => { 
                        const newStart = e.target.value;
                        setStartDate(newStart); 
                        // ✨ फिक्स: अगर End Date खाली है या Start Date से पहले का है, तभी सिंक करें!
                        if (!endDate || endDate < newStart) {
                           setEndDate(newStart); 
                        }
                      }} 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 [color-scheme:light] dark:[color-scheme:dark] shadow-inner cursor-pointer" 
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">To Date (Optional)</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={e => { 
                        setEndDate(e.target.value); 
                        if (!startDate || startDate > e.target.value) setStartDate(e.target.value); 
                      }} 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 [color-scheme:light] dark:[color-scheme:dark] shadow-inner cursor-pointer" 
                    />
                  </div>
                </div>
                <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => setIsOpen(false)} className="w-full py-3 text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95">Apply Filter</button>
                </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
// ==========================================
// 🚛 NIGHT HAULT MOBILE FORM (SUPERVISOR)
// ==========================================
function NightHaultMobileForm({ userProfile, fetchNightHaults, setActiveTab, fillerName, language }) {
  const t = TRANSLATIONS[language]?.nh || TRANSLATIONS['en'].nh;
  
  // ✨ BACK TO BASICS: Uses the literal, exact present day so supervisors never get confused!
  const [date, setDate] = useState(getISTDate());
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  
  const [vehicles, setVehicles] = useState([
    { id: Date.now(), vehNo: "", material: "", location: "", purpose: "" }
  ]);

  // ✨ MAGIC: Auto-fills material, loc, purpose from previous row, leaves vehNo blank!
  const addVehicle = () => {
    const last = vehicles[vehicles.length - 1];
    setVehicles([...vehicles, { 
      id: Date.now(), 
      vehNo: "", 
      material: last ? last.material : "", 
      location: last ? last.location : "", 
      purpose: last ? last.purpose : "" 
    }]);
  };

  const updateVeh = (id, field, value) => {
    setVehicles(vehicles.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const executeSubmit = async (records) => {
    setIsSubmitting(true);
    const { error } = await supabase.from('night_haults').insert(records);
    setIsSubmitting(false);
    if (error) { alert(`Vault Error: ${error.message}`); } 
    else {
      setSuccessMsg(true); fetchNightHaults();
      setTimeout(() => { 
        setSuccessMsg(false); 
        setVehicles([{ id: Date.now(), vehNo: "", material: "", location: "", purpose: "" }]); 
        setActiveTab('history'); 
      }, 1200);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecords = vehicles.map(v => ({
      date, site: userProfile.site, veh_no: v.vehNo.toUpperCase(), material: v.material, location: v.location, purpose: v.purpose, submitted_by: fillerName || userProfile.name
    }));
    executeSubmit(newRecords);
  };

  const handleMarkNil = () => {
    if(window.confirm("Declare 0 vehicles in plant tonight?")) {
      const nilRecord = [{
        date, site: userProfile.site, veh_no: "NIL", material: "-", location: "-", purpose: "NO VEHICLES IN PLANT", submitted_by: fillerName || userProfile.name
      }];
      executeSubmit(nilRecord);
    }
  };

  const inputClass = "w-full bg-white dark:bg-[#0B1120] border-2 border-slate-300 dark:border-slate-600 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-slate-800 dark:focus:border-slate-400 transition-all shadow-inner";

  return (
    <div className="p-4 space-y-6">
      <div className="bg-slate-900 dark:bg-slate-800 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden group">
        <Truck size={40} className="absolute -right-2 -top-2 text-slate-700/50 group-hover:scale-110 transition-transform"/>
        <h2 className="font-black uppercase tracking-widest text-lg relative z-10">{t.nh || "Night Hault"}</h2>
        <p className="text-xs font-bold text-slate-400 mt-1 relative z-10">{t.nhSub || "Silent Hour Report (11 PM - 5 AM)"}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t.date}</label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`} />
        </div>

        <div className="space-y-5">
          {vehicles.map((v, index) => (
            <div key={v.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vehicle {index + 1}</span>
                {vehicles.length > 1 && <button type="button" onClick={() => setVehicles(vehicles.filter(x => x.id !== v.id))} className="text-slate-400 hover:text-rose-500"><X size={14} /></button>}
              </div>
              <div className="p-5 space-y-4">
                <div><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t.vehNo}</label><input type="text" required placeholder="e.g. MH 04 AB 1234" value={v.vehNo} onChange={(e) => updateVeh(v.id, 'vehNo', e.target.value)} className={`${inputClass} uppercase`} /></div>
                <div><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t.material}</label><input type="text" required value={v.material} onChange={(e) => updateVeh(v.id, 'material', e.target.value)} className={inputClass} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t.loc}</label><input type="text" required value={v.location} onChange={(e) => updateVeh(v.id, 'location', e.target.value)} className={inputClass} /></div>
                  <div><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t.purpose}</label><input type="text" required value={v.purpose} onChange={(e) => updateVeh(v.id, 'purpose', e.target.value)} className={inputClass} /></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addVehicle} className="w-full py-4 rounded-[1.5rem] border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-95 transition-all">
          <Plus size={16} /> {t.addVeh}
        </button>

        <div className="flex gap-3">
          <button type="button" onClick={handleMarkNil} className="flex-1 py-4 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-sm border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 active:scale-95 transition-all">
            {t.markNil}
          </button>
          <button type="submit" disabled={isSubmitting} className={`flex-1 py-4 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${successMsg ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-600 shadow-slate-900/30'}`}>
            {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : successMsg ? <CheckCircle size={14} /> : <Save size={14} />} {successMsg ? 'SAVED' : t.submit}
          </button>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// 🚛 NIGHT HAULT HISTORY (SUPERVISOR)
// ==========================================
function NightHaultMobileHistory({ nightHaults, isLoading, language }) {
  const [filterStartDate, setFilterStartDate] = useState(getISTDate());
  const [filterEndDate, setFilterEndDate] = useState(getISTDate());
  
  if (isLoading) return <div className="p-10 text-center font-bold text-slate-500 animate-pulse text-[10px] uppercase tracking-widest">Loading...</div>;

  const filtered = nightHaults.filter(n => {
    const dMatch = (!filterStartDate || n.date >= filterStartDate) && (!filterEndDate || n.date <= filterEndDate);
    return dMatch;
  });

  return (
    <div className="p-4 space-y-4 pb-24 relative z-[100]">
      <div className="bg-white dark:bg-[#0B1120] p-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3 mb-2 relative overflow-visible z-[100]">
         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={14} className="text-slate-500"/> Audit Filters</span>
         <div className="w-full relative">
            <SmartDateFilter startDate={filterStartDate} setStartDate={setFilterStartDate} endDate={filterEndDate} setEndDate={setFilterEndDate} />
         </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center shadow-sm text-slate-500 font-bold text-xs uppercase tracking-widest">No reports found.</div>
      ) : (
        filtered.map((log, i) => (
          <div key={log.id} className="bg-white dark:bg-[#0f172a] rounded-[1.5rem] p-5 shadow-sm border border-slate-200 dark:border-slate-800 relative">
             <div className={`absolute top-0 left-0 w-1.5 h-full ${log.veh_no === 'NIL' ? 'bg-emerald-500' : 'bg-slate-800 dark:bg-slate-500'}`}></div>
             <div className="ml-2 flex justify-between items-start mb-3">
               <h4 className={`font-black text-lg uppercase tracking-tight leading-tight ${log.veh_no === 'NIL' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>{log.veh_no}</h4>
               <span className="text-[9px] font-bold text-slate-400">{log.date}</span>
             </div>
             {log.veh_no !== 'NIL' && (
               <div className="ml-2 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                 <p className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">📦 {log.material}</p>
                 <p className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">📍 {log.location}</p>
                 <p className="col-span-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">🎯 {log.purpose}</p>
               </div>
             )}
          </div>
        ))
      )}
    </div>
  );
}

// ==========================================
// 🚛 ADMIN NIGHT HAULT VIEW (MASTER SHEET EXPORT + EDIT/DELETE)
// ==========================================
function AdminNightHaultView({ nightHaults, isLoading, onEdit, onDelete, SITES = [], STATE_NAMES = [], SITES_BY_STATE = {}, COMMISSIONED_SITES = [] }) {
  const [filterStartDate, setFilterStartDate] = useState(getISTDate());
  const [filterEndDate, setFilterEndDate] = useState(getISTDate());
  const [filterState, setFilterState] = useState("All"); 
  const [filterSite, setFilterSite] = useState("All");

  const baseSites = filterState === "All" ? SITES : SITES_BY_STATE[filterState] || [];
  const availableSites = baseSites.filter(site => (COMMISSIONED_SITES || []).includes(site));
  const operationalStates = STATE_NAMES.filter(st => (SITES_BY_STATE[st] || []).some(site => (COMMISSIONED_SITES || []).includes(site)));

  // ✨ THE SMART FILTER & SORTER BRAIN!
  const filtered = nightHaults.filter(r => {
    const rDate = r.date || "";
    const dMatch = (!filterStartDate || rDate >= filterStartDate) && (!filterEndDate || rDate <= filterEndDate);
    const safeSiteName = (r.site || "").toUpperCase();
    const stMatch = filterState === "All" || (SITES_BY_STATE[filterState] && SITES_BY_STATE[filterState].includes(safeSiteName));
    const sMatch = filterSite === "All" || safeSiteName === filterSite;
    return dMatch && stMatch && sMatch;
  }).sort((a, b) => {
    // 1. Sort by Date (Newest dates at the top)
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    if (dateA > dateB) return -1;
    if (dateA < dateB) return 1;
    
    // 2. If same date, sort by Site Name (A-Z)
    const siteA = (a.site || "").toUpperCase().trim();
    const siteB = (b.site || "").toUpperCase().trim();
    if (siteA < siteB) return -1;
    if (siteA > siteB) return 1;
    
    // 3. If same site, put 'NIL' records above actual vehicles for neatness
    if (a.veh_no === 'NIL' && b.veh_no !== 'NIL') return -1;
    if (a.veh_no !== 'NIL' && b.veh_no === 'NIL') return 1;
    
    return 0;
  });

  // ✨ VIP MATH MAGIC (Ghost Bug Proofed!)
  const expectedSites = filterSite === "All" ? availableSites : [filterSite];
  const totalVehicles = filtered.filter(f => f.veh_no !== 'NIL').length;
  
  // ✨ फिक्स: Force everything to UPPERCASE so 'Prayagraj 1' and 'prayagraj 1' merge perfectly!
  const activeVehicleSites = [...new Set(filtered.filter(f => f.veh_no !== 'NIL').map(f => (f.site || "").toUpperCase().trim()))];
  const nilSitesList = [...new Set(filtered.filter(f => f.veh_no === 'NIL').map(f => (f.site || "").toUpperCase().trim()))];
  const submittedSitesList = [...new Set(filtered.map(f => (f.site || "").toUpperCase().trim()))];
  
  // Ensure the expected list also uses uppercase to check against the submissions!
  const pendingSitesList = expectedSites.map(s => (s || "").toUpperCase().trim()).filter(s => !submittedSitesList.includes(s));
// ✨ GOD-MODE EXPORT: Clean Rows + Bottom Summary Section!
  const exportMasterCSV = () => {
    if (filtered.length === 0 && expectedSites.length === 0) return alert("No data to export!");
    
    const headers = ['Date', 'Site', 'Vehicle No', 'Material', 'Location', 'Purpose', 'Submitted By', 'Status'];
    const csvRows = [];
    let grandTotalVehicles = 0;
    const siteSummaries = []; 

    // 1. Group all actual logs by an uppercase, trimmed site name to avoid JS string ghost bugs!
    const groupedLogs = {};
    filtered.forEach(log => {
      const sName = (log.site || "UNKNOWN").toUpperCase().trim();
      if (!groupedLogs[sName]) groupedLogs[sName] = [];
      groupedLogs[sName].push(log);
    });

    // 2. Combine the expected sites and the actual logged sites into one unified, clean list!
    const allTargetSites = new Set([
      ...expectedSites.map(s => (s || "").toUpperCase().trim()),
      ...Object.keys(groupedLogs)
    ]);

    // 3. Sort them alphabetically (Now they will all sort perfectly since they are uppercase!)
    const sortedTargets = [...allTargetSites].sort();

    sortedTargets.forEach(siteName => {
      const siteLogs = groupedLogs[siteName] || [];
      let siteVehicleCount = 0;
      
      if (siteLogs.length === 0) {
         csvRows.push(`"${filterEndDate || 'N/A'}","${siteName}","---","---","---","---","---","PENDING SUBMISSION"`);
      } else {
         siteLogs.forEach(log => {
           if (log.veh_no === 'NIL') {
             csvRows.push(`"${log.date}","${log.site}","NIL","NIL","NIL","NIL","${log.submitted_by}","CLEARED (0 VEHICLES)"`);
           } else {
             siteVehicleCount++;
             grandTotalVehicles++;
             const clean = (t) => `"${(t||'').replace(/"/g, '""')}"`;
             csvRows.push([log.date, log.site, log.veh_no, log.material, log.location, log.purpose, log.submitted_by, "REPORTED"].map(clean).join(','));
           }
         });
         
         // Save the total for the bottom summary block!
         if (siteVehicleCount > 0) {
            siteSummaries.push({ siteName: siteName, count: siteVehicleCount });
         }
      }
    });

    // ✨ THE NEW SUMMARY BLOCK AT THE BOTTOM!
    if (siteSummaries.length > 0) {
      csvRows.push(`"","","","","","","",""`); // Blank spacing row
      csvRows.push(`"","*** SITE SUMMARIES ***","","","","","",""`);
      
      siteSummaries.forEach(summary => {
        csvRows.push(`"","${summary.siteName}","${summary.count} Vehicles","","","","",""`);
      });
    }

    // ✨ ADD GRAND TOTAL ROW AT THE VERY BOTTOM
    csvRows.push(`"","","","","","","",""`); 
    csvRows.push(`"","** GRAND TOTAL ALL SITES **","** ${grandTotalVehicles} VEHICLES **","","","","",""`);

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = `CBG_NightHault_Master_${filterStartDate}_to_${filterEndDate}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 relative pb-10">
      {/* COMMAND BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 flex flex-wrap justify-between items-end gap-4 relative overflow-visible z-[100]">
        <div className="flex flex-wrap gap-3 relative z-10">
          <SmartDateFilter startDate={filterStartDate} setStartDate={setFilterStartDate} endDate={filterEndDate} setEndDate={setFilterEndDate} />
          <FilterSelect label="State" value={filterState} onChange={e => {setFilterState(e); setFilterSite("All");}} options={operationalStates} />
          <FilterSelect label="VIP Site" value={filterSite} onChange={setFilterSite} options={[...availableSites].sort()} />
          <button onClick={() => { setFilterStartDate(getISTDate()); setFilterEndDate(getISTDate()); setFilterState('All'); setFilterSite('All'); }} className="text-[10px] font-black tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors h-max mb-0.5">CLEAR</button>
        </div>
        <button onClick={exportMasterCSV} className="relative z-10 px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95">
          <Download size={16} /> Export Master Sheet
        </button>
      </div>

      {/* 🚀 GOD-MODE HOVER STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-[50]">
         
         {/* CARD 1: ACTIVE VEHICLES */}
         <div className="bg-white dark:bg-[#0B1120] p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-visible group cursor-help z-30">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Truck size={14}/> Total Vehicles Logged</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{totalVehicles} <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded align-middle ml-2">From {activeVehicleSites.length} Sites</span></h3>
            
            {/* HOVER REVEAL */}
            {activeVehicleSites.length > 0 && (
              <div className="absolute top-[80%] left-0 mt-2 w-full min-w-[200px] bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black p-4 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 shadow-2xl border border-slate-700 flex flex-col gap-2 transform translate-y-2 group-hover:translate-y-0 max-h-48 overflow-y-auto custom-scrollbar">
                <span className="text-blue-400 dark:text-blue-600 border-b border-slate-600 dark:border-slate-300 pb-1.5 mb-1 uppercase tracking-widest">Active Sites ({activeVehicleSites.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeVehicleSites.map(s => <span key={s} className="bg-slate-700 dark:bg-slate-200 px-2 py-1 rounded shadow-sm">{s}</span>)}
                </div>
              </div>
            )}
         </div>

         {/* CARD 2: NIL SITES */}
         <div className="bg-white dark:bg-[#0B1120] p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-visible group cursor-help z-20">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/> Zero Vehicle Sites (NIL)</p>
            <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{nilSitesList.length} <span className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded align-middle ml-2">Cleared</span></h3>
            
            {/* HOVER REVEAL */}
            {nilSitesList.length > 0 && (
              <div className="absolute top-[80%] left-0 mt-2 w-full min-w-[200px] bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black p-4 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 shadow-2xl border border-slate-700 flex flex-col gap-2 transform translate-y-2 group-hover:translate-y-0 max-h-48 overflow-y-auto custom-scrollbar">
                <span className="text-emerald-400 dark:text-emerald-600 border-b border-slate-600 dark:border-slate-300 pb-1.5 mb-1 uppercase tracking-widest">Cleared Sites ({nilSitesList.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {nilSitesList.map(s => <span key={s} className="bg-slate-700 dark:bg-slate-200 px-2 py-1 rounded shadow-sm">{s}</span>)}
                </div>
              </div>
            )}
         </div>

         {/* CARD 3: COMPLIANCE ROLLCALL */}
         <div className="bg-white dark:bg-[#0B1120] p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-visible group cursor-help z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Activity size={14} className="text-indigo-500"/> Submission Rollcall</p>
            <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{submittedSitesList.length} <span className="text-sm text-slate-400">/ {expectedSites.length}</span></h3>
            
            {/* HOVER REVEAL */}
            <div className="absolute top-[80%] right-0 mt-2 w-72 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 p-4 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 shadow-2xl border border-slate-700 flex flex-col gap-4 transform translate-y-2 group-hover:translate-y-0 max-h-64 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-emerald-400 dark:text-emerald-600 border-b border-slate-600 dark:border-slate-300 pb-1.5 uppercase tracking-widest">Submitted ({submittedSitesList.length})</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {submittedSitesList.length === 0 ? <span className="text-[9px] text-slate-400">None</span> : submittedSitesList.map(s => <span key={s} className="text-[8.5px] font-bold uppercase tracking-wider bg-slate-700 dark:bg-slate-200 px-2 py-1 rounded shadow-sm">{s}</span>)}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-rose-400 dark:text-rose-600 border-b border-slate-600 dark:border-slate-300 pb-1.5 uppercase tracking-widest">Pending ({pendingSitesList.length})</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {pendingSitesList.length === 0 ? <span className="text-[9px] text-slate-400">All Clear!</span> : pendingSitesList.map(s => <span key={s} className="text-[8.5px] font-bold uppercase tracking-wider bg-slate-700 dark:bg-slate-200 px-2 py-1 rounded shadow-sm">{s}</span>)}
                </div>
              </div>
            </div>
         </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] shadow-sm overflow-hidden z-10 relative">
        {isLoading ? (
          <div className="p-16 text-center font-bold text-slate-500 animate-pulse uppercase tracking-widest text-[10px]">Scanning Vault...</div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Sr. No</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Site</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vehicle No.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Material</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Purpose</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Submitted By</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500">{idx + 1}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">{log.date}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-widest">{log.site}</span></td>
                    <td className="px-6 py-4">
                       {log.veh_no === 'NIL' 
                          ? <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded shadow-sm">NIL - CLEAR</span>
                          : <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{log.veh_no}</span>
                       }
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">{log.material}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">{log.location}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">{log.purpose}</td>
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{log.submitted_by}</td>
                    
                    {/* ✨ NEW ADMIN ACTIONS */}
                    <td className="px-4 py-4 text-center">
                       <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => { e.stopPropagation(); onEdit(log); }} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-white dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm" title="Edit Record"><Edit2 size={14} /></button>
                         <button onClick={(e) => { e.stopPropagation(); onDelete(log); }} className="p-1.5 text-slate-400 hover:text-rose-600 bg-white dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm" title="Delete Record"><Trash2 size={14} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="9" className="px-6 py-16 text-center text-slate-500 font-bold italic">No records found.</td></tr>}
              </tbody>
              {/* ✨ STICKY TOTAL ROW */}
              {filtered.length > 0 && (
                <tfoot className="bg-slate-100 dark:bg-slate-800/80 border-t-2 border-slate-200 dark:border-slate-700 sticky bottom-0">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Global Vehicle Count:</td>
                    <td className="px-6 py-4 text-sm font-black text-indigo-600 dark:text-indigo-400">{totalVehicles} <span className="text-[10px] text-slate-500 ml-1">Vehicles</span></td>
                    <td colSpan="5"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
// ==========================================
// ✏️ NIGHT HAULT EDIT MODAL (ADMIN ONLY)
// ==========================================
function NightHaultEditModal({ record, onClose, onSave }) {
  const [fd, setFd] = useState({ ...record });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = { ...fd };
    dataToSave.veh_no = (dataToSave.veh_no || '').toUpperCase();
    onSave(dataToSave);
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner placeholder-slate-400";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-[0.95] duration-300">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-lg uppercase tracking-tight relative z-10">
              <Edit2 size={16} className="text-indigo-500" /> Modify Log
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Site: <span className="text-indigo-500">{record.site}</span></p>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-full shadow-sm transition-all active:scale-95 border border-slate-200 dark:border-slate-700 relative z-10"><X size={16} /></button>
        </div>

        <form id="edit-nighthault-form" onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          <div>
            <label className={labelClass}>Vehicle Number</label>
            <input type="text" required placeholder="e.g. MH 04 AB 1234" value={fd.veh_no} onChange={(e) => setFd({...fd, veh_no: e.target.value})} className={`${inputClass} uppercase`} />
          </div>
          <div>
            <label className={labelClass}>Material</label>
            <input type="text" required value={fd.material} onChange={(e) => setFd({...fd, material: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input type="text" required value={fd.location} onChange={(e) => setFd({...fd, location: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Purpose</label>
            <input type="text" required value={fd.purpose} onChange={(e) => setFd({...fd, purpose: e.target.value})} className={inputClass} />
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-200 dark:border-amber-500/30 mt-2">
            <label className={`${labelClass} !text-amber-600 dark:!text-amber-500 flex items-center gap-1.5`}><Calendar size={12}/> Reported Date</label>
            <input type="date" required value={fd.date} onChange={(e) => setFd({...fd, date: e.target.value})} className="w-full bg-transparent text-sm font-black text-amber-900 dark:text-amber-100 outline-none [color-scheme:light] dark:[color-scheme:dark]" />
          </div>
        </form>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700">Cancel</button>
          
          <button type="submit" form="edit-nighthault-form" className="flex-[2] py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-indigo-600 text-white flex items-center justify-center gap-2 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 active:scale-95 transition-all">
            <Save size={16} /> Save Changes
          </button>
        </div>
        
      </div>
    </div>
  );
}
