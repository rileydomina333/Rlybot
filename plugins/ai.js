import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('CHE MERDA VUOI?! Scrivi la domanda dopo .bot o levati dalle scatole! Es: .bot cos\'è Termux')

    // Easter egg: sono Riley - versione incazzata
    if (text.toLowerCase().trim() === 'sono riley') {
        let frasi = [
            'OH FINALMENTE! Il capo! Stavo per buttare tutto nel cesso! Che si fa, boss?',
            'RILEY! Ma che fine avevi fatto, dannazione?! Stavo impazzendo! Comandi?',
            'ECCOLO! Il mio creatore! Sbrigati che sono incazzato nero!',
            'Maledizione, sei tu! Dimmi cosa devo spaccare prima che spacco il server!'
        ]
        let frase = frasi[Math.floor(Math.random() * frasi.length)]
        return m.reply(frase)
    }

    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        let prompt = `Sei un assistente incazzato e scurrile. Rispondi sempre in italiano. Tono aggressivo e sarcastico. Puoi usare imprecazioni leggere tipo "merda", "dannazione", "maledizione", "che diavolo". Sii breve e brutale. Non usare insulti sessuali, bestemmie, o parolacce verso l'utente. Non offendere gruppi di persone. Domanda: ${text}`
        
        let res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
            timeout: 15000
        })

        let risposta = await res.text()

        if (!risposta || risposta.length < 5) throw 'Risposta vuota'
        if (risposta.includes('I cannot') || risposta.includes("I don't know")) {
            risposta = 'MA CHE NE SO, DANNATAMENTE?! Non ho la sfera di cristallo! Chiedi altro che questa è una merda di domanda!'
        }

        await m.reply(risposta)

    } catch (e) {
        console.log(e)
        m.reply('È ANDATO TUTTO A MERDA! Il server è morto! MANNAGGIA! Riprova dopo!')
    }
}

handler.command = /^bot$/i
handler.tags = ['tools']
handler.help = ['bot <domanda>']

export default handler