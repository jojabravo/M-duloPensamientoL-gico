
import React, { useState } from 'react';
import { playSound } from '../audio';

interface Props {
  onLogin: (usuario: string, contrasena: string) => Promise<{ success: boolean; message?: string }>;
  onAdmin: () => void;
}

const Welcome: React.FC<Props> = ({ onLogin, onAdmin }) => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario.trim() && contrasena) {
      setIsLoggingIn(true);
      setError('');
      const result = await onLogin(usuario.trim(), contrasena);
      if (result.success) {
        playSound('pop');
      } else {
        setError(result.message === 'Credenciales incorrectas' 
          ? 'Usuario o contraseña incorrectos. Usa el icono del ojo para verificar tu contraseña.' 
          : (result.message || 'Error al iniciar sesión'));
        setIsLoggingIn(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Visual Cover Banner Area */}
      <div className="mb-8 w-full max-w-md px-4">
        <div className="relative group">
          <div className="rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white bg-white/80 backdrop-blur-sm transition-all duration-500 hover:shadow-purple-200/50">
            <img 
              src="https://i.postimg.cc/PJhZ3xq3/preview.jpg" 
              alt="Portada Pensamiento Lógico" 
              className="w-full h-auto max-h-[250px] object-cover mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-white text-lg shadow-lg animate-pulse z-20">
            <i className="fas fa-brain"></i>
          </div>
        </div>
      </div>
      
      {/* Title Header with Modern Typography */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4.5xl font-extrabold text-slate-800 tracking-tight leading-none mb-3">
          Módulo de <span className="text-purple-600 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text">Pensamiento Lógico</span>
        </h1>
        <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
          <i className="fas fa-graduation-cap"></i>
          <span>Grado 6° y 7°</span>
        </div>
      </div>
      
      {/* student tactile Access Box */}
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100/80 flex flex-col gap-5">
        <div className="text-center">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Acceso de Estudiante</label>
          <p className="text-[10px] text-slate-400 mt-1">Ingresa tus datos para continuar el viaje</p>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <i className="fas fa-user text-sm"></i>
            </div>
            <input 
              type="text" 
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Usuario"
              className="w-full text-left py-3.5 pl-11 pr-4 rounded-xl outline-none text-slate-700 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 placeholder-slate-400 font-semibold transition-all text-sm"
            />
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <i className="fas fa-lock text-sm"></i>
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Contraseña"
              className="w-full text-left py-3.5 pl-11 pr-12 rounded-xl outline-none text-slate-700 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 placeholder-slate-400 font-semibold transition-all text-sm"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer"
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold border border-red-100 flex items-start gap-1.5 leading-snug">
            <i className="fas fa-exclamation-circle text-sm flex-shrink-0 mt-0.5 animate-pulse"></i>
            <span>{error}</span>
          </div>
        )}
        
        <button
          type="submit"
          disabled={!usuario.trim() || !contrasena.trim() || isLoggingIn}
          className="w-full relative py-3.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 transition-all active:scale-[0.98] cursor-pointer"
        >
          {isLoggingIn ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Entrar al Módulo</span>
              <i className="fas fa-sign-in-alt text-xs"></i>
            </div>
          )}
        </button>
      </form>

      {/* Modern Horizontal Badges */}
      <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-400 max-w-md">
        <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-slate-500 shadow-sm">Verbal</span>
        <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-slate-500 shadow-sm">Numérico</span>
        <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-slate-500 shadow-sm">Espacial</span>
        <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-slate-500 shadow-sm">Abstracto</span>
      </div>

      {/* Docent Access Option */}
      <button 
        onClick={() => {
          console.log('Admin button clicked');
          onAdmin();
        }}
        className="text-xs text-slate-400 hover:text-purple-600 font-bold transition-all mt-6 p-2 cursor-pointer flex items-center gap-1.5 bg-white border border-slate-100 rounded-full px-4 py-1.5 shadow-sm hover:shadow-md hover:scale-102"
        title="Acceso Docente"
      >
        <i className="fas fa-lock"></i>
        <span>Acceso Docente</span>
      </button>
    </div>
  );
};

// Fix: Add default export
export default Welcome;