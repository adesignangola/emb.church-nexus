import { ShieldAlert, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-nexus-bg flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={40} className="text-rose-500" />
        </div>
        <h1 className="text-3xl font-black text-nexus-text uppercase tracking-tight mb-2">Acesso Negado</h1>
        <p className="text-nexus-text-muted mb-8">Não tem permissão para aceder esta área.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 gold-gradient text-white rounded-xl text-sm font-bold shadow-lg shadow-nexus-orange/10 hover:brightness-110 transition-all">
          <Home size={18} /> Ir para Dashboard
        </Link>
      </div>
    </div>
  );
}
