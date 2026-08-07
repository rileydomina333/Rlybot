import axios from 'axios'

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
    if (text.startsWith('.bot ') && text!== '.bot on' && text!== '.bot off') {
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

// IA DUCKDUCKGO SENZA KEY
async function ia(prompt) {
    try {
        let {data} = await axios.post('https://duckduckgo.com/duckchat/v1/chat', 
        {
            model: "gpt-4o-mini", // modello gratis di DDG
            messages: [
                {role: "system", content: "Sei RLY BOT. Rispondi in italiano, corto, max 3 righe."},
                {role: "user", content: prompt}
            ]
        },
        {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Content-Type": "application/json"
            }
        })
        return data.message
    } catch (e) {
        console.log("DDG ERROR:", e.response?.data || e.message)
        return "Errore AI. Riprova"
    }
}