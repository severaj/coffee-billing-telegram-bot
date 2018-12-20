import { Access } from '../user/access'
const Router = require('telegraf/router')

export default (access: Access) => {
    const callbackRouter = new Router(({ callbackQuery }) => {
        if (!callbackQuery.data) {
            return
        }
        const parts = callbackQuery.data.split(':')
        return {
            route: parts[0],
            state: {
                data: parts[1]
            }
        }
    })

    callbackRouter.on('new_user', (ctx) => {
        const tlgId: number = parseInt(ctx.state.data)
        if (access.isUserAdmin(ctx.appUser)) {
            ctx.scene.enter('new-user-wizard', {tlgId})
        }
    })
    return callbackRouter
}