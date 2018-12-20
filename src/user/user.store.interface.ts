import { UserModel } from './user.model'
import { UserT } from './user.type'

export interface UserStoreI {
    findUserById (id: number): Promise<UserModel>
    findUserByTelegramId (id: number): Promise<UserModel>
    syncUser(id: string, data: UserT): Promise<UserModel>
    getAllUsers(): Promise<UserModel[]>
    insertUser(user: UserT): Promise<UserModel>
}