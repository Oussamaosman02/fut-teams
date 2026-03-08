import { Jugador, EquiposGenerados } from './types'

function totalNivel(equipo: Jugador[]): number {
  return equipo.reduce((sum, j) => sum + j.nivel, 0)
}

function contarConflictos(equipo: Jugador[]): number {
  let count = 0
  for (let i = 0; i < equipo.length; i++) {
    for (let j = i + 1; j < equipo.length; j++) {
      if (
        equipo[i].conflictos.includes(equipo[j].id) ||
        equipo[j].conflictos.includes(equipo[i].id)
      ) count++
    }
  }
  return count
}

function contarAfinidades(equipo: Jugador[]): number {
  let count = 0
  for (let i = 0; i < equipo.length; i++) {
    for (let j = i + 1; j < equipo.length; j++) {
      if (
        equipo[i].afinidades.includes(equipo[j].id) ||
        equipo[j].afinidades.includes(equipo[i].id)
      ) count++
    }
  }
  return count
}

function puntuarSolucion(equipoA: Jugador[], equipoB: Jugador[]): number {
  const desequilibrio = Math.abs(totalNivel(equipoA) - totalNivel(equipoB)) * 2
  const penalizacionConflictos = (contarConflictos(equipoA) + contarConflictos(equipoB)) * 12
  const bonusAfinidades = (contarAfinidades(equipoA) + contarAfinidades(equipoB)) * 4
  return desequilibrio + penalizacionConflictos - bonusAfinidades
}

function mezclarConSemilla<T>(arr: T[], semilla: number): T[] {
  const a = [...arr]
  let s = semilla
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const j = Math.abs(s) % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generarEquipos(
  jugadores: Jugador[],
  jugadoresPorEquipo: number,
  semilla = 0
): EquiposGenerados {
  if (jugadores.length < 2) {
    return {
      equipoA: jugadores,
      equipoB: [],
      suplentes: [],
      equilibrio: 0,
      conflictosViolados: 0,
      afinidadesHonradas: 0,
    }
  }

  const totalParaEquipos = jugadoresPorEquipo * 2

  // Agrupar por nivel y mezclar dentro de cada grupo con la semilla
  const porNivel = new Map<number, Jugador[]>()
  for (const j of jugadores) {
    if (!porNivel.has(j.nivel)) porNivel.set(j.nivel, [])
    porNivel.get(j.nivel)!.push(j)
  }

  const reordenados: Jugador[] = []
  for (const [, grupo] of [...porNivel.entries()].sort((a, b) => b[0] - a[0])) {
    reordenados.push(...mezclarConSemilla(grupo, semilla))
  }

  const jugadoresDeEquipo = reordenados.slice(0, Math.min(totalParaEquipos, reordenados.length))
  const suplentes = reordenados.slice(jugadoresDeEquipo.length)

  // Draft serpiente para distribución inicial equilibrada
  let equipoA: Jugador[] = []
  let equipoB: Jugador[] = []

  for (let i = 0; i < jugadoresDeEquipo.length; i++) {
    const grupo = Math.floor(i / 2)
    const grupoEsPar = grupo % 2 === 0
    const indiceEsPar = i % 2 === 0

    if ((grupoEsPar && indiceEsPar) || (!grupoEsPar && !indiceEsPar)) {
      equipoA.push(jugadoresDeEquipo[i])
    } else {
      equipoB.push(jugadoresDeEquipo[i])
    }
  }

  // Búsqueda local: intentar intercambios para mejorar el puntaje
  let mejorPuntaje = puntuarSolucion(equipoA, equipoB)
  let mejorado = true
  let iteraciones = 0
  const maxIter = 300

  while (mejorado && iteraciones < maxIter) {
    mejorado = false
    iteraciones++

    for (let i = 0; i < equipoA.length && !mejorado; i++) {
      for (let j = 0; j < equipoB.length && !mejorado; j++) {
        const nuevoA = [...equipoA]
        const nuevoB = [...equipoB]
        ;[nuevoA[i], nuevoB[j]] = [nuevoB[j], nuevoA[i]]

        const nuevoPuntaje = puntuarSolucion(nuevoA, nuevoB)
        if (nuevoPuntaje < mejorPuntaje) {
          equipoA = nuevoA
          equipoB = nuevoB
          mejorPuntaje = nuevoPuntaje
          mejorado = true
        }
      }
    }
  }

  return {
    equipoA,
    equipoB,
    suplentes,
    equilibrio: Math.abs(totalNivel(equipoA) - totalNivel(equipoB)),
    conflictosViolados: contarConflictos(equipoA) + contarConflictos(equipoB),
    afinidadesHonradas: contarAfinidades(equipoA) + contarAfinidades(equipoB),
  }
}
