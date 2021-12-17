const Sauce = require('../models/sauces');
const fs = require('fs');


exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error: error })
    );
};

// Suppression de l'ancienne image lors d'un 'update'

exports.modifySauce = (req, res, next) => {

  if (req.file) {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          console.log('Ancienne image supprimée')
        })
      })
      .catch(error => res.status(400).json({ error }));
  }
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1]; // couper au niveau de image , avant position O , après position 1
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
          .catch((error) => res.status(400).json({ error: error }));
      });
    })
    .catch(error => res.status(400).json({ error }));
};

exports.likeDislikeSauce = (req, res, next) => {
  const like = req.body.like;
  const userId = req.body.userId;
  const sauceId = req.params.id;
  if (!userId) {
    res.status(401).json({ error: "Utilisateur requis !" });
    return;
  }

  Sauce.findOne({ _id: sauceId })
    .then((sauce) => {
      if (like === 1) {
        if (sauce.usersLiked.includes(userId) || sauce.usersDisliked.includes(userId)) { // est-ce que ds mon tab ya la valeur suivant ici userID
          res.status(401).json({ error: "L'utilisateur a déjà liké ou disliké" });
        } else {
          Sauce.updateOne({ _id: sauceId }, { $push: { usersLiked: userId }, $inc: { likes: +1 } })
            .then(() => res.status(200).json({ message: "J'aime" }))
            .catch((error) => res.status(400).json({ error: error.message }));
        }
      } else if (like === 0) {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: userId }, $inc: { likes: -1 } })
            .then(() => res.status(200).json({ message: "Neutre" }))
            .catch((error) => res.status(400).json({ error: error.message }));
        } else if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne({ _id: sauceId }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } })
            .then(() => res.status(200).json({ message: "Neutre" }))
            .catch((error) => res.status(400).json({ error: error.message }));
        } else {
          res.status(401).json({ error: "Utilisateur n'a pas liké ou disliké" });
        }
      } else if (like === -1) {
        if (sauce.usersLiked.includes(userId) || sauce.usersDisliked.includes(userId)) {
          res.status(401).json({ error: "L'utilisateur a déjà liké ou disliké" });
        } else {
          Sauce.updateOne({ _id: sauceId }, { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } })
            .then(() => {
              res.status(200).json({ message: "Je n'aime pas" });
            })
            .catch((error) => res.status(400).json({ error: error.message }));
        }
      } else {
        res.status(400).json({ error: "Like ne peut que être égale à -1, 0 ou 1" });
      }
    })
    .catch((error) => res.status(404).json({ error: error.message }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error: error }));
};