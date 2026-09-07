/**
 * Catálogos y Validaciones Fiscales SAT (CFDI 4.0) para México
 */

export interface SatRegimen {
  code: string;
  name: string;
  type: "fisica" | "moral" | "ambas";
}

export interface SatUsoCfdi {
  code: string;
  name: string;
}

export const SAT_REGIMENES_FISCALES: SatRegimen[] = [
  { code: "601", name: "General de Ley Personas Morales", type: "moral" },
  { code: "603", name: "Personas Morales con Fines no Lucrativos", type: "moral" },
  { code: "605", name: "Sueldos y Salarios e Ingresos Asimilados a Salarios", type: "fisica" },
  { code: "606", name: "Arrendamiento", type: "fisica" },
  { code: "607", name: "Régimen de Enajenación o Adquisición de Bienes", type: "fisica" },
  { code: "608", name: "Demás ingresos", type: "fisica" },
  { code: "610", name: "Residentes en el Extranjero sin Establecimiento Permanente en México", type: "ambas" },
  { code: "611", name: "Ingresos por Dividendos (socios y accionistas)", type: "fisica" },
  { code: "612", name: "Personas Físicas con Actividades Empresariales y Profesionales", type: "fisica" },
  { code: "614", name: "Ingresos por intereses", type: "fisica" },
  { code: "615", name: "Régimen de los ingresos por obtención de premios", type: "fisica" },
  { code: "616", name: "Sin obligaciones fiscales", type: "fisica" },
  { code: "620", name: "Sociedades Cooperativas de Producción que optan por diferir sus ingresos", type: "moral" },
  { code: "621", name: "Incorporación Fiscal (RIF)", type: "fisica" },
  { code: "622", name: "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras (AGAPES)", type: "ambas" },
  { code: "623", name: "Opcional para Grupos de Sociedades", type: "moral" },
  { code: "624", name: "Coordinados", type: "moral" },
  { code: "625", name: "Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas", type: "fisica" },
  { code: "626", name: "Régimen Simplificado de Confianza (RESICO)", type: "ambas" },
];

export const SAT_USOS_CFDI: SatUsoCfdi[] = [
  { code: "G01", name: "Adquisición de mercancías" },
  { code: "G02", name: "Devoluciones, descuentos o bonificaciones" },
  { code: "G03", name: "Gastos en general" },
  { code: "I01", name: "Construcciones" },
  { code: "I02", name: "Mobiliario y equipo de oficina por inversiones" },
  { code: "I03", name: "Equipo de transporte" },
  { code: "I04", name: "Equipo de computo y accesorios" },
  { code: "I08", name: "Otra maquinaria y equipo" },
  { code: "D01", name: "Honorarios médicos, dentales y gastos hospitalarios" },
  { code: "D02", name: "Gastos médicos por incapacidad o discapacidad" },
  { code: "D04", name: "Donativos" },
  { code: "D07", name: "Primas por seguros de gastos médicos" },
  { code: "D10", name: "Pagos por servicios educativos (colegiaturas)" },
  { code: "S01", name: "Sin efectos fiscales" },
  { code: "CP01", name: "Pagos" },
];

/**
 * Normaliza y valida un RFC mexicano (12 caracteres persona moral, 13 persona física o genérico)
 */
export function validateRFC(rawRfc: string): { isValid: boolean; type?: "fisica" | "moral" | "generico"; cleanRfc: string; error?: string } {
  const clean = (rawRfc || "").trim().toUpperCase().replace(/[^A-Z0-9&Ñ]/g, "");
  
  if (!clean) {
    return { isValid: false, cleanRfc: "", error: "El RFC es requerido." };
  }

  // RFC Genéricos
  if (clean === "XAXX010101000" || clean === "XEXX010101000") {
    return { isValid: true, type: "generico", cleanRfc: clean };
  }

  // Persona Física: 4 letras + 6 números (AAMMDD) + 3 homoclave = 13 caracteres
  const fisicaRegex = /^[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3}$/;
  if (clean.length === 13 && fisicaRegex.test(clean)) {
    return { isValid: true, type: "fisica", cleanRfc: clean };
  }

  // Persona Moral: 3 letras + 6 números (AAMMDD) + 3 homoclave = 12 caracteres
  const moralRegex = /^[A-Z&Ñ]{3}[0-9]{6}[A-Z0-9]{3}$/;
  if (clean.length === 12 && moralRegex.test(clean)) {
    return { isValid: true, type: "moral", cleanRfc: clean };
  }

  return {
    isValid: false,
    cleanRfc: clean,
    error: "RFC no válido. Debe tener 12 caracteres (moral) o 13 caracteres (física) con formato oficial SAT."
  };
}

/**
 * Valida un Código Postal de México (5 dígitos)
 */
export function validateCP(cp: string): boolean {
  const clean = (cp || "").trim().replace(/\D/g, "");
  return clean.length === 5;
}

/**
 * Valida correo electrónico
 */
export function validateEmail(email: string): boolean {
  if (!email || !email.trim()) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}
