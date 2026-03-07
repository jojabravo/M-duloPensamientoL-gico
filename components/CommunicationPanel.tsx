
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
  const [showMailModal, setShowMailModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

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
      setShowMailModal(false);
      playSound('pop');
      fetchData();
    } else {
      console.error('Error sending message:', error);
    }
    setSending(false);
  };

  const hasUnread = messages.some(m => m.receptor === student.Usuario && !m.leido);

  return (
    <div className="space-y-8 animate-fadeIn">
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

      {/* SECCIÓN BUZÓN */}
      {(mode === 'all' || mode === 'mailbox') && (
        compact ? (
          <button 
            onClick={() => { playSound('pop'); setShowMailModal(true); }}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 relative"
          >
            <i className="fas fa-envelope"></i>
            <span>Buzón</span>
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>
        ) : (
          <section className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-[2.5rem] border-2 border-purple-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-lg relative">
              <i className="fas fa-envelope-open-text text-2xl"></i>
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tighter">Buzón Privado</h3>
              <p className="text-gray-500 font-medium">¿Tienes dudas? Escríbele directamente al Profe Jorge</p>
            </div>
          </div>

          <button 
            onClick={() => { playSound('pop'); setShowMailModal(true); }}
            className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-black shadow-xl hover:bg-purple-700 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3"
          >
            <i className="fas fa-paper-plane"></i>
            ESCRIBIR AL PROFE JORGE
          </button>
        </div>

        {/* LISTA DE MENSAJES RECIENTES (OPCIONAL) */}
        {messages.length > 0 && (
          <div className="mt-8 space-y-3">
            <p className="text-[10px] text-purple-400 font-black uppercase tracking-[0.2em] mb-4">Conversaciones recientes</p>
            {messages.slice(0, 3).map((msg) => (
              <div key={msg.id} className={`p-4 rounded-xl border shadow-sm flex justify-between items-center ${msg.emisor === student.Usuario ? 'bg-white border-gray-100' : 'bg-purple-100 border-purple-200'}`}>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700 line-clamp-1">{msg.mensaje}</span>
                  <span className="text-[9px] text-gray-400 font-black uppercase mt-1">
                    {msg.emisor === student.Usuario ? 'Tú' : 'Profe Jorge'} • {new Date(msg.fecha).toLocaleDateString()}
                  </span>
                </div>
                {!msg.leido && msg.receptor === student.Usuario && (
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
        )
      )}

      {/* MODAL PARA ESCRIBIR MENSAJE */}
      {showMailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-2xl border-8 border-purple-50 relative animate-scaleIn">
            <button 
              onClick={() => setShowMailModal(false)}
              className="absolute top-6 right-8 text-gray-400 hover:text-red-500 transition-colors text-2xl"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 text-2xl mx-auto mb-4">
                <i className="fas fa-comment-dots"></i>
              </div>
              <h4 className="text-2xl font-black text-gray-800 tracking-tighter">Enviar Mensaje Privado</h4>
              <p className="text-gray-500 font-medium mt-1">Tu mensaje será recibido únicamente por el Profe Jorge</p>
            </div>

            <textarea 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe aquí tu duda o comentario..."
              className="w-full h-40 p-6 bg-gray-50 border-2 border-gray-100 rounded-[2rem] focus:border-purple-500 outline-none transition-all font-medium text-gray-700 resize-none"
            ></textarea>

            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => setShowMailModal(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all"
              >
                CANCELAR
              </button>
              <button 
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className="flex-[2] py-4 bg-purple-600 text-white rounded-2xl font-black shadow-xl hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {sending ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
                ENVIAR MENSAJE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationPanel;
