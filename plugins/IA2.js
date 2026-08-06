import { G4F } from "g4f";

let botAttivo = {}
let chatHistory = {}
const g4f = new G4F();

let handler = m => m
handler.all = async function(m, {conn}) {
    let chat = m.chat
    let text = m.text
    if (!text) return

    // REGOLA 1: se è.bot on/off lo gestisce il file bot-toggle.js
    if (text.startsWith('.')) return
    if (m.fromMe) return

    // REGOLA 2: RISPONDE SOLO SE: bot è ON O se gli stai rispondendo
    let isReplyToBot = m.quoted && m.quoted.sender == conn.user.jid
    if (!botAttivo[chat] &&!isReplyToBot) return

    // Se gli rispondi ma bot era OFF, lo riattiva solo per quella chat
    if (isReplyToBot &&!botAttivo[chat]) botAttivo[chat] = true

    await conn.sendPresenceUpdate('composing', chat)

    try {
        if(!chatHistory[chat]) chatHistory[chat] = [{role: "system", content: "Sei ℝ𝕃𝕐 𝔹𝕆𝕋. Italiano, diretto, amichevole, max 3 righe. Non essere robot."}]

        // SE RISPONDI AL BOT GLI DAI IL CONTESTO
        let userMsg = text
        if (isReplyToBot) {
            userMsg = `L'utente sta rispondendo a questo messaggio: "${m.quoted.text}"\nRisposta: "${text}"`
        }

        chatHistory[chat].push({role: "user", content: userMsg})
        if(chatHistory[chat].length > 10) chatHistory[chat].splice(1,2)

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