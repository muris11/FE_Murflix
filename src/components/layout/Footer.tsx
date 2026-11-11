import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Film, Shield, Server, Tv, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0c0c0e] border-t border-white/5 text-gray-400 pt-12 pb-24 md:py-12 mt-10">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 space-y-10">
        
        {/* Navigation & Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs sm:text-sm">
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-2">
              <li><Link to="/browse/movies" className="hover:text-white transition-colors">Semua Film</Link></li>
              <li><Link to="/browse/tv" className="hover:text-white transition-colors">Serial TV</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors">Pencarian &amp; Tren</Link></li>
              <li><Link to="/my-list" className="hover:text-white transition-colors">Daftar Saya</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Koleksi Genre</h4>
            <ul className="space-y-2">
              <li><Link to="/browse/genre/28" className="hover:text-white transition-colors">Film Action</Link></li>
              <li><Link to="/browse/genre/878" className="hover:text-white transition-colors">Fiksi Ilmiah (Sci-Fi)</Link></li>
              <li><Link to="/browse/genre/27" className="hover:text-white transition-colors">Horor &amp; Misteri</Link></li>
              <li><Link to="/browse/genre/35" className="hover:text-white transition-colors">Film Komedi</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Infrastruktur</h4>
            <ul className="space-y-2 text-zinc-400">
              <li className="flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Multi-Server Player Ad-Free</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>Format Resolusi 4K &amp; Full HD</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Multi-Profil &amp; Privasi Terjaga</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Tentang Murflix</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Murflix adalah platform katalog dan streaming film serta serial televisi dengan dukungan multi-server berkecepatan tinggi untuk pengalaman menonton terbaik tanpa jeda iklan.
            </p>
          </div>
        </div>

        {/* TMDB Official Compliance & Attribution Card */}
        <div className="bg-[#121215] border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 group hover:opacity-90 transition-opacity"
              title="Kunjungi The Movie Database (TMDB)"
            >
              <img
                src="/tmdb-logo.svg"
                alt="The Movie Database (TMDB) Logo"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </a>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  TMDB API Attribution &amp; Compliance
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  Data Terverifikasi
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                This product uses the TMDB API but is not endorsed or certified by TMDB. Seluruh data metadata sinema, judul, sinopsis, informasi pemeran, dan poster film bersumber dari API The Movie Database.
              </p>
            </div>
          </div>

          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white text-xs font-semibold border border-zinc-700 transition-all self-start md:self-center"
          >
            <span>The Movie Database</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <p>&copy; {new Date().getFullYear()} Murflix Streaming Hub. All rights reserved.</p>
          <p className="text-center sm:text-right text-[11px] text-zinc-600">
            Murflix tidak menyimpan berkas video di peladen kami. Seluruh konten disematkan dari sumber pihak ketiga yang terpercaya.
          </p>
        </div>

      </div>
    </footer>
  );
};
