import { Jugador, PartidoGuardado } from './types'

const JUGADORES_KEY = 'fut-jugadores-v1'
const PARTIDOS_KEY = 'fut-partidos-v1'

export function getJugadores(): Jugador[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(JUGADORES_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function guardarJugadores(jugadores: Jugador[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(JUGADORES_KEY, JSON.stringify(jugadores))
}

export function getPartidos(): PartidoGuardado[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(PARTIDOS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function guardarPartidos(partidos: PartidoGuardado[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PARTIDOS_KEY, JSON.stringify(partidos))
}
