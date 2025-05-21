
const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//load models 
const Profile = require('../../models/profilemodel');
const User = require('../../models/usermodel');

//load Validation files fro validation folder 
const validateprofileinput = require('../../validator/profilevalidator');
const validateExperinceinput = require('../../validator/experincevalidation');
const validateEducationinput = require('../../validator/educationvalidation');


//@routes GET api/users/test
//@desc test profile  routes
//@access public
router.get('/test', (req, res) => {
    res.json({ msg: 'profile  ' });
})


//@routes GET api/profiel
//@desc Create User profile 
//@access Private 
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (!profile) {
                errors.noprofile = "No Profile Found ";
                return res.status(404).json(errors);
            }
            else {
                return res.json(profile);
            }
        }).catch(err => {
            console.log(err); return res.status(500).json({ message: 'Internal Server Error' });
        });
});

//@routes POST api/profiel/handle/:handle
//@desc Get Profile by Handle 
//@access Public 

router.get('/all', (req, res) => {
    const errors = {};
    Profile.find({})
        .populate('user', ['name', 'avatar'])
        .then((profiles) => {
            if (!profiles) {
                errors.noprofile = "No Profile Found ";
                return res.status(404).json(errors);
            }
            return res.json(profiles);
        }).catch(err => {
            console.log(err); return res.status(500).json({
                message: 'Internal Server Error'
            });

        })

})



//@routes POST api/profiel/handle/:handle
//@desc Get Profile by Handle 
//@access Public 


router.get('/handle/:handle', (req, res) => {
    const errors = {};

    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then((profile) => {
            if (!profile) {
                errors.noprofile = "No Profile Found ";
                return res.status(404).json(errors);
            }
            else {
                return res.status(200).json(profile)
            }
        })
        .catch((err) => {
            errors.noprofile = "there is no profile found ";
            return res.status(404).json(errors);
        })
})

//@routes POST api/profiel/user/:user_id
//@desc Get Profile by Id 
//@access Public 


router.get('/user/:user_id', (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then((profile) => {
            if (!profile) {
                errors.noprofile = "No Profile Found ";
                return res.status(404).json(errors);
            }
            else {
                return res.status(200).json(profile)
            }
        })
        .catch((err) => {
            errors.noprofile = "there is no profile found ";
            return res.status(404).json(errors);
        })
})


//@routes POST api/profiel
//@desc Create or Edit  User profile 
//@access Private 
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    // object destructuring 
    const { errors, isvalid } = validateprofileinput(req.body);

    //check validation for the profile routes s
    if (!isvalid) {
        //return with error code 
        return res.status(400).json(errors);
    }

    //get fields
    const profielfields = {};
    profielfields.user = req.user.id;
    //check field are empty or undefind 
    if (req.body.handle) profielfields.handle = req.body.handle;
    if (req.body.company) profielfields.company = req.body.company;
    if (req.body.location) profielfields.location = req.body.location;
    if (req.body.website) profielfields.website = req.body.website;
    if (req.body.bio) profielfields.bio = req.body.bio;
    if (req.body.status) profielfields.status = req.body.status;
    if (req.body.githubusername)
        profielfields.githubusername = req.body.githubusername;
    if (req.body.skills != "undefined") {
        profielfields.skills = req.body.skills.split(',');
    }
    //social
    profielfields.social = {};
    if (req.body.youtube) profielfields.social.youtube = req.body.youtube;
    if (req.body.instagram) profielfields.social.instagram = req.body.instagram;
    if (req.body.facebook) profielfields.social.facebook = req.body.facebook;
    if (req.body.linkdin) profielfields.social.linkdin = req.body.linkdin;
    if (req.body.twitter) profielfields.social.twitter = req.body.twitter;

    // if block remove if you use blackbox code 
    // remove from check field are empty
    //black box code 
    // Define the fields to update in profielfields
    // const fields = ['handle', 'company', 'location', 'website', 'bio', 'status', 'githubusername'];
    // fields.forEach(field => {
    //     if (req.body[field]) profielfields[field] = req.body[field];
    // });

    // // Define the social media fields to update in profielfields.social
    // const socialFields = ['youtube', 'instagram', 'facebook', 'linkdin', 'twitter'];
    // profielfields.social = {};
    // socialFields.forEach(field => {
    //     if (req.body[field]) profielfields.social[field] = req.body[field];
    // });
    // if (req.body.skills != "undefined") {
    //     profielfields.skills = req.body.skills.split(',');
    // }

    Profile.findOne({ user: req.user.id })
        .then((profile) => {
            if (profile) {
                // updata
                Profile.findOneAndUpdate(
                    { user: req.user.id },//where clasuse 
                    { $set: profielfields },//set the updated value 
                    { new: true }//return update profile insted of orignal one 
                ).then((profile) => {
                    return res.json(profile);
                })
                    .catch((err) => {
                        errors.SystemError = 'Error updating profile';
                        return res.status(500).json(errors);
                    });

            }
            else {
                //create
                //check if handle exist 
                Profile.findOne({ handle: profielfields.handle })
                    .then((profile) => {
                        if (profile) {
                            errors.handle = 'That Handle already exists';
                            return res.status(400).json(errors);
                        }
                        //save new profile
                        new Profile(profielfields).save()
                            .then((profile) => {
                                return res.json(profile);
                            })
                            .catch((err) => {
                                console.error(err);
                                return res.status(500).json({ msg: 'Error creating profile' });
                            });
                    })
                    .catch((err) => {
                        console.error(err);
                        return res.status(500).json({ msg: 'Error checking handle' });
                    });
            }
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ msg: 'Error finding profile' });
        });


});

