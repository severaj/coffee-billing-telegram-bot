const Scene = require('telegraf/scenes/base')
export default (userStore) => {
    const changeNicknameScene = new Scene('change-nickname')

    changeNicknameScene.enter(({reply}) => {
        reply('Zvol novou přezdívku, např "Capo di Tutti Capi"')
    })
    changeNicknameScene.on('message', ({appUser, message, reply, scene}) => {
        appUser.nickname(message.text)
        userStore.syncUser(appUser.id(), appUser.getRawData()).then(() => {
            reply('Přezdívka změněna')
            scene.leave()
        })
    })
    return changeNicknameScene
}