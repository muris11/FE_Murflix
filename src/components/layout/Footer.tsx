import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Shield, Server, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0a0c] border-t border-zinc-800/80 text-zinc-400 pt-10 pb-28 md:py-12 mt-12">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 space-y-8">
        
        {/* Navigation & Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-xs sm:text-sm">
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link to="/browse/movies" className="hover:text-white transition-colors">Semua Film</Link></li>
              <li><Link to="/browse/tv" className="hover:text-white transition-colors">Serial TV</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors">Pencarian &amp; Tren</Link></li>
              <li><Link to="/my-list" className="hover:text-white transition-colors">Daftar Saya</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider">Koleksi Genre</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link to="/browse/genre/28" className="hover:text-white transition-colors">Film Action</Link></li>
              <li><Link to="/browse/genre/878" className="hover:text-white transition-colors">Fiksi Ilmiah (Sci-Fi)</Link></li>
              <li><Link to="/browse/genre/27" className="hover:text-white transition-colors">Horor &amp; Misteri</Link></li>
              <li><Link to="/browse/genre/35" className="hover:text-white transition-colors">Film Komedi</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider">Infrastruktur</h4>
            <ul className="space-y-2 text-zinc-400">
              <li className="flex items-center space-x-2">
                <Server className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                <span>Multi-Server Player Ad-Free</span>
              </li>
              <li className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                <span>Format Resolusi 4K &amp; Full HD</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                <span>Multi-Profil &amp; Privasi Terjaga</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider">Tentang Murflix</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Murflix adalah platform katalog dan streaming film serta serial televisi dengan dukungan multi-server berkecepatan tinggi untuk pengalaman menonton terbaik tanpa jeda iklan.
            </p>
          </div>
        </div>

        {/* TMDB Official Compliance & Attribution (Seamless Integration without Card Box) */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 max-w-3xl">
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
              title="The Movie Database (TMDB)"
            >
              <img
                src="/tmdb-logo.svg"
                alt="The Movie Database (TMDB) Logo"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </a>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-300">
                TMDB API Attribution &amp; Metadata Notice
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                This product uses the TMDB API but is not endorsed or certified by TMDB. Seluruh metadata sinema, judul, poster, dan informasi sinopsis disediakan melalui The Movie Database.
              </p>
            </div>
          </div>

          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white font-medium transition-colors whitespace-nowrap group self-start md:self-auto"
          >
            <span>themoviedb.org</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
          </a>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <p>&copy; {new Date().getFullYear()} Murflix Streaming Hub. All rights reserved.</p>
          <p className="text-center sm:text-right text-[11px] text-zinc-600">
            Murflix tidak menyimpan berkas video di peladen kami. Seluruh konten disematkan dari sumber pihak ketiga yang terpercaya.
          </p>
        </div>

      </div>
    </footer>
  );
};
