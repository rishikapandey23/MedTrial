import React from 'react';

const PatientSelector = ({ patientsList, selectedPatientId, onChange }) => {
 return (
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#0d131f] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-left transition-colors duration-200">
  <div>
  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 ">Analyzing Patient:</span>
  </div>
  <select
  value={selectedPatientId}
  onChange={(e) => onChange(e.target.value)}
  className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-violet-500 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none transition-colors text-sm cursor-pointer font-semibold shadow-sm"
  >
  <option value="" disabled>-- Choose Patient --</option>
  {patientsList.map((p) => (
   <option key={p.id} value={p.id}>
   {p.name} (Age {p.age})
   </option>
  ))}
  </select>
 </div>
 );
};

export default PatientSelector;
