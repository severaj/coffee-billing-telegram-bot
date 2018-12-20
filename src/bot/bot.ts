import { UserModel } from '../user/user.model'
import Scene from 'telegraf/scenes/base'
import Router from 'telegraf/router'
import { Access } from '../user/access'
import { UserStoreI } from '../user/user.store.interface'

// Need to be replaced with es6 module style. More info at 
// https://stackoverflow.com/q/49348607/7092954
// or https://stackoverflow.com/q/49348607/7092954
const telegraf = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const { leave } = Stage
const Markup = require('telegraf/markup')

export default (
    scenes: Scene[],
    access: Access,
    cbRouter: Router,
    userStore: UserStoreI,
    botKey: number
) => {
    const bot = new telegraf(botKey)
    // Create scene manager
    const stage = new Stage(scenes)
    stage.command('cancel', leave())

    bot.use(session())
    bot.use(access.middleware())
    bot.use(stage.middleware())
    bot.command('new', ({scene, appUser}) => {
        if (access.isUserAdmin(appUser)) {
            scene.enter('new-user-wizard')
        }
    })

    bot.command('changenick', ({scene}) => {
        scene.enter('change-nickname')
    })

    bot.command('changesalut', ({scene}) => {
        scene.enter('change-salutation')
    })

    bot.on('callback_query', cbRouter)

    bot.start(({reply}) => {
        reply(
            'Tož tě zdravím v sprateknet coffee billing machine ver 0.0.1!'
        )
    })

    bot.help(({replyWithMarkdown}) => {
        const msg = "Sprateknet coffee billing machine 0.0.1 se ovládá následně:\n\
    +, kafe\n\
    připočtu ti do aktuálního měsíce kafe.\n\
    -, deletefake\n\
    odpočítám ti v aktuálním měsíci poslední zaevidované kafe od koncce\n\
    /count\n\
    dostaneš kolik káv máš tento měsíc\n\
    /sum\n\
    dostaneš aktuální cenu za kávu tento měsíc\n\
    /top\n\
    žebříček uživatelů aktuální měsíc\n\
    /changenick\n\
    změna přezdívky\n\
    /changesalut\n\
    změna oslovení\n\
    /keyboard\n\
    pomocná tlačítka"

        replyWithMarkdown(msg)
    })

    bot.command('count', ({appUser, reply}): void => {
        reply(`Tento měsíc jsi měl ${appUser.getCurrentMounthCoffeeSum()} káv`)
    })

    bot.command('sum', ({reply}): void => {
        reply('SorryJako tohle ještě není implementováno')
    })

    bot.command('keyboard', ({reply}) => {
        reply(
            'Pomocná tlačítka', 
            Markup
                .keyboard(['☕ kafe up'])
                .oneTime()
                .resize()
                .extra()
        )
    })

    bot.command('top', ({replyWithMarkdown}) => {
        let msg: string = ''
        userStore.getAllUsers()
            .then((users) => {
                users
                    //Sort desc by the users month coffee consumption
                    .sort((a, b): number => b.getCurrentMounthCoffeeSum() - a.getCurrentMounthCoffeeSum())
                    //Compose response message
                    .forEach((user, index) => {
                        msg += `${(index + 1)}. ${user.nickname()} má `
                        msg += `${user.getCurrentMounthCoffeeSum()} káv\n`
                    })
                replyWithMarkdown(msg)
            })
    })

    bot.hears(['+', 'kafe', '☕ kafe up'], ({appUser, reply}): void => {
        appUser.addCoffee()
        //Sync data with store (persist). It's async operation!
        userStore.syncUser(
            appUser.id(),
            appUser.getRawData()
        )
        .then((newUser) => {
            reply(
                newUser.salutation() +
                ' zaevidoval jsem ti jedno kafe. Tento měsíc jsi měl ' +
                newUser.getCurrentMounthCoffeeSum(),
                Markup
                    .keyboard(['☕ kafe down', '☕ kafe up'])
                    .oneTime()
                    .resize()
                    .extra()
            )
        })
        //Something is terribly wrong
        .catch(() => {
            reply(
                'SorryJako něco se pokazilo nemohl jsem ti zaevidovat kafe! ' +
                'Kontaktuj guru Juru, zkusí ti to odháčkovat.'
            )
        })
    })


    bot.hears(['-', 'deletekafe', '☕ kafe down'], (ctx) => {
        let user: UserModel = ctx.appUser;
        if (user.getCurrentMounthCoffeeSum() < 1) {
            const msg = `${user.salutation()} tento měsíc nemáš evidované žádné ` +
                        `kafe nemám ti to z čeho odpočítat`
            ctx.reply(msg)
        }
        else {
            user.removeLastCoffee()
            userStore.syncUser(
                user.id(),
                user.getRawData()
            )
            .then((newUser) => {
                const count: number = newUser.getCurrentMounthCoffeeSum()
                const salutation: string = newUser.salutation()
                let msg: string
                if (count <= 0) {
                    msg = `${salutation} odpáral jsem ti jedno kafe. Takže tento měsíc ` +
                    `nemáš evidovaný žádný kafe`
                }
                else {
                    msg = `${salutation} odpáral jsem ti jedno kafe. Takže tento měsíc ` +
                    `jsi měl ${count}` 
                }
                ctx.reply(msg)
            })
        }
    })

    //Custom error handling
    bot.catch((err) => {
        // TODO: More complex error handling!
        console.log('Ooops', err)
    })

    return bot
}