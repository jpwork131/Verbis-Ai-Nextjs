"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Minimize2, Maximize2 } from 'lucide-react';

export default function FloatingConsole() {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMin, setIsMin] = useState(false);
  const logsEndRef = useRef(null);

  useEffect(() => {
    const handleLog = (e) => {
      setLogs((prev) => [...prev, e.detail]);
      if (!isOpen && !isMin) {
        setIsOpen(true);
      }
    };

    window.addEventListener("system-log", handleLog);
    return () => window.removeEventListener("system-log", handleLog);
  }, [isOpen, isMin]);

  useEffect(() => {
    if (isOpen && !isMin && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen, isMin]);

  return (
    <div 
      className={`fixed bottom-4 left-4 z-50 bg-slate-950 text-emerald-400 font-mono text-xs rounded-md shadow-2xl border border-slate-800 transition-all duration-300 flex flex-col overflow-hidden ${
        isOpen ? (isMin ? 'w-80 h-10' : 'w-96 md:w-[500px] h-[400px]') : 'w-12 h-12 rounded-full cursor-pointer hover:scale-105'
      }`} 
      style={{ opacity: (!isOpen && logs.length === 0) ? 0.7 : 1 }}
    >
      {!isOpen && (
        <div 
          className="w-full h-full flex flex-col items-center justify-center bg-slate-900 border-2 border-slate-800 text-slate-400 hover:text-white" 
          onClick={() => setIsOpen(true)} 
          title="Open System Logs"
        >
          <Terminal size={20} />
          {logs.length > 0 && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />
          )}
        </div>
      )}

      {isOpen && (
        <>
          <div 
            className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 select-none cursor-pointer" 
            onClick={() => setIsMin(!isMin)}
          >
            <div className="flex items-center gap-2 text-slate-300">
              <Terminal size={14} className="text-emerald-500" />
              <span className="font-bold tracking-tight">ai-system-worker.exe</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[9px] animate-pulse">RUNNING</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMin(!isMin); }} 
                className="hover:text-white transition-colors"
                type="button"
              >
                {isMin ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
                className="hover:text-red-400 transition-colors"
                type="button"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMin && (
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">Waiting for connection...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`flex gap-2 ${log.error ? 'text-red-400' : 'text-emerald-400'}`}>
                    <span className="text-slate-500 shrink-0">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span className="break-all">{log.message}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
