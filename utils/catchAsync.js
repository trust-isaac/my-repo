module.exports = func => {
    return (req, res, next)=>{
        //the function above helps carry the function below to the middleware where it will be executed, to prevent it from being executed here. And since it is carrying a middleware, it itself ought to be in middleware format.
        func(req, res, next).catch(e => next(e))
    }
}