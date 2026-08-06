import { G4F } from "g4f";

let botAttivo = {}
let chatHistory = {}
const g4f = new G4F();

const SYSTEM = "Sei ℝ𝕃𝕐 𝔹𝕆𝕋. Rispondi in italiano, diretto, amichevole, max 3 righe. Niente papiri."

let handler = async (m, { conn, text, usedPrefix }) => {
    let chat = m.chat

    if (text === usedPrefix + 'bot on') {
        botAttivo[chat] = true
        return m.reply(`✅ *ℝ𝕃𝕐 𝔹𝕆𝕋 OFFLINE ON*\n\nModello: GPT-4o Mini Local\nVelocità: Istantanea\nNo Key | No Lag\n*.bot off* per spegnere`)
    }
    if (text === usedPrefix + 'bot off') {
        botAttivo[chat] = false
        return m.reply(`❌ *BOT OFF*`)
    }
    if (text === usedPrefix + 'bot reset') {
        chatHistory[chat] = []
        return m.reply(`🧠 Memoria resettata`)
    }
    if (text === usedPrefix + 'bot') {
        return m.reply(`Stato: ${botAttivo[chat]? 'ON' : 'OFF'}`)
    }

    // AUTO REPLY
    if (!botAttivo[chat]) return
    if (m.fromMe) return
    if (text.startsWith(usedPrefix)) return

    await conn.sendPresenceUpdate('composing', chat)

    try {
        if(!chatHistory[chat]) chatHistory[chat] = [{role: "system", content: SYSTEM}]

        chatHistory[chat].push({role: "user", content: text})
        if(chatHistory[chat].length > 12) chatHistory[chat].splice(1,2) // tieni 5 scambi

        const response = await g4f.chatCompletion(chatHistory[chat], {
            model: "gpt-4o-mini", // il più veloce
            provider: "Liaobots" // il più stabile e veloce
        });

        let reply = response
        chatHistory[chat].push({role: "assistant", content: reply})

        m.reply(reply)

    } catch (e) {
        console.log(e)
        m.reply("Errore: " + e.message)
    }
}

handler.all = async () => {}
handler.command = /./
export default handler