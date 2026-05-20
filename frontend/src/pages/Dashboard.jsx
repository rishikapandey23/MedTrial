import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
 Users, 
 Activity, 
 ShieldAlert, 
 ArrowRight,
 Plus,
 Trash2,
 BrainCircuit,
 Heart,
 Brain,
 Grid
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Mock Scenario Templates for quick seeding
const SCENARIO_TEMPLATES = [
 {
 id: 'oncology',
 title: 'Oncology Protocol',
 subtitle: 'NSCLC Stage IIIa Study',
 icon: BrainCircuit,
 color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
 data: {
  name: 'Arthur Pendelton',
  age: 64,
  gender: 'Male',
  report_text: 'Patient is a 64-year-old male presenting with Stage IIIa Lung Adenocarcinoma. ECOG Performance Status is 1. Patient reports chronic cough and moderate dyspnea. eGFR: 82 mL/min. Patient is therapy-naive with no prior chemotherapy or radiation history.',
  lab_notes: 'eGFR: 82 mL/min/1.73m2\nPlatelet Count: 145,000 /uL\nEGFR Mutation: Positive\nPD-L1 Expression: Positive (45%)',
  current_meds: 'Lisinopril 10mg daily, Metformin 500mg daily, Atorvastatin 20mg daily',
  trial_title: 'NSCLC-301: Monoclonal Antibody Immunotherapy Study',
  trial_criteria: 'Inclusion Criteria:\n1. Age >= 18 years\n2. Confirmed Stage IIIa/IIIb NSCLC diagnosis\n3. ECOG Performance Status of 0 or 1\n4. Adequate organ function (eGFR >= 50 mL/min)\n\nExclusion Criteria:\n1. Prior oncology radiation or chemotherapy\n2. Active autoimmune disease'
 }
 },
 {
 id: 'cardiology',
 title: 'Cardiovascular Study',
 subtitle: 'Chronic Heart Failure Trial',
 icon: Heart,
 color: 'bg-rose-50 text-rose-600 border-rose-100',
 data: {
  name: 'James Reynolds',
  age: 72,
  gender: 'Male',
  report_text: 'Patient is a 72-year-old male presenting with chronic heart failure (HFrEF, NYHA Class III) showing bilateral pedal edema and orthopnea. Stable background GDMT therapy has been verified.',
  lab_notes: 'LVEF: 28%\nNT-proBNP: 2,450 pg/mL\neGFR: 42 mL/min\nPotassium: 4.8 mEq/L',
  current_meds: 'Lisinopril 20mg daily, Carvedilol 12.5mg twice daily, Spironolactone 25mg daily, Furosemide 40mg daily',
  trial_title: 'HF-CORE: Novel Aldosterone Synthase Inhibitor Trial',
  trial_criteria: 'Inclusion Criteria:\n1. LVEF <= 35% (systolic dysfunction)\n2. NT-proBNP >= 1,600 pg/mL\n3. Stable background GDMT therapy\n\nExclusion Criteria:\n1. Severe renal insufficiency (eGFR < 30 mL/min)\n2. Hyperkalemia safety warning (Potassium > 5.2 mEq/L)'
 }
 },
 {
 id: 'neurology',
 title: 'Neurological Study',
 subtitle: 'Early Alzheimer Monoclonal Study',
 icon: Brain,
 color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
 data: {
  name: 'Margaret Chen',
  age: 79,
  gender: 'Female',
  report_text: 'Margaret Chen is a 79-year-old female presenting with mild cognitive decline, MMSE Score of 21, and biochemically confirmed amyloid-beta pathology.',
  lab_notes: 'MMSE Score: 21 / 30\nCSF Amyloid Beta 1-42: 420 pg/mL (abnormal low)\nBrain MRI: 2 cerebral microhemorrhages (low-risk baseline)',
  current_meds: 'Donepezil 10mg daily, Atorvastatin 40mg daily, Apixaban (Eliquis) 5mg twice daily',
  trial_title: 'ALZ-CLEAR: Monoclonal Immunotherapy Study',
  trial_criteria: 'Inclusion Criteria:\n1. MMSE score between 20 and 26\n2. CSF or PET amyloid positivity confirmation\n\nExclusion Criteria:\n1. Concomitant oral anticoagulant therapies (Eliquis, Warfarin)\n2. Brain MRI microhemorrhage count > 4'
 }
 },
 {
 id: 'diabetes',
 title: 'Metabolic Study',
 subtitle: 'Type 2 Diabetes Control',
 icon: Grid,
 color: 'bg-amber-50 text-amber-600 border-amber-100',
 data: {
  name: 'Carlos Mendez',
  age: 51,
  gender: 'Male',
  report_text: 'Carlos Mendez is a 51-year-old male with poorly controlled Type 2 Diabetes Mellitus (HbA1c: 8.4%) and moderate obesity (BMI: 33.6). No pancreatitis history.',
  lab_notes: 'HbA1c: 8.4%\nBMI: 33.6 kg/m2\neGFR: 88 mL/min',
  current_meds: 'Metformin 1000mg twice daily, Glipizide 10mg daily, Atorvastatin 20mg daily',
  trial_title: 'GLP-MAX: GLP-1 Receptor Agonist Trial',
  trial_criteria: 'Inclusion Criteria:\n1. HbA1c between 7.5% and 10.0%\n2. BMI >= 27.0 kg/m2\n\nExclusion Criteria:\n1. Prior history of acute or chronic pancreatitis'
 }
 }
];

