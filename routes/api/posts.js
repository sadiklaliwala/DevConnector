const express = require("express");
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

//load models 
const post = require('../../models/postmodel');
const usermodel = require('../../models/usermodel');
const profilemodel = require("../../models/profilemodel");

//load validation 
const validatePostinput = require('../../validator/postvalidation');

//@routes GET api/post/test
//@desc test post routes
//@access public
router.get('/test', (req, res) => {
    res.json({ msg: 'posts calling  ' });
})

//@routes GET api/post/
//@desc get post 
//@access public
router.get('/', async (req, res) => {
    try {
        const posts = await post.find().sort({ date: -1 });
        return res.json(posts);
    } catch (err) {
        return res.status(404).json({ msg: 'no post found' });
    }
});

//@routes GET api/post/:id
//@desc get post by id 
//@access public
router.get('/:id', async (req, res) => {
    try {
        const posts = await post.findById(req.params.id).sort({ date: -1 });
        return res.json(posts);
    } catch (err) {
        return res.status(404).json({ msg: 'no post found with this id' });
    }
});

//@routes POST api/post/
//@desc create post 
//@access private 
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { errors, isvalid } = validatePostinput(req.body);
    console.log(errors);
    if (!isvalid) {
        return res.status(400).json(errors);
    }

    const newpost = new post({
        user: req.user.id,
        text: req.body.text,
        name: req.user.name,
        avatar: req.user.avatar
    });

    try {
        const savedPost = await newpost.save();
        return res.json(savedPost);
    } catch (err) {
        return res.status(404).json(err);
    }
});

//@routes DELETE api/post/:id
//@desc delete post by id 
//@access private
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const profile = await profilemodel.findOne({ user: req.user.id });
        const foundPost = await post.findById(req.params.id);
        if (foundPost.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'not authorized to delete this post' });
        }
        await foundPost.deleteOne();
        return res.json({ msg: 'post removed' });
    } catch (err) {
        return res.status(404).json({ msg: 'something went wrong' });
    }
});

//@routes POST api/post/like/:id
//@desc Like the post
//@access private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const profile = await profilemodel.findOne({ user: req.user.id });
        const foundPost = await post.findById(req.params.id);

        if (foundPost.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ alreadyliked: "You have already liked this post " });
        }

        foundPost.likes.unshift({ user: req.user.id });
        const updatedPost = await foundPost.save();
        return res.json(updatedPost);
    } catch (err) {
        return res.status(404).json({ msg: 'no post found ' });
    }
});

//@routes POST api/post/dislike/:id
//@desc dislike the post
//@access private
router.post('/dislike/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const profile = await profilemodel.findOne({ user: req.user.id });
        const foundPost = await post.findById(req.params.id);

        if (foundPost.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ notliked: "You have not liked this post " });
        }

        const removeindex = foundPost.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

        foundPost.likes.splice(removeindex, 1);
        const updatedPost = await foundPost.save();
        return res.json(updatedPost);
    } catch (err) {
        return res.status(404).json({ msg: 'no post found ' });
    }
});

//@routes POST api/post/comment/:id
//@desc create comment
//@access private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { errors, isvalid } = validatePostinput(req.body);
    console.log(errors);
    if (!isvalid) {
        return res.status(400).json(errors);
    }

    try {
        const foundPost = await post.findById(req.params.id);
        const newComment = {
            text: req.body.text,
            name: req.user.name,
            avatar: req.user.avatar,
            user: req.user.id
        };
        foundPost.comments.unshift(newComment);
        const updatedPost = await foundPost.save();
        return res.json(updatedPost);
    } catch (err) {
        return res.status(404).json({ msg: 'no post found ' });
    }
});

//@routes DELETE api/post/comment/:id/:comment_id
//@desc delete comment
//@access private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const foundPost = await post.findById(req.params.id);
        if (foundPost.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
            return res.status(404).json({ msg: 'comment not found ' });
        }

        const removeIndex = foundPost.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);

        foundPost.comments.splice(removeIndex, 1);
        const updatedPost = await foundPost.save();
        return res.json(updatedPost);
    } catch (err) {
        return res.status(404).json({ msg: 'no post found ' });
    }
});

module.exports = router;
