'use client'

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-50 to-gray-100 text-gray-900">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center max-w-md">
        <div className="bg-red-100 rounded-full p-4 mb-4">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">¡Ups! Algo salió mal</h1>
        <p className="text-center text-gray-700 mb-6">
          Ocurrió un error inesperado.<br />
          Por favor, intenta de nuevo.<br />
          Si el problema persiste, contáctanos.
        </p>
        <Button
          onClick={() => reset()}
          className="w-full"
        >
          Reintentar
        </Button>
      </div>
    </div>
  )
}