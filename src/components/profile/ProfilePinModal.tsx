import React, { useState, useRef, useEffect } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';
import { UserProfile } from '@/types/profile';
import { profilesApi } from '@/api/profiles';
import { getAvatarUrl } from '@/utils/avatarConverter';

interface ProfilePinModalProps {
  isOpen: boolean;
  profile: UserProfile | null;
  onSuccess: () => void;
  onClose: () => void;
}

export const ProfilePinModal: React.FC<ProfilePinModalProps> = ({
  isOpen,
  profile,
  onSuccess,
  onClose,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Reset and auto-focus first box on open
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '']);
      setError(null);
      setIsVerifying(false);
      setIsShaking(false);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen, profile?.id]);

  if (!isOpen || !profile) return null;

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric single character
    const sanitized = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = sanitized;
    setDigits(newDigits);
    setError(null);

    // Auto advance focus
    if (sanitized && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto submit when 4 digits are completed
    if (sanitized && index === 3) {
      const fullPin = newDigits.join('');
      if (fullPin.length === 4) {
        verifyPinCode(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs[index - 1].current?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs[index + 1].current?.focus();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const verifyPinCode = async (pinString: string) => {
    if (isVerifying) return;
    setIsVerifying(true);
    setError(null);

    try {
      const isValid = await profilesApi.verifyPin(profile.id, pinString);
      if (isValid) {
        onSuccess();
      } else {
        triggerErrorState('PIN salah. Silakan coba lagi.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'PIN profil salah. Coba lagi.';
      triggerErrorState(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const triggerErrorState = (msg: string) => {
    setError(msg);
    setIsShaking(true);
    setDigits(['', '', '', '']);
    setTimeout(() => {
      setIsShaking(false);
      inputRefs[0].current?.focus();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Backdrop Dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div
        className={`relative z-10 w-full max-w-sm bg-[#121215] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-black ring-1 ring-white/5 text-center transition-transform ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon Header & Profile Avatar */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-900 border-2 border-white/20 shadow-xl mx-auto">
              <img
                src={getAvatarUrl(profile.avatar_url)}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/avatars/avatar-red.svg';
                }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-[#121215]">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Kunci Profil</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Masukkan PIN 4-digit untuk mengakses profil <strong className="text-white">{profile.name}</strong>
            </p>
          </div>
        </div>

        {/* 4 Digit Boxes */}
        <div className="flex items-center justify-center space-x-3 sm:space-x-4 py-2">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={isVerifying}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-zinc-900/90 text-center text-2xl font-black text-white border transition-all duration-150 focus:outline-none ${
                error
                  ? 'border-red-500/80 bg-red-950/20'
                  : digit
                  ? 'border-white/60 bg-zinc-800/80'
                  : 'border-zinc-700/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
              }`}
            />
          ))}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center justify-center space-x-1.5 text-xs font-semibold text-red-400 bg-red-950/40 border border-red-900/50 py-2 px-3 rounded-xl animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs border border-zinc-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={digits.join('').length !== 4 || isVerifying}
            onClick={() => verifyPinCode(digits.join(''))}
            className="flex-1 py-3 px-4 rounded-xl bg-[#e50914] hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-[#e50914] text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-red-950/60"
          >
            {isVerifying ? 'Memeriksa...' : 'Buka Profil'}
          </button>
        </div>
      </div>
    </div>
  );
};
