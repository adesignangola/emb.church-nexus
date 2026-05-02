import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-nexus-bg flex items-center justify-center p-6">
          <div className="glass-card p-8 max-w-md w-full text-center border-rose-500/20">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-rose-500" />
            </div>
            <h2 className="text-xl font-black text-nexus-text uppercase tracking-tight mb-2">Erro Inesperado</h2>
            <p className="text-sm text-nexus-text-muted mb-6">
              Ocorreu um erro ao carregar este módulo. Tente recarregar a página.
            </p>
            {this.state.error && (
              <p className="text-xs font-mono text-rose-400 bg-nexus-card/50 p-3 rounded-lg mb-6 text-left">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2.5 bg-nexus-card border border-nexus-border text-nexus-text rounded-xl text-xs font-bold hover:bg-nexus-bg transition-all"
              >
                <RefreshCw size={16} /> Recarregar
              </button>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 gold-gradient text-white rounded-xl text-xs font-bold shadow-lg shadow-nexus-orange/10 hover:brightness-110 transition-all"
              >
                <Home size={16} /> Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
