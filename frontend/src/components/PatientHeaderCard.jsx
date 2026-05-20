import React from 'react';
import { User } from 'lucide-react';

const PatientHeaderCard = ({ patient, evaluation }) => {
 const getStatusBadgeClass = (status) => {
 switch (status) {
  case 'Eligible':
  return 'bg-emerald-50 text-emerald-700 border-emerald-200 ';
  case 'Borderline':
  return 'bg-amber-50 text-amber-700 border-amber-200 ';
  default:
  return 'bg-rose-50 text-rose-700 border-rose-200 ';
 }
 };

 return (
 <div className="bg-white dark:bg-[#0d131f] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-200">
  <div className="flex items-center gap-4 text-left">
  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
   <User size={30} />
  </div>
  <div>
   <div className="flex items-center gap-3">
   <h2 className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-white">{patient.name}</h2>
   <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(evaluation.status)}`}>
    {evaluation.status.toUpperCase()}
   </span>
   </div>
   <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
   Age {patient.age} • {patient.gender} • Target Trial: <span className="font-bold text-slate-800 dark:text-slate-200 ">{patient.trial_title?.split(':')[0]}</span>
   </p>
  </div>
  </div>

  {/* Circular Match Rating Score */}
  <div className="flex items-center gap-4">
  <div className="relative w-20 h-20">
   <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
   <path
    className="text-slate-100 "
    strokeWidth="3"
    stroke="currentColor"
    fill="none"
    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
   />
   <path
    className="text-indigo-600 transition-all duration-1000 ease-out"
    strokeDasharray={`${evaluation.match_score}, 100`}
    strokeWidth="3.5"
    strokeLinecap="round"
    stroke="currentColor"
    fill="none"
    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
   />
   </svg>
   <div className="absolute inset-0 flex items-center justify-center">
   <span className="font-outfit font-extrabold text-lg text-slate-900 dark:text-white ">{evaluation.match_score}%</span>
   </div>
  </div>
  <div className="text-left">
   <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Eligibility rating</p>
   <p className="text-sm font-bold text-slate-700 dark:text-slate-300 ">Protocol score</p>
  </div>
  </div>
 </div>
 );
};

export default PatientHeaderCard;
