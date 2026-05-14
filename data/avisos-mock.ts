import { Aviso, Postulante, Postulacion, EstadoPostulacion } from "@/types/avisos"

// Estados de Postulacion disponibles
export const estadosPostulacion: EstadoPostulacion[] = [
  { nombreEstadoPostulacion: "Enviado", fechaBajaEstadoPostulacion: null },
  { nombreEstadoPostulacion: "Citado", fechaBajaEstadoPostulacion: null },
  { nombreEstadoPostulacion: "Aceptado", fechaBajaEstadoPostulacion: null },
  { nombreEstadoPostulacion: "Rechazado", fechaBajaEstadoPostulacion: null },
  { nombreEstadoPostulacion: "Cancelado", fechaBajaEstadoPostulacion: null }
]

// Postulante logueado (mock del usuario en sesión)
export const postulanteMock: Postulante = {
  nroPostulante: 1,
  nombrePostulante: "Juan Pérez",
  fechaBajaPostulante: null,
  urlCVGuardado: "https://ejemplo.com/cv/juan-perez.pdf"
}

// Lista de postulaciones existentes
export let postulacionesMock: Postulacion[] = []

// Contador para generar nroPostulacion
let contadorPostulacion = 1

export const avisosMock: Aviso[] = [
  {
    nroAviso: 1001,
    nombreAviso: "Desarrollador Full Stack Senior",
    descripcionAviso: "Buscamos un desarrollador Full Stack con experiencia en React, Node.js y bases de datos SQL/NoSQL. El candidato ideal tendrá al menos 3 años de experiencia y será capaz de liderar proyectos técnicos.",
    fechaCierreAviso: "2026-06-15",
    fechaCreacionAviso: "2026-05-01",
    imagenUrlAviso: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop",
    empresa: { nombreEmpresa: "TechCorp Solutions" },
    reclutador: { nombreReclutador: "María García López" },
    carreras: [
      { nombreCarrera: "Ingeniería en Sistemas de Información" },
      { nombreCarrera: "Tecnicatura Universitaria en Programación" }
    ],
    tiposAviso: [
      {
        nombreTipoAviso: "Modalidad de trabajo",
        subTipos: [
          { nombreSubTipoAviso: "Remoto" },
          { nombreSubTipoAviso: "Híbrido" }
        ]
      },
      {
        nombreTipoAviso: "Tipo de contrato",
        subTipos: [
          { nombreSubTipoAviso: "Relación de dependencia" }
        ]
      }
    ],
    estadoAviso: { nombreEstadoAviso: "Abierto", fechaBajaEstadoAviso: null }
  },
  {
    nroAviso: 1002,
    nombreAviso: "Analista de Datos Junior",
    descripcionAviso: "Oportunidad para recién graduados interesados en análisis de datos. Se requiere conocimiento en Python, SQL y herramientas de visualización como Power BI o Tableau.",
    fechaCierreAviso: "2026-06-30",
    fechaCreacionAviso: "2026-05-10",
    imagenUrlAviso: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    empresa: { nombreEmpresa: "DataInsights Argentina" },
    reclutador: { nombreReclutador: "Carlos Rodríguez" },
    carreras: [
      { nombreCarrera: "Ingeniería en Sistemas de Información" },
      { nombreCarrera: "Ingeniería Electrónica" },
      { nombreCarrera: "Tecnicatura Universitaria en Programación" }
    ],
    tiposAviso: [
      {
        nombreTipoAviso: "Modalidad de trabajo",
        subTipos: [
          { nombreSubTipoAviso: "Remoto" }
        ]
      },
      {
        nombreTipoAviso: "Tipo de contrato",
        subTipos: [
          { nombreSubTipoAviso: "Pasantía" }
        ]
      },
      {
        nombreTipoAviso: "Experiencia requerida",
        subTipos: [
          { nombreSubTipoAviso: "Sin experiencia" },
          { nombreSubTipoAviso: "Primer empleo" }
        ]
      }
    ],
    estadoAviso: { nombreEstadoAviso: "Abierto", fechaBajaEstadoAviso: null }
  },
  {
    nroAviso: 1003,
    nombreAviso: "Desarrollador de Videojuegos",
    descripcionAviso: "Empresa líder en desarrollo de videojuegos busca programador con experiencia en Unity o Unreal Engine. Portfolio demostrable y conocimientos de C# o C++.",
    fechaCierreAviso: "2026-07-01",
    fechaCreacionAviso: "2026-05-05",
    imagenUrlAviso: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop",
    empresa: { nombreEmpresa: "GameDev Studio" },
    reclutador: { nombreReclutador: "Ana Martínez" },
    carreras: [
      { nombreCarrera: "Tecnicatura Universitaria en Desarrollo y Producción de Videojuegos" },
      { nombreCarrera: "Ingeniería en Sistemas de Información" },
      { nombreCarrera: "Tecnicatura Universitaria en Programación" }
    ],
    tiposAviso: [
      {
        nombreTipoAviso: "Modalidad de trabajo",
        subTipos: [
          { nombreSubTipoAviso: "Híbrido" }
        ]
      },
      {
        nombreTipoAviso: "Tipo de contrato",
        subTipos: [
          { nombreSubTipoAviso: "Contrato temporal" }
        ]
      },
      {
        nombreTipoAviso: "Duración",
        subTipos: [
          { nombreSubTipoAviso: "6 meses" },
          { nombreSubTipoAviso: "Renovable" }
        ]
      }
    ],
    estadoAviso: { nombreEstadoAviso: "Abierto", fechaBajaEstadoAviso: null }
  },
  {
    nroAviso: 1004,
    nombreAviso: "Ingeniero DevOps / Cloud",
    descripcionAviso: "Se busca ingeniero DevOps con experiencia en AWS, Docker, Kubernetes y CI/CD. Será responsable de la infraestructura cloud y automatización de despliegues.",
    fechaCierreAviso: "2026-06-20",
    fechaCreacionAviso: "2026-05-08",
    imagenUrlAviso: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=400&fit=crop",
    empresa: { nombreEmpresa: "CloudNet Systems" },
    reclutador: { nombreReclutador: "Roberto Fernández" },
    carreras: [
      { nombreCarrera: "Ingeniería en Sistemas de Información" },
      { nombreCarrera: "Ingeniería en Telecomunicaciones" }
    ],
    tiposAviso: [
      {
        nombreTipoAviso: "Modalidad de trabajo",
        subTipos: [
          { nombreSubTipoAviso: "Remoto" }
        ]
      },
      {
        nombreTipoAviso: "Tipo de contrato",
        subTipos: [
          { nombreSubTipoAviso: "Relación de dependencia" }
        ]
      },
      {
        nombreTipoAviso: "Alcance",
        subTipos: [
          { nombreSubTipoAviso: "Internacional" }
        ]
      }
    ],
    estadoAviso: { nombreEstadoAviso: "Abierto", fechaBajaEstadoAviso: null }
  },
  {
    nroAviso: 1005,
    nombreAviso: "Técnico en Higiene y Seguridad Industrial",
    descripcionAviso: "Importante empresa del sector industrial busca técnico en higiene y seguridad para supervisar y asegurar el cumplimiento de normas de seguridad en planta.",
    fechaCierreAviso: "2026-07-15",
    fechaCreacionAviso: "2026-05-12",
    imagenUrlAviso: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop",
    empresa: { nombreEmpresa: "Industrias Mendoza S.A." },
    reclutador: { nombreReclutador: "Laura Sánchez" },
    carreras: [
      { nombreCarrera: "Tecnicatura Universitaria en Higiene y Seguridad" },
      { nombreCarrera: "Ingeniería Electromecánica" },
      { nombreCarrera: "Ingeniería Química" }
    ],
    tiposAviso: [
      {
        nombreTipoAviso: "Modalidad de trabajo",
        subTipos: [
          { nombreSubTipoAviso: "Presencial" }
        ]
      },
      {
        nombreTipoAviso: "Tipo de contrato",
        subTipos: [
          { nombreSubTipoAviso: "Relación de dependencia" }
        ]
      },
      {
        nombreTipoAviso: "Experiencia requerida",
        subTipos: [
          { nombreSubTipoAviso: "1-2 años" }
        ]
      }
    ],
    estadoAviso: { nombreEstadoAviso: "Abierto", fechaBajaEstadoAviso: null }
  },
  {
    nroAviso: 1006,
    nombreAviso: "Pasante en Gestión Hotelera",
    descripcionAviso: "Cadena hotelera internacional ofrece pasantía para estudiantes de hotelería. Rotación por diferentes áreas: recepción, eventos, administración y marketing.",
    fechaCierreAviso: "2026-06-25",
    fechaCreacionAviso: "2026-05-13",
    imagenUrlAviso: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop",
    empresa: { nombreEmpresa: "Grand Hotel Mendoza" },
    reclutador: { nombreReclutador: "Patricia Molina" },
    carreras: [
      { nombreCarrera: "Tecnicatura Universitaria en Gestión de Empresas Hoteleras" },
      { nombreCarrera: "Tecnicatura Universitaria en Gestión de Empresas Turísticas" }
    ],
    tiposAviso: [
      {
        nombreTipoAviso: "Modalidad de trabajo",
        subTipos: [
          { nombreSubTipoAviso: "Presencial" }
        ]
      },
      {
        nombreTipoAviso: "Tipo de contrato",
        subTipos: [
          { nombreSubTipoAviso: "Pasantía" }
        ]
      },
      {
        nombreTipoAviso: "Duración",
        subTipos: [
          { nombreSubTipoAviso: "3 meses" },
          { nombreSubTipoAviso: "Renovable" }
        ]
      },
      {
        nombreTipoAviso: "Experiencia requerida",
        subTipos: [
          { nombreSubTipoAviso: "Sin experiencia" }
        ]
      }
    ],
    estadoAviso: { nombreEstadoAviso: "Abierto", fechaBajaEstadoAviso: null }
  }
]

