'use client'

import { useState, useEffect } from 'react'
import { Jugador, Posicion } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Check } from 'lucide-react'

const POSICIONES: { valor: Posicion; etiqueta: string; color: string }[] = [
  { valor: 'por', etiqueta: 'POR', color: 'border-yellow-500 text-yellow-400 data-[active=true]:bg-yellow-500/20' },
  { valor: 'def', etiqueta: 'DEF', color: 'border-blue-500 text-blue-400 data-[active=true]:bg-blue-500/20' },
  { valor: 'med', etiqueta: 'MED', color: 'border-purple-500 text-purple-400 data-[active=true]:bg-purple-500/20' },
  { valor: 'del', etiqueta: 'DEL', color: 'border-red-500 text-red-400 data-[active=true]:bg-red-500/20' },
  { valor: 'cod', etiqueta: 'COD', color: 'border-neutral-500 text-neutral-400 data-[active=true]:bg-neutral-500/20' },
]

const NIVELES = [
  { valor: 1, etiqueta: 'Principiante', color: 'border-neutral-600 data-[active=true]:bg-neutral-700 data-[active=true]:border-neutral-400' },
  { valor: 2, etiqueta: 'Amateur', color: 'border-blue-800 data-[active=true]:bg-blue-900/60 data-[active=true]:border-blue-500' },
  { valor: 3, etiqueta: 'Regular', color: 'border-yellow-800 data-[active=true]:bg-yellow-900/60 data-[active=true]:border-yellow-500' },
  { valor: 4, etiqueta: 'Bueno', color: 'border-orange-800 data-[active=true]:bg-orange-900/60 data-[active=true]:border-orange-500' },
  { valor: 5, etiqueta: 'Crack', color: 'border-green-800 data-[active=true]:bg-green-900/60 data-[active=true]:border-green-500' },
]

const NIVEL_COLORES_TEXTO = ['', 'text-neutral-400', 'text-blue-400', 'text-yellow-400', 'text-orange-400', 'text-green-400']

interface Props {
  abierto: boolean
  onCerrar: () => void
  jugador: Jugador | null
  todosJugadores: Jugador[]
  onGuardar: (jugador: Jugador) => void
}

