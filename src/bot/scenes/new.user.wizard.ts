const WizardScene = require('telegraf/scenes/wizard')
import * as uniqid from 'uniqid'
import { UserStoreI } from '../../user/user.store.interface'

export default (store: UserStoreI) => {
    return new WizardScene('new-user-wizard',
        (ctx) => {
            let tlgId: number = ctx.scene.state.tlgId || null
            ctx.session.newUser = {
                id: uniqid(),
                salutation: null,
                nickname: null,
                coffeeCounter: [],
                tlgId: tlgId
            }
            //Just tmp solution. Now u can't add new user with command /new
            //Only from inline button
            if (!tlgId) {
                ctx.replyWithMarkdown(
                    "#Sorryjako nemůžu pokračovat tohle není nabušeno!\n"+
                    "Nésó jako lidi voe, ale jak na to jukne programář tak bude velký!\n"+
                    "Dočkej času jako husa klasu, nebo něco takového...."
                )
                ctx.scene.leave()
            }
            else {
                ctx.replyWithMarkdown("Vytvoření nového uživatele\nOslovení:")
                return ctx.wizard.next()
            }
        },
        (ctx) => {
            ctx.session.newUser.salutation = ctx.message.text
            ctx.reply('Přezdívka?')
            return ctx.wizard.next()
        },
        (ctx) => {
            ctx.session.newUser.nickname = ctx.message.text
            store.insertUser(ctx.session.newUser)
                .then(() => {
                    ctx.reply(`Uživatel s id ${ctx.session.newUser.id} přidán`)
                })
                .catch(() => {
                    ctx.reply(
                        'Je to takový ošklivý a skoro bych řekl zlý, zlý, ' + 
                        'pane řediteli, nepěkná věc. Něco se pokazilo při přidávání ' +
                        'uživatele. Zkus to znova. Nebo se na to rovnou vys....'
                    )
                })
                .then(() => {
                    return ctx.scene.leave()
                })
        }
    )
}