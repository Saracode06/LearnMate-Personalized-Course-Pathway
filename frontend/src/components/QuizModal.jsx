import React, { useState } from 'react';
import { submitQuizResult } from '../services/api';

export default function QuizModal({ quiz, moduleTitle, moduleId, roadmapDbId, difficulty, onClose, onSaveResult }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);
  const [remediation, setRemediation] = useState(null);
  const [remLoading, setRemLoading] = useState(false);

  const questions = quiz.questions || [];
  const q = questions[current];

  // Running score (count correct answers so far including current if answered)
  const scoreCount = answers.filter(a => a.correct).length;

  const handleSelect = (idx) => {
    if (selected !== null) return;
    const isCorrect = idx === q.correctIndex;
    setSelected(idx);
    setShowExplanation(true);
    setAnswers(prev => [...prev, { questionId: q.id, chosen: idx, correct: isCorrect }]);
  };

  const handleNext = async () => {
    const isLast = current === questions.length - 1;
    if (!isLast) {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      setFinished(true);
      const finalAnswers = [...answers];
      const finalScore = finalAnswers.filter(a => a.correct).length;
      const total = questions.length;

      // Save result & get remediation if needed
      setRemLoading(true);
      try {
        const result = await submitQuizResult({
          topic: quiz.topic, score: finalScore, total,
          moduleId, roadmapDbId, moduleTitle, difficulty
        });
        if (result.remediation) setRemediation(result.remediation);
      } catch {
        // Non-fatal
      } finally {
        setRemLoading(false);
      }

      onSaveResult && onSaveResult({ topic: quiz.topic, score: finalScore, total, moduleId, date: Date.now() });
    }
  };

  const finalScore = answers.filter(a => a.correct).length;
  const pct = Math.round((finalScore / questions.length) * 100);
  const grade = pct >= 80 ? { label: 'Excellent!',      color: '#34d399', emoji: '🏆' }
    : pct >= 70           ? { label: 'Good Job!',        color: '#34d399', emoji: '👍' }
    : pct >= 50           ? { label: 'Keep Practicing',  color: '#fbbf24', emoji: '💪' }
    :                       { label: 'Review Needed',    color: '#f87171', emoji: '📚' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}>
      <div className="w-full max-w-xl glass-card rounded-2xl overflow-hidden animate-in"
        style={{ border: '1px solid rgba(99,102,241,0.2)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-0.5">10-Question Quiz</p>
              <h3 className="text-lg font-bold text-slate-100 leading-tight">{moduleTitle}</h3>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200"
              style={{ background: 'rgba(255,255,255,0.05)' }}>✕</button>
          </div>

          {!finished && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Question {current + 1} of {questions.length}</span>
                <span className="text-indigo-400 font-semibold">{scoreCount} correct</span>
              </div>
              <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-1 rounded-full transition-all duration-500"
                  style={{ width: `${(current / questions.length) * 100}%`, background: 'linear-gradient(90deg,#6366f1,#34d399)' }} />
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── FINISHED SCREEN ── */}
          {finished ? (
            <div className="text-center py-2">
              <div className="text-5xl mb-3">{grade.emoji}</div>
              <h2 className="text-3xl font-black mb-1" style={{ color: grade.color }}>{grade.label}</h2>
              <p className="text-slate-400 mb-4">
                Score: <span className="font-bold text-slate-200">{finalScore} / {questions.length}</span>
                &nbsp;·&nbsp;
                <span style={{ color: grade.color }}>{pct}%</span>
              </p>

              {/* Score ring */}
              <div className="relative w-24 h-24 mx-auto mb-5">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={grade.color} strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
                    style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 8px ${grade.color}66)` }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black" style={{ color: grade.color }}>{pct}%</span>
                </div>
              </div>

              {/* Remediation section */}
              {(pct < 70) && (
                <div className="mb-4 p-4 rounded-xl text-left animate-in"
                  style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2">
                    📚 Remediation Review — Study These Key Points
                  </p>
                  {remLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="w-3 h-3 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin inline-block" />
                      Generating personalized review…
                    </div>
                  ) : remediation ? (
                    <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{remediation}</p>
                  ) : (
                    <p className="text-sm text-slate-500">Score below 70% — retry the quiz after reviewing the module topics.</p>
                  )}
                </div>
              )}

              {/* Answer review */}
              <div className="text-left flex flex-col gap-2">
                {questions.map((qu, i) => {
                  const ans = answers[i];
                  const wasCorrect = ans?.correct;
                  return (
                    <div key={i} className="p-3 rounded-xl text-sm"
                      style={{
                        background: wasCorrect ? 'rgba(52,211,153,0.07)' : 'rgba(239,68,68,0.07)',
                        border: `1px solid ${wasCorrect ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)'}`
                      }}>
                      <span className="mr-2">{wasCorrect ? '✓' : '✗'}</span>
                      <span className="text-slate-300">{qu.question}</span>
                      {!wasCorrect && (
                        <p className="text-xs text-slate-500 mt-1 ml-5">
                          Correct: <span className="text-emerald-400">{qu.options[qu.correctIndex]}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <button onClick={onClose}
                className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white mt-5">
                Close Quiz
              </button>
            </div>

          ) : q ? (
            /* ── QUESTION SCREEN ── */
            <div>
              <p className="text-slate-100 font-semibold text-base mb-5 leading-relaxed">{q.question}</p>
              <div className="flex flex-col gap-3">
                {q.options.map((opt, i) => {
                  let bg = 'rgba(255,255,255,0.03)', border = 'rgba(255,255,255,0.08)', textColor = '#cbd5e1';
                  if (selected !== null) {
                    if (i === q.correctIndex)                                 { bg = 'rgba(52,211,153,0.12)'; border = 'rgba(52,211,153,0.35)'; textColor = '#34d399'; }
                    else if (i === selected && selected !== q.correctIndex)   { bg = 'rgba(239,68,68,0.1)';  border = 'rgba(239,68,68,0.3)';   textColor = '#f87171'; }
                  }
                  return (
                    <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3"
                      style={{ background: bg, border: `1px solid ${border}`, color: textColor, cursor: selected !== null ? 'default' : 'pointer' }}>
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.07)' }}>
                        {['A','B','C','D'][i]}
                      </span>
                      {opt}
                      {selected !== null && i === q.correctIndex && <span className="ml-auto text-emerald-400">✓</span>}
                      {selected !== null && i === selected && selected !== q.correctIndex && <span className="ml-auto text-red-400">✗</span>}
                    </button>
                  );
                })}
              </div>

              {showExplanation && q.explanation && (
                <div className="mt-4 p-3 rounded-xl text-sm animate-in"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <span className="text-indigo-400 font-semibold text-xs uppercase tracking-widest block mb-1">Explanation</span>
                  <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                </div>
              )}

              {selected !== null && (
                <button onClick={handleNext}
                  className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white mt-5">
                  {current < questions.length - 1 ? 'Next Question →' : '🏁 See Results'}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
