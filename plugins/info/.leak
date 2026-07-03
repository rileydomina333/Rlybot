let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Uso:* ${usedPrefix + command} <numero con prefisso>\n\n*Esempio:* ${usedPrefix + command} +393471234567`)
    
    let numero = text.replace(/[^0-9+]/g, '') // pulisce spazi e trattini
    if (!numero.startsWith('+')) return m.reply('Metti il prefisso internazionale. Es: +39, MANNAGGIA!')
    
    await m.reply('Analizzo prefisso...')
    
    // Database prefissi base. Per roba seria serve API tipo numverify.com
    const prefissi = {
        '+39': { paese: 'Italia', tipo: 'Fisso/Mobile' },
        '+1': { paese: 'USA/Canada', tipo: 'Fisso/Mobile' },
        '+44': { paese: 'Regno Unito', tipo: 'Fisso/Mobile' },
        '+33': { paese: 'Francia', tipo: 'Fisso/Mobile' },
        '+49': { paese: 'Germania', tipo: 'Fisso/Mobile' },
        '+34': { paese: 'Spagna', tipo: 'Fisso/Mobile' },
        '+41': { paese: 'Svizzera', tipo: 'Fisso/Mobile' },
        '+86': { paese: 'Cina', tipo: 'Fisso/Mobile' },
        '+91': { paese: 'India', tipo: 'Fisso/Mobile' },
        '+55': { paese: 'Brasile', tipo: 'Fisso/Mobile' },
        '+7': { paese: 'Russia', tipo: 'Fisso/Mobile' }
    }
    
    // Prefissi mobili italiani più comuni
    const mobiliITA = {
        '+39328': 'TIM', '+39329': 'TIM', '+39333': 'TIM', '+39334': 'TIM', '+39335': 'TIM', '+39336': 'TIM', '+39337': 'TIM', '+39338': 'TIM', '+39339': 'TIM',
        '+39347': 'Vodafone', '+39348': 'Vodafone', '+39349': 'Vodafone', '+39340': 'Vodafone', '+39341': 'Vodafone', '+39342': 'Vodafone', '+39343': 'Vodafone',
        '+39392': 'WindTre', '+39320': 'WindTre', '+39388': 'WindTre', '+39389': 'WindTre', '+39390': 'WindTre', '+39391': 'WindTre', '+39393': 'WindTre',
        '+39366': 'Iliad', '+39351': 'Iliad', '+39352': 'Iliad',
        '+39370': 'Ho Mobile', '+39371': 'Ho Mobile',
        '+39350': 'Very Mobile', '+39355': 'Very Mobile'
    }
    
    let info = `*INFO PREFISSO: ${numero}*\n\n`
    let trovato = false
    
    // Controllo operatore italiano
    for (let pref in mobiliITA) {
        if (numero.startsWith(pref)) {
            info += `*Paese:* Italia\n*Operatore:* ${mobiliITA[pref]}\n*Tipo:* Mobile\n`
            trovato = true
            break
        }
    }
    
    // Se non è mobile ITA, controllo paese generico
    if (!trovato) {
        for (let pref in prefissi) {
            if (numero.startsWith(pref)) {
                info += `*Paese:* ${prefissi[pref].paese}\n*Tipo:* ${prefissi[pref].tipo}\n`
                trovato = true
                break
            }
        }
    }
    
    if (!trovato) {
        return m.reply('Prefisso non riconosciuto. Metti un numero valido con +xx')
    }
    
    info += `\n_Dati basati su prefissi pubblici. Non identifica il proprietario del numero._`
    m.reply(info)
}

handler.help = ['leak <numero>']
handler.tags = ['tools', 'osint']
handler.command = ['leak', 'numinfo', 'prefisso']
handler.limit = true

export default handler