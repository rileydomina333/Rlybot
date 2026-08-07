let botAttivo = {}
let chatHistory = {}

let handler = async (m, {conn, text}) => {
    let chat = m.chat
    let args = text.slice(5).trim()

    if (args === 'on') {
        botAttivo[chat] = true
        return conn.reply(chat, `✅ AI ATTIVA`, m)
    }
    if (args === 'off') {
        botAttivo[chat] = false
        return conn.reply(chat, `❌ AI DISATTIVATA`, m)
    }
    if (args) { //.bot domanda
        if (!botAttivo[chat]) return // SE OFF NON RISPONDE
        await conn.sendPresenceUpdate('composing', chat)
        let risposta = await chiediAI(args, chat)
        return conn.reply(chat, risposta, m)
    }
}

handler.all = async function(m, {conn}) {
    let chat = m.chat
    let text = m.text
    if (!text || m.fromMe) return
    if (text.startsWith('.')) return
    if (!botAttivo[chat]) return // SE OFF NON RISPONDE

    await conn.sendPresenceUpdate('composing', chat)
    let risposta = await chiediAI(text, chat)
    conn.reply(chat, risposta, m)
}

handler.command = /^bot$/i
export default handler

async function chiediAI(prompt, chat) {
    try {
        if(!chatHistory[chat]) chatHistory[chat] = [
            {role: "system", content: "Sei RLY BOT. Italiano, diretto, max 3 righe."}
        ]
        chatHistory[chat].push({role: "user", content: prompt})
        if(chatHistory[chat].length > 8) chatHistory[chat].splice(1, 2)

        let res = await fetch('https://api.gptgo.ai/v1/chat/completions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({model: "gpt-3.5-turbo", messages: chatHistory[chat]})
        })
        let json = await res.json()
        let risposta = json.choices[0].message.content
        chatHistory[chat].push({role: "assistant", content: risposta})
        return risposta
    } catch (e) {
        return "Errore. Riprova"
    }
}