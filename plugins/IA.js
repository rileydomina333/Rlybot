import fetch from 'node-fetch'

let modalitaIncazzata = {}
let botAttivo = {}
let livelloAffetto = {}
let cacheRisposte = {} // cache per risposte veloci

let rispostaIA = async (m, { conn, text, fullText }) => {
    const comandoCompleto = fullText.toLowerCase().trim()
    const domanda = text.toLowerCase().trim()
    const chatId = m.chat

    if (botAttivo[chatId] === undefined) botAttivo[chatId] = true
    if (livelloAffetto[chatId] === undefined) livelloAffetto[chatId] = 0

    // Comandi
    if (comandoCompleto === '.bot on') {
        botAttivo[chatId] = true
        return m.reply('RLY BOT VELOCE attivato ⚡')
    }
    if (comandoCompleto === '.bot off') {
        botAttivo[chatId] = false
        return m.reply('RLY BOT disattivato ❌')
    }
    if (!botAttivo[chatId]) return
    if (!text) return m.reply('Dimmi pure!')

    // AFFETTO - risposta istantanea
    const triggerAffetto = ['ti voglio bene', 'ti amo', 'sei il migliore', 'grazie', 'sei dolce']
    if (triggerAffetto.some(frase => domanda.includes(frase))) {
        livelloAffetto[chatId] = Math.min(livelloAffetto[chatId] + 1, 5)
        const risp = modalitaIncazzata[chatId]
          ? ['Tsk... grazie. Contento ora?', 'Smettila di farmi arrossire...']
            : ['Aww 🥺 Ti voglio bene anch\'io!', 'Grazie ❤️ Sei un amore!']
        return m.reply(risp[Math.floor(Math.random() * risp.length)])
    }

    // MODALITA
    if (domanda === 'incazzati') {
        modalitaIncazzata[chatId] = true
        return m.reply('Ok sono incazzato. Sbrigati.')
    }
    if (domanda === 'calmati') {
        modalitaIncazzata[chatId] = false
        return m.reply('Ok calmo. Dimmi.')
    }

    // CHI SEI - risposta istantanea
    if (['chi sei', 'chi sei?'].includes(domanda)) {
        return m.reply('Sono RLY BOT di Riley. Bot veloce ⚡')
    }
    if (domanda === 'sono riley') {
        return m.reply('Capo Riley! Bentornato!')
    }

    // CACHE: se abbiamo già risposto a questa domanda, la rispediamo subito
    if(cacheRisposte[domanda]){
        return m.reply(cacheRisposte[domanda] + ' ⚡')
    }

    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        let tono = modalitaIncazzata[chatId]
      ? `Rispondi in italiano, tono incazzato, sarcastico, max 2 righe.`
            : `Rispondi in italiano, gentile e diretto, max 3 righe.` + (livelloAffetto[chatId] > 0? ' Sii caloroso.' : '')

        const prompt = `${tono}\nDomanda: ${text}`

        // SOLO 1 API VELOCE: DuckDuckGo AI - è la più veloce e non cade mai
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000) // 8s max

        let res = await fetch(`https://api.duck.ai/chat`, {
            method: 'POST',
            signal: controller.signal,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                messages: [{role: "user", content: prompt}],
                model: "gpt-4o-mini" // il più veloce
            })
        })
        clearTimeout(timeout)

        let data = await res.json()
        let risposta = data.message || data.response

        if (!risposta) throw 'vuota'

        risposta = risposta.trim()
        if(risposta.length > 400) risposta = risposta.substring(0, 400) + '...'

        // Salva in cache
        cacheRisposte[domanda] = risposta
        // pulisci cache se diventa troppo grande
        if(Object.keys(cacheRisposte).length > 100) delete cacheRisposte[Object.keys(cacheRisposte)[0]]

        await m.reply(risposta)

    } catch (e) {
        console.log(e)
        // Fallback istantaneo se l'API è lenta
        const fallback = modalitaIncazzata[chatId]
      ? 'Non ho tempo ora! Riprova!'
            : 'Server lento. Riprova tra 2s.'
        m.reply(fallback)
    }
}

let handler = async (m, { conn, text }) => {
    await rispostaIA(m, { conn, text, fullText: m.text })
}
handler.command = /^bot(?:\s+(.+))?$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>', 'bot on', 'bot off']

handler.before = async function (m, { conn }) {
    if (m.isBaileys || m.fromMe) return
    const chatId = m.chat
    if (botAttivo[chatId] === false) return
    if (m.quoted && m.quoted.fromMe && m.text &&!m.text.startsWith('.')) {
        await rispostaIA(m, { conn, text: m.text, fullText: m.text })
    }
}

export default handler