const joi=require('joi');
const loginschema= joi.object({
    email:joi.string().email().required().messages({'string.email':'Must be a valid email','string.empty':'Email is required'}),
    password:joi.string().min(8).required().messages({'string.min':'Must be a valid password (8 char long)','string.empty':'Password is required'})
})

const signupschema= joi.object({
    username:joi.string().alphanum().min(4).max(30).required().messages({
    'string.min':'Username must be atleast 4 characters long',
    'string.max':'Username cannot exceed 30 characters',
    'string.alphanum':'Username must contain only letters and numbers',
    'string.empty':'Username is required'}),
    email: joi.string().email().required().messages({'string.email':'Must be a valid email','string.empty':'Email is required'}),
    password: joi.string().min(8).required().messages({'string.min':'Must be a valid password (8 char long)','string.empty':'Password is required'})
})

module.exports={loginschema,signupschema}