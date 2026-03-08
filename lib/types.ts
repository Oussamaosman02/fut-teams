export type Posicion = 'por' | 'def' | 'med' | 'del' | 'cod'

export interface Jugador {
  id: string
  nombre: string
  nivel: number // 1-5
  posicion: Posicion
  conflictos: string[] // IDs de jugadores con quienes no juega bien
  afinidades: string[] // IDs de jugadores con quienes juega bien
}

export interface EquiposGenerados {
  equipoA: Jugador[]
  equipoB: Jugador[]
  suplentes: Jugador[]
  equilibrio: number // diferencia absoluta de niveles totales
  conflictosViolados: number
  afinidadesHonradas: number
}

export interface PartidoGuardado {
  id: string
  fecha: string
  jugadoresPorEquipo: number
  equipoA: string[] // IDs
  equipoB: string[] // IDs
  suplentes: string[] // IDs
}

export type TabActiva = 'partido' | 'jugadores' | 'historial'
