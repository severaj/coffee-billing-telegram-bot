import { UserStoreI } from './user.store.interface'
import { UserModel } from './user.model'
import { UserT } from './user.type'

export class UserPersistStore implements UserStoreI {
    private store: any
    constructor(store) {
        this.store = store
    }

    findUserById(id) {
        return this.store.get(id)
            .then((user) => {
                if (user) return user
                throw Error('There is no user with id: ' + id)
            })
    }

    findUserByTelegramId(tlgId) {
        const usersStream = this.store.createValueStream()
        return new Promise<UserModel>((resolve, reject) => {
            usersStream
                .on('data', (user: UserT) => {
                    if (user.tlgId == tlgId) {
                        //End stream, it's not needed anymore
                        usersStream.destroy()
                        resolve(new UserModel(user))
                    }
                })
                .on('end', () => {
                    //The user wasn't found so rejection
                    reject()
                })
        })
    }

    syncUser(id, data) {
        return this.findUserById(id)
            .then(() => this.store.put(id, data))
            .then(() => new UserModel(data))
    }

    getAllUsers() {
        const usersStream = this.store.createValueStream()
        type UserModelCollectionT = UserModel[]
        let users: UserModelCollectionT = []
        return new Promise<UserModelCollectionT>((resolve, reject) => {
            usersStream
                .on('data', (user: UserT) => {
                    users.push(new UserModel(user))
                })
                .on('end', () => {
                    resolve(users)
                })
                .on('error', (err) => {
                    //In this moment I don't know what I should do with err
                    //Log or propagate duno....
                    //Important is just rejection of the promise
                    //TODO
                    reject()
                })
        })
    }

    insertUser(user) {
        return this.store.put(user.id, user)
            .then((user) => new UserModel(user))
    }

}