
import React from 'react';

interface Props {
  onNext: () => void;
}

const Theory: React.FC<Props> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
      <section className="bg-white p-8 rounded-3xl shadow-md border border-purple-50">
        <h2 className="text-3xl font-bold text-purple-700 mb-4 flex items-center gap-3">
          <i className="fas fa-info-circle text-blue-400"></i>
          ¿Qué es Ordenar la Información?
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Es la capacidad de organizar un conjunto de datos que parecen desordenados, utilizando deducciones lógicas para encontrar una secuencia coherente. Esta habilidad es fundamental para resolver problemas matemáticos y entender textos complejos.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-purple-50 p-6 rounded-2xl">
            <h3 className="font-bold text-purple-600 mb-2">Importancia</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Facilita la toma de decisiones.</li>
              <li>Mejora la comprensión lectora.</li>
              <li>Desarrolla el razonamiento analítico.</li>
              <li>Ayuda a visualizar situaciones complejas.</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-6 rounded-2xl">
            <h3 className="font-bold text-blue-600 mb-2">¿Cómo se hace?</h3>
            <p className="text-gray-600 text-sm">
              Leemos los datos uno a uno, dibujamos esquemas (rectas, círculos o tablas) y vamos descartando posibilidades hasta llegar a la única respuesta correcta.
            </p>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-purple-500 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
            <i className="fas fa-arrows-left-right"></i>
          </div>
          <h4 className="font-bold mb-2">Lineal Horizontal</h4>
          <p className="text-xs text-gray-500 italic">Comparaciones de edad, estatura, o posición en fila.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-500 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <i className="fas fa-arrows-up-down"></i>
          </div>
          <h4 className="font-bold mb-2">Lineal Vertical</h4>
          <p className="text-xs text-gray-500 italic">Edificios con pisos, niveles de profundidad o escalas.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-pink-500 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mb-4">
            <i className="fas fa-circle-notch"></i>
          </div>
          <h4 className="font-bold mb-2">Circular</h4>
          <p className="text-xs text-gray-500 italic">Personas sentadas alrededor de una mesa redonda.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-green-500 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
            <i className="fas fa-table-cells"></i>
          </div>
          <h4 className="font-bold mb-2">Doble Entrada</h4>
          <p className="text-xs text-gray-500 italic">Relacionar personas con sus gustos, profesiones u oficios.</p>
        </div>
      </section>

      <div className="flex justify-center pt-6">
        <button 
          onClick={onNext}
          className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg"
        >
          ¡Comenzar Simulaciones!
        </button>
      </div>
    </div>
  );
};

export default Theory;
