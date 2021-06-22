var express = require("express");
var router = express.Router();
const Book = require("../models").Book;
const Sequelize = require("sequelize");
const { Op } = require("sequelize");

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

const errorHandler = (errStatus, msg) => {
  const err = new Error(msg);
  err.status = errStatus;
  throw err;
};

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
  asyncHandler(async (req, res, next) => {
    const page = req.query.page;
    !page ? res.redirect("?page=1") : null;

    const books = await Book.findAll({
      order: [["ID", "ASC"]],
      offset: (page - 1) * 10,
      limit: 10,
    });
    const results = books.length;
    console.log(results, page);
    results < 1
      ? res.redirect("?page=1")
      : res.render("index", { books, page });
  })
);

router.get(
  "/books/new",
  asyncHandler(async (req, res) => {
    res.render("new-book");
  })
);

router.post(
  "/books/new",
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
          id: null,
        });
      } else {
        throw error;
      }
    }
  })
);

//search
router.get(
  "/books/search",
  asyncHandler(async (req, res, next) => {
    const { term } = req.query;
    console.log(term);
    const books = await Book.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: "%" + term + "%" } },
          { author: { [Op.like]: "%" + term + "%" } },
          { genre: { [Op.like]: "%" + term + "%" } },
          { year: { [Op.like]: "%" + term + "%" } },
        ],
      },
    });
    console.log(books);
    if (books) {
      res.render("index", { books, term });
    } else {
      errorHandler(404, "Could not find your page");
    }
  })
);

router.get(
  "/books/:id",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("update-book", { book });
    } else {
      errorHandler(404, "Could not find your page");
    }
  })
);

// update book
router.post(
  "/books/:id",
  asyncHandler(async (req, res, next) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/");
      } else {
        errHandler(404, "Could not find your page");
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render("update-book", {
          book,
          errors: error.errors,
          title: "Edit Book",
        });
      } else {
        throw error;
      }
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

//search?

// app.get("/books/search", (req, res) => {

//   Books.findAll({ where: { title: { [Op.like]: '%' + term + '%' } } })
//     .then(Books => res.render('index', {Books})
//   .catch()
// });

module.exports = router;