// Tipo de resultado para verificar antes de postular
export type ResultadoVerificacion = 
  | { puedePostular: true; mensaje: string; urlCVGuardado: string }
  | { puedePostular: false; mensaje: string; requiereCV?: boolean }

// Tipo de resultado para la función postular
export type ResultadoPostulacion = 
  | { exito: true; mensaje: string; postulacion: Postulacion }
  | { exito: false; mensaje: string }

// Función para verificar si puede postularse (Pasos 2-3 del CU)
export function verificarPostulacion(nroAvisoV: number): ResultadoVerificacion {
  // Paso 2: Verificar que el Usuario logueado exista
  // 2.1 Buscar instancias de Postulante con fechaBajaPostulante igual a vacio
  // 2.2 Comprobar que instancia de Postulante sea igual a instancia de Postulante (instanciado)
  if (postulanteMock.fechaBajaPostulante !== null) {
    // C.A 1: No existe el usuario
    return { puedePostular: false, mensaje: "El usuario no se ha encontrado en el sistema" }
  }
  const postulanteSeleccionado = postulanteMock

  // Paso 3: Iniciar proceso de postulación a un aviso
  // 3.1 Buscar instancia de EstadoAviso con nombreEstadoAviso igual a "Abierto" y fechaBajaEstadoAviso igual a vacio
  const estadoAvisoAbierto = { nombreEstadoAviso: "Abierto", fechaBajaEstadoAviso: null }
  
  // 3.2 Buscar instancia de EstadoPostulacion con nombreEstadoPostulacion igual a "Citado"
  const estadoCitado = estadosPostulacion.find(e => e.nombreEstadoPostulacion === "Citado" && e.fechaBajaEstadoPostulacion === null)
  
  // 3.3 Buscar instancia de EstadoPostulacion con nombreEstadoPostulacion igual a "Aceptado"
  const estadoAceptado = estadosPostulacion.find(e => e.nombreEstadoPostulacion === "Aceptado" && e.fechaBajaEstadoPostulacion === null)
  
  // 3.4 Buscar instancia de EstadoPostulacion con nombreEstadoPostulacion igual a "Enviado"
  const estadoEnviado = estadosPostulacion.find(e => e.nombreEstadoPostulacion === "Enviado" && e.fechaBajaEstadoPostulacion === null)
  
  if (!estadoEnviado || !estadoCitado || !estadoAceptado) {
    return { puedePostular: false, mensaje: "Error interno del sistema" }
  }

  // 3.5 Buscar instancia de Aviso con nroAviso igual a nroAvisoV y relacionado a instancia de EstadoAviso actual
  const avisoBuscado = avisosMock.find(a => 
    a.nroAviso === nroAvisoV && 
    a.estadoAviso.nombreEstadoAviso === estadoAvisoAbierto.nombreEstadoAviso &&
    a.estadoAviso.fechaBajaEstadoAviso === null
  )
  
  if (!avisoBuscado) {
    // C.A 2: Aviso no disponible
    return { puedePostular: false, mensaje: "El Aviso no esta disponible" }
  }

  // 3.6 y 3.7 Leer de Postulante: urlCVGuardado
  const urlCVGuardado = postulanteSeleccionado.urlCVGuardado

  // 3.8 Comprobar que urlCVGuardado sea igual a vacio
  if (!urlCVGuardado) {
    // 3.8.1 Mostrar mensaje y 3.8.2 Ir a CU SubirCV
    return { 
      puedePostular: false, 
      mensaje: "No se ha encontrado un CV en su perfil cargue uno para continuar",
      requiereCV: true
    }
  }

  // 3.9 Buscar instancia de Postulacion con relacionado a instancia de Postulante y Aviso
  const postulacionExistente = postulacionesMock.find(p => 
    p.postulante.nroPostulante === postulanteSeleccionado.nroPostulante &&
    p.aviso.nroAviso === avisoBuscado.nroAviso
  )

  // C.A 3: Postulacion ocupada
  if (postulacionExistente) {
    // 4.1-4.3 Verificar si el estado es Enviado, Citado o Aceptado
    const estadoActual = postulacionExistente.estadoPostulacion.nombreEstadoPostulacion
    if (estadoActual === "Enviado" || estadoActual === "Citado" || estadoActual === "Aceptado") {
      return { puedePostular: false, mensaje: "Ya se encuentra postulado, verifique en la seccion de postulaciones" }
    }
    // 4.4 SINO: puede volver a postularse (postulación cancelada anteriormente)
  }

  // 3.10 Mostrar mensaje para ingresar datos
  return { 
    puedePostular: true, 
    mensaje: "Ingrese los siguientes datos para postularse:",
    urlCVGuardado: urlCVGuardado
  }
}

