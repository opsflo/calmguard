'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAnalysisStore } from '@/store/analysis-store';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RADIUS = 56;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = 64; // viewBox is 128x128

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGaugeColor(score: number): string {
  if (score < 40) return '#ef4444'; // red-500
  if (score < 70) return '#f59e0b'; // amber-500
  return '#10b981'; // emerald-500
}

function getBarColorClass(score: number): string {
  if (score < 40) return 'bg-red-500';
  if (score < 70) return 'bg-amber-500';
  return 'bg-emerald-500';
}

// ---------------------------------------------------------------------------
// useCountUp hook
// ---------------------------------------------------------------------------

function useCountUp(targetScore: number, duration: number = 1200): number {
  const [displayScore, setDisplayScore] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (targetScore <= 0) {
      setDisplayScore(0);
      return;
    }

    // Cancel any in-progress animation
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic: starts fast, decelerates to target
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(targetScore * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [targetScore, duration]);

  return displayScore;
}

// ---------------------------------------------------------------------------
// SVG Gauge
// ---------------------------------------------------------------------------

interface GaugeProps {
  displayScore: number;
  hasData: boolean;
}

function ComplianceGauge({ displayScore, hasData }: GaugeProps) {
  const color = getGaugeColor(displayScore);
  const strokeDashoffset = CIRCUMFERENCE * (1 - displayScore / 100);

  if (!hasData) {
    // Empty state: dashed ring outline, no foreground arc
    return (
      <svg width={128} height={128} viewBox="0 0 128 128" aria-label="No compliance data yet">
        {/* Dashed background ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={8}
          strokeDasharray="4 4"
          className="text-slate-700"
        />
        {/* Placeholder text */}
        <text
          x={CENTER}
          y={CENTER - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill="#64748b"
        >
          Run analysis
        </text>
        <text
          x={CENTER}
          y={CENTER + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill="#64748b"
        >
          to see score
        </text>
      </svg>
    );
  }

  return (
    <svg width={128} height={128} viewBox="0 0 128 128" aria-label={`Compliance score: ${displayScore} out of 100`}>
      {/* Background track — full circle */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={8}
        className="text-slate-700"
      />

      {/* Foreground arc — rotated to start at 12 o'clock */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
        style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
      />

      {/* Score number — centered, large bold */}
      <text
        x={CENTER}
        y={CENTER - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={28}
        fontWeight="bold"
        fill={color}
      >
        {displayScore}
      </text>

      {/* Subtitle */}
      <text
        x={CENTER}
        y={CENTER + 16}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fill="#94a3b8"
      >
        / 100
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Framework Bars
// ---------------------------------------------------------------------------

interface FrameworkScore {
  framework: string;
  score: number;
  rating: string;
}

interface FrameworkBarsProps {
  scores: FrameworkScore[];
}

function FrameworkBars({ scores }: FrameworkBarsProps) {
  if (scores.length === 0) {
    // Empty-state placeholder bars
    return (
      <div className="space-y-3">
        {['SOX', 'PCI-DSS', 'NIST-CSF', 'FINOS-CCC'].map((label) => (
          <div key={label}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-slate-500">{label}</span>
              <span className="text-sm text-slate-600">—</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-700/50" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scores.map(({ framework, score }) => {
        const colorClass = getBarColorClass(score);
        const displayLabel = framework === 'CCC' ? 'FINOS-CCC' : framework;
        return (
          <div key={framework}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-slate-300">{displayLabel}</span>
              <span className="text-sm text-slate-400">{score}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-700">
              <div
                className={`h-1.5 rounded-full ${colorClass} transition-all duration-1000 ease-out`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ComplianceCard — main export
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Analyzing state — pulsing gauge with progress text
// ---------------------------------------------------------------------------

function AnalyzingGauge() {
  return (
    <svg width={128} height={128} viewBox="0 0 128 128" aria-label="Analysis in progress">
      {/* Spinning arc background */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={8}
        className="text-slate-700"
      />
      {/* Animated spinning arc */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={`${CIRCUMFERENCE * 0.25} ${CIRCUMFERENCE * 0.75}`}
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
        className="animate-spin origin-center"
        style={{ transformBox: 'fill-box', animationDuration: '2s' }}
      />
      {/* Center text */}
      <text
        x={CENTER}
        y={CENTER - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight="600"
        fill="#60a5fa"
      >
        Analyzing
      </text>
      <text
        x={CENTER}
        y={CENTER + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={9}
        fill="#64748b"
      >
        Please wait...
      </text>
    </svg>
  );
}

function AnalyzingBars() {
  return (
    <div className="space-y-3">
      {['SOX', 'PCI-DSS', 'NIST-CSF', 'FINOS-CCC'].map((label) => (
        <div key={label}>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="text-sm text-slate-600 animate-pulse">...</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 animate-shimmer rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ComplianceCard() {
  const riskData = useAnalysisStore((state) => state.analysisResult?.risk ?? null);
  const status = useAnalysisStore((state) => state.status);

  const overallScore = riskData?.overallScore ?? 0;
  const displayScore = useCountUp(overallScore);
  const hasData = riskData !== null;
  const isAnalyzing = status === 'analyzing';

  return (
    <Card className="bg-slate-800 border-slate-700">
      <div className="p-6">
        <h3 className="text-sm font-medium text-slate-400 mb-4">Compliance Score</h3>

        {/* SVG Gauge */}
        <div className="flex justify-center mb-6">
          {isAnalyzing && !hasData ? (
            <AnalyzingGauge />
          ) : (
            <ComplianceGauge displayScore={displayScore} hasData={hasData} />
          )}
        </div>

        {/* Overall rating — only when data exists */}
        {riskData && (
          <p className="text-center text-sm text-slate-400 mb-6">
            Rating:{' '}
            <span className="font-medium text-slate-200 capitalize">{riskData.overallRating}</span>
          </p>
        )}

        {/* Per-framework breakdown bars */}
        {isAnalyzing && !hasData ? (
          <AnalyzingBars />
        ) : (
          <FrameworkBars scores={riskData?.frameworkScores ?? []} />
        )}
      </div>
    </Card>
  );
}
