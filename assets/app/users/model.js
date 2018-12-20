export default class {
    constructor(user) {
        this.user = user
    }

    getUser(id) {
        if (this.usersStore.hasOwnProperty(id)) {
            return this.usersStore[id]
        }
        return null
    }
    
    getSalutation() {
        if (user.hasOwnProperty('salutation')) {
            return user.salutation
        }
        return ''
    }
}