//@routes POST api/profiel/Exprience
//@desc Create experince profile 
//@access Private 

router.post('/exprience', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isvalid } = validateExperinceinput(req.body);

    if (!isvalid) {
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
        .then((profile) => {
            const newExprience = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
            //add to Exprience array of Logged in user 
            profile.experience.unshift(newExprience);

            profile.save()
                .then((profile) => {
                    return res.json(profile);
                })
                .catch(err => {
                    console.error(err);
                    return res.status(500).json({ msg: 'Error adding experience' });
                });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ msg: 'Error finding profile' });
        });
})


//@routes POST api/profiel/education
//@desc Create Education profile 
//@access Private 

router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isvalid } = validateEducationinput(req.body);

    if (!isvalid) {
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
        .then((profile) => {
            const neweducation = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstydy: req.body.fieldofstydy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
            console.log(req.body.fieldofstydy);
            //add to education array of Logged in user 
            profile.education.unshift(neweducation);

            profile.save()
                .then((profile) => {
                    return res.json(profile);
                })
                .catch(err => {
                    console.error(err);
                    return res.status(500).json({ msg: 'Error: save adding Education' });
                });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ msg: 'Error adding Education' });
        });
})


//@routes POST api/profiel/exprience/:exp_id
//@desc delete Education specified id 
//@access Private 

router.delete('/exprience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
        .then((profile) => {
            //get Remove index
            const removeindex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

            //splice out of Array 
            profile.experience.splice(removeindex, 1);

            //save profile
            profile.save()
                .then(profile => {
                    return res.status(200).json(profile);
                })
                .catch((err) => {
                    console.error(err);
                    return res.status(500).json({ msg: 'Error Deleteing Exprience' });
                });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ msg: 'Error Deleteing Exprience' });
        });
})

//@routes POST api/profiel/education/:edu_id
//@desc delete Education specified id 
//@access Private 

router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
        .then((profile) => {
            //get Remove index
            const removeindex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

            //splice out of Array 
            profile.education.splice(removeindex, 1);

            //save profile

            profile.save()
                .then(profile => {
                    return res.status(200).json(profile);
                })
                .catch((err) => {
                    console.error(err);
                    return res.status(500).json({ msg: 'Error Deleteing Education' });
                });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ msg: 'Error Deleteing Education' });
        });
})


//@routes POST api/profiel
//@desc delete Profile and user account 
//@access Private 

router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOneAndDelete({ user: req.user.id })
        .then((profile) => {
            User.findOneAndDelete({ _id: req.user.id })
                .then(() => {
                    return res.status(200).json({ msg: 'Profile and User Account Deleted' });
                })
                .catch((err) => {
                    console.error(err);
                    return res.status(400).json(err);

                })
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ msg: 'Error Deleteing profile' });
        });
});

module.exports = router;
