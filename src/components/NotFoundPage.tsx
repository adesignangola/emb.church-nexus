import { AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-nexus-bg flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl bg-nexus-yellow/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} className="text-nexus-yellow" />
        </div>
        <h1 className="text-5xl font-black text-nexus-text mb-2">404</h1>
        <p className="text-lg text-nexus-text-muted mb-2">Página não encontrada</p>
        <p className="text-sm text-nexus-text-muted mb-8">O recurso que procura não existe ou foi removido.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 gold-gradient text-white rounded-xl text-sm font-bold shadow-lg shadow-nexus-orange/10 hover:brightness-110 transition-all">
          <Home size={18} /> Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
