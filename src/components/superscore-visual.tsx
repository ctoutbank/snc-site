'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function SuperscoreVisual() {
  const nodes = [
    { name: 'SERASA', angle: 0, label: 'Crédito', delay: 0 },
    { name: 'BOA VISTA', angle: 60, label: 'Bureau', delay: 0.2 },
    { name: 'SPC BRASIL', angle: 120, label: 'Varejo', delay: 0.4 },
    { name: 'BANCO CENTRAL', angle: 180, label: 'SNC', delay: 0.6 },
    { name: 'JUSTIÇA', angle: 240, label: 'Processos', delay: 0.8 },
    { name: 'POLÍCIA', angle: 300, label: 'Segurança', delay: 1.0 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0A1628] overflow-hidden" style={{ minHeight: '600px' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--snc-green-2)] opacity-[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--snc-brass)] opacity-[0.05] blur-[120px]" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: `radial-gradient(var(--snc-brass) 0.5px, transparent 0.5px)`,
          backgroundSize: '30px 30px'
        }}
      />

      <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center">
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [0.8, 1.1, 0.8],
              rotate: ring % 2 === 0 ? 360 : -360
            }}
            transition={{
              duration: 10 + ring * 5,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute border border-white/10 rounded-full"
            style={{
              width: `${40 + ring * 20}%`,
              height: `${40 + ring * 20}%`,
              borderStyle: ring === 2 ? 'dashed' : 'solid'
            }}
          />
        ))}

        <svg viewBox="0 0 400 400" className="w-full h-full relative z-10 overflow-visible">
          <defs>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <linearGradient id="pulse-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="var(--snc-brass)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {nodes.map((node, i) => {
            const radius = 160;
            const x = 200 + radius * Math.cos((node.angle * Math.PI) / 180);
            const y = 200 + radius * Math.sin((node.angle * Math.PI) / 180);

            return (
              <g key={`node-${i}`}>
                <line
                  x1="200" y1="200" x2={x} y2={y}
                  stroke="rgba(184, 145, 74, 0.15)"
                  strokeWidth="1"
                />

                <motion.circle
                  r="1.5"
                  fill="var(--snc-brass)"
                  filter="url(#neon-glow)"
                  animate={{
                    cx: [x, 200],
                    cy: [y, 200],
                    opacity: [0, 1, 0],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: node.delay,
                    ease: "easeInOut"
                  }}
                />

                <motion.circle
                  cx={x}
                  cy={y}
                  r="12"
                  fill="transparent"
                  stroke="var(--snc-brass)"
                  strokeWidth="0.5"
                  strokeDasharray="4 2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />

                <motion.circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="var(--snc-navy)"
                  stroke="var(--snc-brass)"
                  strokeWidth="2"
                  whileHover={{ scale: 1.8 }}
                />

                <g style={{ pointerEvents: 'none' }}>
                  <text
                    x={x}
                    y={y + (y > 200 ? 30 : -25)}
                    textAnchor="middle"
                    fill="white"
                    style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', fontWeight: 500, letterSpacing: '0.05em' }}
                  >
                    {node.name}
                  </text>
                  <text
                    x={x}
                    y={y + (y > 200 ? 42 : -13)}
                    textAnchor="middle"
                    fill="var(--snc-brass)"
                    style={{ fontSize: '8px', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', opacity: 0.5 }}
                  >
                    {node.label}
                  </text>
                </g>
              </g>
            );
          })}

          <g className="core-group">
            {[1, 0.8, 0.6].map((scale, i) => (
              <motion.path
                key={i}
                d="M200 150 L243.3 175 L243.3 225 L200 250 L156.7 225 L156.7 175 Z"
                fill={i === 0 ? "var(--snc-navy)" : "transparent"}
                stroke="var(--snc-brass)"
                strokeWidth={2 - i * 0.5}
                initial={{ scale: 0 }}
                animate={{
                  scale: scale,
                  rotate: i * 30,
                  opacity: 1 - i * 0.2
                }}
                transition={{ duration: 1, delay: i * 0.2 }}
                filter={i === 0 ? "url(#neon-glow)" : "none"}
                transform-origin="200 200"
              />
            ))}

            <motion.g
              animate={{
                opacity: [0.6, 1, 0.6],
                scale: [0.9, 1.1, 0.9]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <circle
                cx="200"
                cy="200"
                r="32"
                fill="rgba(184, 145, 74, 0.15)"
                stroke="var(--snc-brass)"
                strokeWidth="1.5"
                filter="url(#neon-glow)"
              />
              <text
                x="200"
                y="200"
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--snc-brass)"
                style={{
                  fontFamily: 'var(--font-caslon), serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  filter: 'drop-shadow(0 0 8px rgba(184, 145, 74, 0.4))'
                }}
              >
                SNC
              </text>
            </motion.g>

            <motion.rect
              x="150"
              width="100"
              height="2"
              fill="url(#pulse-grad)"
              animate={{ y: [160, 240, 160] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          </g>

          <motion.g
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <rect x="260" y="100" width="90" height="24" rx="12" fill="rgba(43, 168, 74, 0.1)" stroke="var(--snc-green-2)" strokeWidth="1" />
            <text x="305" y="116" textAnchor="middle" fill="var(--snc-green-2)" style={{ fontSize: '9px', fontWeight: 600, fontFamily: 'JetBrains Mono' }}>SCORE_READY</text>
          </motion.g>

          <motion.g
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <rect x="50" y="280" width="90" height="24" rx="12" fill="rgba(184, 145, 74, 0.1)" stroke="var(--snc-brass)" strokeWidth="1" />
            <text x="95" y="296" textAnchor="middle" fill="var(--snc-brass)" style={{ fontSize: '9px', fontWeight: 600, fontFamily: 'JetBrains Mono' }}>AI_VALIDATED</text>
          </motion.g>
        </svg>

        <div className="absolute inset-0 font-mono text-[8px] text-white/10 uppercase tracking-widest pointer-events-none p-10 flex flex-col justify-between">
          <div className="flex justify-between">
            <span>Kernel::Decision_v4</span>
            <span>Latency::0.002ms</span>
          </div>
          <div className="flex justify-between">
            <span>Buffer::Syncing_datasets</span>
            <span>Entropy::0.001</span>
          </div>
        </div>
      </div>
    </div>
  );
}
