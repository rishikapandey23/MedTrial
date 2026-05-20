import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import PatientIntake from './pages/PatientIntake';
import TrialMatchAnalyzer from './pages/TrialMatchAnalyzer';
import RAGChat from './pages/RAGChat';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

// Icons
import { 
 LayoutDashboard, 
 FileCheck, 
 Activity, 
 MessageSquareCode, 
 Settings as SettingsIcon, 
 LogOut, 
 Menu, 
 X, 
 ShieldAlert,
 Sparkles,
 Link as LinkIcon,
 Moon,
 Sun
} from 'lucide-react';

const Layout = () => {
 const { user, logout } = useContext(AuthContext);
 const [mobileOpen, setMobileOpen] = useState(false);
 const [theme, setTheme] = useState(() => {
  return localStorage.getItem('theme') || 'light';
 });
 
 const location = useLocation();
 const navigate = useNavigate();

 useEffect(() => {
  if (theme === 'dark') {
   document.documentElement.classList.add('dark');
   document.body.classList.add('dark');
  } else {
   document.documentElement.classList.remove('dark');
   document.body.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
 }, [theme]);

 const handleThemeToggle = () => {
  setTheme(theme === 'light' ? 'dark' : 'light');
 };

 const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Patient Intake', path: '/intake', icon: FileCheck },
  { name: 'Match Analyzer', path: '/analyzer', icon: Activity },
  { name: 'RAG Chatbot', path: '/chat', icon: MessageSquareCode },
  { name: 'System Settings', path: '/settings', icon: SettingsIcon },
 ];

 // Dynamic header titles based on path
 const getHeaderInfo = () => {
  switch (location.pathname) {
   case '/':
    return { title: "Dashboard Overview", subtitle: "Real-time statistics and quick templates" };
   case '/intake':
    return { title: "Patient & Trial Intake", subtitle: "Ingest clinical notes, labs, and protocols" };
   case '/analyzer':
    return { title: "Trial Match Analyzer", subtitle: "Intelligent medical parsing and eligibility scorecards" };
   case '/chat':
    return { title: "RAG Chat Assistant", subtitle: "Interactive clinical QA with semantic citations" };
   case '/settings':
    return { title: "System Settings", subtitle: "Configure LLM API integrations and debug consoles" };
   default:
    return { title: "MedTrial", subtitle: "Precision trial matching assistant" };
  }
 };

 const { title, subtitle } = getHeaderInfo();
 const hasGeminiKey = !!localStorage.getItem('custom_gemini_key');

 const handleNav = (path) => {
  navigate(path);
  setMobileOpen(false);
 };

 const handleLogout = () => {
  logout();
  navigate('/login');
 };

 return (
  <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 overflow-x-hidden font-sans transition-colors duration-200">
   {/* Desktop Sidebar */}
   <aside className="hidden md:flex flex-col w-64 bg-[#f8fafc] dark:bg-[#0d131f] text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
    <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800">
     <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600 text-white">
      <ShieldAlert size={18} />
     </div>
     <span className="font-outfit font-bold text-lg tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
      MedTrial
     </span>
    </div>
    
    <nav className="flex-1 px-4 py-6 space-y-1">
     {menuItems.map((item) => {
      const isActive = location.pathname === item.path;
      const Icon = item.icon;
      return (
       <button
        key={item.name}
        onClick={() => handleNav(item.path)}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
         isActive 
          ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 shadow-sm' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
        }`}
       >
        <Icon size={18} className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'} />
        {item.name}
       </button>
      );
     })}
    </nav>

    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0f19]">
     <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 font-bold flex items-center justify-center text-sm border border-violet-200 dark:border-violet-900/50">
       {user?.name ? user.name[0].toUpperCase() : 'D'}
      </div>
      <div className="flex-1 min-w-0">
       <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
       <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.role}</p>
      </div>
     </div>
     <button
      onClick={handleLogout}
      className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-white dark:bg-[#151c2c] hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors"
     >
      <LogOut size={13} />
      Sign Out
     </button>
    </div>
   </aside>

   {/* Mobile Sliding Sidebar */}
   <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
    mobileOpen ? 'bg-black/60 opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
   }`} onClick={() => setMobileOpen(false)}>
    <aside className={`absolute top-0 bottom-0 left-0 w-64 bg-[#f8fafc] dark:bg-[#0d131f] text-slate-800 dark:text-slate-200 flex flex-col transition-transform duration-300 ${
     mobileOpen ? 'translate-x-0' : '-translate-x-full'
    }`} onClick={(e) => e.stopPropagation()}>
     <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
       <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600 text-white">
        <ShieldAlert size={18} />
       </div>
       <span className="font-outfit font-bold text-lg text-slate-950 dark:text-white">MedTrial</span>
      </div>
      <button onClick={() => setMobileOpen(false)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
       <X size={20} />
      </button>
     </div>
     
     <nav className="flex-1 px-4 py-6 space-y-1">
      {menuItems.map((item) => {
       const isActive = location.pathname === item.path;
       const Icon = item.icon;
       return (
        <button
         key={item.name}
         onClick={() => handleNav(item.path)}
         className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
          isActive 
           ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400' 
           : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
         }`}
        >
         <Icon size={18} />
         {item.name}
        </button>
       );
      })}
     </nav>

     <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0f19]">
      <div className="flex items-center gap-3 mb-3">
       <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 flex items-center justify-center font-bold text-xs">
        {user?.name ? user.name[0].toUpperCase() : 'D'}
       </div>
       <div className="truncate">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.name}</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">{user?.role}</p>
       </div>
      </div>
      <button
       onClick={handleLogout}
       className="flex items-center justify-center gap-2 w-full py-2 bg-white dark:bg-[#151c2c] hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800"
      >
       <LogOut size={13} />
       Sign Out
      </button>
     </div>
    </aside>
   </div>

   {/* Main Content Area */}
   <div className="flex-1 flex flex-col min-h-screen">
    {/* Top Header */}
    <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-slate-50 dark:bg-[#0d131f] text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
     <div className="flex items-center gap-3">
      <button 
       onClick={() => setMobileOpen(true)} 
       className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
      >
       <Menu size={20} />
      </button>
      <div>
       <h1 className="font-outfit font-bold text-lg md:text-xl text-slate-900 dark:text-white leading-tight">{title}</h1>
       <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{subtitle}</p>
      </div>
     </div>

     <div className="flex items-center gap-3">
      {/* Theme Toggle Button */}
      <button
       onClick={handleThemeToggle}
       className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151c2c]"
       title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      >
       {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      {/* Dynamic Status Badges */}
      {hasGeminiKey ? (
       <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 rounded-full text-xs font-semibold border border-violet-200 dark:border-violet-800 shadow-sm animate-pulse">
        <Sparkles size={12} />
        Gemini Active
       </span>
      ) : (
       <span className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 rounded-full text-xs font-semibold border border-sky-200 dark:border-sky-800">
        <LinkIcon size={12} />
        Local Matching fallback
       </span>
      )}
     </div>
    </header>

    {/* Content Body */}
    <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-200 transition-colors duration-200">
     <Outlet />
    </main>
   </div>
  </div>
 );
};


const App = () => {
 return (
  <Router>
   <AuthProvider>
    <Routes>
     <Route path="/login" element={<Login />} />
     <Route path="/register" element={<Register />} />
     
     <Route element={
      <ProtectedRoute>
       <Layout />
      </ProtectedRoute>
     }>
      <Route path="/" element={<Dashboard />} />
      <Route path="/intake" element={<PatientIntake />} />
      <Route path="/analyzer" element={<TrialMatchAnalyzer />} />
      <Route path="/chat" element={<RAGChat />} />
      <Route path="/settings" element={<Settings />} />
     </Route>
    </Routes>
   </AuthProvider>
  </Router>
 );
};

export default App;
