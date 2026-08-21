let { G4F } = await import('g4f')
let g4f = new G4F()

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `Esempio: ${usedPrefix + command} cos'è l'universo? 🤖`, m)
    
    await conn.sendMessage(m.chat, {react: { text: '🧠', key: m.key }})
    
    try {
        let messages = [
            { role: "system", content: "Sei un assistente utile. Rispondi in italiano, chiaro e diretto." },
            { role: "user", content: text }
        ]
        
        let risposta = await g4f.chatCompletion(messages, {
            provider: g4f.providers.FreeGPT, // usa provider gratis
            model: "gpt-4o" // cambia con gpt-3.5-turbo se è lento
        })
        
        if(!risposta) throw new Error('Nessuna risposta')
        await conn.reply(m.chat, risposta, m)
        
    } catch (e) {
        console.log(e)
        await conn.reply(m.chat, 'Errore AI. Riprova tra 5 sec', m)
    }
}

handler.help = ['bot <domanda>']
handler.tags = ['ai']
handler.command = ['bot', 'ai', 'ask']
handler.register = false // pubblico, chiunque può usarlo

export default handler