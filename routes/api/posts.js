const express = require("express");
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose')


//load models 
const post = require('../../models/postmodel');
const usermodel = require('../../models/usermodel');

//load validation 
const validatePostinput = require('../../validator/postvalidation');
const profilemodel = require("../../models/profilemodel");

//@routes GET api/post/test
//@desc test post  routes
//@access public
router.get('/test', (req, res) => {
    res.json({ msg: 'posts calling  ' });
})

//@routes GET api/post/
//@desc get post 
//@access public
router.get('/', (req, res) => {
    post.find()
        .sort({ date: -1 })
        .then(posts => { return res.json(posts) })
        .catch(err => {
            return res.status(404).json({ msg: 'no post found' })
        })
})

//@routes GET api/post/:id
//@desc get post by id 
//@access public
router.get('/:id', (req, res) => {
    post.findById(req.params.id)
        .sort({ date: -1 })
        .then(posts => { return res.json(posts) })
        .catch(err => {
            return res.status(404).json({ msg: 'no post found with this id' })
        })
})

//@routes GET api/post/test
//@desc create post 
//@access private 

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    //check if Text is null of not
    const { errors, isvalid } = validatePostinput(req.body);
    console.log(errors);
    //check validatioin 
    if (!isvalid) {
        return res.status(400).json(errors);
    }

    const newpost = new post({
        user: req.user.id,
        text: req.body.text,
        name: req.user.name,
        avatar: req.user.avatar
    });

    newpost.save()
        .then(post => {
            return res.json(post)
        })
        .catch(err => { return res.status(404).json(err) });
})

//@routes delete api/post/:id
//@desc delete post by id 
//@access private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    profilemodel.findOne({ user: req.user.id })
        .then(profile => {
            post.findById(req.params.id)
                .then(post => {
                    //check for post owner 
                    if (post.user.toString() !== req.user.id) {
                        return res.status(401).json({ msg: 'not authorized to delete this post' })
                    }
                    else {
                        post.deleteOne()
                            .then(() => {
                                return res.json({ msg: 'post removed' })
                            })
                            .catch(err => { return res.json({ msg: 'somethin went Wrong ' }) })
                    }
                })
                .catch(err => {
                    return res.status(404).json({ msg: 'no post found with this id' })
                })
        })
        .catch(err => {
            return res.status(404).json({ msg: 'No Profile found with this id' })
        })
})


//@routes POST api/post/like/:id
//@desc Like the post :id is post id 
//@access private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    profilemodel.findOne({ user: req.user.id })
        .then(profile => {
            post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.status(400).json({ alreadyliked: "You have already liked this post " })
                    }

                    //add user id to likes arrays 
                    post.likes.unshift({ user: req.user.id });

                    post.save()
                        .then(post => { return res.json(post) })
                        .catch(err => { return res.json(err) });
                })
                .catch(err => {
                    return res.status(404).json({ msg: 'no post found ' })
                })
        })
        .catch(err => {
            return res.status(404).json({ msg: 'No Profile found with this id' })
        })
})

//@routes POST api/post/dislike/:id
//@desc disLike the post :id is post id 
//@access private
router.post('/dislike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    profilemodel.findOne({ user: req.user.id })
        .then(profile => {
            post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        return res.status(400).json({ notliked: "You have not liked this post " })
                    }

                    //get remove index 
                    const removeindex = post.likes.map(item => req.user.toString()).indexOf(req.user.id);


                    //splice out of array
                    post.likes.splice(removeindex, 1);

                    post.save()
                        .then(post => { return res.json(post) })
                        .catch(err => { return res.json(err) });



                })
                .catch(err => {
                    return res.status(404).json({ msg: 'no post found ' })
                })
        })
        .catch(err => {
            return res.status(404).json({ msg: 'No Profile found with this id' })
        })
})


//@routes POST api/post/comment/:id
//@desc create comment :id is post id 
//@access private


router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    //check if Text is null of not
    const { errors, isvalid } = validatePostinput(req.body);
    console.log(errors);
    //check validatioin 
    if (!isvalid) {
        return res.status(400).json(errors);
    }

    post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.user.name,
                avatar: req.user.avatar,
                user: req.user.id
            }
            // Add to comment Array 
            post.comments.unshift(newComment);
            post.save()
                .then(post => { return res.json(post) })
                .catch(err => { return res.json(err) });
        })
        .catch(err => {
            return res.status(404).json({ msg: 'no post found ' })
        })
})


//@routes delete api/post/comment/:id/:comment_id
//@desc delete comment :id is post id  comment_id 
//@access private


router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    post.findById(req.params.id)
        .then(post => {
            //to check to see if comment exist 
            if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                return res.status(404).json({ msg: 'comment not found ' })
            }
            //get remove index
            const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id)
            //splice remove comment from array
            post.comments.splice(removeIndex, 1);
            post.save()
                .then(post => { return res.json(post) })
                .catch(err => { return res.json(err) });
        })
        .catch(err => {
            return res.status(404).json({ msg: 'no post found ' })
        })


})




module.exports = router;
