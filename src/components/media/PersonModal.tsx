import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Calendar, MapPin, Film, Star, Loader2 } from 'lucide-react';
import { moviesApi } from '@/api/movies';
import { PersonDetails, PersonCreditItem } from '@/types/tmdb';
import { getTMDBImageUrl, getDirectTMDBUrl } from '@/utils/image';
import { getMovieUrl, getTVUrl } from '@/utils/slug';

interface PersonModalProps {
  personId: number | null;
  onClose: () => void;
}

export const PersonModal: React.FC<PersonModalProps> = ({ personId, onClose }) => {
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    if (!personId) {
      setPerson(null);
      return;
    }

    setIsLoading(true);
    setPhotoError(false);
    moviesApi
      .getPersonDetails(personId)
      .then((data) => setPerson(data))
      .catch((err) => console.error('Failed to load person details:', err))
      .finally(() => setIsLoading(false));
  }, [personId]);

  if (!personId) return null;

  const photoUrl = person?.profile_path
    ? photoError
      ? getDirectTMDBUrl(person.profile_path, 'w500')
      : getTMDBImageUrl(person.profile_path, 'w500')
    : '/placeholder.svg';

  // Sort known works by popularity
  const knownWorks: PersonCreditItem[] = (person?.combined_credits?.cast || [])
    .filter((item) => item.poster_path && (item.title || item.name))
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 12);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl text-white p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-red-600" />
            <p className="text-sm text-gray-400">Memuat profil pemeran...</p>
          </div>
        ) : person ? (
          <div className="space-y-6">
            {/* Header: Photo + Bio */}
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div className="flex-shrink-0 w-32 h-44 sm:w-40 sm:h-56 rounded-xl overflow-hidden shadow-xl border border-white/10 bg-zinc-900">
                <img
                  src={photoUrl}
                  alt={person.name}
                  onError={() => setPhotoError(true)}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-3 text-center sm:text-left">
                <span className="inline-block text-xs font-bold tracking-wider uppercase text-red-500">
                  {person.known_for_department || 'Pemeran'}
                </span>

                <h2 className="text-2xl sm:text-3xl font-black">{person.name}</h2>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-300">
                  {person.birthday && (
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-red-500" />
                      <span>{person.birthday}</span>
                    </div>
                  )}
                  {person.place_of_birth && (
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      <span>{person.place_of_birth}</span>
                    </div>
                  )}
                </div>

                {person.biography ? (
                  <p className="text-xs sm:text-sm text-gray-300 line-clamp-5 leading-relaxed pt-1">
                    {person.biography}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 italic pt-1">Belum ada biografi resmi tersedia.</p>
                )}
              </div>
            </div>

            {/* Filmography Carousel */}
            {knownWorks.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center space-x-2">
                  <Film className="w-4 h-4 text-red-500" />
                  <h3 className="text-sm sm:text-base font-bold text-gray-200">
                    Karya & Film Populer ({knownWorks.length})
                  </h3>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-1">
                  {knownWorks.map((work) => {
                    const isTV = work.media_type === 'tv' || !work.title;
                    const workTitle = work.title || work.name || 'Untitled';
                    const targetUrl = isTV ? getTVUrl(work.id, workTitle) : getMovieUrl(work.id, workTitle);
                    const poster = work.poster_path ? getTMDBImageUrl(work.poster_path, 'w300') : '/placeholder.svg';

                    return (
                      <Link
                        key={`${work.media_type}-${work.id}`}
                        to={targetUrl}
                        onClick={onClose}
                        className="group flex flex-col space-y-1.5"
                      >
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 border border-white/5 group-hover:border-red-500/50 transition-all shadow-md group-hover:scale-105">
                          <img
                            src={poster}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {work.vote_average && (
                            <div className="absolute top-1.5 left-1.5 px-1 py-0.5 rounded bg-black/80 text-[9px] font-bold text-amber-400 flex items-center space-x-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              <span>{work.vote_average.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        <span className="text-[11px] font-medium text-gray-300 line-clamp-1 group-hover:text-red-400 transition-colors">
                          {workTitle}
                        </span>
                        {work.character && (
                          <span className="text-[10px] text-gray-500 line-clamp-1">sebagai {work.character}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">Data profil pemeran tidak ditemukan.</div>
        )}
      </div>
    </div>
  );
};

