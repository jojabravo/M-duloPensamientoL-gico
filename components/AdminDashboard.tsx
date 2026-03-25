
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../src/supabaseClient';
import { StudentProfile, MailMessage, Announcement } from '../types';
import { playSound } from '../audio';

interface Props {
  onBack: () => void;
}

const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD || 'Perla2026*';

const AdminDashboard: React.FC<Props> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);
  
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Todos');
  const [performanceFilter, setPerformanceFilter] = useState('Todos');
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table');
  const [showInProcess, setShowInProcess] = useState(false);

  // Unified Messaging Center States
  const [allBuzonMessages, setAllBuzonMessages] = useState<MailMessage[]>([]);
  const [selectedChatStudent, setSelectedChatStudent] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatSidebarSearch, setChatSidebarSearch] = useState('');
  const [chatSidebarGrade, setChatSidebarGrade] = useState('Todos');
  const [selectedMassRecipients, setSelectedMassRecipients] = useState<string[]>([]);
  const [isMassMode, setIsMassMode] = useState(false);
  const [commLoading, setCommLoading] = useState(false);
  const [lastNotification, setLastNotification] = useState<{show: boolean, message: string}>({ show: false, message: '' });
  const [activeTab, setActiveTab] = useState<'students' | 'messaging' | 'config'>('students');
  const [chapterConfig, setChapterConfig] = useState<{id: number, capitulo_numero: number, nombre: string, activo: boolean}[]>([]);
  const [configLoading, setConfigLoading] = useState(false);

  // Legacy/Other communication states (keeping for announcements)
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [announcementGrade, setAnnouncementGrade] = useState('TODOS');

  // Handle blocking logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBlocked && blockTimer > 0) {
      timer = setInterval(() => {
        setBlockTimer((prev) => prev - 1);
      }, 1000);
    } else if (blockTimer === 0) {
      setIsBlocked(false);
      setAttempts(0);
    }
    return () => clearInterval(timer);
  }, [isBlocked, blockTimer]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) return;

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      playSound('pop');
      fetchStudents();
      fetchCommunicationData();
      fetchChapterConfig();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError('Acceso Denegado: Esta área es exclusiva para el docente Jorge Armando Jaramillo Bravo');
      playSound('error');
      
      if (newAttempts >= 3) {
        setIsBlocked(true);
        setBlockTimer(30);
      }
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Estudiantes')
      .select('*')
      .order('Usuario', { ascending: true });

    if (!error && data) {
      setStudents(data);
    }
    setLoading(false);
  };

  const fetchCommunicationData = async () => {
    setCommLoading(true);
    // Fetch all messages involving Jorge
    const { data: msgData } = await supabase
      .from('buzon')
      .select('*')
      .or(`Emisor.eq."Jorge",Receptor.eq."Jorge"`)
      .order('fecha', { ascending: true });
    
    if (msgData) setAllBuzonMessages(msgData);
    setCommLoading(false);
  };

  const fetchChapterConfig = async () => {
    setConfigLoading(true);
    const { data, error } = await supabase
      .from('configuracion_capitulos')
      .select('*')
      .order('capitulo_numero', { ascending: true });
    
    if (!error && data) {
      setChapterConfig(data);
    }
    setConfigLoading(false);
  };

  const toggleChapter = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('configuracion_capitulos')
      .update({ activo: !currentStatus })
      .eq('id', id);
    
    if (!error) {
      setChapterConfig(prev => prev.map(c => c.id === id ? { ...c, activo: !currentStatus } : c));
      playSound('success');
    } else {
      playSound('error');
      alert('Error al actualizar la configuración');
    }
  };

  // Real-time subscription for new messages
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('admin-buzon-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'buzon',
          filter: 'Receptor=eq.Jorge',
        },
        (payload) => {
          const newMessage = payload.new as MailMessage;
          
          // Update messages state
          setAllBuzonMessages((prev) => {
            // Avoid duplicates if fetch and real-time overlap
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          
          // Play notification sound
          playSound('pop');
          
          // Find student name
          const student = students.find(s => s.Usuario === newMessage.Emisor);
          const senderName = student?.Nombre || newMessage.Emisor;
          
          // Show notification
          setLastNotification({
            show: true,
            message: `📩 Nuevo mensaje de ${senderName}: "${newMessage.Contenido.substring(0, 40)}${newMessage.Contenido.length > 40 ? '...' : ''}"`
          });
          
          // Auto-hide after 6 seconds
          setTimeout(() => {
            setLastNotification(prev => ({ ...prev, show: false }));
          }, 6000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, students]);

  const markAsRead = async (studentId: string) => {
    const unreadFromStudent = allBuzonMessages.filter(m => m.Emisor === studentId && m.Receptor === 'Jorge' && !m.Leido);
    if (unreadFromStudent.length === 0) return;

    const { error } = await supabase
      .from('buzon')
      .update({ Leido: true })
      .in('id', unreadFromStudent.map(m => m.id));
    
    if (!error) {
      setAllBuzonMessages(prev => prev.map(m => 
        (m.Emisor === studentId && m.Receptor === 'Jorge') ? { ...m, Leido: true } : m
      ));
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const recipients = isMassMode ? selectedMassRecipients : (selectedChatStudent ? [selectedChatStudent] : []);
    if (recipients.length === 0) {
      alert('Por favor, selecciona al menos un destinatario.');
      return;
    }

    setIsSendingChat(true);
    const messagesToInsert = recipients.map(studentId => {
      const student = students.find(s => s.Usuario === studentId);
      return {
        Emisor: 'Jorge',
        Receptor: studentId,
        Contenido: chatInput.trim(),
        Grado: student?.Grado || 'N/A',
        Leido: false,
        fecha: new Date().toISOString()
      };
    });

    try {
      const { error } = await supabase
        .from('buzon')
        .insert(messagesToInsert);
      
      if (!error) {
        setChatInput('');
        playSound('pop');
        fetchCommunicationData();
        alert('¡Mensaje enviado con éxito!');
        if (isMassMode) {
          setIsMassMode(false);
          setSelectedMassRecipients([]);
        }
      } else {
        console.error('Error al enviar mensaje:', error);
        alert(`Error al enviar el mensaje: ${error.message}`);
      }
    } catch (err) {
      console.error('Excepción al enviar mensaje:', err);
      alert('Ocurrió un error inesperado.');
    } finally {
      setIsSendingChat(false);
    }
  };

  const publishAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;
    
    try {
      const { error } = await supabase
        .from('anuncios')
        .insert([
          {
            mensaje: newAnnouncement.trim(),
            Grado: announcementGrade,
            autor: 'Jorge'
          }
        ]);
      
      if (!error) {
        setNewAnnouncement('');
        playSound('pop');
        alert('¡Anuncio publicado en la Josefa Campos!');
      } else {
        console.error('Error al publicar anuncio:', error);
        alert(`Error al publicar el anuncio: ${error.message}`);
      }
    } catch (err) {
      console.error('Excepción al publicar anuncio:', err);
      alert('Ocurrió un error inesperado.');
    }
  };

  const unreadConversations = useMemo(() => {
    const unread = allBuzonMessages.filter(m => m.Receptor === 'Jorge' && !m.Leido);
    const grouped = unread.reduce((acc, msg) => {
      if (!acc[msg.Emisor] || new Date(msg.fecha) > new Date(acc[msg.Emisor].fecha)) {
        acc[msg.Emisor] = msg;
      }
      return acc;
    }, {} as Record<string, MailMessage>);
    return (Object.values(grouped) as MailMessage[]).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [allBuzonMessages]);

  const filteredChatStudents = useMemo(() => {
    return students.filter(s => {
      const matchesGrade = chatSidebarGrade === 'Todos' || s.Grado === chatSidebarGrade;
      const matchesSearch = (s.Nombre || s.Usuario).toLowerCase().includes(chatSidebarSearch.toLowerCase());
      return matchesGrade && matchesSearch;
    });
  }, [students, chatSidebarGrade, chatSidebarSearch]);

  const activeChatHistory = useMemo(() => {
    if (!selectedChatStudent) return [];
    return allBuzonMessages.filter(m => 
      (m.Emisor === selectedChatStudent && m.Receptor === 'Jorge') ||
      (m.Emisor === 'Jorge' && m.Receptor === selectedChatStudent)
    );
  }, [allBuzonMessages, selectedChatStudent]);

  const getPerformanceLevel = (nota: number) => {
    if (nota >= 90) return { label: 'SUPERIOR', color: 'text-cyan-600 bg-cyan-50' };
    if (nota >= 80) return { label: 'ALTO', color: 'text-yellow-600 bg-yellow-50' };
    if (nota >= 60) return { label: 'BÁSICO', color: 'text-slate-600 bg-slate-50' };
    return { label: 'BAJO', color: 'text-rose-600 bg-rose-50' };
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const searchStr = (s.Nombre || s.Usuario || '').toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase().trim());
      const matchesGrade = selectedGrade === 'Todos' || (s.Grado || '').trim() === selectedGrade;
      const avg = s.nota_capitulo_1 || 0;
      let matchesPerformance = true;
      if (performanceFilter === 'BAJO') matchesPerformance = avg < 60;
      else if (performanceFilter === 'BÁSICO') matchesPerformance = avg >= 60 && avg < 80;
      else if (performanceFilter === 'ALTO') matchesPerformance = avg >= 80 && avg < 90;
      else if (performanceFilter === 'SUPERIOR') matchesPerformance = avg >= 90;
      
      return matchesSearch && matchesGrade && matchesPerformance;
    });
  }, [students, searchTerm, selectedGrade, performanceFilter]);

  const grades = useMemo(() => {
    const uniqueGrades = Array.from(new Set(students.map(s => s.Grado).filter(Boolean)));
    return ['Todos', ...uniqueGrades.sort()];
  }, [students]);

  const exportToCSV = () => {
    if (filteredStudents.length === 0) return;

    const headers = [
      'Usuario',
      'Nombre',
      'Grado',
      'Ultima Conexion (Colombia)',
      'Ordenamiento %',
      'Proposiciones %',
      'Cuantificadores %',
      'Microbit %',
      'Promedio Capitulo 1',
      'Criptogramas %',
      'Ecuaciones Gráficas %',
      'Crucinúmeros y Retos %',
      'Mensaje Oculto %',
      'Promedio Capitulo 2',
      'Estado Academico'
    ];

    const rows = filteredStudents.map(s => {
      const avg1 = s.nota_capitulo_1 || 0;
      
      const block3Avg = (
        (s.progreso_sudoku || 0) +
        (s.progreso_magic_squares || 0) +
        (s.progreso_crucinumeros || 0) +
        (s.progreso_piramides || 0)
      ) / 4;
      
      const avg2 = (
        (s.progreso_criptogramas || 0) +
        (s.progreso_ecuaciones_graficas || 0) +
        block3Avg +
        (s.progreso_mensaje_oculto || 0)
      ) / 4;

      const maxAvg = Math.max(avg1, avg2);
      let estado = 'BAJO';
      if (maxAvg >= 90) estado = 'SUPERIOR';
      else if (maxAvg >= 80) estado = 'ALTO';
      else if (maxAvg >= 60) estado = 'BÁSICO';

      return [
        `"${s.Usuario}"`,
        `"${s.Nombre || ''}"`,
        `"${s.Grado || 'N/A'}"`,
        `"${formatColombiaTime(s.ultima_conexion)}"`,
        s.progreso_ordenamiento || 0,
        s.progreso_proposiciones || 0,
        s.progreso_cuantificadores || 0,
        s.progreso_microbit || 0,
        avg1,
        s.progreso_criptogramas || 0,
        s.progreso_ecuaciones_graficas || 0,
        Math.round(block3Avg),
        s.progreso_mensaje_oculto || 0,
        Math.round(avg2),
        `"${estado}"`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporte_Notas_${selectedGrade}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSound('pop');
  };

  const formatColombiaTime = (dateStr?: string) => {
    if (!dateStr || dateStr === 'now') return 'Nunca';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        dateStyle: 'short',
        timeStyle: 'short',
        hour12: false
      }).format(date);
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return 'bg-emerald-500'; // Superior
    if (value >= 80) return 'bg-blue-500';    // Alto
    if (value >= 60) return 'bg-amber-500';   // Básico
    return 'bg-rose-500';                    // Bajo
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 border-4 border-purple-100 animate-fadeIn">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-rose-600 rounded-[2rem] flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-xl animate-float">
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Zona Privada</h2>
            <p className="text-gray-500 font-medium mt-2">Acceso exclusivo para el docente</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password || ''}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Clave de Administrador"
                disabled={isBlocked}
                className="w-full px-8 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-bold text-center text-xl"
              />
            </div>

            {error && (
              <p className="text-rose-600 text-sm font-bold text-center animate-shake">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isBlocked}
              className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all transform active:scale-95 ${
                isBlocked 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 text-white hover:bg-purple-700 hover:-translate-y-1'
              }`}
            >
              {isBlocked ? `Bloqueado (${blockTimer}s)` : 'ACCEDER AL TABLERO'}
            </button>
          </form>

          <button 
            onClick={onBack}
            className="w-full mt-8 text-gray-400 font-bold hover:text-purple-600 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fadeIn pb-20">
      {/* Real-time Notification Toast */}
      {lastNotification.show && (
        <div className="fixed top-6 right-6 z-[100] animate-bounce-in">
          <div className="bg-white border-l-4 border-indigo-600 shadow-2xl rounded-2xl p-5 flex items-center gap-4 max-w-md">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
              <i className="fas fa-comment-dots text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Nueva Notificación</p>
              <p className="text-sm text-gray-700 font-bold leading-tight">{lastNotification.message}</p>
            </div>
            <button 
              onClick={() => setLastNotification({ show: false, message: '' })}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[4rem] shadow-2xl border-8 border-purple-50 p-8 md:p-12">
        <header className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white text-3xl shadow-xl shrink-0">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-800 tracking-tighter">Control de Estudiantes</h1>
              <p className="text-gray-500 font-medium">Docente: Jorge Armando Jaramillo Bravo</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 w-full lg:w-auto">
            <button 
              onClick={() => { console.log('DEBUG: All Students', students); alert('Datos de estudiantes impresos en la consola (F12)'); }}
              className="w-full md:w-auto px-4 py-4 bg-gray-200 text-gray-700 rounded-2xl font-black hover:bg-gray-300 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <i className="fas fa-bug"></i>
              DEBUG
            </button>
            <button 
              onClick={() => { fetchStudents(); fetchCommunicationData(); fetchChapterConfig(); playSound('pop'); }}
              className="w-full md:w-auto px-8 py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-all shadow-lg flex items-center justify-center gap-3"
            >
              <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
              ACTUALIZAR DATOS
            </button>
            <button 
              onClick={onBack}
              className="w-full md:w-auto px-8 py-4 bg-gray-800 text-white rounded-2xl font-black hover:bg-black transition-all shadow-lg"
            >
              SALIR
            </button>
          </div>
        </header>
        
        {/* TAB SWITCHER */}
        <div className="flex flex-wrap lg:flex-nowrap gap-2 md:gap-4 mb-10 bg-gray-50 p-2 rounded-[2rem] lg:rounded-full w-full lg:w-fit mx-auto lg:mx-0 shadow-inner">
          <button 
            onClick={() => setActiveTab('students')}
            className={`flex-1 lg:flex-none px-4 md:px-8 py-3 md:py-4 rounded-[1.5rem] lg:rounded-full font-black text-[10px] md:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'students' ? 'bg-white text-purple-600 shadow-lg scale-105' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-users"></i>
            <span>Estudiantes y Notas</span>
          </button>
          <button 
            onClick={() => setActiveTab('messaging')}
            className={`flex-1 lg:flex-none px-4 md:px-8 py-3 md:py-4 rounded-[1.5rem] lg:rounded-full font-black text-[10px] md:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative ${activeTab === 'messaging' ? 'bg-white text-indigo-600 shadow-lg scale-105' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-comments"></i>
            <span>Mensajería y Avisos</span>
            {allBuzonMessages.some(m => m.Receptor === 'Jorge' && !m.Leido) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`flex-1 lg:flex-none px-4 md:px-8 py-3 md:py-4 rounded-[1.5rem] lg:rounded-full font-black text-[10px] md:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative ${activeTab === 'config' ? 'bg-white text-emerald-600 shadow-lg scale-105' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className="fas fa-cog"></i>
            <span>Configuración</span>
          </button>
        </div>

        {activeTab === 'config' && (
          <div className="animate-fadeIn max-w-2xl mx-auto">
            <div className="bg-white rounded-[3rem] shadow-xl border-4 border-emerald-50 p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl shadow-sm">
                  <i className="fas fa-toggle-on"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tighter">Interruptores de Capítulos</h3>
                  <p className="text-gray-500 font-medium">Habilita o deshabilita el acceso de los estudiantes</p>
                </div>
              </div>

              <div className="space-y-6">
                {configLoading ? (
                  <div className="py-10 text-center">
                    <div className="animate-spin text-3xl text-emerald-500 mb-2">
                      <i className="fas fa-circle-notch"></i>
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Cargando configuración...</p>
                  </div>
                ) : (
                  chapterConfig.map((cap) => (
                    <div key={cap.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-emerald-100 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-md ${cap.activo ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                          <i className={`fas ${cap.capitulo_numero === 1 ? 'fa-font' : cap.capitulo_numero === 2 ? 'fa-magnifying-glass' : cap.capitulo_numero === 3 ? 'fa-cube' : 'fa-shapes'}`}></i>
                        </div>
                        <div>
                          <h4 className="font-black text-gray-800 uppercase tracking-tight">{cap.nombre}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {cap.activo ? 'Visible para estudiantes' : 'Oculto para estudiantes'}
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => toggleChapter(cap.id, cap.activo)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${cap.activo ? 'bg-emerald-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${cap.activo ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-10 p-6 bg-amber-50 rounded-[2rem] border-2 border-amber-100">
                <div className="flex gap-4">
                  <i className="fas fa-info-circle text-amber-500 text-xl mt-1"></i>
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    <strong>Nota:</strong> Los cambios realizados aquí se reflejarán inmediatamente en el menú principal de todos los estudiantes. Los capítulos desactivados aparecerán con un mensaje de "Muy pronto".
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="animate-fadeIn">
            {/* SEARCH AND FILTERS (Moved inside students tab) */}
            <div className="flex flex-col md:flex-row flex-wrap items-center gap-4 mb-8">
              <div className="relative w-full md:w-auto flex-grow lg:flex-grow-0">
                <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={searchTerm || ''}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-14 pr-8 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none w-full lg:w-64 font-bold"
                />
              </div>
              <div className="flex flex-wrap gap-4 w-full md:w-auto">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="flex-1 md:flex-none px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none font-bold cursor-pointer"
                >
                  {grades.map(g => (
                    <option key={g} value={g}>{g === 'Todos' ? 'Todos los Grados' : `Grado ${g}`}</option>
                  ))}
                </select>
                <select 
                  value={performanceFilter}
                  onChange={(e) => setPerformanceFilter(e.target.value)}
                  className="flex-1 md:flex-none px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none font-bold cursor-pointer"
                >
                  <option value="Todos">Todos los Desempeños</option>
                  <option value="SUPERIOR">Superior (90-100%)</option>
                  <option value="ALTO">Alto (80-89%)</option>
                  <option value="BÁSICO">Básico (60-79%)</option>
                  <option value="BAJO">Bajo (0-59%)</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-4 w-full md:w-auto">
                <button 
                  onClick={() => setViewMode(viewMode === 'table' ? 'gallery' : 'table')}
                  className="flex-1 md:flex-none px-6 py-4 bg-purple-100 text-purple-700 rounded-2xl font-black hover:bg-purple-200 transition-all shadow-sm flex items-center justify-center gap-2 transform hover:-translate-y-1 active:scale-95"
                >
                  <i className={`fas ${viewMode === 'table' ? 'fa-th-large' : 'fa-table'}`}></i>
                  <span>{viewMode === 'table' ? 'Ver Galería' : 'Ver Tabla'}</span>
                </button>
                <button 
                  onClick={exportToCSV}
                  disabled={filteredStudents.length === 0}
                  className="flex-1 md:flex-none px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-95"
                >
                  <i className="fas fa-download"></i>
                  <span>Exportar Notas</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messaging' && (
          <div className="flex flex-col gap-8 animate-fadeIn w-full max-w-full overflow-hidden">
            {/* PUBLICAR ANUNCIO (Compacto) */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border-4 border-amber-50 p-6 md:p-8 w-full max-w-full overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                    <i className="fas fa-bullhorn text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-800 tracking-tighter">Publicar Anuncio General</h3>
                    <p className="text-gray-500 text-xs font-medium">Avisos rápidos para grados completos</p>
                  </div>
                </div>
                
                <div className="flex flex-1 flex-col md:flex-row items-center gap-4 w-full">
                  <select 
                    id="Grado"
                    name="Grado"
                    value={announcementGrade}
                    onChange={(e) => setAnnouncementGrade(e.target.value)}
                    className="w-full md:w-48 px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-amber-500 outline-none font-bold text-sm cursor-pointer"
                  >
                    <option value="TODOS">Todos los Grados</option>
                    {grades.filter(g => g !== 'Todos').map(g => (
                      <option key={g} value={g}>Grado {g}</option>
                    ))}
                  </select>
                  <div className="relative flex-1 w-full">
                    <input 
                      id="mensaje"
                      name="mensaje"
                      type="text"
                      value={newAnnouncement || ''}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      placeholder="Escribe el aviso importante aquí..."
                      className="w-full px-6 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-amber-500 outline-none font-medium text-sm"
                    />
                  </div>
                  <button 
                    onClick={publishAnnouncement}
                    disabled={!newAnnouncement.trim()}
                    className="w-full md:w-auto px-8 py-3 bg-amber-500 text-white rounded-xl font-black text-sm shadow-lg hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                  >
                    <i className="fas fa-paper-plane"></i>
                    PUBLICAR
                  </button>
                </div>
              </div>
            </div>

            {/* CENTRO DE MENSAJERÍA PROFESIONAL (ESTILO WHATSAPP WEB) */}
            <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-indigo-50 overflow-hidden flex flex-col lg:flex-row h-[800px] w-full max-w-full">
              {/* SIDEBAR IZQUIERDA: MENSAJES NO LEÍDOS */}
              <div className="w-full lg:w-96 border-r border-gray-100 flex flex-col bg-gray-50/30">
                <div className="p-6 border-b border-gray-100 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-gray-800 tracking-tighter">Buzón de Entrada</h3>
                    <button 
                      onClick={fetchCommunicationData}
                      className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all"
                    >
                      <i className={`fas fa-sync-alt text-xs ${commLoading ? 'animate-spin' : ''}`}></i>
                    </button>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <button 
                      onClick={() => {
                        setIsMassMode(!isMassMode);
                        setSelectedMassRecipients([]);
                        setSelectedChatStudent(null);
                      }}
                      className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${isMassMode ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 border-2 border-gray-100'}`}
                    >
                      <i className="fas fa-users"></i>
                      {isMassMode ? 'Cancelar Masivo' : 'Modo Masivo'}
                    </button>
                  </div>

                  <div className="relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                    <input 
                      type="text"
                      value={chatSidebarSearch || ''}
                      onChange={(e) => setChatSidebarSearch(e.target.value)}
                      placeholder="Buscar estudiante..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                  {isMassMode ? (
                    // En modo masivo mostramos todos los estudiantes filtrados
                    filteredChatStudents.map(student => {
                      const isSelected = selectedMassRecipients.includes(student.Usuario);
                      return (
                        <div 
                          key={student.Usuario}
                          onClick={() => {
                            setSelectedMassRecipients(prev => 
                              prev.includes(student.Usuario) ? prev.filter(id => id !== student.Usuario) : [...prev, student.Usuario]
                            );
                          }}
                          className={`p-4 rounded-2xl cursor-pointer transition-all border-2 flex items-center justify-between ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-transparent hover:border-indigo-100 text-gray-700 shadow-sm'}`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isSelected ? 'bg-white/20' : 'bg-gray-50 text-indigo-600'}`}>
                              {student.Nombre ? student.Nombre.charAt(0).toUpperCase() : student.Usuario.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-black text-sm truncate">{student.Nombre || student.Usuario}</span>
                              <span className={`text-[9px] font-bold uppercase ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>Grado {student.Grado}</span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'bg-white border-white text-indigo-600' : 'border-gray-200 bg-gray-50'}`}>
                            {isSelected && <i className="fas fa-check text-[10px]"></i>}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // En modo normal mostramos primero los no leídos y luego el resto si hay búsqueda
                    <>
                      {unreadConversations.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 px-2">Mensajes No Leídos</p>
                          {unreadConversations.map(msg => {
                            const student = students.find(s => s.Usuario === msg.Emisor);
                            const isSelected = selectedChatStudent === msg.Emisor;
                            return (
                              <div 
                                key={msg.id}
                                onClick={() => {
                                  setSelectedChatStudent(msg.Emisor);
                                  markAsRead(msg.Emisor);
                                }}
                                className={`p-4 rounded-2xl cursor-pointer transition-all border-2 mb-2 flex items-center justify-between ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-transparent hover:border-indigo-100 text-gray-700 shadow-sm'}`}
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isSelected ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {student?.Nombre ? student.Nombre.charAt(0).toUpperCase() : msg.Emisor.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="font-black text-sm truncate">{student?.Nombre || msg.Emisor} - {student?.Grado || 'N/A'}</span>
                                    <p className={`text-[10px] truncate font-medium ${isSelected ? 'text-indigo-100' : 'text-gray-500'}`}>{msg.Contenido}</p>
                                  </div>
                                </div>
                                <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm shrink-0"></span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {chatSidebarSearch && (
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">Resultados de Búsqueda</p>
                          {filteredChatStudents.filter(s => !unreadConversations.some(u => u.Emisor === s.Usuario)).map(student => {
                            const isSelected = selectedChatStudent === student.Usuario;
                            return (
                              <div 
                                key={student.Usuario}
                                onClick={() => {
                                  setSelectedChatStudent(student.Usuario);
                                  markAsRead(student.Usuario);
                                }}
                                className={`p-4 rounded-2xl cursor-pointer transition-all border-2 mb-2 flex items-center justify-between ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-transparent hover:border-indigo-100 text-gray-700 shadow-sm'}`}
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isSelected ? 'bg-white/20' : 'bg-gray-50 text-indigo-600'}`}>
                                    {student.Nombre ? student.Nombre.charAt(0).toUpperCase() : student.Usuario.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="font-black text-sm truncate">{student.Nombre || student.Usuario}</span>
                                    <span className={`text-[9px] font-bold uppercase ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>Grado {student.Grado}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {!chatSidebarSearch && unreadConversations.length === 0 && (
                        <div className="py-20 text-center opacity-30">
                          <i className="fas fa-inbox text-4xl mb-4"></i>
                          <p className="font-black text-xs uppercase tracking-widest">Buzón vacío</p>
                          <p className="text-[10px] mt-2">Busca un estudiante para iniciar un chat</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* PANEL DERECHA: CONVERSACIÓN */}
              <div className="flex-1 flex flex-col bg-white relative w-full max-w-full overflow-hidden">
                {(!selectedChatStudent && !isMassMode) || (isMassMode && selectedMassRecipients.length === 0) ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-32 h-32 bg-indigo-50 rounded-[3rem] flex items-center justify-center text-indigo-200 text-5xl mb-8 animate-float">
                      <i className="fas fa-comments"></i>
                    </div>
                    <h4 className="text-2xl font-black text-gray-800 tracking-tighter">Centro de Mensajería Profesional</h4>
                    <p className="text-gray-500 font-medium max-w-md mt-2">
                      Selecciona un mensaje de la izquierda para responder o usa el modo masivo.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* CABECERA DEL CHAT */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-xl shadow-sm">
                          <i className={isMassMode ? "fas fa-users" : "fas fa-user"}></i>
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-gray-800 tracking-tighter">
                            {isMassMode ? `Envío Masivo (${selectedMassRecipients.length})` : (students.find(s => s.Usuario === selectedChatStudent)?.Nombre || selectedChatStudent)}
                          </h4>
                          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                            {isMassMode ? "Mensajes individuales personalizados" : `Grado ${students.find(s => s.Usuario === selectedChatStudent)?.Grado}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CUERPO DEL CHAT */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar bg-gray-50/20">
                      {isMassMode ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6">
                          <div className="p-8 bg-white rounded-[2rem] shadow-xl border-2 border-indigo-50 max-w-sm">
                            <i className="fas fa-paper-plane text-4xl text-indigo-200 mb-4"></i>
                            <h5 className="font-black text-gray-800 uppercase text-sm mb-2">Modo Masivo Activo</h5>
                            <p className="text-gray-500 text-xs font-medium leading-relaxed">
                              Escribe tu mensaje abajo. Se enviará una copia a cada uno de los {selectedMassRecipients.length} estudiantes seleccionados.
                            </p>
                          </div>
                        </div>
                      ) : (
                        activeChatHistory.map((msg, idx) => {
                          const isMe = msg.Emisor === 'Jorge';
                          return (
                            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                              <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-[2rem] shadow-sm relative ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'}`}>
                                <p className="text-sm leading-relaxed font-medium break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                  {msg.Contenido}
                                </p>
                                <span className={`text-[9px] font-bold mt-2 block ${isMe ? 'text-indigo-200 text-right' : 'text-gray-400'}`}>
                                  {new Date(msg.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* ÁREA DE ENTRADA FIJA */}
                    <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0">
                      <div className="flex items-end gap-4 bg-gray-50 rounded-[2.5rem] p-3 border-2 border-gray-100 focus-within:border-indigo-500 transition-all shadow-inner">
                        <textarea 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={isMassMode ? "Escribe el mensaje masivo..." : "Escribe tu respuesta aquí..."}
                          className="flex-1 bg-transparent border-none outline-none p-4 font-medium text-gray-700 resize-none max-h-48 min-h-[80px] text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendChatMessage();
                            }
                          }}
                        ></textarea>
                        <button 
                          onClick={sendChatMessage}
                          disabled={isSendingChat || !chatInput.trim()}
                          className="w-16 h-16 bg-indigo-600 text-white rounded-[1.8rem] flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all transform active:scale-90 disabled:opacity-50 shrink-0"
                        >
                          {isSendingChat ? (
                            <i className="fas fa-circle-notch animate-spin text-xl"></i>
                          ) : (
                            <i className="fas fa-paper-plane text-xl"></i>
                          )}
                        </button>
                      </div>
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-3 text-center">
                        Enter para enviar • Shift + Enter para nueva línea
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      {activeTab === 'students' && (
        <div className="mt-12 animate-fadeIn">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto -mx-8 md:mx-0">
            <table className="w-full border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  <th className="px-6 py-4 text-left">Estudiante</th>
                  <th className="px-6 py-4 text-center">Grado</th>
                  <th className="px-6 py-4 text-center">Última Conexión</th>
                  <th className="px-6 py-4 text-center">Cap. 1: Orden.</th>
                  <th className="px-6 py-4 text-center">Cap. 1: Lógica</th>
                  <th className="px-6 py-4 text-center">Cap. 1: Cuant.</th>
                  <th className="px-6 py-4 text-center">Cap. 1: Micro.</th>
                  <th className="px-6 py-4 text-center">Cap. 2: Bloque 1</th>
                  <th className="px-6 py-4 text-center">Cap. 2: Bloque 2</th>
                  <th className="px-6 py-4 text-center">Cap. 2: Bloque 3</th>
                  <th className="px-6 py-4 text-center">Cap. 2: Bloque 4</th>
                  <th className="px-6 py-4 text-center">Nota Final</th>
                  <th className="px-6 py-4 text-center">Desempeño</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={13} className="text-center py-20">
                      <div className="animate-spin text-4xl text-purple-600 mb-4">
                        <i className="fas fa-circle-notch"></i>
                      </div>
                      <p className="font-black text-gray-400 uppercase tracking-widest">Cargando Alumnos...</p>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-20">
                      <p className="font-black text-gray-400 uppercase tracking-widest">No se encontraron estudiantes</p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const block3Avg = (
                      (student.progreso_sudoku || 0) +
                      (student.progreso_magic_squares || 0) +
                      (student.progreso_crucinumeros || 0) +
                      (student.progreso_piramides || 0)
                    ) / 4;

                    const avg2 = (
                      (student.progreso_criptogramas || 0) +
                      (student.progreso_ecuaciones_graficas || 0) +
                      block3Avg +
                      (student.progreso_mensaje_oculto || 0)
                    ) / 4;

                    const maxAvg = Math.max(student.nota_capitulo_1 || 0, student.nota_capitulo_2 || avg2);

                    return (
                    <tr key={student.Usuario} className="group">
                      <td className="bg-gray-50 px-6 py-5 rounded-l-[2rem] border-y-2 border-l-2 border-transparent group-hover:border-purple-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm font-black">
                            {(student.Nombre || student.Usuario).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-gray-800">{student.Nombre || student.Usuario}</span>
                            {student.Nombre && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">@{student.Usuario}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="bg-gray-50 px-6 py-5 text-center border-y-2 border-transparent group-hover:border-purple-200 transition-all">
                        <span className="bg-white px-4 py-1.5 rounded-full text-xs font-black text-gray-500 shadow-sm border border-gray-100">
                          {student.Grado || 'N/A'}
                        </span>
                      </td>
                      <td className="bg-gray-50 px-6 py-5 text-center border-y-2 border-transparent group-hover:border-purple-200 transition-all">
                        <span className="text-xs font-bold text-gray-400">
                          {formatColombiaTime(student.ultima_conexion)}
                        </span>
                      </td>
                      
                      {/* Progress Columns Chapter 1 */}
                      {[
                        student.progreso_ordenamiento,
                        student.progreso_proposiciones,
                        student.progreso_cuantificadores,
                        student.progreso_microbit
                      ].map((val, idx) => (
                        <td key={`cap1-${idx}`} className="bg-gray-50 px-4 py-5 text-center border-y-2 border-transparent group-hover:border-purple-200 transition-all">
                          <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                            <span className="text-[10px] font-black text-gray-400">{val || 0}%</span>
                            <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner border border-gray-100">
                              <div 
                                className={`h-full transition-all duration-1000 ${getProgressColor(val || 0)}`}
                                style={{ width: `${val || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      ))}

                      {/* Progress Columns Chapter 2 */}
                      {[
                        student.progreso_criptogramas,
                        student.progreso_ecuaciones_graficas,
                        block3Avg,
                        student.progreso_mensaje_oculto
                      ].map((val, idx) => (
                        <td key={`cap2-${idx}`} className="bg-gray-50 px-4 py-5 text-center border-y-2 border-transparent group-hover:border-purple-200 transition-all">
                          <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                            <span className="text-[10px] font-black text-gray-400">{Math.round(val || 0)}%</span>
                            <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner border border-gray-100">
                              <div 
                                className={`h-full transition-all duration-1000 ${getProgressColor(val || 0)}`}
                                style={{ width: `${val || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      ))}

                      <td className="bg-gray-50 px-6 py-5 text-center border-y-2 border-transparent group-hover:border-purple-200 transition-all">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xl font-black text-gray-800 leading-none">
                            {Math.round(maxAvg)}
                            <span className="text-[10px] text-purple-400 ml-0.5">%</span>
                          </span>
                          <div className={`w-12 h-1 mt-1 rounded-full ${getProgressColor(maxAvg)}`}></div>
                        </div>
                      </td>

                      <td className="bg-gray-50 px-6 py-5 rounded-r-[2rem] text-center border-y-2 border-r-2 border-transparent group-hover:border-purple-200 transition-all">
                        {(() => {
                          const perf = getPerformanceLevel(maxAvg);
                          return (
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-black/5 ${perf.color}`}>
                              {perf.label}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-black text-gray-800 tracking-tighter mb-2">Galería de Logros Maestra</h3>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Visualización de Excelencia por Grado</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* COLUMNA BRONCE */}
              <div className="flex flex-col gap-4">
                <div className="bg-orange-50/50 p-4 rounded-[2rem] border-2 border-orange-100 text-center">
                  <i className="fas fa-trophy text-orange-400 text-2xl mb-1"></i>
                  <h4 className="font-black text-orange-800 text-[10px] uppercase tracking-widest">Bronce (30-59%)</h4>
                  <p className="text-[8px] font-black text-orange-600 uppercase">Desempeño Básico</p>
                </div>
                <div className="space-y-4">
                  {filteredStudents.filter(r => (r.nota_capitulo_1 || 0) >= 30 && (r.nota_capitulo_1 || 0) < 60).map((r, i) => (
                    <div 
                      key={r.Usuario} 
                      className="bg-white p-6 rounded-[1.5rem] border-2 border-orange-100 shadow-[0_10px_30px_rgba(251,146,60,0.1)] animate-fade-up hover:scale-105 hover:brightness-110 transition-all duration-300 group" 
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 font-black text-sm border border-orange-100">
                          {Math.round(r.nota_capitulo_1 || 0)}%
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-700 text-sm tracking-tight leading-tight">{r.Nombre || r.Usuario}</span>
                          <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-1">Desempeño Básico</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUMNA PLATA */}
              <div className="flex flex-col gap-4">
                <div className="bg-slate-50/50 p-4 rounded-[2rem] border-2 border-slate-200 text-center">
                  <i className="fas fa-trophy text-slate-400 text-2xl mb-1"></i>
                  <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">Plata (60-95%)</h4>
                  <p className="text-[8px] font-black text-slate-600 uppercase">Desempeño Alto</p>
                </div>
                <div className="space-y-4">
                  {filteredStudents.filter(r => (r.nota_capitulo_1 || 0) >= 60 && (r.nota_capitulo_1 || 0) < 96).map((r, i) => (
                    <div 
                      key={r.Usuario} 
                      className="bg-white p-6 rounded-[1.5rem] border-2 border-slate-200 shadow-[0_10px_30px_rgba(148,163,184,0.15)] animate-fade-up hover:scale-105 hover:brightness-110 transition-all duration-300 group" 
                      style={{ animationDelay: `${i * 0.05 + 0.1}s` }}
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 font-black text-sm border border-slate-200">
                          {Math.round(r.nota_capitulo_1 || 0)}%
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-700 text-sm tracking-tight leading-tight">{r.Nombre || r.Usuario}</span>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Desempeño Alto</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUMNA ORO */}
              <div className="flex flex-col gap-4">
                <div className="bg-yellow-50/50 p-4 rounded-[2rem] border-2 border-yellow-200 text-center shadow-[0_0_20px_rgba(250,204,21,0.1)]">
                  <i className="fas fa-trophy text-yellow-400 text-2xl mb-1 drop-shadow-sm"></i>
                  <h4 className="font-black text-yellow-800 text-[10px] uppercase tracking-widest">Oro (96-99%)</h4>
                  <p className="text-[8px] font-black text-yellow-600 uppercase">Desempeño Superior</p>
                </div>
                <div className="space-y-4">
                  {filteredStudents.filter(r => (r.nota_capitulo_1 || 0) >= 96 && (r.nota_capitulo_1 || 0) < 100).map((r, i) => (
                    <div 
                      key={r.Usuario} 
                      className="bg-white p-6 rounded-[1.5rem] border-2 border-yellow-400 shadow-[0_15px_40px_rgba(250,204,21,0.2)] animate-fade-up hover:scale-105 hover:brightness-110 transition-all duration-300 group ring-4 ring-yellow-50" 
                      style={{ animationDelay: `${i * 0.05 + 0.2}s` }}
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 font-black text-sm border border-yellow-200">
                          {Math.round(r.nota_capitulo_1 || 0)}%
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-sm tracking-tight leading-tight">{r.Nombre || r.Usuario}</span>
                          <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest mt-1">Desempeño Superior</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUMNA DIAMANTE */}
              <div className="flex flex-col gap-4">
                <div className="diamond-bg-animated p-4 rounded-[2rem] text-center shadow-xl relative overflow-hidden">
                  <div className="sparkle-effect top-2 left-4"></div>
                  <div className="sparkle-effect bottom-2 right-4" style={{ animationDelay: '1s' }}></div>
                  <i className="fas fa-gem text-white text-2xl mb-1 drop-shadow-md"></i>
                  <h4 className="font-black text-white text-[10px] uppercase tracking-widest relative z-10">Diamante (100%)</h4>
                  <p className="text-[8px] font-black text-white/80 uppercase relative z-10">Desempeño Superior</p>
                </div>
                <div className="space-y-4">
                  {filteredStudents.filter(r => (r.nota_capitulo_1 || 0) >= 100).map((r, i) => (
                    <div 
                      key={r.Usuario} 
                      className="diamond-bg-animated p-1 rounded-[1.6rem] shadow-[0_20px_50px_rgba(34,211,238,0.3)] animate-fade-up relative overflow-hidden group hover:scale-105 hover:brightness-110 transition-all duration-500" 
                      style={{ animationDelay: `${i * 0.05 + 0.3}s` }}
                    >
                      <div className="bg-white p-6 rounded-[1.3rem] flex flex-col items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 font-black text-sm border border-cyan-100 group-hover:rotate-12 transition-transform">
                          100
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 text-sm tracking-tight leading-tight">{r.Nombre || r.Usuario}</span>
                          <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mt-1">Desempeño Superior</span>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <i className="fas fa-sparkles text-cyan-400 text-xs animate-ping"></i>
                        </div>
                      </div>
                      <div className="sparkle-effect top-2 left-3 scale-75"></div>
                      <div className="sparkle-effect bottom-2 right-3 scale-75" style={{ animationDelay: '0.5s' }}></div>
                      <div className="sparkle-effect top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-50" style={{ animationDelay: '1.2s' }}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECCIÓN ESTUDIANTES EN PROCESO (<30%) */}
            <div className="mt-12 border-t-2 border-gray-100 pt-12">
              <button 
                onClick={() => setShowInProcess(!showInProcess)}
                className="w-full flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                    <i className="fas fa-user-clock"></i>
                  </div>
                  <div className="text-left">
                    <h4 className="font-black text-gray-700 uppercase tracking-tighter">Estudiantes en Proceso de Activación (&lt;30%)</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Alumnos que requieren apoyo pedagógico</p>
                  </div>
                </div>
                <i className={`fas fa-chevron-${showInProcess ? 'up' : 'down'} text-gray-400 group-hover:text-purple-600 transition-all`}></i>
              </button>

              {showInProcess && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fadeIn">
                  {filteredStudents.filter(r => (r.nota_capitulo_1 || 0) < 30).length === 0 ? (
                    <div className="col-span-full py-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Todos los estudiantes de este grado han superado el 30%</p>
                    </div>
                  ) : (
                    filteredStudents.filter(r => (r.nota_capitulo_1 || 0) < 30).map((r) => (
                      <div key={r.Usuario} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700 text-sm truncate max-w-[120px]">{r.Nombre || r.Usuario}</span>
                          <span className="text-[10px] text-gray-400 font-black">@{r.Usuario}</span>
                        </div>
                        <div className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg font-black text-[10px] flex flex-col items-center">
                          <span>{Math.round(r.nota_capitulo_1 || 0)}%</span>
                          <span className="text-[7px] uppercase tracking-tighter">Bajo</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )}

        <footer className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400 font-bold text-sm">
          <p>Total Estudiantes: {filteredStudents.length} / {students.length}</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span>Superior (90-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Alto (80-89)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              <span>Básico (60-79)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span>Bajo (0-59)</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
