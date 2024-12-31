import jwt from "jsonwebtoken";
import UserRepository from "../features/user/user.repository.js";
const userRepository=new UserRepository();

const jwtAuth = async (req, res, next) => {
  //console.log("in jwt")
  const token = req.headers["authorization"];

  if (!token) return res.status(401).send("No token, authorization denied");
  //check whether token is valid or not
  //if invalid return invalid
  //if valid there might be a chance that its a stale one so we need to further check from db
  let emailId,payload;
  try {
    payload = jwt.verify(token, "vikram");
    //console.log(payload);
    emailId= payload.emailId;
  } catch (error) {
    return res.status(401).send("Token is not valid");
  }
  //checking whether the token is a fresh one or the used ever before cause that can also be verified by jwt so it becomes necesssary to check that the current is in activesessiontokens list
  const result=await userRepository.verifyToken(emailId,token);
  if(result){
    req.emailId=emailId;
    req.userId=payload.userId;
    next();
  }else{
    return res.status(401).send("Token is not valid");
  }
};

export default jwtAuth;
