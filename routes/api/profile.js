const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//load models 
const Profile = require('../../models/profilemodel');
const User = require('../../models/usermodel');

//load Validation files
const validateprofileinput = require('../../validator/profilevalidator');
const validateExperinceinput = require('../../validator/experincevalidation');
const validateEducationinput = require('../../validator/educationvalidation');

router.get('/test', (req, res) => {
    res.json({ msg: 'profile  ' });
});

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const errors = {};
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            errors.noprofile = "No Profile Found ";
            return res.status(404).json(errors);
        }
        return res.json(profile);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/all', async (req, res) => {
    const errors = {};
    try {
        const profiles = await Profile.find({}).populate('user', ['name', 'avatar']);
        if (!profiles) {
            errors.noprofile = "No Profile Found ";
            return res.status(404).json(errors);
        }
        return res.json(profiles);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/handle/:handle', async (req, res) => {
    const errors = {};
    try {
        const profile = await Profile.findOne({ handle: req.params.handle }).populate('user', ['name', 'avatar']);
        if (!profile) {
            errors.noprofile = "No Profile Found ";
            return res.status(404).json(errors);
        }
        return res.status(200).json(profile);
    } catch (err) {
        errors.noprofile = "there is no profile found ";
        return res.status(404).json(errors);
    }
});

router.get('/user/:user_id', async (req, res) => {
    const errors = {};
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            errors.noprofile = "No Profile Found ";
            return res.status(404).json(errors);
        }
        return res.status(200).json(profile);
    } catch (err) {
        errors.noprofile = "there is no profile found ";
        return res.status(404).json(errors);
    }
});

router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { errors, isvalid } = validateprofileinput(req.body);
    if (!isvalid) {
        return res.status(400).json(errors);
    }

    const profielfields = {};
    profielfields.user = req.user.id;
    if (req.body.handle) profielfields.handle = req.body.handle;
    if (req.body.company) profielfields.company = req.body.company;
    if (req.body.location) profielfields.location = req.body.location;
    if (req.body.website) profielfields.website = req.body.website;
    if (req.body.bio) profielfields.bio = req.body.bio;
    if (req.body.status) profielfields.status = req.body.status;
    if (req.body.githubusername) profielfields.githubusername = req.body.githubusername;
    if (req.body.skills != "undefined") {
        profielfields.skills = req.body.skills.split(',');
    }

    profielfields.social = {};
    if (req.body.youtube) profielfields.social.youtube = req.body.youtube;
    if (req.body.instagram) profielfields.social.instagram = req.body.instagram;
    if (req.body.facebook) profielfields.social.facebook = req.body.facebook;
    if (req.body.linkdin) profielfields.social.linkdin = req.body.linkdin;
    if (req.body.twitter) profielfields.social.twitter = req.body.twitter;

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
            const updatedProfile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profielfields },
                { new: true }
            );
            return res.json(updatedProfile);
        } else {
            const existing = await Profile.findOne({ handle: profielfields.handle });
            if (existing) {
                errors.handle = 'That Handle already exists';
                return res.status(400).json(errors);
            }
            const newProfile = await new Profile(profielfields).save();
            return res.json(newProfile);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Error processing profile' });
    }
});

router.post('/exprience', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { errors, isvalid } = validateExperinceinput(req.body);
    if (!isvalid) {
        return res.status(400).json(errors);
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const newExprience = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        };
        profile.experience.unshift(newExprience);
        const saved = await profile.save();
        return res.json(saved);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Error adding experience' });
    }
});

router.post('/education', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { errors, isvalid } = validateEducationinput(req.body);
    if (!isvalid) {
        return res.status(400).json(errors);
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const neweducation = {
            school: req.body.school,
            degree: req.body.degree,
            fieldofstydy: req.body.fieldofstydy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        };
        profile.education.unshift(neweducation);
        const saved = await profile.save();
        return res.json(saved);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Error adding Education' });
    }
});

router.delete('/exprience/:exp_id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeindex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeindex, 1);
        const saved = await profile.save();
        return res.status(200).json(saved);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Error Deleting Experience' });
    }
});

router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeindex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeindex, 1);
        const saved = await profile.save();
        return res.status(200).json(saved);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Error Deleting Education' });
    }
});

router.delete('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        await Profile.findOneAndDelete({ user: req.user.id });
        await User.findOneAndDelete({ _id: req.user.id });
        return res.status(200).json({ msg: 'Profile and User Account Deleted' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Error Deleting profile' });
    }
});

module.exports = router;
