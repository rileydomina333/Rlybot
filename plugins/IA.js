import fetch from 'node-fetch'

// Memorie per chat
let modalitaIncazzata = {}
let botAttivo = {}
let livelloAffetto = {}

let rispostaIA = async (m, { conn, text, fullText }) => {
    const comandoCompleto = fullText.toLowerCase().trim()
    const domanda = text.toLowerCase().trim()
    const chatId = m.chat

    // 0. Default
    if (botAttivo[chatId] === undefined) botAttivo[chatId] = true
    if (livelloAffetto[chatId] === undefined) livelloAffetto[chatId] = 0

    // Comandi on/off
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

    // 1. AFFETTO
    const triggerAffetto = ['ti voglio bene', 'ti amo', 'sei il migliore', 'sei un tesoro', 'ti adoro', 'grazie', 'sei carino', 'mi piaci', 'sei dolce']
    if (triggerAffetto.some(frase => domanda.includes(frase))) {
        livelloAffetto[chatId] = Math.min(livelloAffetto[chatId] + 1, 5)
        if (modalitaIncazzata[chatId]) {
            const risp = ['Tsk... smettila... mi fai arrossire, dannazione.', 'Oh. Ehm. Grazie. Non fare che ci prendi gusto.', 'Maledizione, sei carino anche tu. Contento?']
            return m.reply(risp[Math.floor(Math.random() * risp.length)])
        } else {
            const risp = ['Aww 🥺 Ti voglio bene anch\'io! Mi hai fatto sorridere.', 'Grazie di cuore ❤️ Significa tanto per me.', 'Sei un amore! Cosa posso fare per te ora?']
            return m.reply(risp[Math.floor(Math.random() * risp.length)])
        }
    }

    // 2. Modalità
    if (domanda === 'incazzati' || domanda === 'modalità incazzata') {
        modalitaIncazzata[chatId] = true
        return m.reply('Va bene... ora sono incazzato. Che diavolo vuoi?!')
    }
    if (domanda === 'calmati' || domanda === 'modalità gentile') {
        modalitaIncazzata[chatId] = false
        return m.reply('Ok, mi calmo. Scusa per prima. Come posso aiutarti?')
    }

    // 3. Chi sei
    if (['chi sei', 'chi sei?', 'chi sei tu'].includes(domanda)) {
        return m.reply('Sono RLY BOT, il bot di Riley. Sono qui per aiutarti con tutto quello che ti serve!')
    }
    if (domanda === 'sono riley') {
        return m.reply('Riley! Capo, bentornato! Dimmi tutto, sono a tua completa disposizione.')
    }

    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        let extraTono = ''
        if (livelloAffetto[chatId] > 0 &&!modalitaIncazzata[chatId]) {
            extraTono = ' L\'utente è stato gentile, sii più caloroso e amichevole.'
        }

        let systemPrompt = modalitaIncazzata[chatId]
          ? `Sei RLY BOT in modalità incazzata. Tono aggressivo e sarcastico. Puoi usare "merda", "dannazione". Sii breve, max 3 righe. Rispondi in italiano.`
            : `Sei RLY BOT, il bot di Riley. Sei gentile, educato e disponibile. Rispondi in modo utile e completo in italiano, max 5 righe.` + extraTono

        const fullPrompt = `${systemPrompt}\n\nDomanda: ${text}`

        // API FREE 2026 - Testate e funzionanti senza key
        const apis = [
            `https://api.vyro.ai/v2/chatbot?message=${encodeURIComponent(text)}&bot_name=RLY`,
            `https://api.monkedev.com/func/chatgpt-4?prompt=${encodeURIComponent(fullPrompt)}`,
            `https://chat.affiliateplus.ai/api/chat?text=${encodeURIComponent(text)}&botname=RLY`
        ]

        let risposta = null
        for (let url of apis) {
            try {
                const controller = new AbortController()
                const timeout = setTimeout(() => controller.abort(), 20000) // 20s timeout

                let res = await fetch(url, { signal: controller.signal })
                clearTimeout(timeout)

                if(!res.ok) continue
                let data = await res.json()

                // Estrai risposta in base all'API
                risposta = data.response || data.message || data.reply || data.result || data.text
                if (typeof risposta === 'string' && risposta.length > 3) break
            } catch {
                continue
            }
        }

        if (!risposta) throw 'Nessuna API ha risposto'

        // Pulisci risposta
        risposta = risposta.replace(/RLY BOT:|Bot:/gi, '').trim()

        // Filtro risposte inglesi
        if (risposta.includes('I cannot') || risposta.includes("I don't know")) {
            risposta = modalitaIncazzata[chatId]
              ? 'MA CHE NE SO, DANNATAMENTE?! Chiedi altro!'
                : 'Mi dispiace, su questo non so rispondere. Riformula?'
        }

        await m.reply(risposta)

    } catch (e) {
        console.log(e)
        let msgErrore = modalitaIncazzata[chatId]
          ? 'È ANDATO TUTTO A MERDA! I server sono morti! Riprova!'
            : 'Mi spiace, i server sono lenti ora. Riprova tra 10 secondi?'
        m.reply(msgErrore)
    }
}

let handler = async (m, { conn, text }) => {
    await rispostaIA(m, { conn, text, fullText: m.text })
}
handler.command = /^bot(?:\s+(.+))?$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>', 'bot on', 'bot off', 'ti voglio bene']

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