'use client'

import { useState } from 'react'
import { Jugador } from '@/lib/types'
import { cn } from '@/lib/utils'
import { PlayerForm } from './PlayerForm'
import { Pencil, Trash2, Plus, Users } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const POSICION_CONFIG = {
  por: { etiqueta: 'POR', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-700/50' },
  def: { etiqueta: 'DEF', color: 'bg-blue-500/15 text-blue-400 border-blue-700/50' },
  med: { etiqueta: 'MED', color: 'bg-purple-500/15 text-purple-400 border-purple-700/50' },
  del: { etiqueta: 'DEL', color: 'bg-red-500/15 text-red-400 border-red-700/50' },
  cod: { etiqueta: 'COD', color: 'bg-neutral-500/15 text-neutral-400 border-neutral-700/50' },
}

const NIVEL_CONFIG = [
  null,
  { color: 'bg-neutral-500', label: 'Principiante' },
  { color: 'bg-blue-500', label: 'Amateur' },
  { color: 'bg-yellow-500', label: 'Regular' },
  { color: 'bg-orange-500', label: 'Bueno' },
  { color: 'bg-green-500', label: 'Crack' },
]

function NivelDots({ nivel }: { nivel: number }) {
  const config = NIVEL_CONFIG[nivel]
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 rounded-full transition-all',
            i <= nivel ? config?.color : 'bg-neutral-800'
          )}
        />
      ))}
    </div>
  )
}

interface Props {
  jugadores: Jugador[]
  onAgregar: (j: Jugador) => void
  onEditar: (j: Jugador) => void
  onEliminar: (id: string) => void
}

export function PlayersTab({ jugadores, onAgregar, onEditar, onEliminar }: Props) {
  const [formAbierto, setFormAbierto] = useState(false)
  const [jugadorEditando, setJugadorEditando] = useState<Jugador | null>(null)
  const [jugadorAEliminar, setJugadorAEliminar] = useState<Jugador | null>(null)
  const [busqueda, setBusqueda] = useState('')

  const jugadoresFiltrados = jugadores.filter(j =>
    j.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  function abrirFormNuevo() {
    setJugadorEditando(null)
    setFormAbierto(true)
  }

  function abrirFormEditar(j: Jugador) {
    setJugadorEditando(j)
    setFormAbierto(true)
  }

  function handleGuardar(j: Jugador) {
    if (jugadorEditando) {
      onEditar(j)
    } else {
      onAgregar(j)
    }
    setFormAbierto(false)
  }

  function confirmarEliminar() {
    if (jugadorAEliminar) {
      onEliminar(jugadorAEliminar.id)
      setJugadorAEliminar(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-display text-2xl tracking-wider">JUGADORES</h2>
            <p className="text-neutral-500 text-xs mt-0.5">
              {jugadores.length} jugador{jugadores.length !== 1 ? 'es' : ''} en el plantel
            </p>
          </div>
          <button
            onClick={abrirFormNuevo}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors active:scale-95"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>

        {jugadores.length > 4 && (
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar jugador..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-green-700"
          />
        )}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {jugadoresFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
            <div className="text-5xl opacity-30">⚽</div>
            <div>
              <p className="text-neutral-500 font-medium">
                {busqueda ? 'No se encontraron jugadores' : 'No hay jugadores aún'}
              </p>
              {!busqueda && (
                <p className="text-neutral-600 text-sm mt-1">
                  Agrega jugadores para empezar a armar equipos
                </p>
              )}
            </div>
            {!busqueda && (
              <button
                onClick={abrirFormNuevo}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
              >
                <Plus size={16} />
                Agregar primer jugador
              </button>
            )}
          </div>
        ) : (
          jugadoresFiltrados.map(j => {
            const posConfig = POSICION_CONFIG[j.posicion]
            const nivelConfig = NIVEL_CONFIG[j.nivel]
            return (
              <div
                key={j.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 flex items-center gap-3 active:opacity-80 transition-opacity"
              >
                {/* Nivel visual */}
                <div className="flex flex-col items-center gap-1 shrink-0 w-8">
                  <span className={cn('text-lg font-display', {
                    'text-neutral-400': j.nivel === 1,
                    'text-blue-400': j.nivel === 2,
                    'text-yellow-400': j.nivel === 3,
                    'text-orange-400': j.nivel === 4,
                    'text-green-400': j.nivel === 5,
                  })}>
                    {j.nivel}
                  </span>
                  <NivelDots nivel={j.nivel} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-base truncate">{j.nombre}</span>
                    <span className={cn(
                      'shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border',
                      posConfig.color
                    )}>
                      {posConfig.etiqueta}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-neutral-600 text-xs">{nivelConfig?.label}</span>
                    {j.conflictos.length > 0 && (
                      <span className="text-red-500 text-xs">🚫 {j.conflictos.length}</span>
                    )}
                    {j.afinidades.length > 0 && (
                      <span className="text-green-500 text-xs">✅ {j.afinidades.length}</span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => abrirFormEditar(j)}
                    className="p-2 text-neutral-500 hover:text-blue-400 transition-colors rounded-lg hover:bg-neutral-800"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setJugadorAEliminar(j)}
                    className="p-2 text-neutral-500 hover:text-red-400 transition-colors rounded-lg hover:bg-neutral-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Form drawer */}
      <PlayerForm
        abierto={formAbierto}
        onCerrar={() => setFormAbierto(false)}
        jugador={jugadorEditando}
        todosJugadores={jugadores}
        onGuardar={handleGuardar}
      />

      {/* Dialog confirmación eliminar */}
      <AlertDialog open={!!jugadorAEliminar} onOpenChange={open => !open && setJugadorAEliminar(null)}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">¿Eliminar jugador?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              ¿Seguro que querés eliminar a <strong className="text-white">{jugadorAEliminar?.nombre}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminar}
              className="bg-red-600 hover:bg-red-500 text-white border-0"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
