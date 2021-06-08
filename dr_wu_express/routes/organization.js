const express = require('express')
const router = express.Router()
const Account = require('../model/account')
const Organization = require('../model/organization')
const { msg } = require('../config/response')
const jwt = require('../utils/jwt')

/**
 * 获取用户绑定的机构信息
 */
router.get('/', async (req, res, next) => {
    let theAccount = req.data
    theAccount = await Account.findById(theAccount._id)
    if (theAccount.organization._id) {
        Organization.findById(theAccount.organization._id).then(r => {
            res.send(msg('用户已绑定机构', 200, r))
        }).catch(e => {
            res.send(msg('获取用户机构信息失败', 500, null, e))
        })
    } else res.send(msg('用户未绑定机构'))
})

/**
 * 获取同一机构的所有医生信息
 */
router.get('/members', async (req, res) => {
    let { organization, _id } = req.data
    if (!organization._id) organization._id = (await Account.findById(_id)).organization._id

    Account.find({ 'organization._id': organization._id }, { password: 0 }).then(r => {
        res.send(msg('查询成功', 200, r))
    }).catch(e => {
        res.send(msg('服务器出错', 500, null, e))
    })
})

/**
 * 查询机构信息
 */
router.get('/query/', async (req, res) => {
    let { keyword } = req.query
    keyword = { $regex: keyword }

    Organization.find({ name: keyword }).then(r => {
        res.send(msg('查询成功', 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg('查询失败', 500, null, e))
    })
})

/**
 * 获取指定机构信息
 */
router.get('/:org_id', async (req, res) => {
    let { org_id } = req.params
    Organization.findById(org_id).then(r => {
        res.send(msg('查询成功', 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg('查询失败', 500, null, e))
    })

})

/**
 * 新增机构
 */
router.post('/', async (req, res, next) => {
    let theAccount = req.data
    let theOrg = req.body
    theOrg.associated_account_list = [{
        account_id: theAccount._id,
        role: 'owner',
    }]
    theOrg = new Organization(theOrg)
    theOrg.save((e, org) => {
        if (e && e.code === 11000) res.send(msg('该机构名已存在', 400, null, e))
        else if (e) res.send(msg('注册失败', 500, null, e))
        else Account.findByIdAndUpdate(theAccount._id, {
                $set: {
                    organization: {
                        _id: org._id,
                        role: 'owner',
                    },
                },
            }).then(account => {
                let token = jwt.encrypt(account)
                res.send(msg('注册成功', 200, { info: account, org, token }))
            }).catch(e => {
                res.send(msg('注册失败', 500, null, e))
            })
    })
})

/**
 * 修改机构信息，仅创建者和管理员
 */
router.put('/', async (req, res) => {
    let { _id } = req.data
    let updateData = req.body
    let theAccount = await Account.findById(_id)

    if (!theAccount.organization._id) res.send(msg('修改失败，用户未绑定机构', 400))
    else if (theAccount.organization.role === 'member') res.send(msg('修改失败，用户权限不足', 400))
    else {
        Organization.findByIdAndUpdate(theAccount.organization._id, updateData, { new: true }).then(r => {
            res.send(msg('修改成功', 200, r))
        }).catch(e => {
            console.error(e)
            if (e.code === 11000) res.send(msg('机构名已存在', 500, null, e))
            else res.send(msg('修改失败', 500, null, e))
        })
    }
})

/**
 * 添加机构成员，仅创建者和管理员
 */
router.post('/members', async (req, res) => {
    let { _id } = req.data
    let { member_id, member_role } = req.query
    let theAccount = await Account.findById(_id)
    let member = await Account.findById(member_id)
    console.log(theAccount.organization._id)

    if (!theAccount.organization._id) res.send(msg('绑定失败，用户未绑定机构', 400))
    else if (theAccount.organization.role === 'member') res.send(msg('绑定失败，用户权限不足', 400))
    else if (member.organization._id) res.send(msg('绑定失败，目标用户已绑定机构', 400))
    else {
        member.organization = {
            _id: theAccount.organization._id,
            role: member_role,
        }

        member.save().then(r => {
            return Organization.findByIdAndUpdate(theAccount.organization._id, {
                $push: {
                    associated_account_list: {
                        account_id: member_id,
                        role: member_role,
                    },
                },
            }, { new: true })
        }).then(r => {
            res.send(msg('绑定成功', 200, r))
        }).catch(e => {
            console.error(e)
        })
    }
})

/**
 * 修改机构成员权限
 */
router.put('/members', async (req, res) => {
    let { _id } = req.data
    let { member_id, member_role } = req.query
    let theAccount = await Account.findById(_id)
    let member = await Account.findById(member_id)

    if (!theAccount.organization._id) res.send(msg('修改失败，用户未绑定机构', 400))
    else if (theAccount.organization.role === 'member') res.send(msg('修改失败，用户权限不足', 400))
    else if (!member) res.send(msg('修改失败，未找到目标用户', 400, null, null))
    else {
        let theOrg = await Organization.findById(theAccount.organization._id)

        member.organization = {
            _id: theOrg._id,
            role: member_role,
        }
        theOrg.associated_account_list = theOrg.associated_account_list.filter(i => i.account_id !== member_id)
        theOrg.associated_account_list.push({
            account_id: member_id,
            role: member_role,
        })

        member.save().then(r => {
            member = r
            return theOrg.save()
        }).then(r => {
            res.send(msg('修改成功', 200, { member, org: r }))
        }).catch(e => {
            console.error(e)
            res.send(msg('修改失败', 500, null, e))
        })
    }
})

/**
 * 解除绑定医生
 */
router.delete('/members', async (req, res) => {
    let { _id } = req.data
    let { member_id } = req.query
    let member = await Account.findById(member_id)
    let theAccount = await Account.findById(_id)

    if (!theAccount.organization._id) res.send(msg('解绑失败，用户未绑定机构', 400))
    else if (theAccount.organization.role === 'member') res.send(msg('解绑失败，用户权限不足', 400))
    else if (!member) res.send(msg('解绑失败，未找到目标用户', 400, null, null))
    else {
        let theOrg = await Organization.findById(theAccount.organization._id)

        member.organization = { _id: '', role: '' }
        theOrg.associated_account_list = theOrg.associated_account_list.filter(i => i.account_id !== member_id)

        member.save().then(r => {
            member = r
            return theOrg.save()
        }).then(r => {
            res.send(msg('解绑成功', 200, { member, org: r }))
        }).catch(e => {
            console.error(e)
            res.send(msg('解绑失败', 500, null, e))
        })
    }
})

module.exports = router