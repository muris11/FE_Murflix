import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/';
  const urlError = searchParams.get('error');

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

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-black overflow-hidden">
      {/* Background Poster Collage with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-sm scale-105"
        style={{
          backgroundImage:
            'url("https://assets.nflxext.com/ffe/siteui/vlv3/ab4b0b22-2ddf-4d48-ae88-c201ae02a9e3/c545bf86-53d9-482d-8869-ecb52a781b22/ID-en-20231030-popsignuptwoweeks-perspective_alpha_website_large.jpg")',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-[#141414]/90 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-3xl sm:text-4xl font-black text-[#e50914] tracking-wider drop-shadow-md">
              MURFLIX
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white mt-3">Masuk ke Akun Anda</h2>
          <p className="text-xs text-gray-400 mt-1">Layanan private streaming film, serial & drama pendek</p>
        </div>

        {/* Error Alert */}
        {(error || urlError === 'account_disabled') && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              {urlError === 'account_disabled'
                ? 'Akun Anda telah dinonaktifkan oleh Admin. Silakan hubungi pengelola.'
                : error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-colors"
              />
              <Mail className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-colors"
              />
              <Lock className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
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

        {/* Information Notice */}
        <div className="mt-8 pt-6 border-t border-gray-800/80 text-center text-xs text-gray-500 space-y-2">
          <p>
            Akun Murflix dibuat secara khusus oleh Admin. Jika belum memiliki akun atau masa langganan habis, silakan hubungi pengelola.
          </p>
          <p className="text-[11px] text-gray-600">Default Super Admin: <code className="text-gray-400">admin@murflix.com</code></p>
        </div>
      </div>
    </div>
  );
};

