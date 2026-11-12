import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/api/client';
import { MurflixLogo } from '@/components/layout/MurflixLogo';

interface DemoConfig {
  enabled: boolean;
  email: string;
  password?: string;
  button_text?: string;
}

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoConfig, setDemoConfig] = useState<DemoConfig | null>(null);

  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/';
  const urlError = searchParams.get('error');

  // Fetch dynamic demo account config from backend
  useEffect(() => {
    apiClient
      .get<DemoConfig>('/config/demo-account')
      .then((res) => {
        if (res.data) {
          setDemoConfig(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Email atau password salah');
      } else {
        navigate(redirectParam);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat masuk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Coba endpoint demo login langsung (bypass mismatch password)
      const res = await loginDemo();
      if (res.success) {
        navigate(redirectParam);
        return;
      }

      // 2. Fallback jika ada email & password terisi
      if (demoConfig?.email && demoConfig?.password) {
        setEmail(demoConfig.email);
        setPassword(demoConfig.password);
        const fallbackRes = await login(demoConfig.email, demoConfig.password);
        if (fallbackRes.success) {
          navigate(redirectParam);
          return;
        }
      }

      setError(res.error || 'Gagal masuk dengan akun demo. Hubungi Admin.');
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan akun demo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-black overflow-hidden">
      
      {/* Genuine Netflix Movie Posters Collage Background - Vivid & Clearly Visible */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-85 filter brightness-100 contrast-105 scale-105"
        style={{
          backgroundImage:
            'url("/login-bg.jpg"), url("https://assets.nflxext.com/ffe/siteui/vlv3/d8132cba-0024-4b01-86f4-2bac9792e1dd/web/ID-en-20261102-TRIFECTA-perspective_ee5f8c9c-18bf-4e73-904a-5a39f3c2c007_large.jpg")',
        }}
      />
      {/* Cinematic Vignette Overlay - Balanced so posters pop while form remains legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/60 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-[#121215]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black ring-1 ring-white/5">
        
        {/* Brand Header */}
        <div className="text-center mb-7 flex flex-col items-center">
          <Link to="/" className="inline-block transition-transform hover:scale-105">
            <MurflixLogo size="xl" />
          </Link>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-3 tracking-tight">Masuk ke Akun Anda</h2>
          <p className="text-xs text-zinc-400 mt-1">Layanan streaming film & serial TV berkualitas tinggi</p>
        </div>

        {/* 1-Click Demo Login Button (Dynamic from Admin Settings) */}
        {demoConfig?.enabled && demoConfig?.email && (
          <div className="mb-6 space-y-3">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm flex items-center justify-center space-x-2.5 transition-all hover:scale-[1.01] active:scale-95 border border-zinc-700 group shadow-lg"
            >
              <UserCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>{demoConfig.button_text || 'Masuk dengan Akun Demo (1-Click)'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-zinc-800" />
              <span className="absolute bg-[#121215] px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Atau Masuk Manual
              </span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {(error || urlError === 'account_disabled') && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400 text-xs sm:text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              {urlError === 'account_disabled'
                ? 'Akun Anda telah dinonaktifkan oleh Admin. Silakan hubungi pengelola.'
                : error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-zinc-900/90 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-colors"
              />
              <Mail className="w-5 h-5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password akun"
                className="w-full bg-zinc-900/90 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-colors"
              />
              <Lock className="w-5 h-5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <span>Memproses...</span>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Notice */}
        <div className="mt-7 pt-5 border-t border-zinc-800 text-center text-xs text-zinc-500 space-y-1">
          <p>
            Akun Murflix dikelola secara privat oleh Administrator.
          </p>
        </div>
      </div>
    </div>
  );
};