export function PlayerForm({ abierto, onCerrar, jugador, todosJugadores, onGuardar }: Props) {
  const [nombre, setNombre] = useState('')
  const [nivel, setNivel] = useState(3)
  const [posicion, setPosicion] = useState<Posicion>('cod')
  const [conflictos, setConflictos] = useState<string[]>([])
  const [afinidades, setAfinidades] = useState<string[]>([])
  const [seccionAbierta, setSeccionAbierta] = useState<'conflictos' | 'afinidades' | null>(null)

  useEffect(() => {
    if (jugador) {
      setNombre(jugador.nombre)
      setNivel(jugador.nivel)
      setPosicion(jugador.posicion)
      setConflictos(jugador.conflictos)
      setAfinidades(jugador.afinidades)
    } else {
      setNombre('')
      setNivel(3)
      setPosicion('cod')
      setConflictos([])
      setAfinidades([])
    }
    setSeccionAbierta(null)
  }, [jugador, abierto])

  const otrosJugadores = todosJugadores.filter(j => j.id !== jugador?.id)

  function toggleConflicto(id: string) {
    setConflictos(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    // Si está en afinidades, quitarlo
    setAfinidades(prev => prev.filter(x => x !== id))
  }

  function toggleAfinidad(id: string) {
    setAfinidades(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    // Si está en conflictos, quitarlo
    setConflictos(prev => prev.filter(x => x !== id))
  }

  function handleGuardar() {
    if (!nombre.trim()) return
    onGuardar({
      id: jugador?.id ?? crypto.randomUUID(),
      nombre: nombre.trim(),
      nivel,
      posicion,
      conflictos,
      afinidades,
    })
    onCerrar()
  }

  return (
    <Drawer open={abierto} onOpenChange={open => !open && onCerrar()}>
      <DrawerContent className="bg-[#0f1f12] border-t border-green-900/50 max-h-[92vh]">
        <DrawerHeader className="border-b border-green-900/30 pb-3">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-white font-display text-xl tracking-wide">
              {jugador ? 'Editar Jugador' : 'Nuevo Jugador'}
            </DrawerTitle>
            <button
              onClick={onCerrar}
              className="text-neutral-500 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 py-4 space-y-5 flex-1">
          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              Nombre
            </label>
            <Input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Nombre del jugador"
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-600 h-11 text-base focus-visible:border-green-600 focus-visible:ring-green-600/20"
              autoComplete="off"
            />
          </div>

          {/* Nivel */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              Nivel
            </label>
            <div className="grid grid-cols-5 gap-2">
              {NIVELES.map(n => (
                <button
                  key={n.valor}
                  data-active={nivel === n.valor}
                  onClick={() => setNivel(n.valor)}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2 rounded-lg border text-neutral-600 transition-all',
                    n.color
                  )}
                >
                  <span className={cn(
                    'text-xl font-display tracking-wider',
                    nivel === n.valor ? NIVEL_COLORES_TEXTO[n.valor] : 'text-neutral-500'
                  )}>
                    {n.valor}
                  </span>
                  <span className="text-[9px] leading-tight text-center px-0.5 hidden sm:block">
                    {n.etiqueta}
                  </span>
                </button>
              ))}
            </div>
            <p className={cn('text-sm font-medium', NIVEL_COLORES_TEXTO[nivel])}>
              {NIVELES[nivel - 1].etiqueta}
            </p>
          </div>

          {/* Posición */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              Posición
            </label>
            <div className="grid grid-cols-5 gap-2">
              {POSICIONES.map(p => (
                <button
                  key={p.valor}
                  data-active={posicion === p.valor}
                  onClick={() => setPosicion(p.valor)}
                  className={cn(
                    'py-2 rounded-lg border text-xs font-bold transition-all',
                    p.color,
                    posicion !== p.valor && 'border-neutral-700 text-neutral-600'
                  )}
                >
                  {p.etiqueta}
                </button>
              ))}
            </div>
          </div>

          {/* Conflictos */}
          {otrosJugadores.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => setSeccionAbierta(s => s === 'conflictos' ? null : 'conflictos')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer">
                    🚫 No juega bien con
                  </label>
                  {conflictos.length > 0 && (
                    <p className="text-xs text-red-400">
                      {conflictos.length} jugador{conflictos.length !== 1 ? 'es' : ''} seleccionado{conflictos.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <span className="text-neutral-500 text-sm">{seccionAbierta === 'conflictos' ? '▲' : '▼'}</span>
              </button>

              {seccionAbierta === 'conflictos' && (
                <div className="grid grid-cols-2 gap-2">
                  {otrosJugadores.map(j => (
                    <button
                      key={j.id}
                      onClick={() => toggleConflicto(j.id)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all text-sm',
                        conflictos.includes(j.id)
                          ? 'bg-red-900/30 border-red-700 text-red-300'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                      )}
                    >
                      <span className="truncate">{j.nombre}</span>
                      {conflictos.includes(j.id) && <X size={14} className="shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Afinidades */}
          {otrosJugadores.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => setSeccionAbierta(s => s === 'afinidades' ? null : 'afinidades')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer">
                    ✅ Juega bien con
                  </label>
                  {afinidades.length > 0 && (
                    <p className="text-xs text-green-400">
                      {afinidades.length} jugador{afinidades.length !== 1 ? 'es' : ''} seleccionado{afinidades.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <span className="text-neutral-500 text-sm">{seccionAbierta === 'afinidades' ? '▲' : '▼'}</span>
              </button>

              {seccionAbierta === 'afinidades' && (
                <div className="grid grid-cols-2 gap-2">
                  {otrosJugadores.map(j => (
                    <button
                      key={j.id}
                      onClick={() => toggleAfinidad(j.id)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all text-sm',
                        afinidades.includes(j.id)
                          ? 'bg-green-900/30 border-green-700 text-green-300'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                      )}
                    >
                      <span className="truncate">{j.nombre}</span>
                      {afinidades.includes(j.id) && <Check size={14} className="shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DrawerFooter className="border-t border-green-900/30 pt-3">
          <Button
            onClick={handleGuardar}
            disabled={!nombre.trim()}
            className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {jugador ? 'Guardar cambios' : 'Agregar jugador'} ⚽
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
