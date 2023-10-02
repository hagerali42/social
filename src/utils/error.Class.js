export class ErrorClass extends Error{
    constructor(message,statuse){
        super(message)
        this.statuse = statuse ||500
    }
}