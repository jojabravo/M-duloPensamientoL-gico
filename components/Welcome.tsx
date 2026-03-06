
import React, { useState } from 'react';
import { playSound } from '../audio';

interface Props {
  onLogin: (usuario: string, contrasena: string) => Promise<{ success: boolean; message?: string }>;
}

const Welcome: React.FC<Props> = ({ onLogin }) => {
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fadeIn">
      <div className="mb-8 relative">
        <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-5xl shadow-2xl border-8 border-white relative z-10">
          <i className="fas fa-brain"></i>
        </div>
        <div className="absolute -top-2 -left-2 w-10 h-10 bg-yellow-400 rounded-full animate-bounce shadow-lg"></div>
      </div>
      
      <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-2">
        Módulo de Pensamiento Lógico
      </h1>
      <p className="text-purple-600 font-bold text-lg md:text-xl mb-8">Grado 6° y 7°</p>
      
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-xl border border-purple-50">
        <label className="block text-left text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Acceso de Estudiante</label>
        
        <div className="space-y-4 mb-6">
          <input 
            type="text" 
            required
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Usuario"
            className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-bold text-center bg-gray-800 text-white"
          />
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Contraseña"
              className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-bold text-center bg-gray-800 text-white"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs font-bold mb-4">{error}</p>}

        <button
          type="submit"
          disabled={!usuario.trim() || !contrasena.trim() || isLoggingIn}
          className="w-full group relative px-6 py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-purple-700 hover:shadow-purple-200 disabled:bg-gray-200 transition-all transform active:scale-95"
        >
          {isLoggingIn ? (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mx-auto"></div>
          ) : (
            <>
              <span>Entrar al Módulo</span>
              <i className="fas fa-sign-in-alt ml-2 text-sm"></i>
            </>
          )}
        </button>
      </form>

      <div className="mt-10 flex gap-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
        <span>Verbal</span>
        <span className="text-gray-200">|</span>
        <span>Numérico</span>
        <span className="text-gray-200">|</span>
        <span>Espacial</span>
        <span className="text-gray-200">|</span>
        <span>Abstracto</span>
      </div>
    </div>
  );
};

// Fix: Add default export
export default Welcome;