'use client'

import { useState, useCallback } from 'react'
import { Jugador, EquiposGenerados } from '@/lib/types'
import { generarEquipos } from '@/lib/team-generator'
import { cn } from '@/lib/utils'
import { Check, Minus, Plus, RefreshCw, Save, ChevronDown, ChevronUp } from 'lucide-react'

const POSICION_ETIQUETA = {
  por: 'POR', def: 'DEF', med: 'MED', del: 'DEL', cod: 'COD'
}

const NIVEL_COLOR_TEXT = [
  '', 'text-neutral-400', 'text-blue-400', 'text-yellow-400', 'text-orange-400', 'text-green-400'
]

function NivelDots({ nivel, pequeno = false }: { nivel: number, pequeno?: boolean }) {
  const colores = ['', 'bg-neutral-500', 'bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-green-500']
  const size = pequeno ? 'w-1.5 h-1.5' : 'w-2 h-2'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={cn('rounded-full', size, i <= nivel ? colores[nivel] : 'bg-neutral-800')} />
      ))}
    </div>
  )
}

function JugadorFila({ jugador, seleccionado, onToggle }: {
  jugador: Jugador
  seleccionado: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all active:scale-[0.98] text-left',
        seleccionado
          ? 'bg-green-900/30 border-green-700/60'
          : 'bg-neutral-900 border-neutral-800'
      )}
    >
      {/* Checkbox */}
      <div className={cn(
        'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
        seleccionado ? 'bg-green-600 border-green-600' : 'border-neutral-700'
      )}>
        {seleccionado && <Check size={12} className="text-white" />}
      </div>

      {/* Nivel */}
      <div className="flex flex-col items-center gap-0.5 shrink-0 w-7">
        <span className={cn('text-sm font-display', NIVEL_COLOR_TEXT[jugador.nivel])}>
          {jugador.nivel}
        </span>
        <NivelDots nivel={jugador.nivel} pequeno />
      </div>

      {/* Nombre */}
      <span className={cn(
        'flex-1 text-sm font-medium truncate',
        seleccionado ? 'text-white' : 'text-neutral-300'
      )}>
        {jugador.nombre}
      </span>

      {/* Posición */}
      <span className="text-[10px] font-bold text-neutral-600 shrink-0">
        {POSICION_ETIQUETA[jugador.posicion]}
      </span>
    </button>
  )
}

