let botAttivo = {}
let chatHistory = {}

let handler = m => m
handler.all = async function(m, {conn}) {
    let chat = m.chat
    let text = m.text
    if (!text || text.startsWith('.') || m.fromMe) return

    let isReplyToBot = m.quoted && m.quoted.sender == conn.user.jid
    if (!botAttivo[chat] &&!isReplyToBot) return
    if (isReplyToBot &&!botAttivo[chat]) botAttivo[chat] = true

    await conn.sendPresenceUpdate('composing', chat)

    let userMsg = text
    if (isReplyToBot) userMsg = `Contesto: "${m.quoted.text}"\nRisposta: "${text}"`

    let risposta = await chiediAI(userMsg, chat)
    conn.reply(chat, risposta, m)
}
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
        return "⚠️ Errore connessione. Riprova tra 3s"
    }
}