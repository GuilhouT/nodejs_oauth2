
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.show = function (req, res) {
  res.render('user', { user: req.user });
};
