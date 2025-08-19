'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/providers/AuthProvider'
import {
  ArrowLeftIcon,
  UserIcon,
  CogIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  CreditCardIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline'
import { useAppNavigation } from '@/utils/navigation'

export default function SettingsPage() {
  const { user, updateUser, loading } = useAuth()
  const { navigateToDashboard } = useAppNavigation()
  
  // Stati per le impostazioni
  const [settings, setSettings] = useState({
    // Profilo
    name: user?.name || '',
    email: user?.email || '',
    
    // Notifiche
    emailNotifications: true,
    pushNotifications: true,
    transcriptionCompleted: true,
    summaryReady: true,
    weeklyReports: false,
    
    // Privacy
    dataSharing: false,
    analytics: true,
    
    // Interfaccia
    language: 'it',
    theme: 'light',
    autoSave: true,
    
    // Audio
    defaultLanguage: 'it',
    autoTranscribe: false,
    qualityPreset: 'high'
  })
  
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'interface' | 'audio' | 'billing'>('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Carica le impostazioni salvate e sincronizza con i dati utente
  useEffect(() => {
    if (user) {
      const savedSettings = localStorage.getItem('sbobine_settings')
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings)
          setSettings(prev => ({
            ...prev,
            name: user.name, // Sempre usa i dati aggiornati dall'utente
            email: user.email, // Sempre usa i dati aggiornati dall'utente
            ...parsedSettings // Sovrascrivi con le impostazioni salvate
          }))
        } catch (error) {
          console.error('Errore nel caricamento impostazioni:', error)
        }
      } else {
        // Se non ci sono impostazioni salvate, usa solo i dati dell'utente
        setSettings(prev => ({
          ...prev,
          name: user.name,
          email: user.email
        }))
      }
    }
  }, [user])

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    if (!user) return
    
    try {
      // Aggiorna solo i dati del profilo utente
      await updateUser({
        name: settings.name,
        email: settings.email
      })
      
      // Salva le altre impostazioni nel localStorage per questa demo
      const userSettings = {
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        transcriptionCompleted: settings.transcriptionCompleted,
        summaryReady: settings.summaryReady,
        weeklyReports: settings.weeklyReports,
        dataSharing: settings.dataSharing,
        analytics: settings.analytics,
        language: settings.language,
        theme: settings.theme,
        autoSave: settings.autoSave,
        defaultLanguage: settings.defaultLanguage,
        autoTranscribe: settings.autoTranscribe,
        qualityPreset: settings.qualityPreset
      }
      localStorage.setItem('sbobine_settings', JSON.stringify(userSettings))
      
      setIsEditing(false)
      setSaveSuccess(true)
      
      // Nascondi il messaggio di successo dopo 3 secondi
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Errore nel salvataggio:', error)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profilo', icon: UserIcon },
    { id: 'notifications', name: 'Notifiche', icon: BellIcon },
    { id: 'privacy', name: 'Privacy', icon: EyeIcon },
    { id: 'interface', name: 'Interfaccia', icon: CogIcon },
    { id: 'audio', name: 'Audio', icon: GlobeAltIcon },
    { id: 'billing', name: 'Fatturazione', icon: CreditCardIcon }
  ]

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateToDashboard('library')}
              type="button"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Torna alla dashboard
            </button>
          </div>
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">Impostazioni</h1>
            <p className="mt-2 text-gray-600">
              Gestisci le tue preferenze e impostazioni dell'account.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="card">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Profilo</h2>
                    <div className="flex items-center space-x-3">
                      {saveSuccess && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-1 rounded text-sm">
                          ✓ Modifiche salvate
                        </div>
                      )}
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="btn-secondary text-sm"
                      >
                        {isEditing ? 'Annulla' : 'Modifica'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome completo
                      </label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => handleSettingChange('name', e.target.value)}
                        disabled={!isEditing}
                        className="input-field"
                        placeholder="Il tuo nome"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleSettingChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="input-field"
                        placeholder="La tua email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value="••••••••"
                          disabled={!isEditing}
                          className="input-field pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex space-x-3">
                        <button 
                          onClick={handleSave} 
                          disabled={loading}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Salvataggio...' : 'Salva modifiche'}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          disabled={loading}
                          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Annulla
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notifiche</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Canali di notifica</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Email</p>
                            <p className="text-sm text-gray-500">Ricevi notifiche via email</p>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={settings.emailNotifications}
                              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Push notifications</p>
                            <p className="text-sm text-gray-500">Notifiche sul browser</p>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={settings.pushNotifications}
                              onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Tipi di notifica</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Trascrizione completata</p>
                            <p className="text-sm text-gray-500">Quando un file audio è stato trascritto</p>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={settings.transcriptionCompleted}
                              onChange={(e) => handleSettingChange('transcriptionCompleted', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Riassunto pronto</p>
                            <p className="text-sm text-gray-500">Quando il riassunto è stato generato</p>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={settings.summaryReady}
                              onChange={(e) => handleSettingChange('summaryReady', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Report settimanali</p>
                            <p className="text-sm text-gray-500">Statistiche del tuo utilizzo</p>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={settings.weeklyReports}
                              onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy e Sicurezza</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Condivisione dati</p>
                        <p className="text-sm text-gray-500">Permetti la condivisione anonima dei dati per migliorare il servizio</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.dataSharing}
                          onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Analytics</p>
                        <p className="text-sm text-gray-500">Aiutaci a migliorare con statistiche di utilizzo anonime</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.analytics}
                          onChange={(e) => handleSettingChange('analytics', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Gestione Account</h3>
                      <div className="space-y-4">
                        <button className="btn-secondary text-red-600 border-red-300 hover:bg-red-50">
                          Elimina Account
                        </button>
                        <p className="text-sm text-gray-500">
                          Eliminando l'account tutti i tuoi dati verranno rimossi permanentemente.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Interface Tab */}
              {activeTab === 'interface' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Interfaccia</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lingua
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="input-field"
                      >
                        <option value="it">Italiano</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tema
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['light', 'dark', 'auto'].map((theme) => (
                          <button
                            key={theme}
                            onClick={() => handleSettingChange('theme', theme)}
                            className={`p-3 border rounded-lg text-center ${
                              settings.theme === theme
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {theme === 'light' && <SunIcon className="h-5 w-5 mx-auto mb-1" />}
                            {theme === 'dark' && <MoonIcon className="h-5 w-5 mx-auto mb-1" />}
                            {theme === 'auto' && <CogIcon className="h-5 w-5 mx-auto mb-1" />}
                            <p className="text-xs font-medium capitalize">{theme === 'auto' ? 'Automatico' : theme === 'light' ? 'Chiaro' : 'Scuro'}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Salvataggio automatico</p>
                        <p className="text-sm text-gray-500">Salva automaticamente le modifiche</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.autoSave}
                          onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Tab */}
              {activeTab === 'audio' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Impostazioni Audio</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lingua predefinita
                      </label>
                      <select
                        value={settings.defaultLanguage}
                        onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                        className="input-field"
                      >
                        <option value="it">Italiano</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualità trascrizione
                      </label>
                      <select
                        value={settings.qualityPreset}
                        onChange={(e) => handleSettingChange('qualityPreset', e.target.value)}
                        className="input-field"
                      >
                        <option value="high">Alta qualità (più lenta)</option>
                        <option value="balanced">Bilanciata (consigliata)</option>
                        <option value="fast">Veloce (meno precisa)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Trascrizione automatica</p>
                        <p className="text-sm text-gray-500">Avvia automaticamente la trascrizione dopo il caricamento</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.autoTranscribe}
                          onChange={(e) => handleSettingChange('autoTranscribe', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Fatturazione</h2>
                  
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                      <h3 className="text-lg font-medium text-blue-900 mb-2">Piano Attuale: Test Mode</h3>
                      <p className="text-sm text-blue-700">
                        Stai utilizzando l'app in modalità test. Tutte le funzionalità sono disponibili gratuitamente.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Utilizzo</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Trascrizioni questo mese</span>
                          <span className="text-sm font-medium">12 / ∞</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Minuti elaborati</span>
                          <span className="text-sm font-medium">245 / ∞</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Storage utilizzato</span>
                          <span className="text-sm font-medium">1.2 GB / ∞</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Metodi di pagamento</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Nessun metodo di pagamento configurato (modalità test).
                      </p>
                      <button className="btn-secondary" disabled>
                        Aggiungi metodo di pagamento
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
