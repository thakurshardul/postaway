import mongoose from "mongoose";



const password = encodeURIComponent("Vikram@2607");
const url=`mongodb+srv://sharkkk:${password}@cluster1.0yehnou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1/`
export const connectUsingMongoose = async () => {
  try {
    await mongoose
      .connect(url, {
        dbName: "SocialMedia"
      })
      .then(() => console.log("Mongodb connected using mongoose"))
      .catch((err) =>
        console.error("Error while connecting to db:", err.message)
      );
  } catch (error) {
    console.log(`Error while connecting to db ${error.message}`);
  }
};
