import fetch from 'node-fetch'

let rispostaIA = async (m, { conn, text }) => {
    if (!text) return m.reply('CHE MERDA VUOI?! SCRIVI!')

    if (text.toLowerCase().trim() === 'sono riley') {
        let frasi = [
            'RILEY! Sbrigati che non ho tempo da perdere, MANNAGGIA!',
            'ECCOLO! IL CAPO! Dimmi cosa spacco prima che esplodo!',
            'RILEY PORCA MISERIA! Dove diavolo eri?! COMANDI?!',
            'OH MENO MALE! RILEY! Sbrigati che sto per lanciare tutto!'
        ]
        return m.reply(frasi[Math.floor(Math.random() * frasi.length)])
    }

    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000)
        
        let prompt = `Rispondi nervoso e breve in italiano. 1-2 frasi secche. Usa "merda", "dannazione", "maledizione", "mannaggia". Non insultare l'utente, no termini sessuali. Domanda: ${text}`
        
        let res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
            signal: controller.signal
        })
        clearTimeout(timeout)

        let risposta = await res.text()
        if (!risposta || risposta.includes('I cannot') || risposta.includes("I don't know")) {
            throw 'Bloccato'
        }
        await m.reply(risposta)

    } catch (e) {
        m.reply('TROPPO LENTO! IL SERVER FA SCHIFO! Riprova, MANNAGGIA!')
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await rispostaIA(m, { conn, text })
}

// Questi 4 campi sono obbligatori per molti bot
handler.help = ['bot <testo>']
handler.tags = ['ai']
handler.command = /^bot$/i
handler.register = true

// Risposta ai messaggi del bot
handler.before = async function (m, { conn }) {
    if (m.isBaileys || m.fromMe) return
    if (m.quoted && m.quoted.fromMe && m.text && !m.text.startsWith('.') && !m.text.startsWith('!')) {
        await rispostaIA(m, { conn, text: m.text })
    }
}

export default handler