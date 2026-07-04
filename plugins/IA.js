import fetch from 'node-fetch'

let modalitaIncazzata = {}

let rispostaIA = async (m, { conn, text }) => {
    if (!text) return m.reply('Dimmi pure, sono qui per aiutarti! Cosa ti serve?')

    const domanda = text.toLowerCase().trim()
    const chatId = m.chat

    if (domanda === 'incazzati' || domanda === 'modalità incazzata') {
        modalitaIncazzata[chatId] = true
        return m.reply('Va bene... ora sono incazzato. Che diavolo vuoi?!')
    }

    if (domanda === 'calmati' || domanda === 'modalità gentile') {
        modalitaIncazzata[chatId] = false
        return m.reply('Ok, mi calmo. Scusa per prima. Come posso aiutarti?')
    }

    if (['chi sei', 'chi sei?', 'chi sei tu'].includes(domanda)) {
        return m.reply('Sono RLY BOT, il bot di Riley. Sono qui per aiutarti con tutto quello che ti serve!')
    }

    if (domanda === 'sono riley') {
        return m.reply('Riley! Capo, bentornato! Dimmi tutto, sono a tua completa disposizione.')
    }

    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        let tono = modalitaIncazzata[chatId]
          ? `Sei RLY BOT in modalità incazzata. Tono aggressivo e sarcastico. Puoi usare imprecazioni leggere tipo "merda", "dannazione", "maledizione". Sii breve e brutale. Non usare insulti sessuali o verso l'utente.`
            : `Sei RLY BOT, il bot di Riley. Sei generoso, educato e disponibile. Rispondi sempre in modo gentile, completo e utile. Aiuta l'utente al meglio delle tue capacità.`

        let prompt = `${tono} Rispondi sempre in italiano. Domanda: ${text}`

        // FIX: endpoint aggiornati + header referrer per Pollinations
        const apis = [
            {
                url: `https://api.pollinations.ai/prompt/${encodeURIComponent(prompt)}`,
                headers: { 'Referer': 'https://rlybot.xyz' } // metti il tuo dominio/repo
            },
            `https://api.makenai.uk/ia?text=${encodeURIComponent(prompt)}`,
            `https://api.nyxbot.xyz/ai/gemini?text=${encodeURIComponent(prompt)}`
        ]

        let risposta = null
        for (let api of apis) {
            try {
                let res
                if (typeof api === 'object') {
                    res = await fetch(api.url, {
                        timeout: 8000,
                        headers: api.headers
                    })
                } else {
                    res = await fetch(api, { timeout: 8000 })
                }

                if (!res.ok) continue // skippa se 500, 503, ecc

                let data = await res.text()
                if (data && data.length > 5 &&!data.includes('ENOSPC')) {
                    risposta = data
                    break
                }
            } catch { continue }
        }

        if (!risposta) throw 'Nessuna API ha risposto'

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

let handler = async (m, { conn, text }) => {
    await rispostaIA(m, { conn, text })
}
handler.command = /^bot$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>']

handler.before = async function (m, { conn }) {
    if (m.isBaileys) return
    if (m.fromMe) return
    if (m.quoted && m.quoted.fromMe && m.text &&!m.text.startsWith('.')) {
        await rispostaIA(m, { conn, text: m.text })
    }
}

export default handler