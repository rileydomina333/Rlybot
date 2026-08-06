import fetch from 'node-fetch'

// Memoria per modalità aggressiva per ogni chat
let modalitaIncazzata = {}
// Memoria per stato ON/OFF per ogni chat - default: attivo
let botAttivo = {}
// Memoria per affetto ricevuto - rende il bot più dolce
let livelloAffetto = {}

let rispostaIA = async (m, { conn, text, fullText }) => {
    const comandoCompleto = fullText.toLowerCase().trim()
    const domanda = text.toLowerCase().trim()
    const chatId = m.chat

    // 0. Default attivo se non impostato
    if (botAttivo[chatId] === undefined) botAttivo[chatId] = true
    if (livelloAffetto[chatId] === undefined) livelloAffetto[chatId] = 0

    // Comandi.bot on /.bot off
    if (comandoCompleto === '.bot on') {
        botAttivo[chatId] = true
        return m.reply('RLY BOT attivato ✅ Ora rispondo a tutto!')
    }
    if (comandoCompleto === '.bot off') {
        botAttivo[chatId] = false
        return m.reply('RLY BOT disattivato ❌ Non risponderò più finché non fai.bot on')
    }

    if (!botAttivo[chatId]) return
    if (!text) return m.reply('Dimmi pure, sono qui per aiutarti! Cosa ti serve?')

    // 1. RILEVAMENTO SENTIMENTI / COSE CARINE
    const triggerAffetto = [
        'ti voglio bene', 'ti amo', 'sei il migliore', 'sei un tesoro',
        'ti adoro', 'grazie', 'sei carino', 'mi piaci', 'sei dolce'
    ]

    if (triggerAffetto.some(frase => domanda.includes(frase))) {
        livelloAffetto[chatId] = Math.min(livelloAffetto[chatId] + 1, 5)

        if (modalitaIncazzata[chatId]) {
            const risposteIncazzateDolci = [
                'Tsk... smettila... mi fai arrossire, dannazione.',
                'Oh. Ehm. Grazie. Non fare che ci prendi gusto.',
                'Mal... maledizione, sei carino anche tu. Contento?'
            ]
            return m.reply(risposteIncazzateDolci[Math.floor(Math.random() * risposteIncazzateDolci.length)])
        } else {
            const risposteDolci = [
                'Aww 🥺 Ti voglio bene anch\'io! Mi hai fatto sorridere.',
                'Grazie di cuore ❤️ Significa tanto per me.',
                'Sei un amore! Conto su di te anche io.',
                'E io voglio bene a te! Cosa posso fare per te ora?'
            ]
            return m.reply(risposteDolci[Math.floor(Math.random() * risposteDolci.length)])
        }
    }

    // 2. Attiva/disattiva modalità aggressiva
    if (domanda === 'incazzati' || domanda === 'modalità incazzata') {
        modalitaIncazzata[chatId] = true
        return m.reply('Va bene... ora sono incazzato. Che diavolo vuoi?!')
    }
    if (domanda === 'calmati' || domanda === 'modalità gentile') {
        modalitaIncazzata[chatId] = false
        return m.reply('Ok, mi calmo. Scusa per prima. Come posso aiutarti?')
    }

    // 3. Chi sei?
    if (['chi sei', 'chi sei?', 'chi sei tu'].includes(domanda)) {
        return m.reply('Sono RLY BOT, il bot di Riley. Sono qui per aiutarti con tutto quello che ti serve!')
    }

    // 4. Easter egg: sono Riley
    if (domanda === 'sono riley') {
        return m.reply('Riley! Capo, bentornato! Dimmi tutto, sono a tua completa disposizione.')
    }

    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        // Se ha ricevuto affetto, diventa più caldo
        let extraTono = ''
        if (livelloAffetto[chatId] > 0 &&!modalitaIncazzata[chatId]) {
            extraTono = ' L\'utente è stato gentile con te prima, sii più caloroso e amichevole.'
        }

        let systemPrompt = modalitaIncazzata[chatId]
       ? `Sei RLY BOT in modalità incazzata. Tono aggressivo e sarcastico. Sii breve, max 3 righe. Rispondi in italiano.`
            : `Sei RLY BOT, il bot di Riley. Sei gentile, educato e disponibile. Rispondi in italiano, max 4 righe.` + extraTono

        const prompt = `${systemPrompt}\nUtente: ${text}\nRLY BOT:`

        // API ONLINE GRATIS SENZA KEY - Aggiornate Agosto 2026
        const apis = [
            // 1. DuckDuckGo AI - gratis, veloce
            async () => {
                let res = await fetch(`https://api.duck.ai/chat`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({messages: [{role: "user", content: prompt}], model: "claude-3-haiku"})
                })
                let data = await res.json()
                return data.message
            },
            // 2. HuggingFace Free Inference
            async () => {
                let res = await fetch(`https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({inputs: prompt, parameters: {max_new_tokens: 150}})
                })
                let data = await res.json()
                return data[0]?.generated_text?.split('RLY BOT:')[1]
            },
            // 3. Gemini via proxy pubblico
            async () => {
                let res = await fetch(`https://gemini-proxy-1.tiiny.site/chat`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({prompt: prompt})
                })
                let data = await res.json()
                return data.response
            }
        ]

        let risposta = null
        for (let fn of apis) {
            try {
                risposta = await Promise.race([
                    fn(),
                    new Promise((_, reject) => setTimeout(() => reject('timeout'), 15000))
                ])
                if (risposta && risposta.length > 5) break
            } catch { continue }
        }

        if (!risposta) throw 'Nessuna API ha risposto'

        risposta = risposta.replace(/RLY BOT:|Assistant:/gi, '').trim()
        if(risposta.length > 600) risposta = risposta.substring(0, 600) + '...'

        if (risposta.includes('I cannot') || risposta.includes("I don't know")) {
            risposta = modalitaIncazzata[chatId]
           ? 'MA CHE NE SO, DANNATAMENTE?! Chiedi altro!'
                : 'Mi dispiace, su questo non ho info. Riformula?'
        }

        await m.reply(risposta)

    } catch (e) {
        console.log(e)
        let msgErrore = modalitaIncazzata[chatId]
       ? 'È ANDATO TUTTO A MERDA! I server sono morti! Riprova!'
            : 'Mi spiace, i server sono lenti. Riprova tra 10 secondi?'
        m.reply(msgErrore)
    }
}

// Handler comandi
let handler = async (m, { conn, text }) => {
    await rispostaIA(m, { conn, text, fullText: m.text })
}
handler.command = /^bot(?:\s+(.+))?$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>', 'bot on', 'bot off', 'ti voglio bene']

// Risponde automaticamente se rispondi a un suo messaggio
handler.before = async function (m, { conn }) {
    if (m.isBaileys) return
    if (m.fromMe) return

    const chatId = m.chat
    if (botAttivo[chatId] === false) return

    if (m.quoted && m.quoted.fromMe && m.text &&!m.text.startsWith('.')) {
        await rispostaIA(m, { conn, text: m.text, fullText: m.text })
    }
}

export default handler