const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csrf');
const dotenv = require('dotenv');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const cors = require('cors');

dotenv.config();

const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'secret';

const users = []; // Cambiado para almacenar contraseñas hasheadas
const sessions = {};
const secureCookieOption = () => ({
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
});

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));

app.get('/', (req, res) => {
    res.send('Hello World1');
});

app.get('/csrf-token', (req, res) => {
    const csrfToken = new csrf().create(SECRET_KEY);
    res.json({ csrfToken });
});

app.post('/login', async (req, res) => {
    const { username, password, csrfToken } = req.body;

    if (!csrf().verify(SECRET_KEY, csrfToken)) {
        return res.status(403).json({ error: 'Invalid CSRF token.' });
    }

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    }

    const user = users.find(async user => await bcrypt.compare(username, user.username));
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const sessionId = crypto.randomBytes(16).toString('base64url');
    sessions[sessionId] = { username };
    res.cookie('sessionId', sessionId, secureCookieOption());
    res.status(200).json({ message: 'Login exitoso.' });
});

app.post('/register', async (req, res) => {
    const { username, password, csrfToken } = req.body;

    if (!csrf().verify(SECRET_KEY, csrfToken)) {
        return res.status(403).json({ error: 'Invalid CSRF token.' });
    }

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    }

    const regexpUsuario = /^[a-zA-Z][0-9a-zA-Z]{5,49}$/;
    if (!regexpUsuario.test(username)) {
        return res.status(400).json({
            error: 'El usuario debe comenzar con letra y tener entre 6-50 caracteres alfanuméricos.'
        });
    }

    const validarPassword = (password) => {
        return (
            password.length >= 10 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9\s]/.test(password)
        );
    };

    if (!validarPassword(password)) {
        return res.status(400).json({
            error: 'La contraseña debe tener al menos 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial.'
        });
    }

    const userExists = users.find(async user => await bcrypt.compare(username, user.username));
    if (userExists) {
        return res.status(409).json({ error: 'El usuario ya existe.' });
    }

    // Hashear el nombre de usuario y la contraseña
    const hashedUsername = await bcrypt.hash(username, 10);
    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({ username: hashedUsername, password: hashedPassword });
    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
});

app.listen(port, () => {
    console.log(`server listening at http://localhost:${port}`);
});



