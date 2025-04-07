'use client' // Error boundaries must be Client Components

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void  // funcion para refrescar la app 
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div  className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-900">
      <h1 className="text-4xl font-bold text-red-600 py-2">¡Error!</h1>
      <h2 className='py-3'>Algo esta mal , intenta de nuevo si el error persiste contactate con nosotos.!</h2>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Intenta de nuevo
      </Button>
    </div>
  )
}