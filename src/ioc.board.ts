
import * as level from 'level'
const sublevel = require('sublevel')

import { UserPersistStore } from './user/users.persist.store'
import newUserWizard from './bot/scenes/new.user.wizard'
import { Access } from './user/access' 
import callBackRouter from './bot/callback.router'
import botBuilder from './bot/bot'
import changeNickScene from './bot/scenes/change.nickname'
import changeSalutScene from './bot/scenes/change.salutation'


const userStore = () => {
    const db = level('./coffee_bot_db', {valueEncoding: 'json'})
    const usersDb = sublevel(db, 'users')
    return new UserPersistStore(usersDb)
}

//Singelton bot cache
let botCache

//Dependency injection for super very poor
export default {
    //Singelton without deps
    userStore: userStore(),
    get scenes() {
        return [
            newUserWizard(this.userStore),
            changeNickScene(this.userStore),
            changeSalutScene(this.userStore)
        ]
    },
    get access() {
        return new Access(
            this.userStore,
            this.telegramAdminId
        )
    },
    telegramAdminId: Number(process.env.TELEGRAM_ADMIN_ID),
    botKey: process.env.BOT_KEY,
    get cbRouter() {
        return callBackRouter(this.access)
    },
    get bot() {
        if (!botCache) {
            botCache = botBuilder(
                this.scenes,
                this.access,
                this.cbRouter,
                this.userStore,
                this.botKey
            )
        }
        return botCache
    }
}