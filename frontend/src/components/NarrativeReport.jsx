import React from 'react';
import { BrainCircuit } from 'lucide-react';

const NarrativeReport = ({ summary }) => {
 return (
 <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 p-6 rounded-2xl shadow-sm text-left transition-colors duration-200">
  <h3 className="text-xs font-bold text-violet-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
  <BrainCircuit size={14} /> Gemini Expert Reasoning Narrative
  </h3>
  <p className="text-sm font-medium text-indigo-950 leading-relaxed">
  {summary}
  </p>
 </div>
 );
};

export default NarrativeReport;
