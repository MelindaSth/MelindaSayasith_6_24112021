module.exports = ( req, res, next) => {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)){
     next()
   } else {
   res.status(400).json({message : 'Votre Email est incorrect'}) 
     }
 }