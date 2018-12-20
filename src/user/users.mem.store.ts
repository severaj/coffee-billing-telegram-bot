import { UserStoreI } from './user.store.interface'
import { UserModel } from './user.model'
import { UserT } from './user.type'

export class UserMemStore implements UserStoreI {
    private store: UserT[] = [
        {
            id: '1',
            salutation: 'Jirko',
            nickname: 'Jura',
            coffeeCounter: [],
            tlgId: 209273419
        },
        {
            id: '2',
            salutation: 'Jirko',
            nickname: 'Franta',
            coffeeCounter: [],
            tlgId: 243921289,
        }
    ]

    private createUserInstanceIfExists(user) {
        if (user) {
            return Promise.resolve(new UserModel(user))
        }
        return Promise.reject()
    }

    getAllUsers() {
        return Promise.all(
            this.store.map((user) => {
                return this.createUserInstanceIfExists(user)
            })
        )
    }

    findUserById(id) {
        return this.createUserInstanceIfExists(
            this.store.find((user) => user.id === id)
        )
    }

    findUserByTelegramId(telegramId) {
        return this.createUserInstanceIfExists(
            this.store.find((user) => user.tlgId === telegramId)
        )
    }

    syncUser(id: string, newData: UserT): Promise<UserModel> {
        const user: UserT = this.store.find(item => item.id === id)
        if (!user) return Promise.reject()
        Object.assign(
            user,
            newData
        )
        return Promise.resolve(new UserModel(user))
    }

    insertUser(user) {
        this.store.push(user)
        return Promise.resolve(new UserModel(user))
    }
}