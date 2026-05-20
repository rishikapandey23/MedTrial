import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
 Save, 
 RotateCcw, 
 Terminal, 
 Key, 
 Cpu, 
 HelpCircle,
 Sparkles,
 ShieldCheck,
 Activity
} from 'lucide-react';

const Settings = () => {
 const [apiKey, setApiKey] = useState('');
 const [apiModel, setApiModel] = useState('gemini-1.5-flash');
 const [temperature, setTemperature] = useState('0.1');
 const [logs, setLogs] = useState([]);

 useEffect(() => {
 // Load configurations from storage
 const savedKey = localStorage.getItem('custom_gemini_key') || '';
 const savedModel = localStorage.getItem('custom_gemini_model') || 'gemini-1.5-flash';
 const savedTemp = localStorage.getItem('custom_gemini_temp') || '0.1';

 setApiKey(savedKey);
 setApiModel(savedModel);
 setTemperature(savedTemp);

 // Seed mock initial logs
 const timestamp = new Date().toLocaleTimeString();
 setLogs([
  `[${timestamp}] [SYSTEM] Settings loaded successfully.`,
  `[${timestamp}] [DATABASE] Connected to client session instance.`,
  `[${timestamp}] [SECURITY] Authentication token verified.`
 ]);
 }, []);

 const addLog = (message, type = 'SYSTEM') => {
 const timestamp = new Date().toLocaleTimeString();
 setLogs((prev) => [...prev, `[${timestamp}] [${type}] ${message}`]);
 };

 const handleSave = () => {
 if (apiKey.trim()) {
  localStorage.setItem('custom_gemini_key', apiKey.trim());
  addLog("Retrieved custom Gemini API key for headers authorization.", "SECURITY");
 } else {
  localStorage.removeItem('custom_gemini_key');
  addLog("Cleared custom Gemini API key. System falling back to backend offline mode.", "SECURITY");
 }
 
 localStorage.setItem('custom_gemini_model', apiModel);
 localStorage.setItem('custom_gemini_temp', temperature);
 
 addLog(`Configurations updated. Set Model: ${apiModel} | Temperature: ${temperature}`);
 alert("System configurations updated successfully!");
 };

 const handleReset = () => {
 if (window.confirm("Reset all settings to system defaults?")) {
  localStorage.removeItem('custom_gemini_key');
  localStorage.removeItem('custom_gemini_model');
  localStorage.removeItem('custom_gemini_temp');

  setApiKey('');
  setApiModel('gemini-1.5-flash');
  setTemperature('0.1');

  addLog("Wiped custom local variables. System defaults restored.", "SECURITY");
  alert("Settings reset to defaults.");
 }
 };

 return (
 <div className="space-y-8 max-w-4xl mx-auto text-left transition-colors duration-200">
  {/* API Key Panel */}
  <div className="bg-white dark:bg-[#0d131f] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
  <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 pb-3 flex items-center gap-2">
   <Key className="text-violet-600" size={20} />
   Gemini LLM Key Configurations
  </h3>

  {apiKey ? (
   <div className="flex gap-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 ">
   <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
    <ShieldCheck size={18} />
   </div>
   <div>
    <p className="text-sm font-bold text-emerald-950 ">Active Custom Authentication Key</p>
    <p className="text-xs text-emerald-800 mt-0.5">Your browser is appending the X-Gemini-Key override header to all clinical matching and chat requests.</p>
   </div>
   </div>
  ) : (
   <div className="flex gap-4 p-4 rounded-xl border border-sky-200 bg-sky-50/30 ">
   <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
    <Activity size={18} />
   </div>
   <div>
    <p className="text-sm font-bold text-sky-950 ">Offline Client Simulator Mode</p>
    <p className="text-xs text-sky-800 mt-0.5">No override key found. The system is operating in simulated matches mode using regex rules and keywords fallback.</p>
   </div>
   </div>
  )}

  <div className="space-y-4">
   <div>
   <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Google Gemini API Key</label>
   <input
    type="password"
    value={apiKey}
    onChange={(e) => setApiKey(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-violet-500 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none transition-colors text-sm"
    placeholder="AIzaSy..."
   />
   <p className="text-[10px] text-slate-400 mt-1.5">Your API Key is kept entirely inside your browser's local storage context and never saved on the server.</p>
   </div>

   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
   <div>
    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Active Reasoning Model</label>
    <select
    value={apiModel}
    onChange={(e) => setApiModel(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-violet-500 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none transition-colors text-sm cursor-pointer"
    >
    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast summaries)</option>
    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep complex reasonings)</option>
    </select>
   </div>
   <div>
    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Generation Temperature</label>
    <select
    value={temperature}
    onChange={(e) => setTemperature(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-violet-500 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none transition-colors text-sm cursor-pointer"
    >
    <option value="0.1">0.1 (Precision / Low Creativity)</option>
    <option value="0.4">0.4 (Moderate clinical reasoning)</option>
    <option value="0.7">0.7 (Narrative focus)</option>
    </select>
   </div>
   </div>
  </div>

  <div className="flex gap-4 pt-4 border-t border-slate-100 justify-end">
   <button
   onClick={handleReset}
   className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 dark:bg-slate-900/50 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors bg-white dark:bg-[#0d131f]"
   >
   <RotateCcw size={14} /> Restore Defaults
   </button>
   <button
   onClick={handleSave}
   className="flex items-center gap-1.5 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
   >
   <Save size={14} /> Save Configurations
   </button>
  </div>
  </div>

  {/* Debug Console Panel */}
  <div className="bg-white dark:bg-[#0d131f] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
  <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 pb-3 flex items-center gap-2">
   <Terminal className="text-slate-600 dark:text-slate-400 " size={20} />
   Diagnostic Developer Console
  </h3>

  <div className="bg-slate-950 dark:bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 leading-relaxed custom-scrollbar h-[200px] overflow-y-auto">
   {logs.map((log, idx) => {
   let color = "text-slate-300";
   if (log.includes("[SECURITY]")) color = "text-amber-400";
   else if (log.includes("[DATABASE]")) color = "text-sky-400";
   return (
    <div key={idx} className={color}>
    {log}
    </div>
   );
   })}
  </div>
  </div>
 </div>
 );
};

export default Settings;
