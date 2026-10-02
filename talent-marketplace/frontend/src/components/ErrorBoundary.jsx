import { Component } from 'react';

// Class component because React error boundaries require the
// componentDidCatch/getDerivedStateFromError lifecycle — there is no hook
// equivalent. Without this, any uncaught render error anywhere in the tree
// (a null-deref, a bad prop, the AdminDashboard Rules-of-Hooks class of bug)
// unmounts the whole app to a blank white page with no way back.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // This replaces the entire app tree (Navbar/Footer included) on any
      // uncaught render error, so it can't rely on those for branding —
      // it uses the same theme-aware bg-theme-base/text-theme-primary
      // tokens the rest of the app is built on, rather than the plain
      // gray/red page this used to fall back to.
      return (
        <div className="min-h-screen bg-theme-base flex flex-col items-center justify-center text-center p-8">
          <span className="text-xl font-display font-extrabold tracking-tight text-theme-primary mb-6">
            ATELIER <span className="text-[#d4af37]">TALENT</span>
          </span>
          <h1 className="text-2xl font-display font-bold text-theme-primary mb-2">
            Something went wrong
          </h1>
          <p className="text-zinc-500 mb-6 max-w-md text-sm leading-relaxed">
            An unexpected error occurred while rendering this page. Reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8962e] hover:from-[#e5c349] hover:to-[#d4af37] text-black font-bold rounded-xl transition-all shadow-lg shadow-[#d4af37]/10"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
