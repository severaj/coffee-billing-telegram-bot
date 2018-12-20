
import { UserT } from './user.type'
import { CoffeeT } from '../coffee/coffee.type'
import * as uniqid from 'uniqid'
import * as moment from 'moment'

export class UserModel {
    private user: UserT

    readonly salutationKey: string = 'salutation'
    readonly idKey: string = 'id'
    readonly tlgIdKey: string = 'tlgId'

    constructor(user: UserT) {
        this.user = user
    }

    salutation(value?: string): string {
        //Setter
        if (value) this.user[this.salutationKey] = value
        //Allways return the Salutation
        if (this.user.hasOwnProperty(this.salutationKey)) {
            return this.user[this.salutationKey]
        }
        //Fallback
        return 'Kemo'
    }

    nickname(value?: string): string {
        //Setter
        if (value) this.user['nickname'] = value
        //Allways return the Nickname
        if (this.user.hasOwnProperty('nickname')) {
            return this.user['nickname']
        }
        //Fallback
        return 'Nějakéj týpek co nemá nick s id ' + this.id()
    }

    getTlgId(): number {
        return this.user[this.tlgIdKey]
    }

    id(): string {
        return this.user[this.idKey]
    }

    addCoffee(
        amount: number = 1,
        tax: number = 0
    ): UserModel {
        [...Array(amount)].forEach(() => {
            const coffee: CoffeeT = {
                id: uniqid(),
                ts: new Date(),
                tax
            }
            this.user.coffeeCounter.push(coffee)
        })
        return this
    }

    getRawData(): UserT {
        return this.user
    }

    removeLastCoffee(): UserModel {
        if (this.user.coffeeCounter.length > 0) {
            this.user.coffeeCounter.pop()
        }
        return this
    }

    getCurrentMounthCoffeeSum(): number {
        const now: moment.Moment = moment()
        const currentMonth: number = now.month()
        const currentYear: number = now.year()
        let sum: number = 0
        this.user.coffeeCounter.forEach((item) => {
            const tsDate: moment.Moment = moment(item.ts)
            if (
                tsDate.month() === currentMonth
                &&
                tsDate.year() === currentYear
            ) {
                sum++
            }
        })
        return sum
    }

}