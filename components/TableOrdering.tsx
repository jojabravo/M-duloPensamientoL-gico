
import React, { useState } from 'react';
import { playSound } from '../audio';

interface Props {
  grid: (string | null)[][];
  setGrid: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
  onNext: () => void;
  onBack: () => void;
}

const TableOrdering: React.FC<Props> = ({ grid, setGrid, onNext, onBack }) => {
  const friends = ['Julio', 'Luis', 'Pedro', 'Manuel'];
  const games = ['Ajedrez', 'Damas', 'Ludo', 'Dom.'];
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleCell = (r: number, c: number) => {
    playSound('pop');
    const next = [...grid.map(row => [...row])];
    // Ciclo: null -> X (No) -> O (Sí) -> null
    if (next[r][c] === null) next[r][c] = 'X';
    else if (next[r][c] === 'X') next[r][c] = 'O';
    else next[r][c] = null;
    setGrid(next);
  };

  const check = () => {
    // Solución correcta según las pistas:
    // Julio: Damas (col 1)
    // Luis: Dominó (col 3)
    // Pedro: Ajedrez (col 0)
    // Manuel: Ludo (col 2)
    const solution = [
      [null, 'O', null, null], // Julio
      [null, null, null, 'O'], // Luis
      ['O', null, null, null], // Pedro
      [null, null, 'O', null], // Manuel
    ];

    let correct = true;
    let missingO = false;

    // Solo validamos que las 'O' estén en su lugar correcto. 
    // Las 'X' son opcionales para el estudiante como ayuda visual.
    for (let r = 0; r < friends.length; r++) {
      let rowHasO = false;
      for (let c = 0; c < games.length; c++) {
        if (grid[r][c] === 'O') {
          rowHasO = true;
          if (solution[r][c] !== 'O') correct = false;
        }
      }
      if (!rowHasO) missingO = true;
    }

    if (missingO) {
      playSound('error');
      setFeedback("Debes marcar con 'O' quién juega cada juego.");
      return;
    }

    if (correct) {
      playSound('success');
      setFeedback("¡Excelente! Has relacionado correctamente a cada amigo con su juego.");
    } else {
      playSound('error');
      setFeedback("Casi... Revisa las pistas: Pedro juega ajedrez y Luis dominó.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-slideIn">
      <div className="bg-white p-5 md:p-8 rounded-3xl shadow-xl border-4 border-green-100">
        <header className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">Interactiva #4</span>
          <h2 className="text-xl md:text-2xl font-bold text-green-700">Doble Entrada</h2>
          
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-3 text-[11px] text-gray-700 rounded-r-xl shadow-sm">
            <p className="font-bold text-green-800 mb-2 underline decoration-green-200">PISTAS PARA RESOLVER:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>A <strong>Pedro</strong> le encanta el <strong>Ajedrez</strong>.</li>
              <li><strong>Luis</strong> prefiere el <strong>Dominó</strong>.</li>
              <li><strong>Manuel</strong> no juega ni Damas ni Ajedrez.</li>
              <li>A <strong>Julio</strong> no le gusta el Ludo ni el Dominó.</li>
            </ul>
          </div>
          
          <p className="mt-4 text-[10px] text-gray-500 italic bg-gray-50 p-2 rounded-lg border border-dashed border-gray-200">
            <i className="fas fa-mouse-pointer mr-1"></i> Instrucción: Toca una celda. Una vez para <span className="text-red-500 font-bold">X</span> (No), dos para <span className="text-green-500 font-bold">O</span> (Sí).
          </p>
        </header>

        <div className="overflow-x-auto mb-6 rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-[11px] md:text-sm border-collapse">
            <thead>
              <tr className="bg-green-100 text-green-800">
                <th className="p-3 border border-green-200 font-extrabold">Nombres</th>
                {games.map(g => (
                  <th key={g} className="p-3 border border-green-200 font-extrabold">{g}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {friends.map((friend, rIdx) => (
                <tr key={friend} className="hover:bg-green-50/30 transition-colors">
                  <td className="p-3 font-bold bg-gray-50 border border-green-100 text-gray-700">{friend}</td>
                  {games.map((game, cIdx) => (
                    <td 
                      key={game} 
                      onClick={() => toggleCell(rIdx, cIdx)}
                      className="p-3 border border-green-100 text-center cursor-pointer h-12 w-12 md:h-14 md:w-14 relative"
                    >
                      {grid[rIdx][cIdx] === 'X' && (
                        <span className="text-red-500 font-black text-lg animate-pop">✕</span>
                      )}
                      {grid[rIdx][cIdx] === 'O' && (
                        <span className="text-green-500 font-black text-lg animate-pop">◯</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {feedback && (
          <div className={`p-3 rounded-xl text-center text-[10px] md:text-xs font-bold mb-4 ${feedback.includes('¡') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
            {feedback}
          </div>
        )}

        <div className="flex justify-between items-center border-t border-gray-100 pt-5">
          <button 
            onClick={() => setGrid(Array(4).fill(null).map(() => Array(4).fill(null)))} 
            className="text-gray-400 hover:text-green-600 font-bold text-[10px] transition-colors"
            title="Reiniciar tabla"
          >
            <i className="fas fa-sync-alt mr-1"></i> Reiniciar
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => { playSound('pop'); onBack(); }} 
              className="w-10 h-10 flex items-center justify-center border-2 border-gray-100 text-gray-400 rounded-xl hover:bg-gray-50 hover:text-gray-600 transition-all shadow-sm"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            
            <button 
              onClick={check} 
              className="px-6 py-2 bg-blue-500 text-white rounded-xl font-bold text-xs hover:bg-blue-600 shadow-md transform hover:scale-105 active:scale-95 transition-all"
            >
              Validar
            </button>
            
            <button 
              onClick={() => { playSound('pop'); onNext(); }} 
              className="w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-md transform hover:scale-105 transition-all"
            >
              <i className="fas fa-star"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableOrdering;
