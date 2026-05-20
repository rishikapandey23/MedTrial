import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
 Send, 
 Loader2, 
 MessageSquare, 
 BookOpen, 
 FileText, 
 Sparkles,
 ArrowRight,
 BrainCircuit
} from 'lucide-react';

const SUGGESTED_CHIPS = [
 "Does the patient meet age guidelines?",
 "Are there any drug interaction conflicts?",
 "What is the patient's renal eGFR level?",
 "Confirm staging eligibility factors."
];

const RAGChat = () => {
 const [patient, setPatient] = useState(null);
 const [messages, setMessages] = useState([]);
 const [input, setInput] = useState('');
 const [sources, setSources] = useState([]);
 const [loading, setLoading] = useState(false);
 const [pageLoading, setPageLoading] = useState(true);
 const navigate = useNavigate();

 const patientId = localStorage.getItem('active_patient_id');
 const chatEndRef = useRef(null);

 useEffect(() => {
 if (!patientId) {
  navigate('/');
  return;
 }
 loadPatientDetails();
 }, [patientId]);

 useEffect(() => {
 // Scroll chatbot to end on new messages
 chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [messages]);

 const loadPatientDetails = async () => {
 setPageLoading(true);
 try {
  const response = await api.get(`/api/patients/${patientId}`);
  setPatient(response.data);
  
  // Initialize greeting message
  setMessages([
  {
   id: 'welcome',
   role: 'bot',
   text: `Hello, I'm your Clinical RAG Assistant. I have indexed the medical files for ${response.data.name} and the ${response.data.trial_title?.split(':')[0]} protocol guidelines. Ask me any clinical questions regarding eligibility or safety.`,
   sources: []
  }
  ]);
 } catch (error) {
  console.error("Failed to load patient context", error);
  navigate('/');
 } finally {
  setPageLoading(false);
 }
 };

 const handleSend = async (textToSend) => {
 const queryText = textToSend || input;
 if (!queryText.trim()) return;

 // Add user message
 const userMsg = {
  id: Date.now().toString(),
  role: 'user',
  text: queryText
 };
 
 setMessages((prev) => [...prev, userMsg]);
 if (!textToSend) setInput('');
 setLoading(true);

 // Create placeholder bot message
 const botMsgId = (Date.now() + 1).toString();
 setMessages((prev) => [...prev, { id: botMsgId, role: 'bot', text: '', typing: true }]);

 try {
  const response = await api.post(`/api/rag/patient/${patientId}/query`, {
  query: queryText
  });
  
  const { answer, sources: retrievedSources } = response.data;
  
  // Update bot message with final answer
  setMessages((prev) => 
  prev.map((msg) => 
   msg.id === botMsgId 
   ? { id: botMsgId, role: 'bot', text: answer, sources: retrievedSources } 
   : msg
  )
  );

  // Focus retrieved sources on the right sidebar
  setSources(retrievedSources);
 } catch (error) {
  console.error("RAG request failed", error);
  setMessages((prev) => 
  prev.map((msg) => 
   msg.id === botMsgId 
   ? { id: botMsgId, role: 'bot', text: "Error: Failed to fetch answer. Please make sure the backend is active.", sources: [] } 
   : msg
  )
  );
 } finally {
  setLoading(false);
 }
 };

 if (pageLoading) {
 return (
  <div className="min-h-[50vh] flex items-center justify-center">
  <Loader2 className="animate-spin text-violet-600" size={32} />
  </div>
 );
 }

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:h-[calc(100vh-12rem)] min-h-[500px]">
  {/* Left Chat Window (2/3 width) */}
  <div className="lg:col-span-2 bg-white dark:bg-[#0d131f] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden transition-colors duration-200">
  {/* Chat Header */}
  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 text-left">
   <div className="p-2 bg-violet-100 text-violet-700 rounded-lg">
   <BrainCircuit size={18} />
   </div>
   <div>
   <h3 className="text-sm font-bold text-slate-900 dark:text-white ">Semantic Chat Portal</h3>
   <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Context: {patient?.name}</p>
   </div>
  </div>

  {/* Message Feed */}
  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50 dark:bg-slate-900/50/30 text-left">
   {messages.map((msg) => (
   <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
    msg.role === 'user' 
     ? 'bg-violet-600 text-white rounded-tr-none' 
     : 'bg-white dark:bg-[#0d131f] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm rounded-tl-none'
    }`}>
    {msg.typing ? (
     <div className="flex items-center gap-1 py-1">
     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
     </div>
    ) : (
     <div>
     <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
     {/* Citations list inside message */}
     {msg.sources && msg.sources.length > 0 && (
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sources:</span>
      {msg.sources.map((src, idx) => (
       <span 
       key={idx} 
       onClick={() => setSources(msg.sources)}
       className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-bold border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-violet-50 dark:bg-violet-950/40 hover:text-violet-700 dark:text-violet-400 hover:border-violet-200 dark:border-violet-800 transition-colors"
       >
       <FileText size={8} />
       {src.source.split(' ')[0]} ({src.score}%)
       </span>
      ))}
      </div>
     )}
     </div>
    )}
    </div>
   </div>
   ))}
   <div ref={chatEndRef} />
  </div>

  {/* Suggestion Chips */}
  {messages.length === 1 && (
   <div className="px-6 py-3 bg-white dark:bg-[#0d131f] border-t border-slate-100 flex flex-wrap gap-2 text-left">
   {SUGGESTED_CHIPS.map((chip, idx) => (
    <button
    key={idx}
    onClick={() => handleSend(chip)}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:border-violet-500/50 text-xs text-slate-600 dark:text-slate-400 hover:text-violet-700 dark:text-violet-400 transition-all font-semibold"
    >
    {chip} <ArrowRight size={10} />
    </button>
   ))}
   </div>
  )}

  {/* Chat Input */}
  <div className="p-4 bg-white dark:bg-[#0d131f] border-t border-slate-200 dark:border-slate-800 flex gap-3">
   <input
   type="text"
   value={input}
   onChange={(e) => setInput(e.target.value)}
   onKeyDown={(e) => e.key === 'Enter' && handleSend()}
   placeholder={`Query details for ${patient?.name}...`}
   className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 focus:border-violet-500 rounded-xl text-sm outline-none text-slate-800 dark:text-slate-200 transition-colors"
   disabled={loading}
   />
   <button
   onClick={() => handleSend()}
   disabled={loading || !input.trim()}
   className="flex items-center justify-center w-11 h-11 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all flex-shrink-0"
   >
   {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
   </button>
  </div>
  </div>

  {/* Right Source Inspector Pane (1/3 width) */}
  <div className="bg-white dark:bg-[#0d131f] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden text-left transition-colors duration-200">
  <h3 className="font-outfit font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
   <BookOpen size={16} className="text-violet-600" />
   Retrieved Context Sources
  </h3>

  <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
   {sources.length === 0 ? (
   <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400 py-12">
    <FileText size={32} className="text-slate-300 mb-2" />
    Ask a question to see matching vector document segments.
   </div>
   ) : (
   sources.map((src, idx) => (
    <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-900/50 hover:border-violet-200 dark:border-violet-500/30 hover:bg-violet-50/30 dark:bg-violet-950/20 transition-all space-y-2">
    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
     <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 ">
     <FileText size={10} /> {src.source}
     </span>
     <span className="text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100 ">
     {src.score}% Match
     </span>
    </div>
    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
     "{src.text}"
    </p>
    </div>
   ))
   )}
  </div>
  </div>
 </div>
 );
};

export default RAGChat;
