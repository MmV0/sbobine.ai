import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nessun file caricato' },
        { status: 400 }
      )
    }

    // Verifica dimensione file (200MB max)
    if (file.size > 200 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File troppo grande. Massimo 200MB.' },
        { status: 400 }
      )
    }

    // Verifica tipo file
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg']
    const fileExtension = path.extname(file.name).toLowerCase()
    const allowedExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg']

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Tipo di file non supportato. Usa MP3, WAV, M4A, AAC o OGG.' },
        { status: 400 }
      )
    }

    // Crea directory uploads se non esiste
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Genera nome file unico
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileName = `${timestamp}_${randomString}${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    // Salva il file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Stima durata basata sulla dimensione del file
    const estimatedDuration = Math.round((file.size / (1024 * 1024)) * 60) // ~1MB per minuto

    console.log(`File caricato: ${fileName}, dimensione: ${file.size} bytes`)

    return NextResponse.json({
      success: true,
      data: {
        fileName: fileName,
        originalName: file.name,
        filePath: filePath,
        fileSize: file.size,
        mimeType: file.type,
        estimatedDuration: estimatedDuration,
        uploadedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Errore durante l\'upload:', error)
    return NextResponse.json(
      { error: 'Errore interno del server durante l\'upload' },
      { status: 500 }
    )
  }
}
