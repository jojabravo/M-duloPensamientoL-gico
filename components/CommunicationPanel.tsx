
import React, { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
import { Announcement, MailMessage, StudentProfile } from '../types';
import { playSound } from '../audio';

interface Props {
  student: StudentProfile;
  mode?: 'all' | 'announcements' | 'mailbox';
  compact?: boolean;
}

const CommunicationPanel: React.FC<Props> = ({ student, mode = 'all', compact = false }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    // Subscribe to changes
    const announcementsChannel = supabase
      .channel('public:anuncios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anuncios' }, fetchData)
      .subscribe();

    const messagesChannel = supabase
      .channel('public:buzon')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'buzon' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(announcementsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Announcements
    const { data: annData } = await supabase
      .from('anuncios')
      .select('*')
      .or(`grado.eq.${student.Grado},grado.eq.TODOS`)
      .order('fecha', { ascending: false });
    
    if (annData) setAnnouncements(annData);

    // Fetch Messages (where student is receiver or emisor)
    const { data: msgData } = await supabase
      .from('buzon')
      .select('*')
      .or(`emisor.eq.${student.Usuario},receptor.eq.${student.Usuario}`)
      .order('fecha', { ascending: false });

    if (msgData) setMessages(msgData);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    const { error } = await supabase
      .from('buzon')
      .insert([
        {
          emisor: student.Usuario,
          receptor: 'Jorge',
          mensaje: newMessage.trim(),
          fecha: new Date().toISOString(),
          leido: false
        }
      ]);

    if (!error) {
      setNewMessage('');
      playSound('pop');
      fetchData();
    } else {
      console.error('Error sending message:', error);
    }
    setSending(false);
  };

  const hasUnread = messages.some(m => m.receptor === student.Usuario && !m.leido);

  if (compact) {
    return (
      <div className="relative group">
        <button 
          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 relative"
          onClick={() => {
            const el = document.getElementById('student-mailbox-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
              playSound('pop');
            }
          }}
        >
          <i className="fas fa-envelope"></i>
          <span>Buzón</span>
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* SECCIÓN ANUNCIOS */}
      {(mode === 'all' || mode === 'announcements') && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
              <i className="fas fa-bullhorn"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tighter">Avisos del Profe Jorge</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Comunicados oficiales para tu grado</p>
            </div>
          </div>

          <div className="grid gap-4">
            {announcements.length === 0 ? (
              <div className="bg-white/50 border-2 border-dashed border-gray-100 p-8 rounded-[2rem] text-center">
                <p className="text-gray-400 font-bold text-sm">No hay avisos recientes</p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="bg-white p-6 rounded-[1.5rem] border-2 border-amber-50 shadow-sm hover:shadow-md transition-all flex gap-4 items-start group">
                  <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                    <i className="fas fa-bell"></i>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium leading-relaxed">{ann.mensaje}</p>
                    <p className="text-[10px] text-gray-400 font-black mt-2 uppercase tracking-widest">
                      {new Date(ann.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* SECCIÓN BUZÓN INTEGRADO */}
      {(mode === 'all' || mode === 'mailbox') && (
        <section id="student-mailbox-section" className="bg-white rounded-[3rem] shadow-2xl border-8 border-indigo-50 overflow-hidden flex flex-col h-[600px] animate-fade-up">
          {/* CABECERA DEL BUZÓN */}
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg relative">
                <i className="fas fa-envelope-open-text text-2xl"></i>
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-800 tracking-tighter">Mi Buzón con el Profe</h3>
                <p className="text-gray-500 font-medium text-sm">Conversación privada con el Profe Jorge</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Conectado
            </div>
          </div>

          {/* HISTORIAL DE CONVERSACIÓN (BURBUJAS) */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gray-50/20"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                <i className="fas fa-comments text-5xl mb-4"></i>
                <p className="font-black text-xs uppercase tracking-widest">No hay mensajes aún. ¡Escríbele al profe!</p>
              </div>
            ) : (
              [...messages].reverse().map((msg, idx) => {
                const isMe = msg.emisor === student.Usuario;
                return (
                  <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                    <div className={`max-w-[80%] md:max-w-[70%] p-5 rounded-[2rem] shadow-sm relative ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'}`}>
                      <p className="text-sm leading-relaxed font-medium">{msg.mensaje}</p>
                      <div className={`flex items-center gap-2 mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[9px] font-bold uppercase tracking-tighter ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                          {new Date(msg.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && (
                          <i className={`fas fa-check-double text-[8px] ${msg.leido ? 'text-emerald-300' : 'text-indigo-300'}`}></i>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* CAJA DE RESPUESTA ESTILIZADA */}
          <div className="p-6 bg-white border-t border-gray-100">
            <div className="flex items-center gap-4 bg-gray-50 rounded-[2.5rem] p-2 border-2 border-gray-100 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
              <input 
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe tu duda o comentario..."
                className="flex-1 bg-transparent border-none outline-none px-6 py-4 font-medium text-gray-700"
              />
              <button 
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all transform active:scale-90 disabled:opacity-50"
              >
                {sending ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CommunicationPanel;
