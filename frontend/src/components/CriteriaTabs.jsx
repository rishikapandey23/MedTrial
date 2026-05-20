import React from 'react';
import { Check, X, HelpCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Radar } from 'react-chartjs-2';

const CriteriaTabs = ({ evaluation, activeTab, setActiveTab }) => {
 // Radar metrics config
 const radarData = {
 labels: ['Hepatic Adequacy', 'Renal Competence', 'Hematology Integrity', 'Criteria Alignment', 'Therapeutic Safety'],
 datasets: [{
  label: 'Clinical Metric Profiles',
  data: evaluation?.radar_data || [80, 80, 80, 80, 80],
  backgroundColor: 'rgba(99, 102, 241, 0.2)',
  borderColor: 'rgba(99, 102, 241, 0.8)',
  borderWidth: 2,
  pointBackgroundColor: 'rgba(99, 102, 241, 1)',
  pointBorderColor: '#fff',
  pointHoverBackgroundColor: '#fff',
  pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
 }]
 };

 const isDark = document.documentElement.classList.contains('dark');

 const radarOptions = {
 scales: {
  r: {
  angleLines: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
  grid: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
  pointLabels: { color: isDark ? '#cbd5e1' : '#475569', font: { size: 10, weight: 'semibold' } },
  ticks: { color: isDark ? '#94a3b8' : '#64748b', backdropColor: 'transparent', stepSize: 20 },
  min: 0,
  max: 100
  }
 },
 plugins: { legend: { display: false } }
 };

 return (
 <div className="bg-white dark:bg-[#0d131f] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col text-left overflow-hidden transition-colors duration-200">
  {/* Tab Navigation */}
  <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex text-sm">
  <button
   onClick={() => setActiveTab('inclusions')}
   className={`flex-1 py-3 px-4 text-center font-bold transition-all border-b-2 ${
   activeTab === 'inclusions' 
    ? 'border-violet-600 text-violet-700 bg-white dark:bg-[#0d131f]' 
    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
   }`}
  >
   Inclusions
  </button>
  <button
   onClick={() => setActiveTab('exclusions')}
   className={`flex-1 py-3 px-4 text-center font-bold transition-all border-b-2 ${
   activeTab === 'exclusions' 
    ? 'border-violet-600 text-violet-700 bg-white dark:bg-[#0d131f]' 
    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
   }`}
  >
   Exclusions
  </button>
  <button
   onClick={() => setActiveTab('safety')}
   className={`flex-1 py-3 px-4 text-center font-bold transition-all border-b-2 ${
   activeTab === 'safety' 
    ? 'border-violet-600 text-violet-700 bg-white dark:bg-[#0d131f]' 
    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
   }`}
  >
   Safety (ADR)
  </button>
  <button
   onClick={() => setActiveTab('metrics')}
   className={`flex-1 py-3 px-4 text-center font-bold transition-all border-b-2 ${
   activeTab === 'metrics' 
    ? 'border-violet-600 text-violet-700 bg-white dark:bg-[#0d131f]' 
    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
   }`}
  >
   Metrics Profile
  </button>
  </div>

  <div className="p-6 md:p-8 flex-1 min-h-[350px] flex flex-col justify-between">
  {/* Tab 1: Inclusions */}
  {activeTab === 'inclusions' && (
   <div className="space-y-4 flex-1">
   {evaluation.inclusion_matches?.map((inc, idx) => (
    <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-900/50 ">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
     inc.status === 'met' 
     ? 'bg-emerald-50 text-emerald-600 ' 
     : (inc.status === 'unmet' ? 'bg-rose-50 text-rose-600 ' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ')
    }`}>
     {inc.status === 'met' ? <Check size={14} /> : (inc.status === 'unmet' ? <X size={14} /> : <HelpCircle size={14} />)}
    </div>
    <div>
     <p className="text-sm font-bold text-slate-900 dark:text-white ">{inc.title}</p>
     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{inc.reason}</p>
    </div>
    </div>
   ))}
   </div>
  )}

  {/* Tab 2: Exclusions */}
  {activeTab === 'exclusions' && (
   <div className="space-y-4 flex-1">
   {evaluation.exclusion_matches?.map((exc, idx) => (
    <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-900/50 ">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
     exc.status === 'met' 
     ? 'bg-emerald-50 text-emerald-600 ' 
     : 'bg-rose-50 text-rose-600 '
    }`}>
     {exc.status === 'met' ? <Check size={14} /> : <X size={14} />}
    </div>
    <div>
     <p className="text-sm font-bold text-slate-900 dark:text-white ">{exc.title}</p>
     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{exc.reason}</p>
    </div>
    </div>
   ))}
   </div>
  )}

  {/* Tab 3: Safety warnings (ADRs) */}
  {activeTab === 'safety' && (
   <div className="space-y-4 flex-1">
   {evaluation.adverse_warnings?.length > 0 ? (
    evaluation.adverse_warnings.map((adr, idx) => (
    <div key={idx} className="flex gap-4 p-4 rounded-xl border border-rose-200 bg-rose-50/40 ">
     <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
     <ShieldAlert size={18} />
     </div>
     <div>
     <p className="text-sm font-bold text-rose-900 ">{adr.title}</p>
     <p className="text-xs text-rose-700 mt-1 leading-relaxed">{adr.desc}</p>
     </div>
    </div>
    ))
   ) : (
    <div className="flex gap-4 p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 ">
    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
     <ShieldCheck size={18} />
    </div>
    <div>
     <p className="text-sm font-bold text-emerald-950 ">Therapeutic Pathway Approved</p>
     <p className="text-xs text-emerald-800 mt-1">No contraindications or adverse drug-drug interactions detected during this screening loop.</p>
    </div>
    </div>
   )}
   </div>
  )}

  {/* Tab 4: Radar Charts */}
  {activeTab === 'metrics' && (
   <div className="flex-1 flex items-center justify-center max-h-[300px] w-full">
   <Radar data={radarData} options={radarOptions} />
   </div>
  )}
  </div>
 </div>
 );
};

export default CriteriaTabs;
