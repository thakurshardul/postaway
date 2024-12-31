import UserRepository from "./user.repository.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



export default class userController {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async signUp(req, res, next) {
    try {
      const { name, emailId, password, gender } = req.body;
      
      const avatar = req.file.filename;
      const hashPassword = await bcrypt.hash(password, 12);
      // Check if the user is already registered
      const existingUser = await this.userRepository.findByEmail(emailId);
      if (existingUser) {
        return res.status(400).send("User already registered.");
      }
      const userCreated = await this.userRepository.signUp(
        name,
        emailId,
        hashPassword,
        gender,
        avatar
      );
      if (userCreated._id) {
        res.status(201).send({
          success: true,
          message: "User has been registered successfully!",
          data: userCreated
        });
      } else {
        res.status(400).send({
          success: false,
          message: "User has not been registered!",
          data: []
        });
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  async signIn(req, res) {
    const { emailId, password } = req.body;
    //1.check email exist or not
    const user = await this.userRepository.findByEmail(emailId);
    if (!user) {
      res.status(400).send({ success: false, message: "Email not exits!" });
    }
    //console.log("user :", user);
    // 2. Compare  password with hashed password.
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      const token = jwt.sign(
        { userId: user._id, emailId: user.emailId },
        "vikram",
        {
          expiresIn: "6h"
        }
      );
      const tokenUpdatedStatus=await this.userRepository.signIn(emailId,token);
      res.status(200).send({
        success: true,
        message: "User has been logged In!",
        data: token
      });
    } else {
      res.status(400).send({ success: false, message: "Invalid Crediential" });
    }
  }
  catch(error) {
    next(error);
  }
  //logout
  async signOut(req, res, next) {
    try {
       const token = req.headers["authorization"];
      const emailId=req.emailId;
      if (!token) {
        throw new ApplicationError("Unauthorized User!", 401);
      }
      const result=await this.userRepository.signOut(emailId,token);
      if(result){
        res
        .status(200)
        .send({ success: true, message: "User has been logout successfully!" });
      }else{
        res.status(400).send({success:false,message:"token is invalid!"});
      }
      
    } catch (error) {
      next(error);
    }
  }
  async getAllUserDetail(req, res, next) {
    try {
      const users = await this.userRepository.getAllUser();
      if (users)
        res.status(200).send({
          success: true,
          message: "User retireved successfully!",
          data: users
        });
      else
        res
          .status(400)
          .send({ success: false, message: "User not retireved!" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getDetailByUser(req, res, next) {
    try {
      const Id = req.userId;
      
      const userId = req.params.id;
      
      const user = await this.userRepository.getUserDetail(Id, userId);
      if (user)
        res.status(200).send({
          success: true,
          message: "User retireved successfully!",
          data: user
        });
      else
        res
          .status(400)
          .send({ success: false, message: "User not retrieved!" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async updateUserDetail(req, res, next) {
    try {
      const { name, gender } = req.body;
      const id = req.userId;
      const userId = req.params.id;
      const avatar = req.file.filename;

      const updatedUser = await this.userRepository.updateUser(
        id,
        userId,
        name,
        gender,
        avatar
      );
      if (updatedUser)
        res.status(200).send({
          success: true,
          message: "User updated successfully!",
          data: updatedUser
        });
    } catch (error) {
      next(error);
    }
  }
  async resetPassword(req, res, next) {
    try {
      const { newPassword } = req.body;
      const id = req.userId;
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      const isPasswordReset = await this.userRepository.resetPasswordUser(
        id,
        hashedPassword
      );
      if (isPasswordReset)
        res
          .status(200)
          .send({ success: true, message: "Password reset successfully!" });
      else
        res
          .status(400)
          .send({ success: false, message: "Password not reset!" });
    } catch (error) {
      next(error);
    }
  }
  async sendOtp(req, res, next) {
    try {
      const { email } = req.body;
      const userOtp = await this.userRepository.sendOtpUser(email);
      if (userOtp)
        res.status(200).send({
          success: true,
          message: "Otp send successfully!",
          otp: userOtp
        });
      else res.status(400).send({ success: false, message: "Otp not send!" });
    } catch (error) {
      next(error);
    }
  }
  async verifyOtp(req, res, next) {
    try {
      const { otp } = req.body;
      const id = req.userId;
      const isOtpVerified = await this.userRepository.verifyOtpUser(id, otp);
      if (isOtpVerified)
        res
          .status(200)
          .send({ success: true, message: "Otp verified successfully!" });
      else
        res.status(400).send({ success: false, message: "Otp not verified!" });
    } catch (error) {
      next(error);
    }
  }
}
