import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id

    if (!jobId) {
      return NextResponse.json(
        { error: 'ID job mancante' },
        { status: 400 }
      )
    }

    // Recupera lo stato del job dalla memoria globale (in produzione usa un database)
    const jobStatus = typeof global !== 'undefined' ? (global as any).jobStatus?.[jobId] : null

    if (!jobStatus) {
      return NextResponse.json(
        { error: 'Job non trovato' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: jobStatus
    })

  } catch (error) {
    console.error('Errore durante il recupero dello stato del job:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
