import axios from 'axios'

const GROQ_KEY = 'AQ.Ab8RN6IZFlErNXaaHoNHtNOrMwbcyga-
Ept5SzzEs2qfKgNF9w' // << METTI QUI LA TUA KEY
let ON = false

let handler = async (m, {conn}) => {
    let text = m.text

    if (text === '.bot on') {
        ON = true
        return m.reply('✅ AI ATTIVA')
    }
    if (text === '.bot off') {
        ON = false
        return m.reply('❌ AI DISATTIVATA')
    }
    if (text.startsWith('.bot ')) {
        if (!ON) return // SE OFF NON RISPONDE
        let domanda = text.replace('.bot ', '')
        let risposta = await ia(domanda)
        return m.reply(risposta)
    }
}

handler.all = async (m) => {
    if (!ON) return // SE OFF NON RISPONDE
    if (m.fromMe) return
    if (m.text.startsWith('.')) return

    await conn.sendPresenceUpdate('composing', m.chat)
    let risposta = await ia(m.text)
    m.reply(risposta)
}

handler.command = /^bot$/i
export default handler

// IA GROQ CON KEY
async function ia(prompt) {
    try {
        let {data} = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.1-8b-instant", // il più veloce e gratis
            messages: [
                {role: "system", content: "Sei RLY BOT. Italiano, diretto, max 3 righe."},
                {role: "user", content: prompt}
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        })
        return data.choices[0].message.content
    } catch (e) {
        console.log("GROQ ERROR:", e.response?.data || e.message)
        return "Errore API. Controlla la key"
    }
}