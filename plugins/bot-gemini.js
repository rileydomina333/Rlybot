let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `Esempio: ${usedPrefix + command} spiegami i buchi neri 🤖`, m)
    
    await conn.sendMessage(m.chat, {react: { text: '🧠', key: m.key }})
    
    try {
        const { G4F } = await import('g4f')
        const g4f = new G4F()
        
        const messages = [
            { role: "system", content: "Sei un assistente utile. Rispondi in italiano e sii breve." },
            { role: "user", content: text }
        ]
        
        const risposta = await g4f.chatCompletion(messages)
        
        await conn.reply(m.chat, risposta, m)
        
    } catch (e) {
        await conn.reply(m.chat, 'Errore AI. Riprova tra 5 sec', m)
        console.log(e)
    }
}

handler.help = ['bot <domanda>']
handler.tags = ['ai'] 
handler.command = ['bot', 'ai', 'ask']
handler.register = false // pubblico per tutti

export default handler