// Usa la stessa banca della roulette
let bancaRoulette = bancaRoulette || {}

const SIMBOLI = ['🍒', '🍋', '🍊', '⭐', '💎', '7️⃣']
const VALORI = {
    '🍒': 2, // 2x
    '🍋': 3, // 3x
    '🍊': 4, // 4x
    '⭐': 10, // 10x
    '💎': 20, // 20x
    '7️⃣': 50 // 50x JACKPOT
}

function giraRulli() {
    return [
        SIMBOLI[Math.floor(Math.random() * SIMBOLI.length)],
        SIMBOLI[Math.floor(Math.random() * SIMBOLI.length)],
        SIMBOLI[Math.floor(Math.random() * SIMBOLI.length)]
    ]
}

let slot = async (m, { conn, text }) => {
    const chatId = m.chat
    const sender = m.sender
    const nome = m.pushName || 'Giocatore'

    if (!bancaRoulette[sender]) bancaRoulette[sender] = 1000 // stessa banca roulette

    const args = text.trim().split(' ')
    const puntata = parseInt(args[0])

    //.slot
    if (!puntata) {
        return m.reply(`🎰 *RLY SLOT*\n\nI tuoi crediti: *${bancaRoulette[sender]}* 💰\n\n*Come giocare:*\n\`.slot 50\` → Punta 50 crediti e gira\n\n*Tabella Vincite:*\n3 uguali = puntata x valore\n3x 7️⃣ = JACKPOT 500x\n2 uguali = puntata x 1.5\nMin: 10 | Max: 500`)
    }

    // Controlli
    if (isNaN(puntata) || puntata < 10) return m.reply('La puntata minima è 10 crediti.')
    if (puntata > 500) return m.reply('La puntata massima è 500 crediti.')
    if (puntata > bancaRoulette[sender]) return m.reply(`Non hai abbastanza crediti. Ne hai ${bancaRoulette[sender]}`)

    bancaRoulette[sender] -= puntata

    await conn.sendPresenceUpdate('composing', m.chat)
    await m.reply('🎰 I rulli girano...')
    await new Promise(r => setTimeout(r, 1500))

    const [r1, r2, r3] = giraRulli()
    let vincita = 0
    let msgExtra = ''

    // CALCOLO VINCITE
    if (r1 === r2 && r2 === r3) {
        // TRIPLA
        if (r1 === '7️⃣') {
            vincita = puntata * 500 // JACKPOT
            msgExtra = '🎉 JACKPOT!!! 🎉🎉'
        } else {
            vincita = puntata * VALORI[r1]
            msgExtra = `TRIPLA ${r1}!`
        }
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        // DOPPIA
        vincita = Math.floor(puntata * 1.5)
        msgExtra = 'DOPPIA! Quasi...'
    }

    bancaRoulette[sender] += vincita

    // ANIMAZIONE
    let risultato = `[ ${r1} | ${r2} | ${r3} ]`

    let msg = `🎰 *RLY SLOT* 🎰\n\n${risultato}\n\nHai puntato: *${puntata}* crediti\n`

    if (vincita > 0) {
        msg += `${msgExtra}\n💰 HAI VINTO: *${vincita}* crediti!\n`
        if(modalitaIncazzata?.[chatId]) msg += 'Accidenti... ti è andata bene.'
        else if(livelloAffetto?.[chatId] > 2) msg += 'Grande! Sono fiero di te! ❤️'
        else msg += 'Complimenti!'
    } else {
        msg += `😢 Hai perso: *${puntata}* crediti\n`
        if(modalitaIncazzata?.[chatId]) msg += 'SECCO! Impara a giocare!'
        else msg += 'Ritenta, la fortuna gira!'
    }
    msg += `\n\nSaldo attuale: *${bancaRoulette[sender]}* 💰`

    await m.reply(msg)
}

// Handler
let handler = async (m, { conn, text }) => {
    await slot(m, { conn, text })
}
handler.command = /^slot$/i
handler.tags = ['game']
handler.help = ['slot <puntata>', 'slot 50']

export default handler