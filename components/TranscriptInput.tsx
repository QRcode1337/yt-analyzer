'use client'

import { useState } from 'react'
import { Card } from './ui/Card'

interface TranscriptInputProps {
  videoId: string
  onTranscriptSaved?: () => void
}

export function TranscriptInput({ videoId, onTranscriptSaved }: TranscriptInputProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/videos/${videoId}/transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, source: 'manual' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save transcript')
      }

      setSuccess(true)
      setText('')
      onTranscriptSaved?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transcript')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const fileText = await file.text()
      setText(fileText)
    } catch (err) {
      setError('Failed to read file')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Add Transcript</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Upload File (optional)
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".txt,.srt,.vtt"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="transcript-text" className="block text-sm font-medium text-gray-700 mb-2">
            Or Paste Transcript
          </label>
          <textarea
            id="transcript-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Paste your transcript here..."
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Transcript saved successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : 'Save Transcript'}
        </button>
      </form>
    </Card>
  )
}

