import React, { useEffect } from 'react';
import { X, Play, ExternalLink, FileVideo, AlertCircle } from 'lucide-react';

export function resolveVideoUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/')) {
    return trimmed;
  }
  if (trimmed.startsWith('uploads/')) {
    return `/${trimmed}`;
  }
  return `/uploads/videos/${trimmed}`;
}

export function isDirectVideoUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.startsWith('/uploads/') ||
    lower.endsWith('.mp4') ||
    lower.endsWith('.mov') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.ogg') ||
    lower.endsWith('.m4v') ||
    lower.includes('.mp4?') ||
    lower.includes('.mov?')
  );
}

export function getGoogleDriveEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return null;
}

export function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  }
  return null;
}

export default function VideoPlayerModal({ video, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!video || !video.url) return null;

  const rawUrl = video.rawUrl || video.url;
  const resolvedUrl = resolveVideoUrl(rawUrl);
  const isDirect = isDirectVideoUrl(resolvedUrl);
  const gDriveEmbed = getGoogleDriveEmbedUrl(rawUrl);
  const ytEmbed = getYouTubeEmbedUrl(rawUrl);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-slate-900 rounded-3xl border-4 border-[#4e97fe] shadow-2xl p-4 sm:p-6 space-y-4 text-white animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-[#4e97fe] shrink-0">
              <FileVideo className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-pixel text-white">
                {video.title || 'Squad Gameplay Demo'}
              </h3>
              <p className="text-[11px] font-retro text-slate-400">
                {video.fileName || 'Gameplay Video Clip'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-pixel text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in New Tab</span>
            </a>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Area */}
        <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center min-h-[320px] max-h-[540px] border border-slate-800 relative">
          {isDirect ? (
            <video
              src={resolvedUrl}
              controls
              autoPlay
              className="w-full h-full max-h-[520px] object-contain"
            />
          ) : gDriveEmbed ? (
            <iframe
              src={gDriveEmbed}
              title="Google Drive Video Player"
              className="w-full h-[480px] border-0"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : ytEmbed ? (
            <iframe
              src={ytEmbed}
              title="YouTube Video Player"
              className="w-full h-[480px] border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
                <Play className="w-8 h-8 ml-1" />
              </div>
              <div className="space-y-1">
                <h4 className="font-pixel text-sm font-bold text-white">EXTERNAL VIDEO LINK</h4>
                <p className="text-xs font-retro text-slate-300">
                  This video is hosted on an external drive or video platform. Click below to view the gameplay clip.
                </p>
              </div>
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-pixel font-bold shadow-lg transition-all cursor-pointer transform hover:scale-105"
              >
                <ExternalLink className="w-4 h-4" />
                <span>OPEN VIDEO IN NEW TAB ↗</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
