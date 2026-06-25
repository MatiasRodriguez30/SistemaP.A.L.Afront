"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, BriefcaseBusiness, Eye, EyeOff, GraduationCap, KeyRound, Mail, ShieldCheck } from "lucide-react"

import type { AuthRegisterStartResponse, AuthResponse, ErrorResponse, MessageResponse, PalaRol, TipoEstudianteOption } from "@/types/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavbar } from "@/components/site-navbar"

type AuthMode = "login" | "register" | "verify" | "forgot" | "reset"

interface AuthScreenProps {
  initialMode: AuthMode
}

interface LoginFormState {
  mailUsuario: string
  passwordUsuario: string
}

interface RegisterFormState {
  mailUsuario: string
  passwordUsuario: string
  confirmarPassword: string
  rolSolicitado: PalaRol
  nombreReclutador: string
  cuilReclutador: string
  descripcionReclutador: string
  nombrePostulante: string
  apellidoPostulante: string
  fechaNacimientoPostulante: string
  legajoAcademicoPostulante: string
  tipoEstudianteId: string
}

interface VerifyFormState {
  codigo: string
}

interface RecoveryFormState {
  mailUsuario: string
  codigo: string
  nuevaPassword: string
  confirmarNuevaPassword: string
}

const SESSION_KEY = "pala-auth-session"

const emptyLoginForm: LoginFormState = {
  mailUsuario: "",
  passwordUsuario: "",
}

const emptyRegisterForm: RegisterFormState = {
  mailUsuario: "",
  passwordUsuario: "",
  confirmarPassword: "",
  rolSolicitado: "POSTULANTE",
  nombreReclutador: "",
  cuilReclutador: "",
  descripcionReclutador: "",
  nombrePostulante: "",
  apellidoPostulante: "",
  fechaNacimientoPostulante: "",
  legajoAcademicoPostulante: "",
  tipoEstudianteId: "",
}

const emptyVerifyForm: VerifyFormState = {
  codigo: "",
}

const emptyRecoveryForm: RecoveryFormState = {
  mailUsuario: "",
  codigo: "",
  nuevaPassword: "",
  confirmarNuevaPassword: "",
}

async function readResponseBody<T>(response: Response): Promise<T | ErrorResponse> {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return (await response.json()) as T | ErrorResponse
  }

  const text = await response.text()
  return { mensaje: text || "No se pudo completar la operacion." }
}

function getResponseMessage(body: unknown, fallback: string) {
  if (body && typeof body === "object") {
    const payload = body as ErrorResponse & MessageResponse
    return payload.mensaje ?? payload.message ?? payload.error ?? fallback
  }

  return fallback
}

