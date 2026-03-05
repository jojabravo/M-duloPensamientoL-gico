
import React, { useState } from 'react';
import { playSound } from '../audio';

interface Props {
  onStart: (name: string) => void;
}

const Welcome: React.FC<Props> = ({ onStart }) => {
  const [name, setName] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      playSound('pop');
      onStart(name.trim());
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
      
      <form onSubmit={handleStart} className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-xl border border-purple-50">
        <label className="block text-left text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Ingresa tu nombre para comenzar</label>
        <input 
          type="text" 
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre aquí..."
          className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all mb-6 font-bold text-center text-lg bg-gray-800 text-white"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full group relative px-6 py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-purple-700 hover:shadow-purple-200 disabled:bg-gray-200 transition-all transform active:scale-95"
        >
          <span>Empezar Módulo</span>
          <i className="fas fa-play ml-2 text-sm"></i>
        </button>
      </form>

      <div className="mt-10 flex gap-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
        <span>Lógica Verbal</span>
        <span className="text-gray-200">|</span>
        <span>Ordenamiento</span>
        <span className="text-gray-200">|</span>
        <span>Deducción</span>
      </div>
    </div>
  );
};

// Fix: Add default export
export default Welcome;