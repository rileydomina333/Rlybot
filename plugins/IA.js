let botAttivo = {}
let chatHistory = {}

let handler = async (m, {conn, text}) => {
    let chat = m.chat
    let args = text.split(' ').slice(1).join(' ')

    if (args == 'on') { botAttivo[chat] = true; return m.reply(`✅ *AI ON*`) }
    if (args == 'off') { botAttivo[chat] = false; return m.reply(`❌ *AI OFF*`) }
    if (args == 'reset') { chatHistory[chat] = []; return m.reply(`🧠 Memoria pulita`) }

    //.bot domanda
    if (args) {
        await conn.sendPresenceUpdate('composing', chat)
        let res = await chiediAI(args, chat)
        return m.reply(res)
    }

    let stato = botAttivo[chat]? '🟢 ON' : '🔴 OFF'
    m.reply(`*Stato:* ${stato}\n*.bot on/off/reset*\n*.bot domanda*`)
}
handler.command = /^bot$/i
export default handler

async function chiediAI(prompt, chat){
    if(!chatHistory[chat]) chatHistory[chat] = [{role: "system", content: "Sei RLY BOT. Italiano, diretto, max 3 righe."}]
    chatHistory[chat].push({role: "user", content: prompt})
    if(chatHistory[chat].length > 10) chatHistory[chat].splice(1,2)

    try{
        let r = await fetch('https://api.gptgo.ai/v1/chat/completions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({model: "gpt-3.5-turbo", messages: chatHistory[chat]})
        })
        let json = await r.json()
        let risposta = json.choices[0].message.content
        chatHistory[chat].push({role: "assistant", content: risposta})
        return risposta
    }catch(e){
        return "Errore AI. Riprova"
    }
}