let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `Esempio: ${usedPrefix + command} spiegami i buchi neri 🤖`, m)

    await conn.sendMessage(m.chat, {react: { text: '🧠', key: m.key }})

    try {
        // Usiamo OpenRouter via proxy pubblico - gratis
        let res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://github.com/rlybot', // obbligatorio
                'X-Title': 'Rlybot'
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-3.1-8b-instruct:free", // modello gratis
                "messages": [
                    { "role": "system", "content": "Rispondi in italiano, breve e diretto." },
                    { "role": "user", "content": text }
                ]
            })
        })

        let data = await res.json()
        let risposta = data.choices[0].message.content

        await conn.reply(m.chat, risposta, m)

    } catch (e) {
        console.log(e)
        await conn.reply(m.chat, 'Errore AI. Prova di nuovo tra 10 sec', m)
    }
}

handler.help = ['bot <domanda>']
handler.tags = ['ai']
handler.command = ['bot', 'ai', 'ask']
handler.register = false

export default handler