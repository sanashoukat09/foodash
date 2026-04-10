import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const icons = { success: CheckCircle, error: AlertCircle, info: Info };
  const colors = { success: 'var(--success)', error: 'var(--error)', info: 'var(--brand)' };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{ position:'fixed', bottom:24, right:24, display:'flex', flexDirection:'column', gap:10, zIndex:9999 }}>
        {toasts.map(t => {
          const Icon = icons[t.type] || Info;
          return (
            <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', background:'var(--dark2)', border:`1px solid ${colors[t.type]}44`, borderRadius:'var(--radius)', boxShadow:'var(--shadow)', minWidth:280, maxWidth:380, animation:'slideIn 0.3s ease' }}>
              <Icon size={18} color={colors[t.type]} style={{flexShrink:0}} />
              <span style={{ fontSize:14, flex:1 }}>{t.message}</span>
              <button onClick={() => remove(t.id)} style={{ background:'none', border:'none', color:'var(--text-muted)', padding:0, display:'flex' }}><X size={16} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
