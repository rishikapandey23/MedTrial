import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FileUp, Loader2, Sparkles, Check, X } from 'lucide-react';

const PatientIntake = () => {
 const [name, setName] = useState('');
 const [age, setAge] = useState('');
 const [gender, setGender] = useState('Male');
 const [reportText, setReportText] = useState('');
 const [labNotes, setLabNotes] = useState('');
 const [currentMeds, setCurrentMeds] = useState('');
 const [trialTitle, setTrialTitle] = useState('');
 const [trialCriteria, setTrialCriteria] = useState('');
 
 const [uploadingReport, setUploadingReport] = useState(false);
 const [uploadingLabs, setUploadingLabs] = useState(false);
 const [reportStatus, setReportStatus] = useState('');
 const [labsStatus, setLabsStatus] = useState('');
 
 const [submitting, setSubmitting] = useState(false);
 const navigate = useNavigate();

 const reportInputRef = useRef(null);
 const labsInputRef = useRef(null);

 // Check if a scenario template was pre-seeded from Dashboard
 useEffect(() => {
 const seeded = localStorage.getItem('seeded_template');
 if (seeded) {
  const data = JSON.parse(seeded);
  setName(data.name || '');
  setAge(data.age || '');
  setGender(data.gender || 'Male');
  setReportText(data.report_text || '');
  setLabNotes(data.lab_notes || '');
  setCurrentMeds(data.current_meds || '');
  setTrialTitle(data.trial_title || '');
  setTrialCriteria(data.trial_criteria || '');
  localStorage.removeItem('seeded_template');
 }
 }, []);

 const handleFileUpload = async (e, type) => {
 const file = e.target.files[0];
 if (!file) return;
 triggerUpload(file, type);
 };

 const triggerUpload = async (file, type) => {
 if (!file.name.toLowerCase().endsWith('.pdf')) {
  alert("Unsupported file format. Please upload a PDF file.");
  return;
 }

 const formData = new FormData();
 formData.append("file", file);

 if (type === 'report') {
  setUploadingReport(true);
  setReportStatus("Uploading and parsing document...");
 } else {
  setUploadingLabs(true);
  setLabsStatus("Uploading and parsing document...");
 }

 try {
  const response = await api.post('/api/patients/ingest-file', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  const parsedText = response.data.extracted_text;
  
  if (type === 'report') {
  setReportText(parsedText);
  setReportStatus(`Parsed: ${file.name}`);
  } else {
  setLabNotes(parsedText);
  setLabsStatus(`Parsed: ${file.name}`);
  }
 } catch (error) {
  console.error("File upload failed", error);
  if (type === 'report') {
  setReportStatus("Failed to extract text.");
  } else {
  setLabsStatus("Failed to extract text.");
  }
  alert(error.response?.data?.detail || "Failed to process PDF case report.");
 } finally {
  if (type === 'report') setUploadingReport(false);
  else setUploadingLabs(false);
 }
 };

 const handleDragOver = (e) => {
 e.preventDefault();
 };

 const handleDrop = (e, type) => {
 e.preventDefault();
 const file = e.dataTransfer.files[0];
 if (file) {
  triggerUpload(file, type);
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setSubmitting(true);

 try {
  // Save patient record
  const patientRes = await api.post('/api/patients', {
  name,
  age: parseInt(age) || 0,
  gender,
  report_text: reportText,
  lab_notes: labNotes,
  current_meds: currentMeds,
  trial_title: trialTitle,
  trial_criteria: trialCriteria
  });

  const newPatient = patientRes.data;
  localStorage.setItem('active_patient_id', newPatient.id);
  
  // Navigate to Analyzer screen which will run evaluations
  navigate('/analyzer');
 } catch (error) {
  console.error("Intake failed", error);
  alert(error.response?.data?.detail || "Failed to submit patient intake.");
 } finally {
  setSubmitting(false);
 }
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
  {/* Section 1: Demographics */}
  <div className="bg-white dark:bg-[#0d131f] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors duration-200">
  <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 pb-3">Patient Intake demographics</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
   <div>
   <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Patient Full Name</label>
   <input
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-violet-500 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none transition-colors"
    placeholder="Arthur Pendelton"
    required
   />
   </div>
   <div>
   <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Age</label>
   <input
    type="number"
    value={age}
    onChange={(e) => setAge(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-violet-500 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none transition-colors"
    placeholder="64"
    required
   />
   </div>
   <div>
   <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Gender</label>
   <select
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-violet-500 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none transition-colors cursor-pointer"
   >
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other / Non-binary</option>
   </select>
   </div>
  </div>
  </div>

  {/* Section 2: Patient Records / File Upload */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {/* Patient Clinical History */}
  <div className="bg-white dark:bg-[#0d131f] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-200">
   <h3 className="font-outfit font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 flex justify-between items-center">
   Clinical History Report
   <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-semibold uppercase">PDF Ingestion Active</span>
   </h3>

   <div
   onDragOver={handleDragOver}
   onDrop={(e) => handleDrop(e, 'report')}
   onClick={() => reportInputRef.current.click()}
   className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-500 rounded-xl p-6 text-center cursor-pointer transition-colors group bg-slate-50 dark:bg-slate-900/50 "
   >
   <input
    type="file"
    ref={reportInputRef}
    onChange={(e) => handleFileUpload(e, 'report')}
    accept=".pdf"
    className="hidden"
   />
   {uploadingReport ? (
    <Loader2 className="mx-auto text-violet-600 animate-spin mb-2" size={24} />
   ) : (
    <FileUp className="mx-auto text-slate-400 group-hover:text-violet-500 transition-colors mb-2" size={24} />
   )}
   <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 ">Drag case report PDF here or click to browse</p>
   {reportStatus && (
    <div className="mt-2 flex items-center justify-center gap-1.5">
    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
     <Check size={10} /> {reportStatus}
    </span>
    <button
     type="button"
     onClick={(e) => {
     e.stopPropagation();
     setReportStatus("");
     setReportText("");
     if (reportInputRef.current) reportInputRef.current.value = "";
     }}
     className="p-1 hover:bg-slate-200 text-slate-500 dark:text-slate-400 hover:text-slate-750 rounded-full transition-colors"
     title="Remove case report"
    >
     <X size={10} />
    </button>
    </div>
   )}
   </div>

   <div>
   <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Raw Report Text</label>
   <textarea
    value={reportText}
    onChange={(e) => setReportText(e.target.value)}
    rows={6}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-violet-500 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none transition-colors text-sm custom-scrollbar"
    placeholder="Prefills on PDF upload or paste notes directly..."
   />
   </div>
  </div>

  {/* Laboratory panels */}
  <div className="bg-white dark:bg-[#0d131f] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-200">
   <h3 className="font-outfit font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 flex justify-between items-center">
   Laboratory Panel Records
   <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-semibold uppercase">PDF Ingestion Active</span>
   </h3>

   <div
   onDragOver={handleDragOver}
   onDrop={(e) => handleDrop(e, 'labs')}
   onClick={() => labsInputRef.current.click()}
   className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-500 rounded-xl p-6 text-center cursor-pointer transition-colors group bg-slate-50 dark:bg-slate-900/50 "
   >
   <input
    type="file"
    ref={labsInputRef}
    onChange={(e) => handleFileUpload(e, 'labs')}
    accept=".pdf"
    className="hidden"
   />
   {uploadingLabs ? (
    <Loader2 className="mx-auto text-violet-600 animate-spin mb-2" size={24} />
   ) : (
    <FileUp className="mx-auto text-slate-400 group-hover:text-violet-500 transition-colors mb-2" size={24} />
   )}
   <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 ">Drag labs PDF here or click to browse</p>
   {labsStatus && (
    <div className="mt-2 flex items-center justify-center gap-1.5">
    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
     <Check size={10} /> {labsStatus}
    </span>
    <button
     type="button"
     onClick={(e) => {
     e.stopPropagation();
     setLabsStatus("");
     setLabNotes("");
     if (labsInputRef.current) labsInputRef.current.value = "";
     }}
     className="p-1 hover:bg-slate-200 text-slate-500 dark:text-slate-400 hover:text-slate-750 rounded-full transition-colors"
     title="Remove laboratory records"
    >
     <X size={10} />
    </button>
    </div>
   )}
   </div>

   <div>
   <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Raw Labs Text</label>
   <textarea
    value={labNotes}
    onChange={(e) => setLabNotes(e.target.value)}
    rows={6}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-violet-500 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none transition-colors text-sm custom-scrollbar"
    placeholder="EGFR: 82 mL/min..."
   />
   </div>
  </div>
  </div>

  {/* Section 3: Medication list and Trial Protocols */}
  <div className="bg-white dark:bg-[#0d131f] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors duration-200">
  <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 pb-3">Clinical Trial Protocol & Medications</h3>
  <div className="space-y-4">
   <div>
   <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Current Prescribed Medications</label>
   <input
    type="text"
    value={currentMeds}
    onChange={(e) => setCurrentMeds(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-violet-500 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none transition-colors text-sm"
    placeholder="Metformin 500mg daily, Lisinopril 10mg daily..."
   />
   </div>

   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
   <div>
    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Clinical Trial Title</label>
    <input
    type="text"
    value={trialTitle}
    onChange={(e) => setTrialTitle(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-violet-500 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none transition-colors text-sm"
    placeholder="NSCLC-301: Monoclonal Antibody Immunotherapy Study"
    required
    />
   </div>
   <div>
    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Eligibility Protocol Criteria Guidelines</label>
    <textarea
    value={trialCriteria}
    onChange={(e) => setTrialCriteria(e.target.value)}
    rows={4}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-violet-500 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none transition-colors text-sm custom-scrollbar"
    placeholder="Inclusion Criteria:\n1. Age >= 18...\n\nExclusion Criteria:\n1. Active autoimmune disease..."
    required
    />
   </div>
   </div>
  </div>
  </div>

  {/* Submission Panel */}
  <div className="flex justify-end">
  <button
   type="submit"
   disabled={submitting}
   className="flex items-center gap-2 py-3.5 px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all disabled:opacity-50"
  >
   {submitting ? (
   <Loader2 className="animate-spin" size={18} />
   ) : (
   <>
    <Sparkles size={18} />
    Run Trial Matching Analysis
   </>
   )}
  </button>
  </div>
 </form>
 );
};

export default PatientIntake;
