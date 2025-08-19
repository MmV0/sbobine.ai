'use client'

import React, { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon, CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { formatDuration } from '@/utils/formatters'
import LoadingSpinner from './LoadingSpinner'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  estimatedCost: number
  duration: number
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  estimatedCost, 
  duration 
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  })

  const handlePayment = async () => {
    setIsProcessing(true)
    
    // Simula il processo di pagamento
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessing(false)
    onComplete()
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Conferma Pagamento
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Riepilogo Ordine</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durata totale:</span>
                      <span className="font-medium">{formatDuration(duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tariffa:</span>
                      <span className="font-medium">€0.08/minuto</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Totale:</span>
                        <span className="font-bold text-primary-600">€{estimatedCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Metodo di Pagamento</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="mr-3"
                      />
                      <CreditCardIcon className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-sm">Carta di Credito/Debito</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={() => setPaymentMethod('paypal')}
                        className="mr-3"
                      />
                      <div className="h-5 w-5 mr-2 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        P
                      </div>
                      <span className="text-sm">PayPal</span>
                    </label>
                  </div>
                </div>

                {/* Payment Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numero Carta
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardData.number}
                        onChange={(e) => setCardData(prev => ({ 
                          ...prev, 
                          number: formatCardNumber(e.target.value) 
                        }))}
                        maxLength={19}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Titolare
                      </label>
                      <input
                        type="text"
                        placeholder="Mario Rossi"
                        value={cardData.name}
                        onChange={(e) => setCardData(prev => ({ 
                          ...prev, 
                          name: e.target.value 
                        }))}
                        className="input-field"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Scadenza
                        </label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={cardData.expiry}
                          onChange={(e) => setCardData(prev => ({ 
                            ...prev, 
                            expiry: formatExpiry(e.target.value) 
                          }))}
                          maxLength={5}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cardData.cvc}
                          onChange={(e) => setCardData(prev => ({ 
                            ...prev, 
                            cvc: e.target.value.replace(/\D/g, '') 
                          }))}
                          maxLength={4}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Note */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                  <LockClosedIcon className="h-4 w-4" />
                  <span>I tuoi dati di pagamento sono protetti con crittografia SSL</span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 btn-secondary"
                    disabled={isProcessing}
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="flex-1 btn-primary flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Elaborazione...
                      </>
                    ) : (
                      `Paga €${estimatedCost.toFixed(2)}`
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
