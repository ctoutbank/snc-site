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
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A1628',
        overflow: 'hidden',
        minHeight: 600,
      }}
    >
      {/* Background gradients */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '50%',
            height: '50%',
            background: 'var(--snc-green-2)',
            opacity: 0.03,
            filter: 'blur(120px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '50%',
            height: '50%',
            background: 'var(--snc-brass)',
            opacity: 0.05,
            filter: 'blur(120px)',
          }}
        />
      </div>

      {/* Dot grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          backgroundImage: `radial-gradient(var(--snc-brass) 0.5px, transparent 0.5px)`,
          backgroundSize: '30px 30px',
        }}
      />

      {/* Core */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 600,
          aspectRatio: '1 / 1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Animated rings */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [0.8, 1.1, 0.8],
              rotate: ring % 2 === 0 ? 360 : -360,
            }}
            transition={{
              duration: 10 + ring * 5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${40 + ring * 20}%`,
              height: `${40 + ring * 20}%`,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderStyle: ring === 2 ? 'dashed' : 'solid',
              borderRadius: '50%',
            }}
          />
        ))}

        <svg
          viewBox="0 0 400 400"
          style={{ width: '100%', height: '100%', position: 'relative', zIndex: 10, overflow: 'visible' }}
        >
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
                <line x1="200" y1="200" x2={x} y2={y} stroke="rgba(184, 145, 74, 0.15)" strokeWidth="1" />

                <motion.circle
                  r="1.5"
                  fill="var(--snc-brass)"
                  filter="url(#neon-glow)"
                  animate={{
                    cx: [x, 200],
                    cy: [y, 200],
                    opacity: [0, 1, 0],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: node.delay,
                    ease: 'easeInOut',
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
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
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

          <g>
            {[1, 0.8, 0.6].map((scale, i) => (
              <motion.path
                key={i}
                d="M200 150 L243.3 175 L243.3 225 L200 250 L156.7 225 L156.7 175 Z"
                fill={i === 0 ? 'var(--snc-navy)' : 'transparent'}
                stroke="var(--snc-brass)"
                strokeWidth={2 - i * 0.5}
                initial={{ scale: 0 }}
                animate={{
                  scale: scale,
                  rotate: i * 30,
                  opacity: 1 - i * 0.2,
                }}
                transition={{ duration: 1, delay: i * 0.2 }}
                filter={i === 0 ? 'url(#neon-glow)' : 'none'}
                style={{ transformOrigin: '200px 200px' }}
              />
            ))}

            <motion.g
              animate={{
                opacity: [0.6, 1, 0.6],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ transformOrigin: '200px 200px' }}
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
                  fontFamily: "'Libre Caslon Text', serif",
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  filter: 'drop-shadow(0 0 8px rgba(184, 145, 74, 0.4))',
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
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          </g>

          <motion.g animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <rect
              x="260"
              y="100"
              width="90"
              height="24"
              rx="12"
              fill="rgba(43, 168, 74, 0.1)"
              stroke="var(--snc-green-2)"
              strokeWidth="1"
            />
            <text
              x="305"
              y="116"
              textAnchor="middle"
              fill="var(--snc-green-2)"
              style={{ fontSize: '9px', fontWeight: 600, fontFamily: 'JetBrains Mono' }}
            >
              SCORE_READY
            </text>
          </motion.g>

          <motion.g animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }}>
            <rect
              x="50"
              y="280"
              width="90"
              height="24"
              rx="12"
              fill="rgba(184, 145, 74, 0.1)"
              stroke="var(--snc-brass)"
              strokeWidth="1"
            />
            <text
              x="95"
              y="296"
              textAnchor="middle"
              fill="var(--snc-brass)"
              style={{ fontSize: '9px', fontWeight: 600, fontFamily: 'JetBrains Mono' }}
            >
              AI_VALIDATED
            </text>
          </motion.g>
        </svg>

        {/* Ambient labels (corner overlays) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 8,
            color: 'rgba(255, 255, 255, 0.1)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            pointerEvents: 'none',
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Kernel::Decision_v4</span>
            <span>Latency::0.002ms</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Buffer::Syncing_datasets</span>
            <span>Entropy::0.001</span>
          </div>
        </div>
      </div>
    </div>
  );
}
