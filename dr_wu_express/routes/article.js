const express = require('express')
const router = express.Router()
const { Article } = require('../model/article')
const { msg } = require('../config/response')

/**
 * 发表新文章
 */
router.post('/', async (req, res) => {
    let article = new Article(req.body)
    article.save((e, article) => {
        if (e) res.send(msg('发表失败', 500, null, e))
        else res.send(msg('发表成功', 200, article))
    })
})

/**
 * 查询文章列表，只有标题、作者等
 */
router.get('/', async (req, res) => {
    let { keyword, status } = req.query
    status = status ? status : 'release'
    keyword = { $regex: keyword }

    Article.find({
        $or: [{ title: keyword }, { content: keyword }, { tag: keyword }, { author_name: keyword }],
        status,
    }, { content: 0, comments: 0 }).then(r => {
        res.send(msg('查询成功', 200, r))
    })
})

/**
 * 删除文章
 */
router.delete('/:article_id', async (req, res) => {
    let { article_id } = req.params
    let article = Article.findByIdAndUpdate(article_id, {
        status: 'banned',
    }, { new: true }).then(r => {
        res.send(msg('删除成功', 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg('删除失败', 500, null, e))
    })
})

/**
 * 发表文章评论
 */
router.post('/comment', async (req, res) => {
    let comment = req.body
    let { article_id } = req.query

    Article.findByIdAndUpdate(article_id, { $push: { comment } }, { new: true }).then(r => {
        res.send(msg('评论成功', 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg('评论失败', 500, null, e))
    })
})

/**
 * 回复评论
 */
router.post('/reply', async (req, res) => {
    let { article_id, comment_id } = req.query
    let reply = req.body
    let article = await Article.findById(article_id)
    let comment = article.comment.id(comment_id)

    comment.reply.push(reply)
    article.save().then(r => {
        res.send(msg('回复成功', 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg('回复失败', 500, null, e))
    })
})

/**
 * 删除评论
 */
router.delete('/comment', async (req, res) => {
    let { article_id, comment_id } = req.query
    let article = await Article.findById(article_id)

    article.comment.id(comment_id).remove()
    article.save().then(r => {
        res.send(msg('删除成功', 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg('删除失败', 500, null, e))
    })
})

/**
 * 删除回复
 */
router.delete('/reply', async (req, res) => {
    let { article_id, comment_id, reply_id } = req.query
    let article = await Article.findById(article_id)

    article.comment.id(comment_id).reply.id(reply_id).remove()
    article.save().then(r => {
        res.send(msg('删除成功', 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg('删除失败', 500, null, e))
    })
})

/**
 * 点赞评论
 */
router.put('/comment', async (req, res) => {
    let { article_id, comment_id } = req.query
    let article = await Article.findById(article_id)
    let comment = article.comment.id(comment_id)
    let { _id } = req.data

    let type = comment.like_account_id_list.includes(_id)
    if (type) comment.like_account_id_list.pull(_id)
    else comment.like_account_id_list.push(_id)
    article.save().then(r => {
        res.send(msg(`${type ? '取消' : '点赞'}成功`, 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg(`${type ? '取消' : '点赞'}失败`, 500, null, e))
    })
})

/**
 * 点赞回复
 */
router.put('/reply', async (req, res) => {
    let { article_id, comment_id, reply_id } = req.query
    let article = await Article.findById(article_id)
    let reply = article.comment.id(comment_id).reply.id(reply_id)
    let { _id } = req.data

    let type = reply.like_account_id_list.includes(_id)
    if (type) reply.like_account_id_list.pull(_id)
    else reply.like_account_id_list.push(_id)
    article.save().then(r => {
        res.send(msg(`${type ? '取消' : '点赞'}成功`, 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg(`${type ? '取消' : '点赞'}失败`, 500, null, e))
    })
})

/**
 * 刷新文章
 */
router.get('/refresh', async (req, res) => {
    let { article_id } = req.query
    Article.findById(article_id).then(r => {
        res.send(msg('查询成功', 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg('查询失败', 500, null, e))
    })
})

/**
 * 根据文章id查询文章详情，并增加一个阅读量
 */
router.get('/:article_id', async (req, res) => {
    let { article_id } = req.params
    Article.findByIdAndUpdate(article_id,
        { $inc: { readCount: 1 } },
        { new: true }).then(r => {
        res.send(msg('查询成功', 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg('查询失败', 500, null, e))
    })
})

/**
 * 修改文章
 */
router.put('/:article_id', async (req, res) => {
    let { article_id } = req.params
    let new_article = req.body
    let article = await Article.findByIdAndUpdate(
        article_id, {
            title: new_article.title,
            tag: new_article.tag,
            content: new_article.content,
            cover: new_article.cover,
        }, { new: true }).then(r => {
        res.send(msg('修改成功', 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg('修改失败', 500, null, e))
    })
})

/**
 * 点赞/取消点赞文章
 */
router.put('/like/:article_id', async (req, res) => {
    let { _id } = req.data
    let { article_id } = req.params
    let article = await Article.findById(article_id)
    let type = article.like_account_id_list.includes(_id)

    if (type) article.like_account_id_list.pull(_id)
    else article.like_account_id_list.push(_id)
    article.save().then(r => {
        res.send(msg(`${type ? '取消' : '点赞'}成功`, 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg(`${type ? '取消' : '点赞'}失败`, 500, null, e))
    })
})

module.exports = router