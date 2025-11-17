export interface Persona {
  id?: number | null;
  nombre: string;
  apellido: string;
  tipoDocumento: number;
  identificacion: string;
  correo: string;
  celular: string;
  fechaNacimiento: string;
  departamento: string;
  ciudad: string;
  direccion: string;
}

export interface TipoDocumento {
    id: number;
    nombre: string;
    valor: string;
    activo: string;
}