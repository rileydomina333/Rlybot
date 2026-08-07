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
        if (!ON) return 
        let domanda = text.replace('.bot ', '')
        let risposta = await ia(domanda)
        return m.reply(risposta)
    }
}

handler.all = async (m) => {
    if (!ON) return 
    if (m.fromMe) return
    if (m.text.startsWith('.')) return

    await conn.sendPresenceUpdate('composing', m.chat)
    let risposta = await ia(m.text)
    m.reply(risposta)
}

handler.command = /^bot$/i
export default handler

// IA POLLINATIONS - LA PIU STABILE
async function ia(prompt) {
    try {
        let url = `https://text.pollinations.ai/${encodeURIComponent("Sei RLY BOT. Rispondi in italiano, corto max 3 righe. Domanda: " + prompt)}`
        let {data} = await axios.get(url, {timeout: 15000})
        return data
    } catch (e) {
        console.log("POLLINATIONS ERROR:", e.message)
        return "Errore AI. Riprova tra 5s"
    }
}