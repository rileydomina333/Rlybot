import { G4F } from "g4f";

let botAttivo = global.db.data.botAttivo || (global.db.data.botAttivo = {})
let chatHistory = global.db.data.chatHistory || (global.db.data.chatHistory = {})
const g4f = new G4F();

let handler = m => m // non serve comando
handler.all = async function(m, {conn}) {
    let chat = m.chat
    let text = m.text

    if (!botAttivo[chat]) return // se off esce
    if (m.fromMe) return
    if (text.startsWith('.')) return // lascia passare i comandi.

    await conn.sendPresenceUpdate('composing', chat)

    try {
        if(!chatHistory[chat]) chatHistory[chat] = [{role: "system", content: "Sei ℝ𝕃𝕐 𝔹𝕆𝕋. Italiano, diretto, max 3 righe."}]
        chatHistory[chat].push({role: "user", content: text})
        if(chatHistory[chat].length > 12) chatHistory[chat].splice(1,2)

        const response = await g4f.chatCompletion(chatHistory[chat], {
            model: "gpt-4o-mini",
            provider: "Liaobots"
        });

        chatHistory[chat].push({role: "assistant", content: response})
        conn.reply(chat, response, m)

    } catch (e) {
        console.log("AI ERROR:", e)
    }
}
export default handler