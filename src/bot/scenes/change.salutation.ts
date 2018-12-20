const Scene = require('telegraf/scenes/base')

export default (userStore) => {
    const changeSalutationScene = new Scene('change-salutation')

    changeSalutationScene.enter(({reply}) => {
        reply('Zvol nové oslovení, např "Borče"')
    })
    changeSalutationScene.on('message', ({appUser, message, reply, scene}) => {
        appUser.salutation(message.text)
        userStore.syncUser(appUser.id(), appUser.getRawData()).then(() => {
            reply('Oslovení změněno')
            scene.leave()
        })
    })

    return changeSalutationScene
}
