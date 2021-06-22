var express = require("express");
var router = express.Router();
const Book = require("../models").Book;

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
    // const books = await Book.findAll();
    // throw Error(500);
    // const allBooks = books.toJSON()
    // console.log(books);

    res.redirect("/books");
  })
);

router.get(
  "/books",
  asyncHandler(async (req, res) => {
    const books = await Book.findAll({ order: [["createdAt", "DESC"]] });
    res.render("index", { books });
  })
);

router.get(
  "/books/new",
  asyncHandler(async (req, res) => {
    res.render("new-book");
  })
);

router.post(
  "books/new",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/books");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        res.render("new-book", {
          book,
          errors: error.errors,
          title: "New Book",
        });
      } else {
        throw error;
      }
    }
  })
);

router.get(
  "/books/:id",
  asyncHandler(async (req, res) => {
    const book = await Article.findByPk(req.params.id);
    if (book) {
      res.render("update-book", { book });
    } else {
      res.sendStatus(404);
    }
  })
);

// update book
router.post(
  "/books/:id",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect("/");
    } else {
      res.sendStatus(404);
    }
  })
);

//delete
router.post(
  "/books/:id/delete",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy(req.body);
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
  })
);

module.exports = router;
