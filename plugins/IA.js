import fetch from 'node-fetch'

let modalitaIncazzata = {}
let botAttivo = {}
let livelloAffetto = {}

// Cervello OFFLINE per risposte immediate
const CERVELLO_OFFLINE = {
    "ciao|salve|hey": ["Ciao! 👋", "Ehilà!", "Salve!"],
    "come stai|tutto bene": ["Sto benissimo! E tu?", "Alla grande ⚡", "Tutto ok"],
    "battuta|ridi": ["Perché il programmatore ha annegato? Aveva troppi bug 😂", "Cosa dice 0 a 8? Bella cintura!"],
    "chi sei": ["Sono RLY BOT di Riley ⚡"],
    "aiuto|help": ["Dimmi pure, cosa ti serve?", "Sono qui per aiutarti!"],
    "grazie|ty": ["Di nulla! ❤️", "Figurati!"],
    "riley": ["Riley è il capo! 👑"],
    "che ore|ora": [new Date().toLocaleTimeString('it-IT')],
    "meteo": ["Non ho i dati ora, ma spero ci sia sole ☀️"]
}

function cercaOffline(testo) {
    testo = testo.toLowerCase()
    for(let key in CERVELLO_OFFLINE){
        if(key.split('|').some(k => testo.includes(k))){
            const arr = CERVELLO_OFFLINE[key]
            return arr[Math.floor(Math.random() * arr.length)]
        }
    }
    return null
}

let rispostaIA = async (m, { conn, text, fullText }) => {
    const comandoCompleto = fullText.toLowerCase().trim()
    const domanda = text.toLowerCase().trim()
    const chatId = m.chat

    if (botAttivo[chatId] === undefined) botAttivo[chatId] = true
    if (livelloAffetto[chatId] === undefined) livelloAffetto[chatId] = 0

    // Comandi
    if (comandoCompleto === '.bot on') return m.reply('RLY BOT VELOCE attivato ⚡')
    if (comandoCompleto === '.bot off') { botAttivo[chatId] = false; return m.reply('RLY BOT disattivato ❌') }
    if (!botAttivo[chatId]) return
    if (!text) return m.reply('Dimmi pure!')

    // AFFETTO - istantaneo
    if (['ti voglio bene','ti amo','grazie'].some(f => domanda.includes(f))) {
        livelloAffetto[chatId]++
        return m.reply(modalitaIncazzata[chatId]? 'Tsk... grazie.' : 'Aww 🥺 Ti voglio bene anch\'io!')
    }

    // MODALITA
    if (domanda === 'incazzati') { modalitaIncazzata[chatId] = true; return m.reply('Ok incazzato. Sbrigati.') }
    if (domanda === 'calmati') { modalitaIncazzata[chatId] = false; return m.reply('Ok calmo.') }

    // 1. PROVA OFFLINE PRIMA - 0.1s
    let rispostaOffline = cercaOffline(domanda)
    if(rispostaOffline) return m.reply(rispostaOffline)

    // 2. SE NON LO SA, VA ONLINE - max 5s
    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        let tono = modalitaIncazzata[chatId]
     ? `Rispondi in italiano, tono incazzato, max 2 righe.`
            : `Rispondi in italiano, gentile, max 3 righe.`

        const prompt = `${tono}\nDomanda: ${text}`

        // Usiamo solo 1 API ma con timeout cortissimo
        const controller = new AbortController()
        setTimeout(() => controller.abort(), 5000) // 5s e basta

        let res = await fetch(`https://api.duck.ai/chat`, {
            method: 'POST',
            signal: controller.signal,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                messages: [{role: "user", content: prompt}],
                model: "claude-3-haiku" // il più veloce
            })
        })

        let data = await res.json()
        let risposta = data.message || "Non ho capito"
        risposta = risposta.substring(0, 300)

        await m.reply(risposta)

    } catch (e) {
        console.log(e)
        // FALLBACK Istantaneo se online fallisce
        const fallback = modalitaIncazzata[chatId]
     ? 'Non ho internet ora. Chiedi qualcosa di semplice.'
            : 'Sono un po\' lento ora. Riprova con "ciao" o "battuta"'
        m.reply(fallback)
    }
}

let handler = async (m, { conn, text }) => {
    await rispostaIA(m, { conn, text, fullText: m.text })
}
handler.command = /^bot(?:\s+(.+))?$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>']

handler.before = async function (m, { conn }) {
    if (m.isBaileys || m.fromMe) return
    const chatId = m.chat
    if (botAttivo[chatId] === false) return
    if (m.quoted && m.quoted.fromMe && m.text &&!m.text.startsWith('.')) {
        await rispostaIA(m, { conn, text: m.text, fullText: m.text })
    }
}

export default handler