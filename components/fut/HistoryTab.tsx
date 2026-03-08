'use client'

import { Jugador, PartidoGuardado } from '@/lib/types'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
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

function formatearFecha(isoString: string): string {
  const fecha = new Date(isoString)
  return fecha.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Props {
  partidos: PartidoGuardado[]
  jugadores: Jugador[]
  onEliminar: (id: string) => void
}

export function HistoryTab({ partidos, jugadores, onEliminar }: Props) {
  const [partidoAEliminar, setPartidoAEliminar] = useState<string | null>(null)

  const mapaJugadores = new Map(jugadores.map(j => [j.id, j]))

  function getNombres(ids: string[]): string[] {
    return ids.map(id => mapaJugadores.get(id)?.nombre ?? 'Jugador eliminado')
  }

  function confirmarEliminar() {
    if (partidoAEliminar) {
      onEliminar(partidoAEliminar)
      setPartidoAEliminar(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-white font-display text-2xl tracking-wider">HISTORIAL</h2>
        <p className="text-neutral-500 text-xs mt-0.5">
          {partidos.length} partido{partidos.length !== 1 ? 's' : ''} guardado{partidos.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {partidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
            <div className="text-5xl opacity-30">📋</div>
            <div>
              <p className="text-neutral-500 font-medium">No hay partidos guardados</p>
              <p className="text-neutral-600 text-sm mt-1">
                Generá y guardá un partido para verlo acá
              </p>
            </div>
          </div>
        ) : (
          partidos.map(partido => {
            const equipoA = getNombres(partido.equipoA)
            const equipoB = getNombres(partido.equipoB)
            const suplentes = getNombres(partido.suplentes)

            return (
              <div
                key={partido.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden"
              >
                {/* Header del partido */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {partido.jugadoresPorEquipo} vs {partido.jugadoresPorEquipo}
                    </p>
                    <p className="text-neutral-600 text-xs mt-0.5">{formatearFecha(partido.fecha)}</p>
                  </div>
                  <button
                    onClick={() => setPartidoAEliminar(partido.id)}
                    className="p-2 text-neutral-600 hover:text-red-400 transition-colors rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Equipos */}
                <div className="grid grid-cols-2 divide-x divide-neutral-800">
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-green-400 font-display text-xs tracking-wider">EQUIPO A</span>
                    </div>
                    {equipoA.map((nombre, i) => (
                      <p key={i} className="text-neutral-300 text-xs truncate">{nombre}</p>
                    ))}
                  </div>
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-orange-400 font-display text-xs tracking-wider">EQUIPO B</span>
                    </div>
                    {equipoB.map((nombre, i) => (
                      <p key={i} className="text-neutral-300 text-xs truncate">{nombre}</p>
                    ))}
                  </div>
                </div>

                {suplentes.length > 0 && (
                  <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950/50">
                    <p className="text-neutral-600 text-xs">
                      🪑 Suplentes: {suplentes.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <AlertDialog open={!!partidoAEliminar} onOpenChange={open => !open && setPartidoAEliminar(null)}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">¿Eliminar partido?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Esta acción no se puede deshacer.
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
