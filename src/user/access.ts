import { UserStoreI } from './user.store.interface'
import { UserModel } from './user.model'
import * as uniqid from 'uniqid'
import * as util from 'util'

const Markup = require('telegraf/markup')

export class Access {
    private store: UserStoreI
    private adminTlgId: number
    private debounced: boolean = false
    readonly debounceDelayInMinutes: number = 5

    public constructor(store: UserStoreI, adminTlgId: number) {
        this.store = store
        this.adminTlgId = adminTlgId
    }

    public isUserAdmin(user: UserModel): boolean {
        return user.getTlgId() === this.adminTlgId ? true : false
    }

    public middleware() {
        return (ctx, next) => {
            const id: number = ctx.from.id
            this.store.findUserByTelegramId(id)
                .then((user: UserModel) => {
                    ctx.appUser = user
                    next()
                })
                .catch(() => {
                    if (id === this.adminTlgId) {
                        this.store.insertUser(
                            {
                                id: uniqid(),
                                salutation: 'Mistře',
                                nickname: 'Admin',
                                coffeeCounter: [],
                                tlgId: id
                            }
                        )
                        .then((user: UserModel) => {
                            ctx.reply('Protože tě nekdo označil jako admina, tak jsem tě přidal')
                            ctx.appUser = user
                            next()
                        })
                    }
                    else {
                        if (!this.debounced) {
                            ctx.telegram.sendMessage(
                                this.adminTlgId,
                                `Někdo s id ${id} se snaží komunikovat s botem, nechceš ho přidat?`,
                                Markup
                                    .inlineKeyboard([
                                        Markup.callbackButton('Přidat', 'new_user:' + id)
                                    ])
                                    .extra()
                            )
                            this.debounced = true
                            const setTimeoutPromise = util.promisify(setTimeout)
                            //Reset debouncer after n minutes. Defined in readonly property
                            // setTimeoutPromise(this.debounceDelayInMinutes * 60000)
                            setTimeoutPromise(5000)
                                .then(() => this.debounced = false)
                        }
                        ctx.reply(
                            'SorryJako kemo neznám tě, nemám se s tebou o čem bavit. Mažu tě bejku!'
                        )
                    }
                })
        }
    }
}