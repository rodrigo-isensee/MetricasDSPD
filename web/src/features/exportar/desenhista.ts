import { jsPDF } from 'jspdf'

/** Documento A4 retrato em milímetros, com título e idioma pt-BR (PDF acessível). */
export function novoDocumento(titulo: string): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  doc.setProperties({ title: titulo, subject: 'Métricas DSPD', creator: 'Métricas DSPD' })
  doc.setLanguage('pt-BR')
  return doc
}
