# 🧪 Setup Rapido per Test OpenAI

## Configurazione Express per Test

Per testare subito le funzionalità reali con OpenAI:

### 1. Crea il file di configurazione
```bash
# Dalla root del progetto
echo "OPENAI_API_KEY=your-key-here" > .env.local
```

### 2. Inserisci la tua chiave OpenAI
Sostituisci `your-key-here` con la tua chiave API reale da [platform.openai.com](https://platform.openai.com)

### 3. Riavvia l'applicazione
```bash
# Ctrl+C per fermare se già in esecuzione
npm run dev
```

### 4. Test Immediato
✅ **Modalità Test Attiva** - Nessun controllo pagamenti
✅ Tutti gli utenti hanno "metodo di pagamento configurato"
✅ Nessun limite di trial
✅ Procede direttamente con le API OpenAI

## Cosa Testa

**File Audio Consigliati per Test:**
- 📱 Registrazione vocale di 30-60 secondi
- 🎧 File MP3/WAV di prova
- 💬 Parlato chiaro in italiano

**Cosa Aspettarsi:**
1. Upload immediato senza richiesta pagamento
2. Progress bar real-time
3. Trascrizione Whisper in ~30-60 secondi
4. Riassunto GPT-4 strutturato
5. Visualizzazione completa risultati

## Costi di Test

- **30 secondi audio**: ~$0.003
- **2 minuti audio**: ~$0.015  
- **5 minuti audio**: ~$0.035

## Fallback Automatico

**Se non configuri la chiave OpenAI:**
- ✅ App funziona comunque con dati mock
- ✅ UI/UX completa testabile
- ❌ Nessuna trascrizione/riassunto reale

## Debug

Controlla la console del browser per:
- ✅ "Avvio elaborazione per: [filename]"
- ✅ Job ID e progress updates
- ❌ Errori API o configurazione

---

**Pronto per il test! 🚀**
