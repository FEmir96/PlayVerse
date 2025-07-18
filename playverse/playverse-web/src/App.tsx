import './index.css'; // Asegurate de que tu Tailwind esté importado

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold mb-4">PlayVerse con TailwindCSS v4 🎮</h1>
        <p className="text-lg text-gray-300">
          Todo funcionando correctamente desde Vite + React + TypeScript + Tailwind.
        </p>
      </div>
    </div>
  );
}
