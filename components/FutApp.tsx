'use client'

import { useState, useEffect } from 'react'
import { Jugador, PartidoGuardado, TabActiva } from '@/lib/types'
import { getJugadores, guardarJugadores, getPartidos, guardarPartidos } from '@/lib/storage'
import { PlayersTab } from './fut/PlayersTab'
import { MatchTab } from './fut/MatchTab'
import { HistoryTab } from './fut/HistoryTab'
import { cn } from '@/lib/utils'

export function FutApp() {
  const [tab, setTab] = useState<TabActiva>('partido')
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [partidos, setPartidos] = useState<PartidoGuardado[]>([])

  useEffect(() => {
    setJugadores(getJugadores())
    setPartidos(getPartidos())
  }, [])

  function agregarJugador(j: Jugador) {
    const nuevos = [...jugadores, j]
    setJugadores(nuevos)
    guardarJugadores(nuevos)
  }

  function editarJugador(actualizado: Jugador) {
    const nuevos = jugadores.map(j => j.id === actualizado.id ? actualizado : j)
    setJugadores(nuevos)
    guardarJugadores(nuevos)
  }

  function eliminarJugador(id: string) {
    // Limpiar referencias en otros jugadores
    const nuevos = jugadores
      .filter(j => j.id !== id)
      .map(j => ({
        ...j,
        conflictos: j.conflictos.filter(cId => cId !== id),
        afinidades: j.afinidades.filter(aId => aId !== id),
      }))
    setJugadores(nuevos)
    guardarJugadores(nuevos)
  }

  function guardarPartido(
    jugadoresPorEquipo: number,
    equipoA: string[],
    equipoB: string[],
    suplentes: string[]
  ) {
    const nuevo: PartidoGuardado = {
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      jugadoresPorEquipo,
      equipoA,
      equipoB,
      suplentes,
    }
    const nuevos = [nuevo, ...partidos].slice(0, 50)
    setPartidos(nuevos)
    guardarPartidos(nuevos)
  }

  function eliminarPartido(id: string) {
    const nuevos = partidos.filter(p => p.id !== id)
    setPartidos(nuevos)
    guardarPartidos(nuevos)
  }

  const tabs: { id: TabActiva; emoji: string; label: string }[] = [
    { id: 'partido', emoji: '⚽', label: 'Partido' },
    { id: 'jugadores', emoji: '👟', label: 'Jugadores' },
    { id: 'historial', emoji: '📋', label: 'Historial' },
  ]

  return (
    <div className="min-h-dvh bg-neutral-950 flex items-start justify-center">
    <div className="flex flex-col h-dvh w-full max-w-md bg-[#080f09] text-white overflow-hidden relative shadow-2xl shadow-black/50">
      {/* Header */}
      <header className="shrink-0 px-4 pt-safe-top bg-[#080f09] border-b border-green-950/50">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-base">
              ⚽
            </div>
            <span className="font-display text-xl tracking-widest text-white">FUTTEAMS</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <span>{jugadores.length} jugadores</span>
          </div>
        </div>

        {/* Pitch lines decoration */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-green-800/30 to-transparent" />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <div className={cn('h-full', tab !== 'partido' && 'hidden')}>
          <MatchTab jugadores={jugadores} onGuardarPartido={guardarPartido} />
        </div>
        <div className={cn('h-full', tab !== 'jugadores' && 'hidden')}>
          <PlayersTab
            jugadores={jugadores}
            onAgregar={agregarJugador}
            onEditar={editarJugador}
            onEliminar={eliminarJugador}
          />
        </div>
        <div className={cn('h-full', tab !== 'historial' && 'hidden')}>
          <HistoryTab
            partidos={partidos}
            jugadores={jugadores}
            onEliminar={eliminarPartido}
          />
        </div>
      </main>

      {/* Bottom navigation */}
      <nav className="shrink-0 bg-[#0a1509] border-t border-green-950/50 pb-safe-bottom">
        <div className="flex">
          {tabs.map(t => {
            const isActive = tab === t.id
            const badge = t.id === 'historial' && partidos.length > 0 ? partidos.length : null
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-3 transition-all relative',
                  isActive ? 'text-green-400' : 'text-neutral-600'
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-green-500 rounded-full" />
                )}
                <span className="text-xl">{t.emoji}</span>
                <span className={cn(
                  'text-[10px] font-semibold tracking-wide',
                  isActive ? 'text-green-400' : 'text-neutral-600'
                )}>
                  {t.label.toUpperCase()}
                </span>
                {badge && (
                  <span className="absolute top-2 right-1/4 bg-green-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
    </div>
  )
}
