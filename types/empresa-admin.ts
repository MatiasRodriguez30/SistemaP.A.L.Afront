export type EmpresaAdmin = {
  id: number
  cuitEmpresa: string
  razonSocialEmpresa: string
  mailEmpresa: string
  telefonoEmpresa: string | null
  descripcionEmpresa: string | null
  direccionEmpresa: string | null
  fechaAltaEmpresa: string
  fechaBajaEmpresa: string | null
}

export type EmpresaForm = {
  cuitEmpresa: string
  razonSocialEmpresa: string
  mailEmpresa: string
  telefonoEmpresa: string
  descripcionEmpresa: string
  direccionEmpresa: string
}
