import React from 'react';

const ClinicalRecordCard = ({ patient }) => {
 // Helper function to regex highlight medical terms in UI
 const highlightMedicalEntities = (text) => {
 if (!text) return '';
 let html = text;

 const conditions = [
  /Stage IIIa/gi, /non-small cell lung cancer/gi, /NSCLC/gi, /adenocarcinoma/gi,
  /heart failure/gi, /HFrEF/gi, /NYHA Class III/gi, /bilateral pedal edema/gi, /orthopnea/gi,
  /Alzheimer's/gi, /dementia/gi, /cognitive decline/gi, /amyloid-beta/gi,
  /Type 2 Diabetes/gi, /diabetes/gi, /diabetic/gi, /obesity/gi
 ];
 
 const drugs = [
  /Pembrolizumab/gi, /Lisinopril/gi, /Metformin/gi, /Carvedilol/gi, /Spironolactone/gi,
  /Furosemide/gi, /Aspirin/gi, /Donepezil/gi, /Atorvastatin/gi, /Apixaban/gi, /Eliquis/gi
 ];
 
 const labs = [
  /HbA1c\s*=\s*\d+\.\d+%/gi, /HbA1c\s*\d+\.\d+%/gi, /EF\s*~?\s*\d+%/gi, /EF\s*=\s*\d+%/gi, /ejection fraction of \d+%/gi,
  /Cr\s*\d+\.\d+/gi, /Creatinine\s*\d+\.\d+/gi, /NT-proBNP\s*\d+/gi, /NT-proBNP\s*=\s*\d+/gi,
  /MMSE\s*score\s*of\s*\d+/gi, /MMSE:\s*\d+/gi, /eGFR\s*\d+/gi, /platelets\s*\d+/gi
 ];

 conditions.forEach(regex => {
  html = html.replace(regex, match => `<span class="highlighted-tag condition">${match}</span>`);
 });
 drugs.forEach(regex => {
  html = html.replace(regex, match => `<span class="highlighted-tag drug">${match}</span>`);
 });
 labs.forEach(regex => {
  html = html.replace(regex, match => `<span class="highlighted-tag lab">${match}</span>`);
 });

 // Replace linebreaks with HTML line breaks
 return html.replace(/\n/g, '<br>');
 };

 return (
 <div className="bg-white dark:bg-[#0d131f] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col text-left transition-colors duration-200">
  <h3 className="font-outfit font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 mb-4">
  Parsed Case Clinical Records
  </h3>
  <div className="flex-1 space-y-6 text-sm text-slate-700 dark:text-slate-300 ">
  <div>
   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Clinical Narrative (Ingested)</h4>
   <div 
   className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 leading-relaxed text-xs custom-scrollbar overflow-y-auto max-h-[160px] "
   dangerouslySetInnerHTML={{ __html: highlightMedicalEntities(patient.report_text) }}
   />
  </div>

  <div>
   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Laboratory Panels</h4>
   <div 
   className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 leading-relaxed text-xs custom-scrollbar overflow-y-auto max-h-[140px] "
   dangerouslySetInnerHTML={{ __html: highlightMedicalEntities(patient.lab_notes) }}
   />
  </div>

  <div>
   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Prescriptions</h4>
   <p className="font-semibold text-slate-800 dark:text-slate-200 ">{patient.current_meds || 'None reported'}</p>
  </div>
  </div>
 </div>
 );
};

export default ClinicalRecordCard;
