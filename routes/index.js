
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'CS294-84 HW3: Archery' });
};
