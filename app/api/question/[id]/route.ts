import { NextResponse } from "next/server"
import { examQuestions } from "../../exam/route"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Obtener el parámetro table_name de la URL
  const url = new URL(request.url)
  const tableName = url.searchParams.get("table_name") || "pmpquestions"

  // Simular un pequeño retraso para mostrar el estado de carga
  await new Promise((resolve) => setTimeout(resolve, 500))

  const questionId = params.id

  // En un entorno real, aquí se haría una consulta a la base de datos
  // usando el tableName para seleccionar la tabla correcta
  // Por ahora, simplemente usamos los datos de ejemplo

  // Buscar la pregunta por ID
  const question = examQuestions.find((q) => q.id === questionId)

  if (!question) {
    return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 })
  }

  return NextResponse.json(question)
}

