module.exports = fn =>{
    //Anonymus fucntion: function withot name
    return (req, res, next) => {
        fn(req,res,next).catch(err => next(err))
    }
}