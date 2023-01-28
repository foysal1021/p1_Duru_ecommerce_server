const express = require("express");
const app = express();
const port = 5000;
var cors = require("cors");
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://drueEcommrece:1LKWxxrggbVNCtwc@cluster0.uvaek7y.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const Database = client.db("Drue-Ecommerce");
    const Product = Database.collection("Drue-Product");
    const order = Database.collection("orderCollection");
    const user = Database.collection("user-info");
    const catagory = Database.collection("catagory");
    const addToCart = Database.collection("cart_product");

    // all products start
    app.get("/products", async (req, res) => {
      const query = {};
      const result = await Product.find(query).toArray();
      res.send(result);
    });
    // all products end

    //product info start
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const productQuery = { _id: ObjectId(id) };
      const result = await Product.findOne(productQuery);
      res.send(result);
    });
    //product info end

    // user information start
    app.post("/user-info", async (req, res) => {
      const userInfo = req.body;
      const userEmail = req.body.email;
      const emailQuery = { email: userEmail };
      const searchEmail = await user.findOne(emailQuery);
      if (searchEmail === null) {
        const postUserInfo = await user.insertOne(userInfo);
        res.send(postUserInfo);
      } else {
        return;
      }
    });
    // user information end

    // order item adde in database start
    app.post("/order-item", async (req, res) => {
      const orderID = req.body.orderId;

      // =============== updated total sell (++) ===============\\start
      if (orderID) {
        const QueryInProduct = { _id: ObjectId(orderID) };
        const searchProduct = await Product.findOne(QueryInProduct);
        const totalSell = searchProduct.totalSell;
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            totalSell: totalSell + 1,
          },
        };
        const result = await Product.updateOne(
          QueryInProduct,
          updateDoc,
          options
        );
      } // ===============updated total sell (++)===============\\ end
      const orderInfo = req.body;
      const orderPost = await order.insertOne(orderInfo);
      res.send(orderPost);
    });
    // order item adde in database end

    // top selling porduct start
    app.get("/top-selling", async (req, res) => {
      const query = {};
      const results = await Product.find(query).toArray();
      let GetTopSelling = [];

      results.forEach((result) => {
        if (result.totalSell > 0) {
          GetTopSelling.push(result);
        }
      });
      res.send(GetTopSelling);
    });
    // top selling porduct end

    // get all user start
    app.get("/user", async (req, res) => {
      const query = {};
      const result = await user.find(query).toArray();
      res.send(result);
    });
    // get all user end

    //get my order start
    app.get("/order/:id", async (req, res) => {
      const email = req.params.id;
      const query = { email: email };
      const result = await order.find(query).toArray();
      res.send(result);
    });
    //get my order end

    //get all order start
    app.get("/all-order", async (req, res) => {
      const query = {};
      const result = await order.find(query).toArray();
      res.send(result);
    });
    //get all order end

    // post catagory start
    app.post("/catagory", async (req, res) => {
      const a = { name: "kk" };
      const catagoryInfo = req.body;
      const query = { catagory: catagoryInfo.catagory };
      const findCatagory = await catagory.findOne(query);
      if (findCatagory === null) {
        const postCatagory = await catagory.insertOne(catagoryInfo);
        res.send(postCatagory);
      }
    });
    // post catagory end

    // get catagory start
    app.get("/catagory", async (req, res) => {
      const query = {};
      const result = await catagory.find(query).toArray();
      res.send(result);
    });
    // get catagory end

    // add product start
    app.post("/add_product", async (req, res) => {
      const productInfo = req.body;
      const result = await Product.insertOne(productInfo);
      res.send(result);
    });
    // add product end

    //mack admin start
    app.post("/mack_admin", async (req, res) => {
      const Loginemail = req.body.Loginemail;
      const userEmail = req.body.userEmail;

      const adminQuery = { email: Loginemail };
      const newAdmin = { email: userEmail };

      const IsAdmin = await user.findOne(adminQuery);
      const MackNewAdmin = await user.findOne(newAdmin);

      if (IsAdmin.role !== "admin") {
        return;
      }

      const options = { upsert: true };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await user.updateOne(newAdmin, updateDoc, options);
      res.send(result);
    });
    //mack admin end

    // check admin
    app.post("/user/check_admin", async (req, res) => {
      const email = req.body?.email;
      const query = { email: email };
      const result = await user.findOne(query);
      res.send(result);
    });

    app.get("/order_delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { orderId: id };
      const result = await order.deleteOne(query);
      res.send(result);
    });

    // post cart data start
    app.post("/add_to_cart", async (req, res) => {
      const cartData = req.body;
      const postCartData = await addToCart.insertOne(cartData);
      res.send(postCartData);
    });
    // post cart data end

    // get cart data start
    app.get("/cart_data/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const find = await addToCart.find(query).toArray();
      res.send(find);
    });
    // get cart data end

    // delete cart paroduct start
    app.get("/delete_cart_product/:id", async (req, res) => {
      const orderId = req.params.id;
      const query = { orderId: orderId };
      const deleted = await addToCart.deleteOne(query);
      res.send(deleted);
    });
    // delete cart paroduct end

    // cart product buy start
    app.post("/cart_product_buy", async (req, res) => {
      const cartDataBuyInfo = req.body;
      const insertCartData = await order.insertOne(cartDataBuyInfo);
      res.send(insertCartData);
    });
    // cart product buy end

    //cart data delete
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
