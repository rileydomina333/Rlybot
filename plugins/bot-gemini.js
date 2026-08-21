import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix }) => {
    if (!text) return conn.reply(m.chat, `💠 *Esempio:* ${usedPrefix}bot come stai?`, m)
    
    let apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return conn.reply(m.chat, `💠 *Errore:* GEMINI_API_KEY non trovata nel .env`, m)

    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
        
        const payload = {
            contents: [{
                parts: [{ text: `Sei RLY BOT, un assistente. Rispondi in italiano, sii simpatico e diretto. Domanda: ${text}` }]
            }]
        }

        let { data } = await axios.post(url, payload)
        let reply = data.candidates[0].content.parts[0].text

        let caption = `
*⟡ RLY BOT AI ⟡*

💠 *Tu:* ${text}
💠 *Io:* ${reply}

*━━━━━━━━━━━━━━*
*│ Powered by Gemini 1.5 Flash*
*━━━━━━━━━━━━━━*
        `.trim()

        await conn.reply(m.chat, caption, m)

    } catch (e) {
        await conn.reply(m.chat, `💠 *Errore:* ${e.response?.data?.error?.message || e.message}`, m)
    }
}

handler.help = ['bot <domanda>']
handler.tags = ['ai']
handler.command = /^bot$/i
handler.limit = true // toglie 1 limit a chi lo usa

export default handler