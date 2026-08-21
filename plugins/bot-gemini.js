let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `Esempio: ${usedPrefix + command} raccontami una barzelletta 🤖`, m)
    
    await conn.sendMessage(m.chat, {react: { text: '🧠', key: m.key }})
    
    try {
        let url = 'https://www.blackbox.ai/api/chat'
        
        let res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({
                messages: [{ id: Date.now().toString(), role: "user", content: text }],
                model: "blackboxai", // usa gpt-4o mini gratis
                id: Date.now().toString(),
                previewToken: null,
                userId: null,
                codeModelMode: true,
                agentMode: {},
                trendingAgentMode: {},
                isMicMode: false,
                isChromeExt: false,
                githubToken: null
            })
        })
        
        let data = await res.text() // blackbox risponde in stream di testo
        
        // Puliamo la risposta
        let risposta = data.split('\n').filter(l => l.startsWith('data: ')).map(l => l.replace('data: ', '')).join('')
        if(!risposta) risposta = data

        await conn.reply(m.chat, risposta, m)
        
    } catch (e) {
        console.log(e)
        await conn.reply(m.chat, 'Blackbox occupato. Riprova tra 5 sec', m)
    }
}

handler.help = ['bot <domanda>']
handler.tags = ['ai']
handler.command = ['bot', 'ai', 'ask']
handler.register = false // pubblico

export default handler