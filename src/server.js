const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');

const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body;
		//console.log(req.body);
		const users = getUsers();

		const user = users.find(u => {
			return u.username === username && u.password === password;
		});

		// console.log("user",user);
		if (!user) {
			res.json({ userId: null });
			return;
		}

		delete user.password; // remove password from return object

		const token = await createToken(user);

		res.json({ user: user, token: token });
	} catch (err) {
		console.log('/login err:', err.message);
		res.status(500).json({
			err: 'internal error in server',
		});
	}
});

app.post('/register', async (req, res) => {
	try {
		console.log('register', req.body);
		const { username, password } = req.body;
		const users = getUsers();
		const user = users.find(u => u.username === username);
		if (!user) {
			users.push(req.body);
			await writeFile('./users.json', JSON.stringify(users));

			res.json({
				err: null,
				success: true,
			});
		} else {
			res.json({
				err: 'user exists',
				success: false,
			});
		}
	} catch (err) {
		console.log('register err:', err.message);
		res.status(500).json({
			err: 'internal error',
			success: false,
		});
	}
});

app.get('/private/', async (req, res) => {
	try {
		const { token } = req.query;
		console.log('token', token);
		const decoded = await verifyToken(token);

		console.log('decoded', decoded);

		res.json({ decoded: decoded });
	} catch (err) {
		console.log('err', err.message);
		res.status(500).json({
			err: err.message,
			success: false,
		});
	}
});

app.listen(3005, () => {
	console.log('server run on port 3005');
});

function getUsers() {
	// TODO use DB

	const usersFilePath = path.join(__dirname, './users.json');
	const usersFileContent = fs.readFileSync(usersFilePath, 'utf8');
	const users = JSON.parse(usersFileContent || []);
	return users;
}

// write file promise base
function writeFile(path, data) {
	return new Promise(function (resolve, reject) {
		fs.writeFile(path, data, function (err, data) {
			if (err) {
				return reject(err);
			}
			resolve(data);
		});
	});
}

function createToken(data, key = 'secret') {
	return new Promise((resolve, reject) => {
		jwt.sign(data, key, function (err, token) {
			if (err) return reject(err);
			return resolve(token);
		});
	});
}

function verifyToken(token, key = 'secret') {
	return new Promise((resolve, reject) => {
		// verify a token symmetric
		jwt.verify(token, key, function (err, decoded) {
			if (err) return reject(err);
			return resolve(decoded);
		});
	});
}