export function AuthScreen({ initialMode }: AuthScreenProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AuthMode>(initialMode)
  const [loginForm, setLoginForm] = useState<LoginFormState>(emptyLoginForm)
  const [registerForm, setRegisterForm] = useState<RegisterFormState>(emptyRegisterForm)
  const [verifyForm, setVerifyForm] = useState<VerifyFormState>(emptyVerifyForm)
  const [recoveryForm, setRecoveryForm] = useState<RecoveryFormState>(emptyRecoveryForm)
  const [pendingRegisterPayload, setPendingRegisterPayload] = useState<object | null>(null)
  const [pendingMail, setPendingMail] = useState("")
  const [tiposEstudiante, setTiposEstudiante] = useState<TipoEstudianteOption[]>([])
  const [tiposLoading, setTiposLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false)
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false)
  const [showRecoveryConfirmPassword, setShowRecoveryConfirmPassword] = useState(false)

  useEffect(() => {
    if (!errorMessage && !successMessage) return
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [errorMessage, successMessage])

  useEffect(() => {
    if (activeTab !== "register" || registerForm.rolSolicitado !== "POSTULANTE" || tiposEstudiante.length > 0) return

    setTiposLoading(true)
    // Los tipos de estudiante vienen del backend PALA (8082), no del subsistema de seguridad.
    fetch("/api/pala/auth/tipos-estudiante")
      .then(async (response) => {
        const body = await readResponseBody<TipoEstudianteOption[]>(response)
        if (!response.ok) {
          throw new Error("mensaje" in body && body.mensaje ? body.mensaje : "No se pudieron cargar los tipos de estudiante")
        }
        setTiposEstudiante(body as TipoEstudianteOption[])
      })
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setTiposLoading(false))
  }, [activeTab, registerForm.rolSolicitado, tiposEstudiante.length])

  const currentRoleCopy = useMemo(() => {
    if (registerForm.rolSolicitado === "RECLUTADOR") {
      return {
        title: "Registro de reclutador",
        description: "Complete los datos necesarios para operar como reclutador dentro del sistema.",
      }
    }

    return {
      title: "Registro de postulante",
      description: "Complete los datos necesarios para habilitar su perfil de postulante.",
    }
  }, [registerForm.rolSolicitado])

  const updateRegisterField = <K extends keyof RegisterFormState>(field: K, value: RegisterFormState[K]) => {
    setRegisterForm((current) => ({ ...current, [field]: value }))
  }

  const clearFeedback = () => {
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const PasswordToggle = ({
    visible,
    onToggle,
    label,
  }: {
    visible: boolean
    onToggle: () => void
    label: string
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-indigo-600"
      aria-label={label}
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )

  const persistSession = (authResponse: AuthResponse) => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(authResponse))

    const rolesNormalizados = authResponse.roles.map((role) => role.toUpperCase())
    const esAdministrador = rolesNormalizados.includes("ADMINISTRADOR")
    const esPostulante = rolesNormalizados.includes("POSTULANTE")

    if (esAdministrador) {
      router.push(authResponse.perfilCompleto ? "/admin" : "/admin/perfil-inicial")
      return
    }

    if (esPostulante || authResponse.permisos.includes("VER_AVISOS")) {
      router.push("/avisos")
    }
  }

  const buildRegisterPayload = () =>
    registerForm.rolSolicitado === "RECLUTADOR"
      ? {
          mailUsuario: registerForm.mailUsuario,
          passwordUsuario: registerForm.passwordUsuario,
          rolSolicitado: registerForm.rolSolicitado,
          reclutador: {
            nombreReclutador: registerForm.nombreReclutador,
            cuilReclutador: registerForm.cuilReclutador,
            descripcionReclutador: registerForm.descripcionReclutador || null,
          },
        }
      : {
          mailUsuario: registerForm.mailUsuario,
          passwordUsuario: registerForm.passwordUsuario,
          rolSolicitado: registerForm.rolSolicitado,
          postulante: {
            nombrePostulante: registerForm.nombrePostulante,
            apellidoPostulante: registerForm.apellidoPostulante,
            fechaNacimientoPostulante: registerForm.fechaNacimientoPostulante || null,
            legajoAcademicoPostulante: Number(registerForm.legajoAcademicoPostulante),
            tipoEstudianteId: Number(registerForm.tipoEstudianteId),
          },
        }

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearFeedback()
    setSubmitting(true)

    try {
      const response = await fetch("/api/pala/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      })

      const body = await readResponseBody<AuthResponse>(response)
      if (!response.ok) {
        const message = getResponseMessage(body, "No se pudo iniciar sesion")
        if (message.toLowerCase().includes("correo") && message.toLowerCase().includes("verificado")) {
          setPendingMail(loginForm.mailUsuario)
          setActiveTab("verify")
        }
        throw new Error(message)
      }

      persistSession(body as AuthResponse)
      setLoginForm(emptyLoginForm)
      setSuccessMessage("Sesion iniciada correctamente.")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo iniciar sesion")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearFeedback()

    if (registerForm.passwordUsuario !== registerForm.confirmarPassword) {
      setErrorMessage("La confirmacion de contrasena no coincide.")
      return
    }

    if (registerForm.rolSolicitado === "POSTULANTE" && !registerForm.tipoEstudianteId) {
      setErrorMessage("Debe seleccionar el tipo de estudiante.")
      return
    }

    setSubmitting(true)

    try {
      const payload = buildRegisterPayload()

      const response = await fetch("/api/pala/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const body = await readResponseBody<AuthRegisterStartResponse>(response)
      if (!response.ok) {
        throw new Error(getResponseMessage(body, "No se pudo registrar el usuario"))
      }

      const registerResponse = body as AuthRegisterStartResponse
      setPendingRegisterPayload(payload)
      setPendingMail(registerResponse.mailUsuario || registerForm.mailUsuario)
      setVerifyForm(emptyVerifyForm)
      setActiveTab("verify")
      setSuccessMessage(registerResponse.message || "Enviamos un codigo de verificacion a tu correo.")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo completar el registro")
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearFeedback()

    if (!pendingRegisterPayload) {
      setErrorMessage("Para verificar el registro, primero completa el formulario de registro.")
      setActiveTab("register")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/pala/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailUsuario: pendingMail,
          codigo: verifyForm.codigo,
          registro: pendingRegisterPayload,
        }),
      })

      const body = await readResponseBody<AuthResponse>(response)
      if (!response.ok) {
        throw new Error(getResponseMessage(body, "No se pudo verificar el correo"))
      }

      persistSession(body as AuthResponse)
      setRegisterForm(emptyRegisterForm)
      setVerifyForm(emptyVerifyForm)
      setPendingRegisterPayload(null)
      setPendingMail("")
      setSuccessMessage("Correo verificado correctamente.")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo verificar el correo")
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendVerification = async () => {
    clearFeedback()

    if (!pendingMail) {
      setErrorMessage("No hay un correo pendiente de verificacion.")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/pala/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailUsuario: pendingMail }),
      })

      const body = await readResponseBody<MessageResponse>(response)
      if (!response.ok) {
        throw new Error(getResponseMessage(body, "No se pudo reenviar el codigo"))
      }

      setSuccessMessage(getResponseMessage(body, "Enviamos un nuevo codigo de verificacion."))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo reenviar el codigo")
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgotPasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearFeedback()
    setSubmitting(true)

    try {
      const response = await fetch("/api/pala/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailUsuario: recoveryForm.mailUsuario }),
      })

      const body = await readResponseBody<MessageResponse>(response)
      if (!response.ok) {
        throw new Error(getResponseMessage(body, "No se pudo enviar el codigo de recuperacion"))
      }

      setPendingMail(recoveryForm.mailUsuario)
      setActiveTab("reset")
      setSuccessMessage(getResponseMessage(body, "Si el correo existe, enviaremos un codigo para recuperar la contrasena."))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo iniciar la recuperacion")
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetPasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearFeedback()

    if (recoveryForm.nuevaPassword !== recoveryForm.confirmarNuevaPassword) {
      setErrorMessage("La confirmacion de contrasena no coincide.")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/pala/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailUsuario: pendingMail || recoveryForm.mailUsuario,
          codigo: recoveryForm.codigo,
          nuevaPassword: recoveryForm.nuevaPassword,
        }),
      })

      const body = await readResponseBody<MessageResponse>(response)
      if (!response.ok) {
        throw new Error(getResponseMessage(body, "No se pudo actualizar la contrasena"))
      }

      setRecoveryForm(emptyRecoveryForm)
      setPendingMail("")
      setActiveTab("login")
      setSuccessMessage(getResponseMessage(body, "La contrasena fue actualizada correctamente."))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo actualizar la contrasena")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 via-fuchsia-500 via-amber-500 to-emerald-500" />

      <SiteNavbar />

      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-start justify-center overflow-hidden px-6 py-12 lg:items-center lg:px-8">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[40rem] rounded-full bg-gradient-to-br from-indigo-400/25 via-fuchsia-400/20 to-amber-300/15 blur-3xl" />

        <Card className="relative w-full max-w-2xl rounded-[2rem] border border-indigo-100 shadow-xl shadow-indigo-100/60">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Iniciar sesión
            </CardTitle>
            <CardDescription className="text-base leading-6 text-muted-foreground">
              Acceda con su cuenta o registre un nuevo usuario segun el rol correspondiente.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {errorMessage && (
              <Alert variant="destructive" className="rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No se pudo completar la operacion</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-950">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Operacion exitosa</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {activeTab === "verify" ? (
              <form className="space-y-5" onSubmit={handleVerifySubmit}>
                <div className="space-y-2 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <p className="text-sm font-semibold text-foreground">Verificacion de correo</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Ingresa el codigo que enviamos a {pendingMail || "tu correo"}.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verify-code">Codigo</Label>
                  <Input
                    id="verify-code"
                    inputMode="numeric"
                    value={verifyForm.codigo}
                    onChange={(event) => setVerifyForm({ codigo: event.target.value })}
                    placeholder="123456"
                    className="h-11"
                    required
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-indigo-500 hover:to-fuchsia-500"
                  >
                    {submitting ? "Verificando..." : "Verificar correo"}
                  </Button>
                  <Button type="button" variant="outline" disabled={submitting} onClick={handleResendVerification} className="h-11 rounded-xl">
                    Reenviar codigo
                  </Button>
                </div>

                <Button type="button" variant="ghost" className="w-full" onClick={() => setActiveTab("register")}>
                  Volver al registro
                </Button>
              </form>
            ) : activeTab === "forgot" ? (
              <form className="space-y-5" onSubmit={handleForgotPasswordSubmit}>
                <div className="space-y-2 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <p className="text-sm font-semibold text-foreground">Recuperar contrasena</p>
                  <p className="text-sm leading-6 text-muted-foreground">Te enviaremos un codigo para cambiar tu contrasena.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="forgot-mail">Mail</Label>
                  <Input
                    id="forgot-mail"
                    type="email"
                    value={recoveryForm.mailUsuario}
                    onChange={(event) => setRecoveryForm((current) => ({ ...current, mailUsuario: event.target.value }))}
                    placeholder="usuario@dominio.com"
                    className="h-11"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-full rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-indigo-500 hover:to-fuchsia-500"
                >
                  {submitting ? "Enviando..." : "Enviar codigo"}
                </Button>

                <Button type="button" variant="ghost" className="w-full" onClick={() => setActiveTab("login")}>
                  Volver al inicio de sesion
                </Button>
              </form>
            ) : activeTab === "reset" ? (
              <form className="space-y-5" onSubmit={handleResetPasswordSubmit}>
                <div className="space-y-2 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <p className="text-sm font-semibold text-foreground">Nueva contrasena</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Ingresa el codigo enviado a {pendingMail || recoveryForm.mailUsuario}.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-code">Codigo</Label>
                  <Input
                    id="reset-code"
                    inputMode="numeric"
                    value={recoveryForm.codigo}
                    onChange={(event) => setRecoveryForm((current) => ({ ...current, codigo: event.target.value }))}
                    placeholder="123456"
                    className="h-11"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reset-password">Nueva contrasena</Label>
                    <div className="relative">
                      <Input
                        id="reset-password"
                        type={showRecoveryPassword ? "text" : "password"}
                        value={recoveryForm.nuevaPassword}
                        onChange={(event) => setRecoveryForm((current) => ({ ...current, nuevaPassword: event.target.value }))}
                        className="h-11 pr-10"
                        required
                      />
                      <PasswordToggle
                        visible={showRecoveryPassword}
                        onToggle={() => setShowRecoveryPassword((current) => !current)}
                        label={showRecoveryPassword ? "Ocultar nueva contrasena" : "Mostrar nueva contrasena"}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reset-confirm-password">Confirmar contrasena</Label>
                    <div className="relative">
                      <Input
                        id="reset-confirm-password"
                        type={showRecoveryConfirmPassword ? "text" : "password"}
                        value={recoveryForm.confirmarNuevaPassword}
                        onChange={(event) => setRecoveryForm((current) => ({ ...current, confirmarNuevaPassword: event.target.value }))}
                        className="h-11 pr-10"
                        required
                      />
                      <PasswordToggle
                        visible={showRecoveryConfirmPassword}
                        onToggle={() => setShowRecoveryConfirmPassword((current) => !current)}
                        label={showRecoveryConfirmPassword ? "Ocultar confirmacion de contrasena" : "Mostrar confirmacion de contrasena"}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-full rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-indigo-500 hover:to-fuchsia-500"
                >
                  {submitting ? "Actualizando..." : "Cambiar contrasena"}
                </Button>
              </form>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={(value) => {
                  clearFeedback()
                  setActiveTab(value as AuthMode)
                }}
                className="gap-5"
              >
              <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-indigo-50 p-1">
                <TabsTrigger
                  value="login"
                  className="rounded-xl py-2.5 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300"
                >
                  Ingresar
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-xl py-2.5 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300"
                >
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form className="space-y-5" onSubmit={handleLoginSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="login-mail">Mail</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
                      <Input
                        id="login-mail"
                        type="email"
                        value={loginForm.mailUsuario}
                        onChange={(event) => setLoginForm((current) => ({ ...current, mailUsuario: event.target.value }))}
                        placeholder="usuario@dominio.com"
                        className="h-11 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contrasena</Label>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        value={loginForm.passwordUsuario}
                        onChange={(event) => setLoginForm((current) => ({ ...current, passwordUsuario: event.target.value }))}
                        placeholder="Ingrese su contrasena"
                        className="h-11 pl-10 pr-10"
                        required
                      />
                      <PasswordToggle
                        visible={showLoginPassword}
                        onToggle={() => setShowLoginPassword((current) => !current)}
                        label={showLoginPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 w-full rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-indigo-500 hover:to-fuchsia-500"
                  >
                    {submitting ? "Ingresando..." : "Iniciar sesion"}
                  </Button>

                  <Button type="button" variant="ghost" className="w-full" onClick={() => setActiveTab("forgot")}>
                    Olvide mi contrasena
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <div className="space-y-4">
                  <div className="space-y-2 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                    <p className="text-sm font-semibold text-foreground">{currentRoleCopy.title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{currentRoleCopy.description}</p>
                  </div>

                  <form className="space-y-5" onSubmit={handleRegisterSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3 md:col-span-2">
                        <Label>Como te queres registrar?</Label>
                        <div className="grid gap-3 md:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => updateRegisterField("rolSolicitado", "POSTULANTE")}
                            className={`rounded-2xl border p-4 text-left transition ${registerForm.rolSolicitado === "POSTULANTE" ? "border-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-sm" : "border-border bg-muted/30 text-foreground hover:border-indigo-300"}`}
                          >
                            <div className="flex items-start gap-3">
                              <GraduationCap className={`mt-0.5 h-5 w-5 ${registerForm.rolSolicitado === "POSTULANTE" ? "text-white" : "text-indigo-500"}`} />
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">Postulante</p>
                                <p className={`text-sm ${registerForm.rolSolicitado === "POSTULANTE" ? "text-white/80" : "text-muted-foreground"}`}>
                                  Para explorar avisos y postularte.
                                </p>
                              </div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateRegisterField("rolSolicitado", "RECLUTADOR")}
                            className={`rounded-2xl border p-4 text-left transition ${registerForm.rolSolicitado === "RECLUTADOR" ? "border-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-sm" : "border-border bg-muted/30 text-foreground hover:border-indigo-300"}`}
                          >
                            <div className="flex items-start gap-3">
                              <BriefcaseBusiness className={`mt-0.5 h-5 w-5 ${registerForm.rolSolicitado === "RECLUTADOR" ? "text-white" : "text-violet-500"}`} />
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">Reclutador</p>
                                <p className={`text-sm ${registerForm.rolSolicitado === "RECLUTADOR" ? "text-white/80" : "text-muted-foreground"}`}>
                                  Para publicar avisos y gestionar postulaciones.
                                </p>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="register-mail">Mail de acceso</Label>
                        <Input
                          id="register-mail"
                          type="email"
                          value={registerForm.mailUsuario}
                          onChange={(event) => updateRegisterField("mailUsuario", event.target.value)}
                          placeholder="usuario@dominio.com"
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password">Contrasena</Label>
                        <div className="relative">
                          <Input
                            id="register-password"
                            type={showRegisterPassword ? "text" : "password"}
                            value={registerForm.passwordUsuario}
                            onChange={(event) => updateRegisterField("passwordUsuario", event.target.value)}
                            className="h-11 pr-10"
                            required
                          />
                          <PasswordToggle
                            visible={showRegisterPassword}
                            onToggle={() => setShowRegisterPassword((current) => !current)}
                            label={showRegisterPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-confirm-password">Confirmar contrasena</Label>
                        <div className="relative">
                          <Input
                            id="register-confirm-password"
                            type={showRegisterConfirmPassword ? "text" : "password"}
                            value={registerForm.confirmarPassword}
                            onChange={(event) => updateRegisterField("confirmarPassword", event.target.value)}
                            className="h-11 pr-10"
                            required
                          />
                          <PasswordToggle
                            visible={showRegisterConfirmPassword}
                            onToggle={() => setShowRegisterConfirmPassword((current) => !current)}
                            label={showRegisterConfirmPassword ? "Ocultar confirmacion de contrasena" : "Mostrar confirmacion de contrasena"}
                          />
                        </div>
                      </div>

                      {registerForm.rolSolicitado === "RECLUTADOR" ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="register-reclutador-nombre">Nombre</Label>
                            <Input
                              id="register-reclutador-nombre"
                              value={registerForm.nombreReclutador}
                              onChange={(event) => updateRegisterField("nombreReclutador", event.target.value)}
                              className="h-11"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="register-reclutador-cuil">CUIL</Label>
                            <Input
                              id="register-reclutador-cuil"
                              value={registerForm.cuilReclutador}
                              onChange={(event) => updateRegisterField("cuilReclutador", event.target.value)}
                              placeholder="20-12345678-3"
                              className="h-11"
                              required
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="register-reclutador-descripcion">Descripcion</Label>
                            <Textarea
                              id="register-reclutador-descripcion"
                              value={registerForm.descripcionReclutador}
                              onChange={(event) => updateRegisterField("descripcionReclutador", event.target.value)}
                              placeholder="Descripcion breve del perfil"
                              className="min-h-24"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="register-postulante-nombre">Nombre</Label>
                            <Input
                              id="register-postulante-nombre"
                              value={registerForm.nombrePostulante}
                              onChange={(event) => updateRegisterField("nombrePostulante", event.target.value)}
                              className="h-11"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="register-postulante-apellido">Apellido</Label>
                            <Input
                              id="register-postulante-apellido"
                              value={registerForm.apellidoPostulante}
                              onChange={(event) => updateRegisterField("apellidoPostulante", event.target.value)}
                              className="h-11"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="register-postulante-fecha-nacimiento">Fecha de nacimiento</Label>
                            <Input
                              id="register-postulante-fecha-nacimiento"
                              type="date"
                              value={registerForm.fechaNacimientoPostulante}
                              onChange={(event) => updateRegisterField("fechaNacimientoPostulante", event.target.value)}
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="register-postulante-legajo">Legajo academico</Label>
                            <Input
                              id="register-postulante-legajo"
                              inputMode="numeric"
                              value={registerForm.legajoAcademicoPostulante}
                              onChange={(event) => updateRegisterField("legajoAcademicoPostulante", event.target.value)}
                              className="h-11"
                              required
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="register-postulante-tipo">Tipo de estudiante</Label>
                            <Select value={registerForm.tipoEstudianteId} onValueChange={(value) => updateRegisterField("tipoEstudianteId", value)}>
                              <SelectTrigger id="register-postulante-tipo" className="h-11 w-full">
                                <SelectValue placeholder={tiposLoading ? "Cargando tipos..." : "Seleccione un tipo"} />
                              </SelectTrigger>
                              <SelectContent>
                                {tiposEstudiante.map((tipo) => (
                                  <SelectItem key={tipo.id} value={String(tipo.id)}>
                                    {tipo.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      <div className="md:col-span-2">
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="h-11 w-full rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-indigo-500 hover:to-fuchsia-500"
                        >
                          {submitting ? "Registrando..." : "Crear cuenta"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </section>

      <SiteFooter />
    </main>
  )
}


