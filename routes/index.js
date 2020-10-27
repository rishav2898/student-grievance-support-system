var express = require('express');
var multer = require('multer');
var path = require('path');
var router = express.Router();
var userModule = require('../modules/user');
var deptModule = require('../modules/department');
var CreateTicketModule = require('../modules/create_ticket');
var responseModule = require('../modules/response');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var getAllTicket = CreateTicketModule.find({});

function checkLoginUser(req, res, next) {
	var userToken = localStorage.getItem('userToken');	
	try {
		if(req.session.username) {
			var decoded = jwt.verify(userToken, 'loginToken');
		} else {
			res.render('index', { title: 'Student Grievance Support System', msg:'' });
		}
	}
	catch (err) {
		res.render('index', { title: 'Student Grievance Support System', msg:'' });
	}
	next();
}

router.use(express.static(__dirname+"./public/"));

var Storage = multer.diskStorage ({
	destination: "./public/uploads/",
	filename: (req, file, cb) => {
		cb(null, file.fieldname+"_"+Date.now()+path.extname(file.originalname));
	}
});

var upload = multer ({
	storage: Storage
}).single('file');

/* GET home page. */


if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}


function checkEmail(req, res, next) {
	var email = req.body.email;
	var checkExistEmail = userModule.findOne({email:email});
	checkExistEmail.exec((err, data) => {
		if(err) throw err;
		if(data) {
			return res.render('signup', { title: 'Student Grievance Support System', msg:'Email Already exist' });
		}
		next();
	});
}

function checkDeptEmail(req, res, next) {
	var email = req.body.email;
	var checkExistEmail = deptModule.findOne({email:email});
	checkExistEmail.exec((err, data) => {
		if(err) throw err;
		if(data) {
			return res.render('signup', { title: 'Student Grievance Support System', msg:'Email Already exist' });
		}
		next();
	});
}

function checkDeptUserName(req, res, next) {
	var email = req.body.email;
	var checkExistEmail = deptModule.findOne({email:email});
	checkExistEmail.exec((err, data) => {
		if(err) throw err;
		if(data) {
			return res.render('signup', { title: 'Student Grievance Support System', msg:'User Name Already exist' });
		}
		next();
	});
}

function checkUserName(req, res, next) {
	var username = req.body.uname;
	var checkUserName = userModule.findOne({username:username});
	checkUserName.exec((err, data) => {
		if(err) throw err;
		if(data) {
			return res.render('signup', { title: 'Student Grievance Support System', msg:'user name Already exist' });
		}
		next();
	});
}

function checkRegistraionId(req, res, next) {
	var reg_id = req.body.reg_id;
	userModule.findOne({registration_id:reg_id}).exec((err, data) => {
		if(err) throw err;
		if(data) {
			return res.render('signup', { title: 'Student Grievance Support System', msg:'Registration id Already exist' });
		}
		next();
	});	
}

router.get('/dashboard', checkLoginUser, function(req, res, next) {
  	var loginUser = req.session.username;
  	res.render('dashboard', { title: 'Student Grievance Support System', msg:'', loginUser:loginUser });
});


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Student Grievance Support System', msg:'' });
});

router.post('/', function(req, res, next) {
	var username = req.body.uname;
	var password = req.body.password;
	// console.log(password);
	var checkUser = userModule.findOne({username:username});
	checkUser.exec((err, data) => {
		if(err) {
			console.log(err);
			throw err;
		}
		var getUserID = data._id;
		var getPassword = data.password;
		if(bcrypt.compareSync(password, getPassword))
		{
			var token = jwt.sign({userID: getUserID}, 'loginToken');
			localStorage.setItem('userToken', token);
			localStorage.setItem('loginUser', username);
			req.session.username = username;

			res.redirect('/dashboard');
		}
		else {
			res.render('index', { title: 'Student Grievance Support System', msg:'Invalid username and password' });
		}
	});

});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Student Grievance Support System', msg:'' });
});

router.post('/signup', checkEmail, checkUserName, checkRegistraionId, function(req, res, next) {
	var registration_id = req.body.reg_id;
	var username = req.body.uname;
	var email = req.body.email;
	var password = req.body.password;
	var confirmpassword = req.body.confpassword;
	console.log(registration_id);
	if(password != confirmpassword) {
		res.render('signup', { title: 'Student Grievance Support System', msg:'password not matched!' });
	}
	else {
		password = bcrypt.hashSync(password, 10);
		var userDetails = new userModule({
			registration_id: registration_id,
			username: username,
			email: email,
			password: password
		});

		userDetails.save((err, doc) => {
			if(err) throw err;
			console.log(err);
			res.render('signup', { title: 'Student Grievance Support System', msg:'user registred successfully' });
		})
	}
});

router.get('/create-ticket', checkLoginUser, function(req, res, next) {
	var loginUser = req.session.username;
	res.render('create_ticket', { title: 'Student Grievance Support System', msg:'', loginUser:loginUser });
});

