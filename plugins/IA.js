import fetch from 'node-fetch' // questo ce l'hai già in Baileys

// Memorie per chat
let modalitaIncazzata = {}
let botAttivo = {}
let livelloAffetto = {}

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
            const risp = ['Aww 🥺 Ti voglio bene anch\'io!', 'Grazie di cuore ❤️ Significa tanto per me.', 'Sei un amore!']
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

    try {
        let extraTono = ''
        if (livelloAffetto[chatId] > 0 &&!modalitaIncazzata[chatId]) {
            extraTono = ' L\'utente è stato gentile, sii più caloroso.'
        }

        let systemPrompt = modalitaIncazzata[chatId]
        ? `Sei RLY BOT in modalità incazzata. Tono aggressivo, sarcastico, risposte corte max 3 righe. Rispondi in italiano.`
            : `Sei RLY BOT, il bot di Riley. Sei gentile, utile e disponibile. Rispondi in italiano, max 4 righe.` + extraTono

        const prompt = `${systemPrompt}\nUtente: ${text}\nRLY BOT:`

        // API che non danno timeout - giro in cascata
        const apis = [
            async () => {
                // DuckDuckGo AI - gratis, veloce
                let res = await fetch(`https://api.duckgo.com/?q=${encodeURIComponent(text)}&format=json&no_redirect=1&no_html=1`)
                let data = await res.json()
                return data.AbstractText || data.Answer
            },
            async () => {
                // HuggingFace free inference
                let res = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({inputs: prompt, parameters: {max_new_tokens: 200}})
                })
                let data = await res.json()
                return data[0]?.generated_text?.split('RLY BOT:')[1]
            },
            async () => {
                // Fallback finale
                return `Non ho internet per rispondere ora. Riprova tra 1 min.`
            }
        ]

        let risposta = null
        for(let fn of apis){
            try{
                risposta = await fn()
                if(risposta && risposta.length > 5) break
            }catch{}
        }

        if(!risposta) risposta = "Mi spiace, tutti i server sono occupati. Riprova."

        // Pulisci
        risposta = risposta.replace(/RLY BOT:|Assistant:/gi, '').trim()
        if(risposta.length > 700) risposta = risposta.substring(0, 700) + '...'

        await m.reply(risposta)

    } catch (e) {
        console.log(e)
        m.reply('Errore. Riprova.')
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