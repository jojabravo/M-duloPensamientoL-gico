
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

  const [showModal, setShowModal] = useState(false);

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
  }, [messages, showModal]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Announcements
    const { data: annData } = await supabase
      .from('anuncios')
      .select('*')
      .or(`Grado.eq.${student.Grado},Grado.eq.TODOS`)
      .order('fecha', { ascending: false });
    
    if (annData) setAnnouncements(annData);

    // Fetch Messages (where student is receiver or emisor)
    const { data: msgData } = await supabase
      .from('buzon')
      .select('*')
      .or(`Emisor.eq.${student.Usuario},Receptor.eq.${student.Usuario}`)
      .order('fecha', { ascending: false });

    if (msgData) {
      setMessages(msgData);
      // If mailbox is visible (not compact) or modal is open, mark as read
      if ((!compact || showModal) && (mode === 'all' || mode === 'mailbox')) {
        const unreadIds = msgData
          .filter(m => m.Receptor === student.Usuario && !m.Leido)
          .map(m => m.id);
        
        if (unreadIds.length > 0) {
          markAsRead(unreadIds);
        }
      }
    }
    setLoading(false);
  };

  const markAsRead = async (ids: string[]) => {
    const { error } = await supabase
      .from('buzon')
      .update({ Leido: true })
      .in('id', ids);
    
    if (error) console.error('Error marking as read:', error);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    const { error } = await supabase
      .from('buzon')
      .insert([
        {
          Emisor: student.Usuario,
          Receptor: 'Jorge',
          Contenido: newMessage.trim(),
          Grado: student.Grado,
          Leido: false
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

  const hasUnread = messages.some(m => m.Receptor === student.Usuario && !m.Leido);

  if (compact) {
    return (
      <div className="relative flex-1 md:flex-none">
        <button 
          className="w-full md:w-auto px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 relative"
          onClick={() => {
            playSound('pop');
            if (showModal) setShowModal(false);
            // We'll rely on the parent to handle navigation if needed, 
            // but for now let's keep the modal as a quick view option 
            // and the full section as the main one.
            setShowModal(true);
          }}
        >
          <i className="fas fa-envelope"></i>
          <span>Buzón</span>
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
          )}
        </button>

        {/* MODAL PARA EL BUZÓN CUANDO NO ESTÁ EN EL MENÚ */}
        {showModal && (
          <div 
            className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex justify-center items-end md:items-center p-0 md:p-4 animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <div 
              ref={scrollRef}
              className="w-full md:w-[95%] max-w-lg h-auto max-h-[75vh] rounded-t-[2.5rem] md:rounded-[3rem] bg-white shadow-[0_-10px_50px_-15px_rgba(0,0,0,0.3)] md:shadow-[0_30px_100px_-15px_rgba(0,0,0,0.5)] flex flex-col overflow-y-auto border-x-4 border-t-4 md:border-4 border-white animate-slideUp md:animate-scaleIn relative custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {/* CABECERA PREMIUM (STICKY) */}
              <div className="sticky top-0 z-40 p-3 md:p-6 border-b border-gray-100 flex items-center justify-between bg-white/95 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-indigo-50 rounded-lg md:rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm relative shrink-0">
                    <i className="fas fa-envelope-open-text text-sm md:text-xl"></i>
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-black text-gray-800 tracking-tighter text-sm md:text-lg leading-none">Mi Buzón</h3>
                    <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Chat con el Profe Jorge</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center group shrink-0"
                  title="Cerrar"
                >
                  <i className="fas fa-times text-xs md:text-base group-hover:rotate-90 transition-transform"></i>
                </button>
              </div>

              {/* CUERPO DE MENSAJES (SIN SCROLL PROPIO, EL PADRE SCROLLEA) */}
              <div 
                className="flex-1 p-5 md:p-6 space-y-4 bg-gray-50/30"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-20">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl md:text-3xl mb-4">
                      <i className="fas fa-comments"></i>
                    </div>
                    <p className="font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em]">No hay mensajes aún</p>
                  </div>
                ) : (
                  [...messages].reverse().map((msg, idx) => {
                    const isMe = msg.Emisor === student.Usuario;
                    return (
                      <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                        <div className={`max-w-[85%] p-4 rounded-[1.8rem] shadow-sm relative break-words overflow-wrap-anywhere ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'}`}>
                          <p className="text-sm font-medium leading-relaxed break-words overflow-wrap-anywhere">{msg.Contenido}</p>
                          <div className={`flex items-center gap-2 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span className={`text-[8px] font-bold uppercase tracking-widest ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                              {new Date(msg.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ÁREA DE ENTRADA (STICKY AL FINAL) */}
              <div className="sticky bottom-0 z-30 p-3 md:p-6 bg-white border-t border-gray-100 shrink-0 pb-8 md:pb-6">
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl md:rounded-[2rem] p-1 border-2 border-transparent focus-within:border-indigo-100 focus-within:bg-white transition-all shadow-inner w-full overflow-hidden">
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-transparent border-none outline-none px-3 md:px-4 py-2 text-sm font-medium text-gray-700 min-w-0"
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="w-9 h-9 md:w-12 md:h-12 bg-indigo-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 transform active:scale-90 shrink-0"
                  >
                    <i className={`fas ${sending ? 'fa-circle-notch animate-spin' : 'fa-paper-plane'}`}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* SECCIÓN ANUNCIOS */}
      {(mode === 'all' || mode === 'announcements') && (
        <section className="w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
              <i className="fas fa-bullhorn"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tighter">Avisos del Profe Jorge</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Comunicados oficiales para tu grado</p>
            </div>
          </div>

          <div className="grid gap-4 w-full">
            {announcements.length === 0 ? (
              <div className="bg-white/50 border-2 border-dashed border-gray-100 p-8 rounded-[2rem] text-center">
                <p className="text-gray-400 font-bold text-sm">No hay avisos recientes</p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="bg-white p-6 rounded-[1.5rem] border-2 border-amber-50 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-start group w-full overflow-hidden">
                  <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                    <i className="fas fa-bell"></i>
                  </div>
                  <div className="flex-1 w-full overflow-hidden">
                    <p className="text-gray-700 font-medium leading-relaxed break-words overflow-wrap-anywhere">{ann.mensaje}</p>
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
        <section id="student-mailbox-section" className="bg-white rounded-[3rem] shadow-2xl border-8 border-indigo-50 overflow-hidden flex flex-col h-[600px] animate-fade-up w-full max-w-full">
          {/* CABECERA DEL BUZÓN */}
          <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg relative shrink-0">
                <i className="fas fa-envelope-open-text text-xl md:text-2xl"></i>
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-gray-800 tracking-tighter">Mi Buzón con el Profe</h3>
                <p className="text-gray-500 font-medium text-xs md:text-sm">Conversación privada con el Profe Jorge</p>
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
            className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-gray-50/20"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                <i className="fas fa-comments text-5xl mb-4"></i>
                <p className="font-black text-xs uppercase tracking-widest">No hay mensajes aún. ¡Escríbele al profe!</p>
              </div>
            ) : (
              [...messages].reverse().map((msg, idx) => {
                const isMe = msg.Emisor === student.Usuario;
                return (
                  <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                    <div className={`max-w-[90%] md:max-w-[70%] p-4 md:p-5 rounded-[2rem] shadow-sm relative break-words overflow-wrap-anywhere ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'}`}>
                      <p className="text-sm leading-relaxed font-medium break-words overflow-wrap-anywhere">{msg.Contenido}</p>
                      <div className={`flex items-center gap-2 mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[9px] font-bold uppercase tracking-tighter ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                          {new Date(msg.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && (
                          <i className={`fas fa-check-double text-[8px] ${msg.Leido ? 'text-emerald-300' : 'text-indigo-300'}`}></i>
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
                id="contenido"
                name="contenido"
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
