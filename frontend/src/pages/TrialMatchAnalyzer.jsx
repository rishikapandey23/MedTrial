import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import { 
 Loader2, 
 ShieldAlert, 
 User,
 BrainCircuit,
 Printer,
 ChevronRight
} from 'lucide-react';

import PatientSelector from '../components/PatientSelector';
import PatientHeaderCard from '../components/PatientHeaderCard';
import NarrativeReport from '../components/NarrativeReport';
import ClinicalRecordCard from '../components/ClinicalRecordCard';
import CriteriaTabs from '../components/CriteriaTabs';

const TrialMatchAnalyzer = () => {
 const [patientsList, setPatientsList] = useState([]);
 const [selectedPatientId, setSelectedPatientId] = useState(localStorage.getItem('active_patient_id') || '');
 const [patient, setPatient] = useState(null);
 const [evaluation, setEvaluation] = useState(null);
 const [loading, setLoading] = useState(true);
 const [scanning, setScanning] = useState(false);
 const [scanProgress, setScanProgress] = useState(0);
 const [activeTab, setActiveTab] = useState('inclusions'); // inclusions, exclusions, safety, metrics
 const navigate = useNavigate();

 // Load all patients on mount
 useEffect(() => {
 const fetchPatients = async () => {
  try {
  const res = await api.get('/api/patients');
  setPatientsList(res.data);
  // If there's no selected patient but patients are available, default to the first one!
  if (!selectedPatientId && res.data.length > 0) {
   const firstId = res.data[0].id;
   setSelectedPatientId(firstId);
   localStorage.setItem('active_patient_id', firstId);
  }
  } catch (err) {
  console.error("Failed to fetch patients list", err);
  } finally {
  setLoading(false);
  }
 };
 fetchPatients();
 }, []);

 // Run evaluation whenever the selectedPatientId changes
 useEffect(() => {
 if (!selectedPatientId) {
  setLoading(false);
  return;
 }

 const controller = new AbortController();
 triggerScanAndEvaluation(selectedPatientId, controller.signal);

 return () => {
  controller.abort();
 };
 }, [selectedPatientId]);

 const handlePatientChange = (newId) => {
 setSelectedPatientId(newId);
 localStorage.setItem('active_patient_id', newId);
 };

 const triggerScanAndEvaluation = async (pId, signal) => {
 setLoading(true);
 setScanning(true);
 setScanProgress(10);

 // Simulate scanning progress metrics
 const progressInterval = setInterval(() => {
  setScanProgress((prev) => {
  if (prev >= 90) {
   clearInterval(progressInterval);
   return 90;
  }
  return prev + 15;
  });
 }, 300);

 try {
  // 1. Fetch patient profile details
  const patientRes = await api.get(`/api/patients/${pId}`, { signal });
  setPatient(patientRes.data);
  
  // 2. Perform the server-side evaluation
  const evalRes = await api.post(`/api/evaluations/patient/${pId}/evaluate`, null, { signal });
  setEvaluation(evalRes.data);
 } catch (error) {
  if (axios.isCancel(error)) {
  return; // Silent cleanup on component unmount
  }
  console.error("Evaluation trigger failed", error);
  alert("Failed to load trial match evaluation. Please check credentials or data.");
 } finally {
  clearInterval(progressInterval);
  setScanProgress(100);
  setTimeout(() => {
  setScanning(false);
  setLoading(false);
  }, 500);
 }
 };

 // Export report trigger
 const handlePrint = () => {
 window.print();
 };

 // Scanning Screen Overlay
 if (scanning) {
 return (
  <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 relative overflow-hidden transition-colors duration-200">
  <div className="absolute top-0 left-0 w-full bg-slate-200 h-1">
   <div className="bg-violet-600 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
  </div>
  
  <div className="animate-scan-line"></div>
  
  <BrainCircuit className="text-violet-600 animate-pulse mb-6" size={60} />
  <h2 className="font-outfit font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white mb-2">SCANNING CLINICAL DATA...</h2>
  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm text-center">
   Analyzing patient reports, clinical markers, and guidelines using FastAPI heuristics and ChromaDB vectors...
  </p>
  </div>
 );
 }

 // Empty patients list check
 if (!loading && patientsList.length === 0) {
 return (
  <div className="min-h-[50vh] flex flex-col items-center justify-center bg-white dark:bg-[#0d131f] text-slate-800 dark:text-slate-200 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center max-w-2xl mx-auto shadow-sm transition-colors duration-200">
  <ShieldAlert className="text-violet-600 mb-4" size={48} />
  <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white mb-2">No Patients Found</h3>
  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
   Please ingest a patient report and trial criteria first in the Intake Workspace.
  </p>
  <button
   onClick={() => navigate('/intake')}
   className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow transition-all text-sm"
  >
   Go to Intake Workspace
  </button>
  </div>
 );
 }

 // Missing patient selection check
 if (!loading && !selectedPatientId) {
 return (
  <div className="min-h-[50vh] flex flex-col items-center justify-center bg-white dark:bg-[#0d131f] text-slate-800 dark:text-slate-200 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center max-w-2xl mx-auto shadow-sm space-y-6 transition-colors duration-200">
  <User className="text-violet-600" size={48} />
  <div>
   <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white mb-2">Select a Patient to Analyze</h3>
   <p className="text-sm text-slate-500 dark:text-slate-400 ">
   Choose a patient profile from the list below to begin the matching assessment:
   </p>
  </div>
  <select
   value={selectedPatientId}
   onChange={(e) => handlePatientChange(e.target.value)}
   className="w-64 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-violet-500 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none transition-colors text-sm cursor-pointer font-semibold shadow-sm"
  >
   <option value="">-- Choose Patient --</option>
   {patientsList.map((p) => (
   <option key={p.id} value={p.id}>
    {p.name} (Age {p.age})
   </option>
   ))}
  </select>
  </div>
 );
 }

 if (loading || !patient || !evaluation) {
 return (
  <div className="min-h-[50vh] flex items-center justify-center">
  <Loader2 className="animate-spin text-violet-600" size={32} />
  </div>
 );
 }

 return (
 <div className="space-y-8 max-w-6xl mx-auto">
  {/* Patient Selector Row */}
  <PatientSelector 
  patientsList={patientsList}
  selectedPatientId={selectedPatientId}
  onChange={handlePatientChange}
  />

  {/* Header Profile Card */}
  <PatientHeaderCard 
  patient={patient}
  evaluation={evaluation}
  />

  {/* Narrative Summary card */}
  <NarrativeReport 
  summary={evaluation.summary}
  />

  {/* Split Details Pane */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Left Pane: Parsed Case Files */}
  <ClinicalRecordCard 
   patient={patient}
  />

  {/* Right Pane: Criteria Auditing & Tabs */}
  <CriteriaTabs 
   evaluation={evaluation}
   activeTab={activeTab}
   setActiveTab={setActiveTab}
  />
  </div>

  {/* Footer Actions */}
  <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 ">
  <button
   onClick={handlePrint}
   className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-bold transition-all text-sm bg-white dark:bg-[#0d131f]"
  >
   <Printer size={16} />
   Export Eligibility Document
  </button>

  <button
   onClick={() => navigate('/chat')}
   className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all text-sm"
  >
   Open RAG Q&A Assistant
   <ChevronRight size={16} />
  </button>
  </div>
 </div>
 );
};

export default TrialMatchAnalyzer;