router.post('/create-ticket', checkLoginUser, upload, function(req, res, next) {
	var loginUser = req.session.username;

	var TicketSubject = req.body.subject;
	var Periority = req.body.periority;
	var TicketCategory = req.body.ticketCategory;
	var TicketDetail = req.body.ticket_details;
	var User = loginUser;

	var Ticket = new CreateTicketModule ({
		User: User,
		TicketSubject: TicketSubject,
		Periority: Periority,
		TicketCategory: TicketCategory,
		TicketBody: TicketDetail
	});

	Ticket.save((err, data) => {
		if(err) throw err;
		res.render('create_ticket', { title: 'Student Grievance Support System', msg:'ticket created uccessfully', loginUser:loginUser });
	});
});

router.get('/view-ticket', checkLoginUser, function(req, res, next) {
	var loginUser = req.session.username;
	getAllTicket.exec(function(err, data) {
		if(err) throw err;
		res.render('view_ticket', { title: 'Student Grievance Support System', msg:'', loginUser:loginUser, records:data });
	});

});

router.get('/view-ticket-details/:id', checkLoginUser, function(req, res, next) {
	var loginUser = req.session.username;
	var ticket_id = req.params.id;
	getAllTicket.exec(function(err, data) {
		if(err) throw err;
		res.render('view_ticket_details', { title: 'Student Grievance Support System', msg:'', loginUser:loginUser, records:data, ticket_id:ticket_id});
	});

});

router.get('/view-ticket/edit/:id', checkLoginUser, function(req, res, next) {
	var loginUser = req.session.username;
	var ticket_id = req.params.id;
	// console.log(ticket_id);
	var ticket = CreateTicketModule.findById(ticket_id);
	ticket.exec(function(err, data) {
		if(err) throw err;
		res.render('edit_ticket', { title: 'Student Grievance Support System', msg:'', record:data, loginUser:loginUser, id:ticket_id});
	});
	
});


router.post('/view-ticket/edit/', checkLoginUser, function(req, res, next) {
	var loginUser = req.session.username;
	var id = req.body.id;
	var TicketSubject = req.body.subject;
	var Periority = req.body.periority;
	var TicketCategory = req.body.ticketCategory;
	var TicketDetail = req.body.ticket_details;
	var User = loginUser;

	CreateTicketModule.findByIdAndUpdate(id, {
		User: User,
		TicketSubject: TicketSubject,
		Periority: Periority,
		TicketCategory: TicketCategory,
		TicketBody: TicketDetail
	}).exec(function(err, data) {
			if(err) throw err;
			res.redirect('/view-ticket');
		});

});

router.get('/view-ticket/delete/:id', checkLoginUser, function(req, res, next) {
	var loginUser = req.session.username;
	var id = req.params.id;
	var ticketDel = CreateTicketModule.findByIdAndDelete(id);
	ticketDel.exec(function(err, data) {
		if(err) throw err;
		res.redirect('/view-ticket');
	});
});

router.get('/admin/signup/', function(req, res, next) {
	res.render('admin/signup', {title:'Student Grievance Support System', msg:'', loginUser:''});
});


router.post('/admin/signup', checkDeptEmail, checkDeptUserName, function(req, res, next) {
	var username = req.body.uname;
	var email = req.body.email;
	var department = req.body.department;
	var password = req.body.password;
	var confirmpassword = req.body.confpassword;
	if(password != confirmpassword) {
		res.render('signup', { title: 'Student Grievance Support System', msg:'password not matched!' });
	}
	else {
		password = bcrypt.hashSync(password, 10);
		var deptDetails = new deptModule({
			username: username,
			email: email,
			department: department,
			password: password
		});

		deptDetails.save((err, doc) => {
			if(err) throw err;
			console.log(err);
			res.render('signup', { title: 'Student Grievance Support System', msg:'user registred successfully' });
		})
	}
});

router.get('/finance_dept/view-all-ticket/', function(req, res, next) {
	getAllTicket.exec(function(err, data) {
		if(err) throw err;
		res.render('admin/view_tickets', { title: 'Student Grievance Support System', msg:'', records:data, loginUser:''});
	});
});


router.get('/finance_dept/view-ticket-details/:id', function(req, res, next) {
	var ticket_id = req.params.id;
	console.log(ticket_id);
	getAllTicket.exec(function(err, data) {
		if(err) throw err;
		res.render('admin/view_ticket_details', { title: 'Student Grievance Support System', msg:'', loginUser:'', records:data, ticket_id:ticket_id});
	});
});

router.get('/view-ticket-details/response/:id', function(req, res, next) {
	var ticket_id = req.params.id;
	console.log(ticket_id);
	res.render('admin/response',{ title: 'Student Grievance Support System', msg:'', loginUser:'', id:ticket_id});
});

router.post('/view-ticket-details/response/:id', function(req, res, next) {
	var userId = req.params.id;
	var ticket_id = userId;
	var message = req.body.response_details;

	CreateTicketModule.findById(userId, function(err, data){
		if(err) {
			console.log("Error: ", err);
		} else {
			console.log("Data: ", data);
			var messageDetail = new responseModule({
			userId: userId,
			TicketCategory: data.TicketCategory,
			response: message
			});

			messageDetail.save((err, doc) => {
				if(err) throw err;
				res.render('admin/response',{ title: 'Student Grievance Support System', msg:'response sent', loginUser:'', id:ticket_id});
			});
		}
	});
});

router.get('/logout', function(req, res, next) {
	req.session.destroy(function(err) {
		if(err) {
			res.redirect('/');
		}
	});
	res.redirect('/');
});

module.exports = router;
