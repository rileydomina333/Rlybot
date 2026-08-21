import { search } from 'duck-duck-scrape'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `Esempio: ${usedPrefix + command} spiegami la quantistica 🤖`, m)
    
    await conn.sendMessage(m.chat, {react: { text: '🧠', key: m.key }})
    
    try {
        // Usiamo DuckDuckGo AI Chat
        let res = await fetch('https://duckgo.com/duckchat/v1/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // anche 'claude-3-haiku-20240307'
                messages: [{ role: 'user', content: text }]
            })
        })
        
        let data = await res.json()
        let risposta = data.message || 'Nessuna risposta'
        
        await conn.reply(m.chat, risposta, m)
        
    } catch (e) {
        console.log(e)
        await conn.reply(m.chat, 'Errore AI. DuckDuckGo è occupato, riprova', m)
    }
}

handler.help = ['bot <domanda>']
handler.tags = ['ai']
handler.command = ['bot', 'ai', 'ask']
handler.register = false

export default handler