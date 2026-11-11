import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#101010] border-t border-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8 text-xs sm:text-sm">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-200">Navigasi</h4>
            <ul className="space-y-2">
              <li><Link to="/browse/movies" className="hover:text-white transition-colors">Semua Film</Link></li>
              <li><Link to="/browse/tv" className="hover:text-white transition-colors">Serial TV</Link></li>
              <li><Link to="/dramabox" className="hover:text-white transition-colors">DramaBox VIP</Link></li>
              <li><Link to="/reelshort" className="hover:text-white transition-colors">ReelShort</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-200">Koleksi</h4>
            <ul className="space-y-2">
              <li><Link to="/anime" className="hover:text-white transition-colors">Anime</Link></li>
              <li><Link to="/my-list" className="hover:text-white transition-colors">Daftar Saya</Link></li>
              <li><Link to="/browse/genre/28" className="hover:text-white transition-colors">Film Action</Link></li>
              <li><Link to="/browse/genre/35" className="hover:text-white transition-colors">Film Komedi</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-200">Akun & Langganan</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-white transition-colors">Masuk Akun</Link></li>
              <li><span className="text-gray-500">Hubungi Admin untuk Akses</span></li>
              <li><span className="text-gray-500">Masa Aktif Fleksibel</span></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-200">Tentang</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              Murflix adalah platform streaming film, serial TV, drama pendek dan anime dengan multi-server player berkecepatan tinggi.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Murflix Streaming Hub. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Powered by Golang + PostgreSQL + React</p>
        </div>
      </div>
    </footer>
  );
};

