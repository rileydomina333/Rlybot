import fetch from 'node-fetch'

let rispostaIA = async (m, { conn, text }) => {
    if (!text) return m.reply('CHE MERDA VUOI?! Scrivi la domanda dopo .bot o rispondi a un mio messaggio!')

    const domanda = text.toLowerCase().trim()

    // 1. Easter egg: sono Riley
    if (domanda === 'sono riley') {
        let frasi = [
            'OH FINALMENTE! Il capo! Stavo per buttare tutto nel cesso! Che si fa, boss?',
            'RILEY! Ma che fine avevi fatto, dannazione?! Stavo impazzendo! Comandi?',
            'ECCOLO! Il mio creatore! Sbrigati che sono incazzato nero!',
            'Maledizione, sei tu! Dimmi cosa devo spaccare prima che spacco il server!'
        ]
        return m.reply(frasi[Math.floor(Math.random() * frasi.length)])
    }

    // 2. Nuovo: chi sei?
    if (['chi sei', 'chi sei?', 'chi cazzo sei', 'chi cazzo sei?'].includes(domanda)) {
        return m.reply('Sono RLY BOT, il bot di Riley. Merda, non ti ricordi più chi comanda qui?!')
    }

    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        let prompt = `Sei RLY BOT, il bot incazzato di Riley. Rispondi sempre in italiano. Tono aggressivo e sarcastico. Puoi usare imprecazioni leggere tipo "merda", "dannazione", "maledizione", "che diavolo". Sii breve, brutale e veloce. Non usare insulti sessuali, bestemmie, o parolacce verso l'utente. Domanda: ${text}`
        
        // Triplo fallback + veloce
        const apis = [
            `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
            `https://api.makenai.uk/ia?text=${encodeURIComponent(prompt)}`,
            `https://api.nyxbot.xyz/ai/gemini?text=${encodeURIComponent(prompt)}`
        ]

        let risposta = null
        for (let url of apis) {
            try {
                let res = await fetch(url, { timeout: 8000 }) // 8s max per API
                let data = await res.text()
                if (data && data.length > 5) {
                    risposta = data
                    break
                }
            } catch { continue }
        }

        if (!risposta) throw 'Nessuna API ha risposto'
        if (risposta.includes('I cannot') || risposta.includes("I don't know")) {
            risposta = 'MA CHE NE SO, DANNATAMENTE?! Non ho la sfera di cristallo! Chiedi altro che questa è una merda di domanda!'
        }

        await m.reply(risposta)

    } catch (e) {
        console.log(e)
        m.reply('È ANDATO TUTTO A MERDA! Anche i server di backup sono morti! MANNAGGIA! Riprova dopo!')
    }
}

// 1. Comando normale .bot
let handler = async (m, { conn, text }) => {
    await rispostaIA(m, { conn, text })
}
handler.command = /^bot$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>']

// 2. Intercetta le risposte ai messaggi del bot
handler.before = async function (m, { conn }) {
    if (m.isBaileys) return
    if (m.fromMe) return
    
    // Se l'utente risponde a un messaggio del bot e non è un comando
    if (m.quoted && m.quoted.fromMe && m.text && !m.text.startsWith('.')) {
        await rispostaIA(m, { conn, text: m.text })
    }
}

export default handler