function EquipoCard({ nombre, jugadores, color }: {
  nombre: string
  jugadores: Jugador[]
  color: 'verde' | 'naranja'
}) {
  const totalNivel = jugadores.reduce((s, j) => s + j.nivel, 0)
  const esVerde = color === 'verde'

  return (
    <div className={cn(
      'rounded-2xl border p-4 space-y-3',
      esVerde
        ? 'bg-green-950/40 border-green-800/50'
        : 'bg-orange-950/40 border-orange-800/50'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-3 h-3 rounded-full',
            esVerde ? 'bg-green-500' : 'bg-orange-500'
          )} />
          <span className={cn(
            'font-display text-lg tracking-wider',
            esVerde ? 'text-green-400' : 'text-orange-400'
          )}>
            {nombre}
          </span>
        </div>
        <div className={cn(
          'text-xs font-semibold px-2 py-1 rounded-full',
          esVerde ? 'bg-green-900/60 text-green-300' : 'bg-orange-900/60 text-orange-300'
        )}>
          {totalNivel} pts
        </div>
      </div>

      <div className="space-y-1.5">
        {jugadores.map((j, idx) => (
          <div key={j.id} className="flex items-center gap-2.5">
            <span className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
              esVerde ? 'bg-green-900 text-green-300' : 'bg-orange-900 text-orange-300'
            )}>
              {idx + 1}
            </span>
            <span className="text-white text-sm font-medium flex-1 truncate">{j.nombre}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <NivelDots nivel={j.nivel} pequeno />
              <span className="text-[10px] text-neutral-600 font-bold">
                {POSICION_ETIQUETA[j.posicion]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  jugadores: Jugador[]
  onGuardarPartido: (jugadoresPorEquipo: number, equipoA: string[], equipoB: string[], suplentes: string[]) => void
}

export function MatchTab({ jugadores, onGuardarPartido }: Props) {
  const [jugadoresPorEquipo, setJugadoresPorEquipo] = useState(5)
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [equipos, setEquipos] = useState<EquiposGenerados | null>(null)
  const [semilla, setSemilla] = useState(0)
  const [guardado, setGuardado] = useState(false)
  const [mostrarSeleccion, setMostrarSeleccion] = useState(true)

  const jugadoresOrdenados = [...jugadores].sort((a, b) => b.nivel - a.nivel)
  const cantSeleccionados = seleccionados.size
  const necesarios = jugadoresPorEquipo * 2

  function toggleJugador(id: string) {
    setSeleccionados(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
    setEquipos(null)
    setGuardado(false)
  }

  function seleccionarTodos() {
    setSeleccionados(new Set(jugadores.map(j => j.id)))
    setEquipos(null)
    setGuardado(false)
  }

  function limpiarSeleccion() {
    setSeleccionados(new Set())
    setEquipos(null)
    setGuardado(false)
  }

  function handleGenerar(nuevaSemilla = semilla) {
    const seleccionadosArr = jugadores.filter(j => seleccionados.has(j.id))
    if (seleccionadosArr.length < 2) return
    const resultado = generarEquipos(seleccionadosArr, jugadoresPorEquipo, nuevaSemilla)
    setEquipos(resultado)
    setGuardado(false)
    setMostrarSeleccion(false)
  }

  function handleRegerar() {
    const nuevaSemilla = semilla + 1
    setSemilla(nuevaSemilla)
    handleGenerar(nuevaSemilla)
  }

  function handleGuardar() {
    if (!equipos) return
    onGuardarPartido(
      jugadoresPorEquipo,
      equipos.equipoA.map(j => j.id),
      equipos.equipoB.map(j => j.id),
      equipos.suplentes.map(j => j.id)
    )
    setGuardado(true)
  }

  const puedeGenerar = cantSeleccionados >= 2

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-white font-display text-2xl tracking-wider">ARMAR PARTIDO</h2>
        <p className="text-neutral-500 text-xs mt-0.5">Seleccioná jugadores y generá los equipos</p>
      </div>

      <div className="px-4 pb-24 space-y-4">
        {/* Config jugadores por equipo */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
            Jugadores por equipo
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setJugadoresPorEquipo(p => Math.max(1, p - 1))}
              className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <Minus size={18} />
            </button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-display text-green-400">{jugadoresPorEquipo}</span>
              <p className="text-neutral-600 text-xs mt-1">{jugadoresPorEquipo} vs {jugadoresPorEquipo}</p>
            </div>
            <button
              onClick={() => setJugadoresPorEquipo(p => Math.min(11, p + 1))}
              className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <Plus size={18} />
            </button>
          </div>
          <p className="text-center text-neutral-600 text-xs mt-2">
            Necesitás mínimo {necesarios} jugadores seleccionados
          </p>
        </div>

        {/* Selección de jugadores */}
        {jugadores.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-2">
            <div className="text-4xl opacity-30">👥</div>
            <p className="text-neutral-500 text-sm">No hay jugadores en el plantel.</p>
            <p className="text-neutral-600 text-xs">Primero agregá jugadores en la pestaña Jugadores.</p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setMostrarSeleccion(p => !p)}
              className="w-full flex items-center justify-between px-4 py-3 border-b border-neutral-800"
            >
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                  Seleccionar jugadores
                </p>
                <p className={cn(
                  'text-sm font-semibold mt-0.5',
                  cantSeleccionados >= necesarios ? 'text-green-400' : 'text-neutral-300'
                )}>
                  {cantSeleccionados} de {jugadores.length} seleccionados
                  {cantSeleccionados >= necesarios && ' ✓'}
                </p>
              </div>
              {mostrarSeleccion ? <ChevronUp size={18} className="text-neutral-500" /> : <ChevronDown size={18} className="text-neutral-500" />}
            </button>

            {mostrarSeleccion && (
              <>
                <div className="flex gap-2 px-4 py-2.5 border-b border-neutral-800">
                  <button
                    onClick={seleccionarTodos}
                    className="flex-1 text-xs font-semibold text-green-400 py-1.5 rounded-lg bg-green-900/20 border border-green-900/40"
                  >
                    Todos
                  </button>
                  <button
                    onClick={limpiarSeleccion}
                    className="flex-1 text-xs font-semibold text-neutral-400 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700"
                  >
                    Limpiar
                  </button>
                </div>

                <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
                  {jugadoresOrdenados.map(j => (
                    <JugadorFila
                      key={j.id}
                      jugador={j}
                      seleccionado={seleccionados.has(j.id)}
                      onToggle={() => toggleJugador(j.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Botón generar */}
        {jugadores.length > 0 && (
          <button
            onClick={() => { setSemilla(0); handleGenerar(0) }}
            disabled={!puedeGenerar}
            className={cn(
              'w-full py-4 rounded-2xl font-display text-xl tracking-widest transition-all active:scale-[0.97]',
              puedeGenerar
                ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/30'
                : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
            )}
          >
            {puedeGenerar ? '⚽ GENERAR EQUIPOS' : `Seleccioná ${Math.max(0, 2 - cantSeleccionados)} jugador${2 - cantSeleccionados !== 1 ? 'es' : ''} más`}
          </button>
        )}

        {/* Resultados */}
        {equipos && (
          <div className="space-y-4">
            {/* Stats del partido */}
            <div className="flex gap-2">
              <div className={cn(
                'flex-1 rounded-xl p-2.5 text-center border',
                equipos.equilibrio === 0
                  ? 'bg-green-900/20 border-green-800/50'
                  : equipos.equilibrio <= 2
                  ? 'bg-yellow-900/20 border-yellow-800/50'
                  : 'bg-orange-900/20 border-orange-800/50'
              )}>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Equilibrio</p>
                <p className={cn(
                  'text-lg font-display',
                  equipos.equilibrio === 0 ? 'text-green-400' : equipos.equilibrio <= 2 ? 'text-yellow-400' : 'text-orange-400'
                )}>
                  {equipos.equilibrio === 0 ? 'PERFECTO' : `±${equipos.equilibrio}`}
                </p>
              </div>
              {equipos.conflictosViolados > 0 && (
                <div className="flex-1 rounded-xl p-2.5 text-center border bg-red-900/20 border-red-800/50">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Conflictos</p>
                  <p className="text-lg font-display text-red-400">🚫 {equipos.conflictosViolados}</p>
                </div>
              )}
              {equipos.afinidadesHonradas > 0 && (
                <div className="flex-1 rounded-xl p-2.5 text-center border bg-green-900/20 border-green-800/50">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Afinidades</p>
                  <p className="text-lg font-display text-green-400">✅ {equipos.afinidadesHonradas}</p>
                </div>
              )}
            </div>

            {/* Equipos */}
            <EquipoCard nombre="EQUIPO A" jugadores={equipos.equipoA} color="verde" />

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-neutral-800" />
              <span className="text-neutral-600 font-display text-sm tracking-wider">VS</span>
              <div className="flex-1 h-px bg-neutral-800" />
            </div>

            <EquipoCard nombre="EQUIPO B" jugadores={equipos.equipoB} color="naranja" />

            {/* Suplentes */}
            {equipos.suplentes.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2">
                  🪑 Suplentes
                </p>
                <div className="space-y-1.5">
                  {equipos.suplentes.map(j => (
                    <div key={j.id} className="flex items-center gap-2 text-sm text-neutral-400">
                      <NivelDots nivel={j.nivel} pequeno />
                      <span>{j.nombre}</span>
                      <span className="text-neutral-700 text-xs">{POSICION_ETIQUETA[j.posicion]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRegerar}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-neutral-700 text-neutral-300 font-semibold text-sm bg-neutral-900 active:scale-95 transition-all"
              >
                <RefreshCw size={16} />
                Regenerar
              </button>
              <button
                onClick={handleGuardar}
                disabled={guardado}
                className={cn(
                  'flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95',
                  guardado
                    ? 'bg-green-900/40 border border-green-800/50 text-green-400 cursor-default'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                )}
              >
                <Save size={16} />
                {guardado ? '¡Guardado!' : 'Guardar partido'}
              </button>
            </div>

            {equipos.conflictosViolados > 0 && (
              <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-3 text-xs text-red-400">
                ⚠️ Hay {equipos.conflictosViolados} conflicto{equipos.conflictosViolados !== 1 ? 's' : ''} en los equipos generados. Probá regenerar para obtener una mejor distribución.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