const Dashboard = () => {
 const [patients, setPatients] = useState([]);
 const [loading, setLoading] = useState(true);
 const [stats, setStats] = useState({
 total: 0,
 eligible: 0,
 borderline: 0,
 excluded: 0,
 adrCount: 0
 });
 const navigate = useNavigate();

 useEffect(() => {
 fetchData();
 }, []);

 const fetchData = async () => {
 setLoading(true);
 try {
  // Get all patients
  const patientRes = await api.get('/api/patients');
  const patientList = patientRes.data;
  setPatients(patientList);

  // Fetch evaluations for stats
  let eligible = 0;
  let borderline = 0;
  let excluded = 0;
  let adrCount = 0;

  for (let p of patientList) {
  try {
   const evalRes = await api.get(`/api/evaluations/patient/${p.id}`);
   const evalData = evalRes.data;
   
   if (evalData.status === 'Eligible') eligible++;
   else if (evalData.status === 'Borderline') borderline++;
   else if (evalData.status === 'Excluded') excluded++;

   if (evalData.adverse_warnings && evalData.adverse_warnings.length > 0) {
   adrCount += evalData.adverse_warnings.length;
   }
  } catch (e) {
   // Patient has no evaluation yet
  }
  }

  setStats({
  total: patientList.length,
  eligible,
  borderline,
  excluded,
  adrCount
  });
 } catch (error) {
  console.error("Error loading dashboard data", error);
 } finally {
  setLoading(false);
 }
 };

 const handleTemplateClick = (template) => {
 // Save template data to localStorage to load inside Intake page
 localStorage.setItem('seeded_template', JSON.stringify(template.data));
 navigate('/intake');
 };

 const handleDelete = async (id, e) => {
 e.stopPropagation();
 if (window.confirm("Are you sure you want to delete this patient profile?")) {
  try {
  await api.delete(`/api/patients/${id}`);
  fetchData();
  } catch (error) {
  console.error("Failed to delete patient record", error);
  }
 }
 };

 const handlePatientRowClick = (patient) => {
 localStorage.setItem('active_patient_id', patient.id);
 // Redirect straight to analyzer screen for this patient
 navigate('/analyzer');
 };

 // Setup Pie Chart
 const pieData = {
 labels: ['Eligible', 'Borderline', 'Excluded', 'Unevaluated'],
 datasets: [{
  data: [
  stats.eligible, 
  stats.borderline, 
  stats.excluded, 
  Math.max(0, stats.total - (stats.eligible + stats.borderline + stats.excluded))
  ],
  backgroundColor: ['rgba(16, 185, 129, 0.75)', 'rgba(245, 158, 11, 0.75)', 'rgba(244, 63, 94, 0.75)', 'rgba(100, 116, 139, 0.2)'],
  borderColor: ['#10b981', '#f59e0b', '#f43f5e', '#64748b'],
  borderWidth: 1,
 }]
 };

 return (
 <div className="space-y-8">
  {/* Metric Cards Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="bg-white dark:bg-[#0d131f] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors duration-200">
   <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
   <Users size={24} />
   </div>
   <div>
   <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Patients</p>
   <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
   </div>
  </div>

  <div className="bg-white dark:bg-[#0d131f] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors duration-200">
   <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
   <Activity size={24} />
   </div>
   <div>
   <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Highly Eligible</p>
   <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.eligible}</p>
   </div>
  </div>

  <div className="bg-white dark:bg-[#0d131f] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors duration-200">
   <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
   <ShieldAlert size={24} />
   </div>
   <div>
   <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ADR Safety Alerts</p>
   <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.adrCount}</p>
   </div>
  </div>
  </div>

  {/* Scenario Templates Seeding Section */}
  <div>
  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Quick Scenario Templates</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
   {SCENARIO_TEMPLATES.map((tmpl) => {
   const Icon = tmpl.icon;
   return (
    <button
    key={tmpl.id}
    onClick={() => handleTemplateClick(tmpl)}
    className="flex items-start gap-4 p-5 bg-white dark:bg-[#0d131f] hover:bg-slate-50 dark:hover:bg-slate-800/40 dark:bg-slate-900/50 dark:hover:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-500/50 transition-all text-left group shadow-sm"
    >
    <div className={`p-3 rounded-xl border ${tmpl.color}`}>
     <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0">
     <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-violet-600 transition-colors">{tmpl.title}</h3>
     <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{tmpl.subtitle}</p>
     <span className="inline-flex items-center gap-1 text-[10px] text-violet-600 font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
     Load & Customize <ArrowRight size={10} />
     </span>
    </div>
    </button>
   );
   })}
  </div>
  </div>

  {/* History and Visualization Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Recent Patients Table */}
  <div className="lg:col-span-2 bg-white dark:bg-[#0d131f] rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm flex flex-col transition-colors duration-200">
   <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
   <h3 className="font-outfit font-bold text-slate-900 dark:text-white ">Recent Patient Intakes</h3>
   <button
    onClick={() => navigate('/intake')}
    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg shadow transition-colors"
   >
    <Plus size={14} /> Add Patient
   </button>
   </div>

   <div className="flex-1 overflow-x-auto custom-scrollbar">
   {loading ? (
    <div className="p-8 flex justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent"></div>
    </div>
   ) : patients.length === 0 ? (
    <div className="p-12 text-center">
    <p className="text-sm text-slate-500 dark:text-slate-400 ">No patient files ingested yet.</p>
    <button
     onClick={() => navigate('/intake')}
     className="mt-3 text-xs text-violet-600 font-semibold hover:underline "
    >
     Load a scenario template or upload files to get started.
    </button>
    </div>
   ) : (
    <table className="w-full text-left text-sm border-collapse">
    <thead>
     <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
     <th className="px-6 py-3.5">Patient Details</th>
     <th className="px-6 py-3.5">Trial Protocol</th>
     <th className="px-6 py-3.5">Intake Date</th>
     <th className="px-6 py-3.5 text-right">Actions</th>
     </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-700 dark:text-slate-300 ">
     {patients.map((p) => (
     <tr
      key={p.id}
      onClick={() => handlePatientRowClick(p)}
      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 dark:bg-slate-900/50 cursor-pointer transition-colors group"
     >
      <td className="px-6 py-4">
      <p className="font-bold text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">{p.name}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.age} yrs • {p.gender}</p>
      </td>
      <td className="px-6 py-4">
      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{p.trial_title || 'Not specified'}</p>
      </td>
      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 ">
      {new Date(p.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-right">
      <button
       onClick={(e) => handleDelete(p.id, e)}
       className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
       title="Delete patient profile"
      >
       <Trash2 size={14} />
      </button>
      </td>
     </tr>
     ))}
    </tbody>
    </table>
   )}
   </div>
  </div>

  {/* Match Statistics Visualization */}
  <div className="bg-white dark:bg-[#0d131f] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm flex flex-col items-center transition-colors duration-200">
   <h3 className="font-outfit font-bold text-slate-900 dark:text-white self-start mb-6">Eligibility breakdown</h3>
   <div className="w-full max-w-[220px] flex-1 flex items-center justify-center">
   {stats.total === 0 ? (
    <div className="text-center text-xs text-slate-400 py-12">
    No active clinical trial eligibility distributions available.
    </div>
   ) : (
    <Pie data={pieData} options={{ plugins: { legend: { display: false } } }} />
   )}
   </div>
   
   {stats.total > 0 && (
   <div className="w-full grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs font-semibold">
    <div className="flex items-center gap-2 text-emerald-600 ">
    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
    <span>{stats.eligible} Eligible</span>
    </div>
    <div className="flex items-center gap-2 text-amber-600 ">
    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
    <span>{stats.borderline} Borderline</span>
    </div>
    <div className="flex items-center gap-2 text-rose-600 ">
    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
    <span>{stats.excluded} Excluded</span>
    </div>
    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 ">
    <div className="w-3 h-3 rounded-full bg-slate-400"></div>
    <span>{stats.total - (stats.eligible + stats.borderline + stats.excluded)} Unevaluated</span>
    </div>
   </div>
   )}
  </div>
  </div>
 </div>
 );
};

export default Dashboard;
