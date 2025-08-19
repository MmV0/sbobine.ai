# Sbobine - Demo Applicazione di Trascrizione e Sintesi Lezioni

![Sbobine Logo](https://via.placeholder.com/400x100/3B82F6/FFFFFF?text=Sbobine)

Una demo completa dell'applicazione **Sbobine** che trasforma registrazioni audio di lezioni in trascrizioni e riassunti strutturati per lo studio, seguendo le specifiche del PRD fornito.

## 🎯 Caratteristiche Principali

### ✅ Autenticazione Completa
- Login con email/password
- Integrazione Google Sign-In
- Integrazione Apple Sign-In
- Registrazione utenti con validazione

### ✅ Upload e Gestione File
- Drag & drop per file audio (MP3, WAV, M4A, AAC, OGG)
- Progress tracking durante l'upload
- Validazione formato e dimensione (max 200MB)
- Selezione lingua della registrazione

### ✅ Processo di Trascrizione
- Simulazione del processo STT (Speech-to-Text)
- Stati in tempo reale: UPLOADED → PROCESSING → TRANSCRIBED → SUMMARIZING → READY
- Indicatori di progresso e feedback utente

### ✅ Generazione Riassunto Strutturato
- **Panoramica**: Sintesi generale della lezione
- **Concetti Chiave**: Punti principali evidenziati
- **Definizioni**: Glossario dei termini importanti
- **Date Importanti**: Eventi e date rilevanti
- **Domande e Risposte**: Q&A estratte dal contenuto

### ✅ Editor di Trascrizione
- Visualizzazione con timestamp
- Modalità editing con salvataggio automatico
- Confronto tra trascrizione grezza e pulita
- Interfaccia intuitiva per correzioni

### ✅ Sistema di Annotazioni
- Annotazioni contestuali ancorate al testo
- Editor di note con posizionamento preciso
- Visualizzazione del contesto
- Gestione completa (CRUD) delle annotazioni

### ✅ Export Avanzato
- Export in PDF formattato e professionale
- Export in Markdown per editing
- Configurazione personalizzabile del contenuto
- Download automatico dei file

### ✅ Sistema di Pagamento
- Trial gratuito (prima trascrizione ≤ 10 min)
- Simulazione integrazione Stripe
- Calcolo costi dinamico (€0.08/minuto)
- Modal di pagamento con validazione carta

### ✅ Dashboard Completa
- Libreria delle lezioni con filtri
- Statistiche e metadati
- Stati di elaborazione in tempo reale
- Interfaccia responsive mobile-first

## 🚀 Avvio della Demo

### Prerequisiti
- Node.js 18+
- npm o yarn
- **Opzionale**: Chiave API OpenAI per funzionalità reali

### Installazione

1. **Clona e installa le dipendenze:**
   ```bash
   cd sbobine_app
   npm install
   ```

2. **Configurazione API (Opzionale):**
   ```bash
   # Per utilizzare le API reali di OpenAI
   echo "OPENAI_API_KEY=your-api-key-here" > .env.local
   ```
   📋 Vedi [SETUP_API.md](./SETUP_API.md) per istruzioni dettagliate

3. **Avvia il server di sviluppo:**
   ```bash
   npm run dev
   ```

4. **Apri il browser:**
   ```
   http://localhost:3000
   ```

### 🔑 Modalità di Funzionamento

**🤖 Con API OpenAI configurata:**
- Trascrizione reale con Whisper
- Riassunti strutturati con GPT-4
- Costi: ~$0.10 per 10 minuti di audio

**🎭 Modalità Demo (senza API):**
- Dati simulati e mock
- Funzionalità complete per test UI/UX
- Gratuito per sviluppo e presentazioni

## 🎮 Come Utilizzare la Demo

### 1. Autenticazione
- **Registrazione rapida**: Usa un email qualsiasi e password (min 6 caratteri)
- **Google/Apple**: Simula il login social (dati mock)
- **Demo Account**: Oppure usa `demo@sbobine.com` / `password123`

### 2. Upload di una Lezione
- Vai alla tab "Nuova Trascrizione"
- Trascina un file audio o clicca per selezionare
- Seleziona la lingua (italiano preimpostato)
- La prima trascrizione è gratuita (trial)

### 3. Visualizzazione Risultati
- Vai alla tab "Le Mie Lezioni"
- Clicca su una lezione completata per vederla
- Esplora le tre sezioni: Trascrizione, Riassunto, Annotazioni

### 4. Editing e Annotazioni
- Clicca "Modifica" per editare la trascrizione
- Aggiungi annotazioni nella sezione dedicata
- Salva le modifiche automaticamente

### 5. Export
- Clicca "Esporta" per scaricare
- Scegli tra PDF o Markdown
- Configura quali sezioni includere

## 🧪 Dati di Esempio

La demo include lezioni precaricate per mostrare tutte le funzionalità:

1. **Matematica - Derivate** (30 min) ✅ Completata
2. **Storia - Prima Guerra Mondiale** (40 min) ✅ Completata  
3. **Fisica Quantistica** (60 min) 🔄 In elaborazione

## 🛠 Architettura Tecnica

### Frontend
- **Framework**: Next.js 14 con App Router
- **Styling**: Tailwind CSS + Headless UI
- **Stato**: React Query + Context API
- **Form**: React Hook Form
- **Icone**: Heroicons
- **Export**: jsPDF + Markdown

### Simulazioni Backend
- **Storage**: LocalStorage per persistenza demo
- **API**: Mock functions per simulare chiamate server
- **Job Processing**: Simulazione asincrona con timeout
- **Pagamenti**: Mock Stripe integration

### Caratteristiche UX/UI
- Design responsive mobile-first
- Animazioni fluide con Framer Motion
- Loading states e feedback visivi
- Accessibilità WCAG 2.1 AA
- Dark mode ready (configurabile)

## 📋 Conformità al PRD

### ✅ Requisiti Funzionali Implementati
- [x] Upload file audio con validazione
- [x] Trascrizione automatica simulata
- [x] Sintesi strutturata (Panoramica, Concetti, Definizioni, Date, Q&A)
- [x] Editor trascrizione con annotazioni
- [x] Export PDF e Markdown
- [x] Autenticazione multi-provider
- [x] Sistema pagamenti pay-per-use
- [x] Trial gratuito con controlli anti-abuso
- [x] Dashboard libreria lezioni

### ✅ Requisiti Non Funzionali
- [x] UI responsive e accessibile
- [x] Performance ottimizzate
- [x] Sicurezza (simulata) e privacy
- [x] Scalabilità architetturale
- [x] UX fluida e intuitiva

### ✅ Flussi Utente
- [x] Onboarding completo
- [x] Upload → Elaborazione → Risultati
- [x] Editing e annotazioni
- [x] Export e condivisione
- [x] Gestione pagamenti

## 🎨 Screenshots

La demo include:
- 🔐 **Pagina di Login/Registrazione** con social auth
- 📊 **Dashboard** con tab upload e libreria
- ⬆️ **Sezione Upload** con drag&drop e preview
- 📝 **Visualizzatore Lezione** con tab multiple
- ✏️ **Editor Trascrizione** con timestamp
- 📑 **Visualizzatore Riassunto** strutturato
- 📌 **Pannello Annotazioni** interattivo
- 💳 **Modal Pagamento** Stripe-style
- 📤 **Export Modal** configurabile

## 🔧 Sviluppi Futuri

Funzionalità non implementate in questa demo ma pianificate:

- [ ] Integrazione STT/LLM reale (Whisper + GPT-4)
- [ ] Backend serverless con job queue
- [ ] Database Postgres per persistenza
- [ ] Integrazione Stripe completa
- [ ] Mobile app nativa
- [ ] Collaborazione multi-utente
- [ ] Traduzione automatica
- [ ] Live transcription

## 📞 Supporto

Questa è una demo tecnica che simula tutte le funzionalità principali dell'applicazione Sbobine secondo il PRD fornito.

---

**Made with ❤️ for educational purposes**  
*Demo completa dell'ecosistema Sbobine - Trascrizione e Sintesi Lezioni*
