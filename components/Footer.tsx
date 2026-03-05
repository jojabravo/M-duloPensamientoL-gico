
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-purple-100 py-10 mt-12">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-purple-700 font-extrabold text-lg">Jorge Armando Jaramillo Bravo</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
            <span><i className="fas fa-certificate text-purple-400 mr-1"></i> Licenciado en matemáticas y física (UdeA)</span>
            <span><i className="fas fa-medal text-blue-400 mr-1"></i> Magister en enseñanza de las ciencias exactas y naturales (UNAL)</span>
            <span><i className="fas fa-user-graduate text-pink-400 mr-1"></i> Doctorante en Educación (UTEL)</span>
          </div>
          <div className="mt-6 flex gap-4 text-gray-300">
            <i className="fab fa-react text-2xl"></i>
            <i className="fab fa-js text-2xl"></i>
            <i className="fas fa-brain text-2xl"></i>
          </div>
          <p className="mt-4 text-[10px] text-gray-400 uppercase tracking-widest">© 2026 - LABORATORIO INTERACTIVO JOSEFA CAMPOS</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