// Función para enviar la postulación (Pasos 4-6 del CU)
export function enviarPostulacion(
  nroAvisoV: number, 
  descripcionPostulacionV: string
): ResultadoPostulacion {
  const postulanteSeleccionado = postulanteMock
  const urlCVGuardado = postulanteSeleccionado.urlCVGuardado!
  
  const estadoEnviado = estadosPostulacion.find(e => e.nombreEstadoPostulacion === "Enviado" && e.fechaBajaEstadoPostulacion === null)!
  
  const avisoBuscado = avisosMock.find(a => a.nroAviso === nroAvisoV)!

  // Paso 5: Enviar proceso de postulacion
  const fechaActual = new Date().toISOString().split('T')[0]
  
  // 5.1 Crear instancia de PostulacionEstado
  const postulacionEstadoCreado = {
    contadorPostulacionEstado: 1,
    fechaInicioVigenciaEP: fechaActual,
    fechaFinVigenciaEP: null,
    estadoPostulacion: estadoEnviado
  }

  // 5.2 Crear instancia de Postulacion
  const nuevaPostulacion: Postulacion = {
    nroPostulacion: contadorPostulacion++,
    fechaPostulacion: fechaActual,
    descripcionPostulacion: descripcionPostulacionV,
    urlCVPostulacion: urlCVGuardado,
    estadoPostulacion: estadoEnviado,
    postulacionEstado: postulacionEstadoCreado,
    postulante: postulanteSeleccionado,
    aviso: avisoBuscado
  }

  // Paso 6: Guardar cambios
  postulacionesMock.push(nuevaPostulacion)

  // 5.3 Mostrar mensaje
  return { exito: true, mensaje: "Postulacion enviada!", postulacion: nuevaPostulacion }
}
