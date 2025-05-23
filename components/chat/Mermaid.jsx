"use client";

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';

export function Mermaid({ chart }) {
  const { theme } = useTheme();
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [id] = useState(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'strict',
      logLevel: 4, // Error only
    });

    const renderChart = async () => {
      try {
        setError(null);
        setLoading(true);
        const { svg } = await mermaid.render(id, chart.trim());
        setSvg(svg);
      } catch (e) {
        console.error('Mermaid rendering error:', e);
        setError(`Error rendering diagram: ${e.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    renderChart();
  }, [chart, theme, id]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
        <p className="font-mono text-sm">{error}</p>
        <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 overflow-x-auto rounded text-xs">
          {chart}
        </pre>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-4 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/30 rounded-md border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
          <div className="diagram-loading-indicator">
            <div className="diagram-loading-dot"></div>
            <div className="diagram-loading-dot"></div>
            <div className="diagram-loading-dot"></div>
          </div>
          <span className="text-sm font-medium">Rendering diagram...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="my-4 flex justify-center bg-white dark:bg-transparent rounded-md p-2 overflow-x-auto animate-fade-in"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
