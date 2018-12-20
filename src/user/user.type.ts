import { CoffeeT } from '../coffee/coffee.type'

export type UserT = {
    // Uid of billing user
    id: string,
    // Chat id of telegram user
    tlgId: number,
    // How you wana salute user in message response
    salutation: string
    nickname: string
    // Main user counter of coffee consumption.
    coffeeCounter: CoffeeT[]
}