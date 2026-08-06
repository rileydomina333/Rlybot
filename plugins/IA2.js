import { G4F } from "g4f";

let botAttivo = {}
let chatHistory = {}
const g4f = new G4F();

let handler = m => m
handler.all = async function(m, {conn}) {
    let chat = m.chat
    let text = m.text

    if (!botAttivo[chat]) return
    if (m.fromMe) return
    if (!text || text.startsWith('.')) return

    await conn.sendPresenceUpdate('composing', chat)

    try {
        if(!chatHistory[chat]) chatHistory[chat] = [{role: "system", content: "Sei ℝ𝕃𝕐 𝔹𝕆𝕋. Italiano, diretto, amichevole, max 3 righe. Usa emoji max 1."}]

        // SE RISPONDI AL BOT
        let userMsg = text
        if (m.quoted && m.quoted.sender == conn.user.jid) {
            userMsg = `Contesto: stavi rispondendo a questo: "${m.quoted.text}"\nDomanda: "${text}"`
        }

        chatHistory[chat].push({role: "user", content: userMsg})
        if(chatHistory[chat].length > 10) chatHistory[chat].splice(1,2)

        const response = await g4f.chatCompletion(chatHistory[chat], {
            model: "gpt-4o-mini",
            provider: "Liaobots",
            timeout: 15000
        });

        chatHistory[chat].push({role: "assistant", content: response})
        conn.reply(chat, response, m)

    } catch (e) {
        console.log("AI ERROR:", e)
        m.reply("⚠️ Errore AI. Riprova tra 3s")
    }
}
export default handler