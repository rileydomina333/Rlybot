import fetch from 'node-fetch'

// Memoria per modalità aggressiva per ogni chat
let modalitaIncazzata = {}
// Memoria per stato ON/OFF per ogni chat - default: attivo
let botAttivo = {}

let rispostaIA = async (m, { conn, text }) => {
    const domanda = text.toLowerCase().trim()
    const chatId = m.chat

    // 0. Controllo ON/OFF - default true se non impostato
    if (botAttivo[chatId] === undefined) botAttivo[chatId] = true

    // Comandi.bot on /.bot off
    if (domanda === '.bot on') {
        botAttivo[chatId] = true
        return m.reply('RLY BOT attivato ✅ Ora rispondo a tutto!')
    }

    if (domanda === '.bot off') {
        botAttivo[chatId] = false
        return m.reply('RLY BOT disattivato ❌ Non risponderò più finché non fai.bot on')
    }

    // Se il bot è disattivato, ignora tutto il resto
    if (!botAttivo[chatId]) return

    if (!text) return m.reply('Dimmi pure, sono qui per aiutarti! Cosa ti serve?')

    // 1. Attiva/disattiva modalità aggressiva
    if (domanda === 'incazzati' || domanda === 'modalità incazzata') {
        modalitaIncazzata[chatId] = true
        return m.reply('Va bene... ora sono incazzato. Che diavolo vuoi?!')
    }

    if (domanda === 'calmati' || domanda === 'modalità gentile') {
        modalitaIncazzata[chatId] = false
        return m.reply('Ok, mi calmo. Scusa per prima. Come posso aiutarti?')
    }

    // 2. Chi sei?
    if (['chi sei', 'chi sei?', 'chi sei tu'].includes(domanda)) {
        return m.reply('Sono RLY BOT, il bot di Riley. Sono qui per aiutarti con tutto quello che ti serve!')
    }

    // 3. Easter egg: sono Riley
    if (domanda === 'sono riley') {
        return m.reply('Riley! Capo, bentornato! Dimmi tutto, sono a tua completa disposizione.')
    }

    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        // Controlla se deve essere aggressivo o gentile
        let tono = modalitaIncazzata[chatId]
          ? `Sei RLY BOT in modalità incazzata. Tono aggressivo e sarcastico. Puoi usare imprecazioni leggere tipo "merda", "dannazione", "maledizione". Sii breve e brutale. Non usare insulti sessuali o verso l'utente.`
            : `Sei RLY BOT, il bot di Riley. Sei generoso, educato e disponibile. Rispondi sempre in modo gentile, completo e utile. Aiuta l'utente al meglio delle tue capacità.`

        let prompt = `${tono} Rispondi sempre in italiano. Domanda: ${text}`

        // Triplo fallback per velocità
        const apis = [
            `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
            `https://api.makenai.uk/ia?text=${encodeURIComponent(prompt)}`,
            `https://api.nyxbot.xyz/ai/gemini?text=${encodeURIComponent(prompt)}`
        ]

        let risposta = null
        for (let url of apis) {
            try {
                let res = await fetch(url, { timeout: 8000 })
                let data = await res.text()
                if (data && data.length > 5) {
                    risposta = data
                    break
                }
            } catch { continue }
        }

        if (!risposta) throw 'Nessuna API ha risposto'

        // Filtro risposte rotte dell'IA
        if (risposta.includes('I cannot') || risposta.includes("I don't know")) {
            risposta = modalitaIncazzata[chatId]
              ? 'MA CHE NE SO, DANNATAMENTE?! Chiedi altro che questa domanda fa schifo!'
                : 'Mi dispiace, su questo non ho informazioni. Puoi provare a riformulare la domanda?'
        }

        await m.reply(risposta)

    } catch (e) {
        console.log(e)
        let msgErrore = modalitaIncazzata[chatId]
          ? 'È ANDATO TUTTO A MERDA! I server sono morti! Riprova, maledizione!'
            : 'Mi spiace, c\'è stato un problema con i server. Potresti riprovare tra un attimo per favore?'
        m.reply(msgErrore)
    }
}

// 1. Comando normale.bot
let handler = async (m, { conn, text }) => {
    await rispostaIA(m, { conn, text })
}
handler.command = /^bot$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>']

// 2. Risponde automaticamente se rispondi a un suo messaggio
handler.before = async function (m, { conn }) {
    if (m.isBaileys) return
    if (m.fromMe) return

    const chatId = m.chat
    // Se il bot è off in questa chat, ignora anche i quoted
    if (botAttivo[chatId] === false) return

    // Se rispondi a un messaggio del bot, risponde senza.bot
    if (m.quoted && m.quoted.fromMe && m.text &&!m.text.startsWith('.')) {
        await rispostaIA(m, { conn, text: m.text })
    }
}

export default handler