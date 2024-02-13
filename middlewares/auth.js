import jwt from "jsonwebtoken";

export const verifyToken = async(req,resp,next)=>{
    try {
        let token = req.header("Authorization");

        if(!token){
            return resp.status(403).json({message:"Access Denied."})
        }

        if(token.startsWith("Bearer ")){
            token = token.slice(7,token.length).trimLeft();
        }

        const verified = jwt.verify(token,process.env.JWT_SECRET);

        //
        req.user = verified;
        next()

    } catch (error) {
        resp.status(500).json({error:error.message});
    }
}