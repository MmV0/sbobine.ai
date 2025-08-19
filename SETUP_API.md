# Configurazione API Reali - Sbobine

## Setup per Integrazione OpenAI

Per utilizzare le funzionalità reali di trascrizione e riassunto, segui questi passaggi:

### 1. Ottieni una Chiave API OpenAI

1. Vai su [platform.openai.com](https://platform.openai.com)
2. Crea un account o accedi
3. Vai su "API Keys" nel dashboard
4. Genera una nuova chiave API
5. **IMPORTANTE**: Assicurati di avere crediti sufficienti nel tuo account

### 2. Configura le Variabili d'Ambiente

1. Crea un file `.env.local` nella root del progetto:
```bash
# Copia questo contenuto nel file .env.local
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

2. **IMPORTANTE**: Non committare mai questo file! È già incluso nel .gitignore.

### 3. Modelli Utilizzati

L'applicazione utilizza:
- **Trascrizione**: `whisper-1` - Modello Whisper di OpenAI
- **Riassunto**: `gpt-4` - GPT-4 per la generazione di riassunti strutturati

### 4. Costi Stimati

**Whisper (Trascrizione)**:
- $0.006 per minuto di audio

**GPT-4 (Riassunto)**:
- ~$0.03-0.06 per ogni riassunto (dipende dalla lunghezza)

**Esempio**: Un file audio di 10 minuti costa circa $0.06 per la trascrizione + $0.04 per il riassunto = **~$0.10 totale**

### 5. Test della Configurazione

1. Avvia l'applicazione: `npm run dev`
2. Registrati o accedi
3. Carica un file audio breve (1-2 minuti) per testare
4. Controlla la console del browser e del server per eventuali errori

### 6. Risoluzione Problemi

**Errore "insufficient_quota"**:
- Verifica di avere crediti nel tuo account OpenAI
- Aggiungi un metodo di pagamento su platform.openai.com

**Errore "invalid_api_key"**:
- Controlla che la chiave API sia corretta nel file .env.local
- Assicurati che non ci siano spazi extra nella chiave

**File troppo grandi**:
- Whisper supporta file fino a 25MB
- L'app limita a 200MB, ma consigliamo file più piccoli per costi ridotti

### 7. Modalità Demo vs Produzione

**Con API Key configurata**: Utilizza le API reali OpenAI
**Senza API Key**: Funziona in modalità demo con dati simulati

### 8. Struttura Directory Upload

I file audio vengono temporaneamente salvati in:
```
uploads/
├── timestamp_random.mp3
├── timestamp_random.wav
└── ...
```

### 9. Sicurezza

- Le chiavi API sono solo lato server
- I file vengono cancellati dopo l'elaborazione
- Non salvare mai chiavi API nel codice

### 10. Limiti di Rate

OpenAI ha limiti di rate per le API:
- Whisper: 50 richieste al minuto
- GPT-4: 500 richieste al minuto

L'app gestisce automaticamente questi limiti con retry e fallback.

---

## Avvio con API Reali

```bash
# 1. Configura .env.local con la tua chiave OpenAI
echo "OPENAI_API_KEY=sk-your-key-here" > .env.local

# 2. Avvia l'applicazione
npm run dev

# 3. Testa con un file audio breve
```

🎉 Ora puoi utilizzare la trascrizione e il riassunto reali con OpenAI!
