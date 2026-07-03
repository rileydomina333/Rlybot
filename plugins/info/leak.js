let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Uso:* ${usedPrefix + command} <numero>\n\n*Esempio:* ${usedPrefix + command} +393471234567`)
    
    let numero = text.replace(/[^0-9+]/g, '')
    if (!numero.startsWith('+')) return m.reply('Metti il prefisso. Es: +39, +1, MANNAGGIA!')
    
    // Database prefissi Paesi principali
    const paesi = {
        '+39': 'Italia', '+1': 'USA/Canada', '+44': 'Regno Unito', '+33': 'Francia',
        '+49': 'Germania', '+34': 'Spagna', '+41': 'Svizzera', '+43': 'Austria',
        '+32': 'Belgio', '+31': 'Olanda', '+351': 'Portogallo', '+30': 'Grecia',
        '+7': 'Russia/Kazakistan', '+86': 'Cina', '+81': 'Giappone', '+91': 'India',
        '+55': 'Brasile', '+52': 'Messico', '+54': 'Argentina', '+61': 'Australia'
    }
    
    // Prefissi mobili italiani. Aggiornati al 2026
    const mobiliITA = {
        'TIM': ['+39328','+39329','+39330','+39331','+39333','+39334','+39335','+39336','+39337','+39338','+39339','+39360','+39366'],
        'Vodafone': ['+39340','+39341','+39342','+39343','+39344','+39345','+39346','+39347','+39348','+39349'],
        'WindTre': ['+39320','+39322','+39323','+39324','+39325','+39327','+39380','+39388','+39389','+39390','+39391','+39392','+39393'],
        'Iliad': ['+39351','+39352','+39353','+39354','+39355','+39356','+39357'],
        'PosteMobile': ['+39371','+39372','+39373','+39374','+39375','+39376','+39377','+39378'],
        'Ho Mobile': ['+39370','+39379'],
        'Kena': ['+39350'],
        'Very Mobile': ['+39319']
    }
    
    // Prefissi fissi Italia per regione
    const fissiITA = {
        '+3902': 'Milano', '+3906': 'Roma', '+39011': 'Torino', '+39051': 'Bologna',
        '+39055': 'Firenze', '+39081': 'Napoli', '+39091': 'Palermo', '+39010': 'Genova',
        '+39049': 'Padova', '+39040': 'Trieste', '+39070': 'Cagliari', '+39080': 'Bari'
    }
    
    let info = `*ANALISI NUMERO: ${numero}*\n\n`
    let trovato = false
    
    // 1. Controllo Paese
    for (let pref in paesi) {
        if (numero.startsWith(pref)) {
            info += `*Paese:* ${paesi}\n`
            trovato = true
            break
        }
    }
    if (!trovato) return m.reply('Prefisso paese non riconosciuto.')
    
    // 2. Se è Italia, dettaglio operatore/zona
    if (numero.startsWith('+39')) {
        let opTrovato = false
        // Check mobile
        for (let [op, prefs] of Object.entries(mobiliITA)) {
            if (prefs.some(p => numero.startsWith(p))) {
                info += `*Tipo:* Mobile\n*Operatore:* ${op}\n`
                opTrovato = true
                break
            }
        }
        // Check fisso se non è mobile
        if (!opTrovato) {
            for (let [pref, citta] of Object.entries(fissiITA)) {
                if (numero.startsWith(pref)) {
                    info += `*Tipo:* Fisso\n*Zona:* ${citta}\n`
                    opTrovato = true
                    break
                }
            }
        }
        if (!opTrovato) info += `*Tipo:* Fisso/Mobile generico\n`
    }
    
    // 3. Link utili pubblici - non violano privacy
    let soloNumeri = numero.replace('+', '')
    info += `\n*Link utili:*\n`
    info += `WhatsApp: wa.me/${soloNumeri}\n`
    info += `Telegram: t.me/+${soloNumeri}\n`
    info += `_Se i link aprono una chat, il numero è registrato. Non forzo controlli._\n\n`
    
    // 4. Check formato
    let lunghezza = numero.replace('+', '').length
    if (numero.startsWith('+39') && lunghezza !== 12) {
        info += `⚠️ *Attenzione:* Numero italiano deve avere 12 cifre con +39. Questo ne ha ${lunghezza}.\n\n`
    }
    
    info += `_Dati da database prefissi pubblici AGCOM. Non identifica persona._`
    
    m.reply(info)
}

handler.help = ['leak <numero>']
handler.tags = ['tools', 'osint']
handler.command = ['leak', 'numinfo', 'ninfo']
handler.limit = true

export default handler