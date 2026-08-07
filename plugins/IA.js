let botAttivo = {} // stato per ogni chat
let chatHistory = {} // memoria per ogni chat

let handler = async (m, {conn, text}) => {
    let chat = m.chat
    let args = text.slice(5).trim() // toglie ".bot "
    let cmd = args.split(' ')[0]

    //.bot on
    if (cmd === 'on') {
        botAttivo[chat] = true
        return conn.reply(chat, `✅ *ℝ𝕃𝕐 𝔹𝕆𝕋 AI: ON*\nOra rispondo a tutti i messaggi in questa chat`, m)
    }

    //.bot off
    if (cmd === 'off') {
        botAttivo[chat] = false
        return conn.reply(chat, `❌ *AI: OFF*\nNon risponderò più finché non fai.bot on`, m)
    }

    //.bot reset
    if (cmd === 'reset') {
        chatHistory[chat] = []
        return conn.reply(chat, `🧠 *Memoria pulita*`, m)
    }

    //.bot domanda → risponde 1 volta anche se OFF
    if (args) {
        await conn.sendPresenceUpdate('composing', chat)
        let risposta = await chiediAI(args, chat, false)
        return conn.reply(chat, risposta, m)
    }

    //.bot da solo → mostra stato
    let stato = botAttivo[chat]? '🟢 ON' : '🔴 OFF'
    conn.reply(chat, `*Stato AI:* ${stato}\n\n*.bot on* = attiva auto-reply\n*.bot off* = disattiva\n*.bot domanda* = chiedi 1 volta\n*.bot reset* = pulisci memoria`, m)
}

handler.all = async function(m, {conn}) {
    let chat = m.chat
    let text = m.text
    if (!text || m.fromMe) return

    // risponde solo se è ON
    if (!botAttivo[chat]) return
    // ignora i comandi
    if (text.startsWith('.')) return

    await conn.sendPresenceUpdate('composing', chat)
    let risposta = await chiediAI(text, chat, true)
    conn.reply(chat, risposta, m)
}

handler.command = /^bot$/i
handler.help = ['bot']
handler.tags = ['ai']
export default handler

// FUNZIONE AI SENZA KEY
async function chiediAI(prompt, chat, isAuto) {
    try {
        if(!chatHistory[chat]) chatHistory[chat] = [
            {role: "system", content: "Sei RLY BOT. Sei italiano, diretto, amichevole. Rispondi in max 3 righe. Usa 1 emoji max."}
        ]

        chatHistory[chat].push({role: "user", content: prompt})
        // tieni solo ultime 10 msg per non appesantire
        if(chatHistory[chat].length > 10) chatHistory[chat].splice(1, 2)

        let res = await fetch('https://api.gptgo.ai/v1/chat/completions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: chatHistory[chat]
            })
        })

        if (!res.ok) throw new Error("API down")
        let json = await res.json()
        let risposta = json.choices[0].message.content

        chatHistory[chat].push({role: "assistant", content: risposta})
        return risposta

    } catch (e) {
        console.log("AI ERROR:", e)
        return "⚠️ Errore connessione. Riprova tra 3 secondi."
    }
}