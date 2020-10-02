const express = require('express')
const ArticlesService = require('./articles-service')
const { requireAuth } = require('../middleware/jwt-auth')

const articlesRouter = express.Router()

articlesRouter
  .route('/')
  .get(getArticles)
  // .get((req, res, next) => {
  //   ArticlesService.getAllArticles(req.app.get('db'))
  //     .then(articles => {
  //       res.json(articles.map(ArticlesService.serializeArticle))
  //     })
  //     .catch(next)
  // })

articlesRouter
  .route('/:article_id')
  .all(requireAuth)
  .all(checkArticleExists)
  .get((req, res) => {
    res.json(ArticlesService.serializeArticle(res.article))
  })

articlesRouter.route('/:article_id/comments/')
  .all(requireAuth)
  .all(checkArticleExists)
  .get(getCommentsForArticle)
  // .get((req, res, next) => {
  //   ArticlesService.getCommentsForArticle(
  //     req.app.get('db'),
  //     req.params.article_id
  //   )
  //     .then(comments => {
  //       res.json(comments.map(ArticlesService.serializeArticleComment))
  //     })
  //     .catch(next)
  // })

/* async/await syntax for promises */

// QUESTIONS:
// 1) Should we always include an "if" statement for error when using async/await?
// 2) Can we create an async await for a simple get request (see route /:article_id above)?
// 3) If using async/await server side, would it be expected to be used client side?
// 4) How does it affect the way we write tests?
// 5) Would we need to apply the same logic to a file like jwt-auth.js for consistentcy?


async function getArticles(req, res, next) {
  try {
    const articles = await ArticlesService.getAllArticles(req.app.get('db'))

    if (!articles)
      return res.status(404).json({
        error: `There are no articles`
      })
    
    res.articles = res.json(articles.map(ArticlesService.serializeArticle))
    next()
  } catch (error) {
    next(error)
  }
}

async function getCommentsForArticle(req, res, next) {
  try {
    const comments = await ArticlesService.getCommentsForArticle(
      req.app.get('db'),
      req.params.article_id
    )

    if (!comments)
      return res.status(404).json({
        error: `There are no comments`
      })

    res.article = res.json(comments.map(ArticlesService.serializeArticleComment))
    next()
  } catch (error) {
    next(error)
  }
}

async function checkArticleExists(req, res, next) {
  try {
    const article = await ArticlesService.getById(
      req.app.get('db'),
      req.params.article_id
    )

    if (!article)
      return res.status(404).json({
        error: `Article doesn't exist`
      })

    res.article = article
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = articlesRouter
