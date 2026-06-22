"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { avisosMock, verificarPostulacion, enviarPostulacion, postulanteMock } from "@/data/avisos-mock"
import { AvisoCard } from "@/components/aviso-card"
import { AvisoDetalle } from "@/components/aviso-detalle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Bell, User, LogOut, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Image from "next/image"

type Vista = "lista" | "detalle" | "salir" | "formulario_postulacion" | "resultado_postulacion"
const SESSION_KEY = "pala-auth-session"

export default function VerAvisosPage() {
  const router = useRouter()
  const [vista, setVista] = useState<Vista>("lista")
  const [avisoSeleccionado, setAvisoSeleccionado] = useState<number | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [postulacionExitosa, setPostulacionExitosa] = useState<boolean>(false)
  const [requiereCV, setRequiereCV] = useState<boolean>(false)
  const [descripcionPostulacion, setDescripcionPostulacion] = useState<string>("")
  const [urlCVGuardado, setUrlCVGuardado] = useState<string>("")

  // La home de la maqueta queda publica para demo.
  const usuarioLogueado = postulanteMock.fechaBajaPostulante === null

  if (!usuarioLogueado) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              El usuario no se ha encontrado en el sistema
            </AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  const handleSeleccionarAviso = (nroAviso: number) => {
    setAvisoSeleccionado(nroAviso)
    setVista("detalle")
    setMensaje(null)
  }

  const handleRegresar = () => {
    setVista("lista")
    setAvisoSeleccionado(null)
    setMensaje(null)
    setDescripcionPostulacion("")
    setRequiereCV(false)
  }

  const handleRegresarADetalle = () => {
    setVista("detalle")
    setMensaje(null)
    setDescripcionPostulacion("")
  }

  // Paso 3: Iniciar proceso de postulacion - verificar y mostrar formulario
  const handlePostular = (nroAviso: number) => {
    const resultado = verificarPostulacion(nroAviso)

    if (resultado.puedePostular) {
      // 3.10 Mostrar formulario para ingresar datos
      setUrlCVGuardado(resultado.urlCVGuardado)
      setMensaje(resultado.mensaje)
      setVista("formulario_postulacion")
    } else {
      // Mostrar error (C.A 1, 2 o 3)
      setMensaje(resultado.mensaje)
      setRequiereCV("requiereCV" in resultado && resultado.requiereCV === true)
      setPostulacionExitosa(false)
      setVista("resultado_postulacion")
    }
  }

  // Paso 4 y 5: Usuario ingresa descripcion y se envia la postulacion
  const handleEnviarPostulacion = () => {
    if (!avisoSeleccionado) return

    const resultado = enviarPostulacion(avisoSeleccionado, descripcionPostulacion)

    setMensaje(resultado.mensaje)
    setPostulacionExitosa(resultado.exito)
    setVista("resultado_postulacion")
  }

  const handleSalir = () => {
    window.localStorage.removeItem(SESSION_KEY)
    setVista("salir")
    setMensaje("Sesion finalizada correctamente.")
    setTimeout(() => router.replace("/login"), 500)
  }

  const avisoActual = avisosMock.find(a => a.nroAviso === avisoSeleccionado)

  // Vista: Sesion finalizada
  if (vista === "salir") {
    return (
      <main className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Alert className="max-w-md">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Sesion Finalizada</AlertTitle>
          <AlertDescription>{mensaje}</AlertDescription>
        </Alert>
      </main>
    )
  }

  // Vista: Formulario de postulacion (Paso 3.10 y 4)
  if (vista === "formulario_postulacion" && avisoActual) {
    return (
      <main className="min-h-screen bg-background">
        {/* Header Global */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MbHWicyzFpcawRts6FlDbCJo6uW7ES.png"
                alt="PALA - Plataforma de Acceso Laboral para Alumnos"
                width={120}
                height={60}
                className="h-12 w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  3
                </span>
                <span className="sr-only">Notificaciones</span>
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Perfil</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSalir}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Salir</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Postularse a: {avisoActual.nombreAviso}</CardTitle>
              <CardDescription>{mensaje}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mostrar CV cargado */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">CV a enviar</span>
                </div>
                <p className="text-sm text-muted-foreground">{urlCVGuardado.split('/').pop()}</p>
              </div>

              {/* Campo para descripcion/presentacion */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Escriba una presentacion para la oferta:</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Escriba aqui su presentacion..."
                  value={descripcionPostulacion}
                  onChange={(e) => setDescripcionPostulacion(e.target.value)}
                  rows={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleRegresarADetalle}>Cancelar</Button>
              <Button onClick={handleEnviarPostulacion}>Enviar postulacion</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    )
  }

  // Vista: Resultado de postulacion
  if (vista === "resultado_postulacion") {
    return (
      <main className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Image 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MbHWicyzFpcawRts6FlDbCJo6uW7ES.png"
              alt="PALA - Plataforma de Acceso Laboral para Alumnos"
              width={120}
              height={60}
              className="h-12 w-auto object-contain"
            />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSalir}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Salir</span>
            </Button>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-6">
          <Alert variant={postulacionExitosa ? "default" : "destructive"}>
            {postulacionExitosa ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{postulacionExitosa ? "Postulacion enviada" : "No se pudo postular"}</AlertTitle>
            <AlertDescription>{mensaje}</AlertDescription>
          </Alert>

          {requiereCV && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Accion requerida</CardTitle>
                <CardDescription>Debe cargar un CV antes de postularse.</CardDescription>
              </CardHeader>
            </Card>
          )}

          <div className="mt-6 flex gap-2 justify-end">
            <Button variant="outline" onClick={handleRegresar}>Volver al listado</Button>
            {avisoSeleccionado && postulacionExitosa === false && !requiereCV && (
              <Button onClick={() => handlePostular(avisoSeleccionado)}>Intentar nuevamente</Button>
            )}
          </div>
        </div>
      </main>
    )
  }

  // Vista: Detalle del aviso
  if (vista === "detalle" && avisoActual) {
    return (
      <AvisoDetalle
        aviso={avisoActual}
        onVolver={handleRegresar}
        onPostular={() => handlePostular(avisoActual.nroAviso)}
        onSalir={handleSalir}
      />
    )
  }

  // Vista: Lista de avisos
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Image 
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MbHWicyzFpcawRts6FlDbCJo6uW7ES.png"
            alt="PALA - Plataforma de Acceso Laboral para Alumnos"
            width={120}
            height={60}
            className="h-12 w-auto object-contain"
          />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                3
              </span>
              <span className="sr-only">Notificaciones</span>
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Perfil</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSalir}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Avisos disponibles</h1>
          <p className="text-muted-foreground mt-1">Explorá oportunidades y revisá el detalle de cada publicación.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {avisosMock.map((aviso) => (
            <AvisoCard
              key={aviso.nroAviso}
              aviso={aviso}
              onVerDetalle={() => handleSeleccionarAviso(aviso.nroAviso)}
            />
          ))}
        </div>
      </section>
    </main>
  )
}


