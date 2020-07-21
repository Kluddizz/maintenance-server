const express = require("express");
const exprjwt = require("express-jwt");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const fs = require("fs");
const db = require("./db");
const path = require("path");

const port = process.env.PORT || 5050;
const publicKey = fs.readFileSync(`${__dirname}/public.key`);

const app = express();
app.use("/users", exprjwt({ secret: publicKey }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());

// Send an unauthorized message whenever the auth process failed.
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(403).json({
      success: false,
      message: "Unauthorized"
    });
  }
});

// The following code is used to load all routes inside the routes folder
// automatically. Every route is represented by a 'express.Router' instance.
const routesPath = path.join(__dirname, "routes");

fs.readdirSync(routesPath).forEach(filename => {
  const routePath = `./routes/${filename}`;

  if (path.extname(routePath) == ".js") {
    const routeName = path.basename(filename, ".js");
    const route = require(routePath);
    app.use(`/${routeName}`, route);
  }
});

// Start the backend server.
app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
