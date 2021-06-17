var express = require("express");
var router = express.Router();
const { sequelize, Book } = require("../models");

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  };
}

/* GET home page. */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const books = await Book.findAll();
    // throw Error(500);
    // const allBooks = books.toJSON()
    // console.log(books);

    res.render("index", { title: "what you want?" });
  })
);

module.exports = router;
