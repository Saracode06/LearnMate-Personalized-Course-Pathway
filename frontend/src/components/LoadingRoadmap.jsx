import React from 'react';

export default function LoadingRoadmap() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Background orbs */}
      <div className="fixed top-1/4 left-1/3 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="text-center animate-in">
        {/* Animated brain/AI icon */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(99,102,241,0.2)', animationDuration: '1.5s' }} />
          <div className="absolute inset-2 rounded-full animate-ping"
            style={{ background: 'rgba(52,211,153,0.15)', animationDuration: '2s', animationDelay: '0.3s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl glow-purple"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #34d399)' }}>
              🤖
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-black mb-3">
          <span className="gradient-text">Crafting Your Roadmap</span>
        </h2>
        <p className="text-slate-400 mb-10 max-w-md mx-auto">
          Granite 3.0 AI is analyzing your profile and generating a personalized learning pathway...
        </p>

        {/* Steps loading */}
        <div className="flex flex-col gap-3 max-w-sm mx-auto text-left">
          {[
            { label: 'Analyzing career interest & skill level', delay: 0 },
            { label: 'Curating industry-standard courses', delay: 0.4 },
            { label: 'Generating module sequence', delay: 0.8 },
            { label: 'Adding milestone projects', delay: 1.2 },
            { label: 'Finalizing your pathway', delay: 1.6 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 animate-in" style={{ animationDelay: `${item.delay}s`, opacity: 0 }}>
              <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}>
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              </div>
              <div className="h-3 rounded-full shimmer-bg flex-1" style={{ maxWidth: `${70 + i * 10}%` }} />
            </div>
          ))}
        </div>

        <p className="text-slate-600 text-xs mt-10">Powered by Granite 3.0 AI Engine · granite-4-h-small</p>
      </div>
    </div>
  );
}
