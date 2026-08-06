// Banca per ogni utente
let bancaUtenti = {}

let handler = async (m, { conn, text }) => {
    const sender = m.sender
    const nome = m.pushName || 'Giocatore'

    // Dai 1000 crediti se è il primo accesso
    if (!bancaUtenti[sender]) bancaUtenti[sender] = 1000

    const args = text.trim().split(' ')
    const scelta = args[0]?.toLowerCase()
    const puntata = parseInt(args[1])

    //.roulette
    if (!scelta) {
        return m.reply(`🎰 *RLY ROULETTE*\n\nI tuoi crediti: *${bancaUtenti[sender]}* 💰\n\n*Come giocare:*\n\`.roulette rosso 50\` → Rosso/Nero x2\n\`.roulette pari 50\` → Pari/Dispari x2\n\`.roulette 1-12 50\` → Dozzina x3\n\`.roulette 17 50\` → Numero secco x36\n\`.roulette saldo\` → Vedi crediti\n\nMin puntata: 10`)
    }

    //.roulette saldo
    if (scelta === 'saldo') {
        return m.reply(`💰 *${nome}* hai: *${bancaUtenti[sender]}* crediti`)
    }

    // Controlli
    if (isNaN(puntata) || puntata < 10) return m.reply('❌ La puntata minima è 10 crediti.')
    if (puntata > bancaUtenti[sender]) return m.reply(`❌ Non hai abbastanza crediti. Hai ${bancaUtenti[sender]}`)

    bancaUtenti[sender] -= puntata // toglie i soldi

    await conn.sendPresenceUpdate('composing', m.chat)
    await m.reply('🎰 La ruota gira...')
    await new Promise(r => setTimeout(r, 2000)) // 2s di suspense

    // Gira la ruota: 0-36
    const numero = Math.floor(Math.random() * 37)
    const rossi = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
    const colore = numero === 0? 'verde' : rossi.includes(numero)? 'rosso' : 'nero'

    let vincita = 0

    // CALCOLO VINCITE
    if (scelta === colore) vincita = puntata * 2 // rosso/nero
    if (scelta === 'pari' && numero!== 0 && numero % 2 === 0) vincita = puntata * 2
    if (scelta === 'dispari' && numero % 2 === 1) vincita = puntata * 2
    if (scelta === '1-12' && numero >= 1 && numero <= 12) vincita = puntata * 3
    if (scelta === '13-24' && numero >= 13 && numero <= 24) vincita = puntata * 3
    if (scelta === '25-36' && numero >= 25 && numero <= 36) vincita = puntata * 3
    if (parseInt(scelta) === numero) vincita = puntata * 36 // numero secco

    bancaUtenti[sender] += vincita // ridà i soldi + vincita

    // RISULTATO
    const emoji = colore === 'rosso'? '🔴' : colore === 'nero'? '⚫' : '🟢'
    let msg = `🎰 *RLY ROULETTE*\n\n${emoji} *USCITO: ${numero}* ${emoji}\n\nHai puntato: *${puntata}* su *${scelta}*`

    if (vincita > 0) {
        msg += `\n\n🎉 *HAI VINTO: ${vincita} crediti!*`
    } else {
        msg += `\n\n😢 *Hai perso: ${puntata} crediti*`
    }

    msg += `\n\nSaldo attuale: *${bancaUtenti[sender]}* 💰`

    await m.reply(msg)
}

handler.command = /^roulette$/i
handler.tags = ['game']
handler.help = ['roulette <scelta> <puntata>', 'roulette saldo']

export default handler