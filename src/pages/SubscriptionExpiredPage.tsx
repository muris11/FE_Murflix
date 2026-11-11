import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldAlert, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const SubscriptionExpiredPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1b1b1b] border border-red-500/30 rounded-2xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full filter blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6 text-red-500">
          <Clock className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-white">Masa Langganan Habis</h1>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          Akun Anda (<span className="text-white font-medium">{user?.email}</span>) telah melewati masa aktif langganan.
        </p>

        {user?.subscription_expires_at && (
          <div className="mt-4 p-3 rounded-xl bg-gray-900/80 border border-gray-800 text-xs text-gray-400 inline-block">
            Kedaluwarsa pada:{' '}
            <span className="text-red-400 font-semibold">
              {new Date(user.subscription_expires_at).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <a
            href="https://wa.me/?text=Halo%20Admin%20Murflix,%20saya%20ingin%20perpanjang%20langganan%20akun%20saya"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Hubungi Admin untuk Perpanjang</span>
          </a>

          <button
            onClick={() => logout()}
            className="w-full py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm flex items-center justify-center space-x-2 transition-colors border border-gray-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Ganti Akun / Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

