/**
 * Video Recommendations & YouTube Academic Library
 */

import React, { useState } from 'react';
import { User, LearningResource } from '../../types';
import { storageService } from '../../services/storageService';
import {
  Lightbulb,
  Play,
  Search,
  ExternalLink,
  Clock,
  BookOpen,
  X,
  Sparkles,
} from 'lucide-react';

interface VideoRecommendationsViewProps {
  user: User;
  onNavigate: (view: string) => void;
}

export const VideoRecommendationsView: React.FC<VideoRecommendationsViewProps> = ({
  user,
  onNavigate,
}) => {
  const resources = storageService.getResources();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalVideo, setActiveModalVideo] = useState<LearningResource | null>(null);

  const categories = ['All', 'Computer Science', 'Mathematics'];

  const filteredVideos = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.conceptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.channelName && r.channelName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'All' ||
                       (selectedCategory === 'Mathematics' && (r.conceptName.includes('Calculus') || r.conceptName.includes('Algebra') || r.conceptName.includes('Quadratic'))) ||
                       (selectedCategory === 'Computer Science' && (r.conceptName.includes('Search') || r.conceptName.includes('Graph') || r.conceptName.includes('Dynamic') || r.conceptName.includes('Trees')));

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-indigo-400" />
            <span>Curated Academic Video Lessons</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            High-yield video tutorials from verified channels (3Blue1Brown, Abdul Bari, MIT OCW, freeCodeCamp) mapped directly to your knowledge gaps.
          </p>
        </div>
        <button
          onClick={() => onNavigate('weak_topics')}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow"
        >
          <Sparkles className="h-4 w-4" />
          <span>View My Weak Topic Priorities</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tutorials, channels or topics..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map(video => (
          <div
            key={video.id}
            className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden hover:border-slate-700 transition space-y-3"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950 flex items-center justify-center">
              {video.youtubeVideoId ? (
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Play className="h-10 w-10 text-rose-500 mb-2" />
                  <span className="text-xs font-bold text-slate-300">{video.conceptName}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => setActiveModalVideo(video)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl shadow-rose-600/50 hover:scale-110 transition"
                >
                  <Play className="h-6 w-6 fill-white ml-0.5" />
                </button>
              </div>
              <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-white">
                {video.durationMinutes}m
              </span>
            </div>

            <div className="p-4 pt-0 space-y-2 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/20">
                    {video.channelName || 'Academic Resource'}
                  </span>
                  <span className="text-slate-400">{video.conceptName}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {video.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setActiveModalVideo(video)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Preview Lesson</span>
                </button>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition"
                >
                  <span>Open in YouTube</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Player */}
      {activeModalVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">{activeModalVideo.title}</h3>
                <p className="text-xs text-slate-400">{activeModalVideo.channelName} · {activeModalVideo.conceptName}</p>
              </div>
              <button
                onClick={() => setActiveModalVideo(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Embedded Iframe */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800">
              <iframe
                src={`https://www.youtube.com/embed/${activeModalVideo.youtubeVideoId}?autoplay=1`}
                title={activeModalVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Duration: ~{activeModalVideo.durationMinutes} mins</span>
              <a
                href={activeModalVideo.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <span>Watch directly on YouTube</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
