module.exports = function(req, res, next){
    const key = req.headers['x-api-key']

    if(!key || key != process.env.API_KEY){
        return res.status(403).json({message:'API key inválida ou ausente'})
    }

    next();
}