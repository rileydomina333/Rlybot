import { pipeline } from '@xenova/transformers'

// Memorie per chat
let modalitaIncazzata = {}
let botAttivo = {}
let livelloAffetto = {}
let generatore = null // lo carichiamo 1 volta sola

// Carica il modello al primo avvio - ci mette 30s la prima volta
const caricaModello = async () => {
    if(!generatore){
        console.log('[RLY BOT] Carico modello IA... attendi 30s la prima volta')
        generatore = await pipeline('text-generation', 'Xenova/Qwen2-0.5B-Instruct')
        console.log('[RLY BOT] Modello pronto ✅')
    }
}
caricaModello()

let rispostaIA = async (m, { conn, text, fullText }) => {
    const comandoCompleto = fullText.toLowerCase().trim()
    const domanda = text.toLowerCase().trim()
    const chatId = m.chat

    // 0. Default
    if (botAttivo[chatId] === undefined) botAttivo[chatId] = true
    if (livelloAffetto[chatId] === undefined) livelloAffetto[chatId] = 0

    // Comandi on/off
    if (comandoCompleto === '.bot on') {
        botAttivo[chatId] = true
        return m.reply('RLY BOT attivato ✅ Ora rispondo a tutto!')
    }
    if (comandoCompleto === '.bot off') {
        botAttivo[chatId] = false
        return m.reply('RLY BOT disattivato ❌')
    }
    if (!botAttivo[chatId]) return
    if (!text) return m.reply('Dimmi pure, sono qui per aiutarti!')

    // 1. AFFETTO
    const triggerAffetto = ['ti voglio bene', 'ti amo', 'sei il migliore', 'sei un tesoro', 'ti adoro', 'grazie', 'sei carino', 'mi piaci', 'sei dolce']
    if (triggerAffetto.some(frase => domanda.includes(frase))) {
        livelloAffetto[chatId] = Math.min(livelloAffetto[chatId] + 1, 5)
        if (modalitaIncazzata[chatId]) {
            const risp = ['Tsk... smettila... mi fai arrossire, dannazione.', 'Oh. Ehm. Grazie. Non fare che ci prendi gusto.']
            return m.reply(risp[Math.floor(Math.random() * risp.length)])
        } else {
            const risp = ['Aww 🥺 Ti voglio bene anch\'io!', 'Grazie di cuore ❤️ Significa tanto per me.']
            return m.reply(risp[Math.floor(Math.random() * risp.length)])
        }
    }

    // 2. Modalità
    if (domanda === 'incazzati' || domanda === 'modalità incazzata') {
        modalitaIncazzata[chatId] = true
        return m.reply('Va bene... ora sono incazzato. Che diavolo vuoi?!')
    }
    if (domanda === 'calmati' || domanda === 'modalità gentile') {
        modalitaIncazzata[chatId] = false
        return m.reply('Ok, mi calmo. Come posso aiutarti?')
    }

    // 3. Chi sei
    if (['chi sei', 'chi sei?'].includes(domanda)) {
        return m.reply('Sono RLY BOT, il bot di Riley. Sono qui per aiutarti!')
    }
    if (domanda === 'sono riley') {
        return m.reply('Riley! Capo, bentornato!')
    }

    await conn.sendPresenceUpdate('composing', m.chat)
    await caricaModello() // assicurati sia caricato

    try {
        let extraTono = ''
        if (livelloAffetto[chatId] > 0 &&!modalitaIncazzata[chatId]) {
            extraTono = ' L\'utente è stato gentile, sii più caloroso.'
        }

        let systemPrompt = modalitaIncazzata[chatId]
         ? `Sei RLY BOT in modalità incazzata. Tono aggressivo, sarcastico, breve. Rispondi in italiano.`
            : `Sei RLY BOT, il bot di Riley. Sei gentile, utile e disponibile. Rispondi in italiano, max 4 frasi.` + extraTono

        const prompt = `<|system|>${systemPrompt}<|user|>${text}<|assistant|>`

        const output = await generatore(prompt, {
            max_new_tokens: 150,
            temperature: 0.9,
            top_p: 0.95,
        })

        let risposta = output[0].generated_text.split("<|assistant|>")[1].trim()
        if(!risposta || risposta.length < 3) risposta = "Non ho capito. Puoi ripetere?"

        await m.reply(risposta)

    } catch (e) {
        console.log(e)
        m.reply('Errore IA. Riavvia il bot.')
    }
}

let handler = async (m, { conn, text }) => {
    await rispostaIA(m, { conn, text, fullText: m.text })
}
handler.command = /^bot(?:\s+(.+))?$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>', 'bot on', 'bot off']

handler.before = async function (m, { conn }) {
    if (m.isBaileys) return
    if (m.fromMe) return
    const chatId = m.chat
    if (botAttivo[chatId] === false) return
    if (m.quoted && m.quoted.fromMe && m.text &&!m.text.startsWith('.')) {
        await rispostaIA(m, { conn, text: m.text, fullText: m.text })
    }
}

export default handler