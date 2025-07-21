'use client'

import type React from 'react'
import { useState, useRef } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Send, Bot, User, Globe } from 'lucide-react'

const languages = [
  { value: 'english', label: 'English', native: 'English' },
  { value: 'hindi', label: 'Hindi', native: 'हिंदी' },
  { value: 'tamil', label: 'Tamil', native: 'தமிழ்' },
  { value: 'telugu', label: 'Telugu', native: 'తెలుగు' },
  { value: 'bengali', label: 'Bengali', native: 'বাংলা' },
  { value: 'marathi', label: 'Marathi', native: 'मराठी' },
  { value: 'gujarati', label: 'Gujarati', native: 'ગુજરાતી' },
  { value: 'kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { value: 'malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { value: 'punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
]

export default function ChatbotFriend() {
  const [selectedLanguage, setSelectedLanguage] = useState('english')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [error, setError] = useState<string | null>(null)
  const [showError, setShowError] = useState(false)

  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'assistant'; content: string }[]
  >([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const sendMessage = async (text: string) => {
    setIsLoading(true)
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text,
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, content }) => ({
            role,
            content,
          })),
          language: selectedLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage = {
        id: Date.now().toString() + '-a',
        role: 'assistant' as const,
        content: data.message || 'No response from Gemini.',
      }

      setMessages([...updatedMessages, assistantMessage])
    } catch (err: any) {
      console.error('Chat error:', err)
      let errorMessage = 'Something went wrong. Please try again.'

      if (err.message.includes('401')) {
        errorMessage = 'Invalid API key. Please check your Gemini API key.'
      } else if (err.message.includes('429')) {
        errorMessage =
          'Rate limit exceeded. Please wait a moment before trying again.'
      } else if (err.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.'
      } else if (
        err.message.includes('network') ||
        err.message.includes('fetch')
      ) {
        errorMessage = 'Network error. Please check your internet connection.'
      }

      setError(errorMessage)
      setShowError(true)
    } finally {
      setIsLoading(false)
      setInput('')
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    setError(null)
    setShowError(false)

    sendMessage(input.trim())
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {error && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
            showError
              ? 'translate-y-0 opacity-100'
              : '-translate-y-full opacity-0'
          }`}
        >
          <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg border border-red-500 max-w-md mx-auto">
            <div className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button
                onClick={() => {
                  setShowError(false)
                  setTimeout(() => setError(null), 300)
                }}
                className="text-white hover:text-red-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI Friend
                </h1>
                <p className="text-sm text-gray-400">
                  Your multilingual companion
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <Select
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
              >
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {languages.map((lang) => (
                    <SelectItem
                      key={lang.value}
                      value={lang.value}
                      className="text-white hover:bg-gray-700 focus:bg-gray-700"
                    >
                      <span className="flex items-center space-x-2">
                        <span>{lang.native}</span>
                        <span className="text-gray-400 text-sm">
                          ({lang.label})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-gray-300">
              {messages.length === 0 ? (
                <div className="space-y-2">
                  <p>👋 Hello! I'm your AI friend!</p>
                  <p className="text-sm text-gray-400">
                    Choose your preferred language and let's chat! I'm here to
                    listen, help, and be your companion.
                  </p>
                </div>
              ) : null}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="h-[60vh] overflow-y-auto space-y-4 pr-2">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-400 mb-4">
                    Start a conversation with your AI friend!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto">
                    <Button
                      variant="outline"
                      className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white text-sm"
                      onClick={() => {
                        const text = 'Hello! How are you today?'
                        setInput(text)
                        sendMessage(text)
                      }}
                    >
                      👋 Say Hello
                    </Button>

                    <Button
                      variant="outline"
                      className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white text-sm"
                      onClick={() => {
                        const text = 'Tell me a joke!'
                        setInput(text)
                        sendMessage(text)
                      }}
                    >
                      😄 Tell me a joke
                    </Button>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user'
                      ? 'flex-row-reverse space-x-reverse'
                      : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-blue-500'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <div
                    className={`max-w-[80%] ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-700 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={onSubmit} className="flex space-x-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={`Type your message in ${
                  languages.find((l) => l.value === selectedLanguage)?.native
                }...`}
                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
