let attivo = false // unico stato per tutto il bot

let handler = async (m, {conn, text}) => {
    let msg = text.toLowerCase()

    if (msg === '.bot on') {
        attivo = true
        return m.reply('✅ AI ATTIVA')
    }
    if (msg === '.bot off') {
        attivo = false
        return m.reply('❌ AI DISATTIVATA')
    }
    if (msg.startsWith('.bot ')) {
        if (!attivo) return // se off non risponde
        let domanda = text.slice(5)
        let risposta = await ia(domanda)
        return m.reply(risposta)
    }
}

handler.all = async (m) => {
    if (!attivo) return // se off esce subito
    if (m.fromMe) return
    if (m.text.startsWith('.')) return

    await conn.sendPresenceUpdate('composing', m.chat)
    let risposta = await ia(m.text)
    m.reply(risposta)
}

handler.command = /^bot$/i
export default handler

// Funzione AI super semplice senza key
async function ia(prompt) {
    try {
        let res = await fetch('https://api.gptgo.ai/v1/chat/completions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {role: "system", content: "Sei RLY BOT. Rispondi corto, max 2 righe."},
                    {role: "user", content: prompt}
                ]
            })
        })
        let json = await res.json()
        return json.choices[0].message.content
    } catch {
        return "Errore AI"
    }
}