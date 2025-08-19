import jsPDF from 'jspdf'
import { AudioFile, Summary } from '@/types'
import { formatDuration, formatDate } from './formatters'

interface ExportData {
  audioFile: AudioFile
  summary: Summary
  includeOptions: {
    overview: boolean
    keyConcepts: boolean
    definitions: boolean
    dates: boolean
    qna: boolean
    metadata: boolean
  }
  exportDate: string
}

export async function generatePDF(data: ExportData): Promise<void> {
  const { audioFile, summary, includeOptions } = data
  const doc = new jsPDF()
  
  let yPosition = 20
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  const lineHeight = 7
  
  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPosition = 20
    }
  }
  
  // Helper function to add text with wrapping
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
    doc.setFontSize(fontSize)
    if (isBold) {
      doc.setFont(undefined, 'bold')
    } else {
      doc.setFont(undefined, 'normal')
    }
    
    const splitText = doc.splitTextToSize(text, 170)
    const textHeight = splitText.length * lineHeight
    
    checkPageBreak(textHeight)
    
    doc.text(splitText, margin, yPosition)
    yPosition += textHeight + 5
  }
  
  // Title
  addText(`Riassunto: ${audioFile.fileName}`, 16, true)
  yPosition += 5
  
  // Metadata
  if (includeOptions.metadata) {
    addText('Informazioni File', 12, true)
    addText(`Durata: ${formatDuration(audioFile.durationSeconds)}`)
    addText(`Lingua: ${audioFile.language.toUpperCase()}`)
    addText(`Data creazione: ${formatDate(audioFile.createdAt)}`)
    addText(`Esportato il: ${formatDate(data.exportDate)}`)
    yPosition += 10
  }
  
  // Overview
  if (includeOptions.overview) {
    addText('Panoramica', 14, true)
    addText(summary.sections.overview)
    yPosition += 10
  }
  
  // Key Concepts
  if (includeOptions.keyConcepts && summary.sections.keyConcepts.length > 0) {
    addText('Concetti Chiave', 14, true)
    summary.sections.keyConcepts.forEach((concept, index) => {
      addText(`${index + 1}. ${concept}`)
    })
    yPosition += 10
  }
  
  // Definitions
  if (includeOptions.definitions && summary.sections.definitions.length > 0) {
    addText('Definizioni', 14, true)
    summary.sections.definitions.forEach((def) => {
      addText(def.term, 12, true)
      addText(def.definition)
      yPosition += 5
    })
    yPosition += 10
  }
  
  // Important Dates
  if (includeOptions.dates && summary.sections.dates.length > 0) {
    addText('Date Importanti', 14, true)
    summary.sections.dates.forEach((dateItem) => {
      addText(`${dateItem.date}: ${dateItem.event}`, 10, true)
    })
    yPosition += 10
  }
  
  // Q&A
  if (includeOptions.qna && summary.sections.qna.length > 0) {
    addText('Domande e Risposte', 14, true)
    summary.sections.qna.forEach((qna, index) => {
      addText(`D${index + 1}: ${qna.question}`, 10, true)
      addText(`R: ${qna.answer}`)
      yPosition += 5
    })
  }
  
  // Footer
  checkPageBreak(20)
  doc.setFontSize(8)
  doc.setFont(undefined, 'normal')
  doc.text('Generato da Sbobine - Trascrizione e Sintesi Lezioni', margin, pageHeight - 10)
  
  // Save the PDF
  doc.save(`${audioFile.fileName.replace(/\.[^/.]+$/, '')}_riassunto.pdf`)
}

export function generateMarkdown(data: ExportData): void {
  const { audioFile, summary, includeOptions } = data
  
  let markdown = `# ${audioFile.fileName}\n\n`
  
  // Metadata
  if (includeOptions.metadata) {
    markdown += `## Informazioni File\n\n`
    markdown += `- **Durata:** ${formatDuration(audioFile.durationSeconds)}\n`
    markdown += `- **Lingua:** ${audioFile.language.toUpperCase()}\n`
    markdown += `- **Data creazione:** ${formatDate(audioFile.createdAt)}\n`
    markdown += `- **Esportato il:** ${formatDate(data.exportDate)}\n\n`
  }
  
  // Overview
  if (includeOptions.overview) {
    markdown += `## Panoramica\n\n${summary.sections.overview}\n\n`
  }
  
  // Key Concepts
  if (includeOptions.keyConcepts && summary.sections.keyConcepts.length > 0) {
    markdown += `## Concetti Chiave\n\n`
    summary.sections.keyConcepts.forEach((concept, index) => {
      markdown += `${index + 1}. ${concept}\n`
    })
    markdown += `\n`
  }
  
  // Definitions
  if (includeOptions.definitions && summary.sections.definitions.length > 0) {
    markdown += `## Definizioni\n\n`
    summary.sections.definitions.forEach((def) => {
      markdown += `### ${def.term}\n\n${def.definition}\n\n`
    })
  }
  
  // Important Dates
  if (includeOptions.dates && summary.sections.dates.length > 0) {
    markdown += `## Date Importanti\n\n`
    summary.sections.dates.forEach((dateItem) => {
      markdown += `- **${dateItem.date}:** ${dateItem.event}\n`
    })
    markdown += `\n`
  }
  
  // Q&A
  if (includeOptions.qna && summary.sections.qna.length > 0) {
    markdown += `## Domande e Risposte\n\n`
    summary.sections.qna.forEach((qna, index) => {
      markdown += `### D${index + 1}: ${qna.question}\n\n**R:** ${qna.answer}\n\n`
    })
  }
  
  // Footer
  markdown += `---\n\n*Generato da Sbobine - Trascrizione e Sintesi Lezioni*\n`
  
  // Create and download the file
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${audioFile.fileName.replace(/\.[^/.]+$/, '')}_riassunto.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
