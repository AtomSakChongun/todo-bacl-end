require('dotenv').config();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userController = {

    success(res, data, message = "success", status = 200) {
        return res.status(status).json({
            success: true,
            message,
            data
        });
    },


    error(res, message = "Internal Server Error", status = 500) {
        return res.status(status).json({
            success: false,
            message
        });
    },

    async getUsers(req, res) {
        try {
            const [rows] = await db.query('SELECT * FROM user');
            return this.success(res, rows);
        } catch (err) {
            console.error(err);
            return this.error(res);
        }
    },

    async getUsersById(req, res) {
        try {
            const { id } = req.params;

            const [rows] = await db.query(
                'SELECT * FROM user WHERE id = ?',
                [id]
            );

            return this.success(res, rows);

        } catch (err) {
            console.error(err);
            return this.error(res);
        }
    },

    async register(req, res) {
        try {
            const {
                username,
                password,
                email = null,
                first_name = null,
                last_name = null
            } = req.body;

            if (!username || !password) {
                return this.error(res, 'Username and password required', 400);
            }

            const [existing] = await db.query(
                'SELECT id FROM user WHERE username = ?',
                [username]
            );

            if (existing.length > 0) {
                return this.error(res, 'Username already exists', 400);
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await db.query(
                `INSERT INTO user 
                (username, password, email, first_name, last_name, is_active) 
                VALUES (?, ?, ?, ?, ?, 1)`,
                [username, hashedPassword, email, first_name, last_name]
            );

            return this.success(res, null, 'User registered successfully', 201);

        } catch (err) {
            console.error(err);
            return this.error(res);
        }
    },

    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return this.error(res, 'Username and password required', 400);
            }

            const [rows] = await db.query(
                "SELECT * FROM user WHERE username = ?",
                [username]
            );

            if (rows.length === 0) {
                return this.error(res, 'Invalid username or password', 401);
            }

            const user = rows[0];

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return this.error(res, 'Invalid username or password', 401);
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || "1h"
                }
            );

            return this.success(res, { token }, "Login success");

        } catch (err) {
            console.error(err);
            return this.error(res);
        }
    }
};

module.exports = {
    getUsers: userController.getUsers.bind(userController),
    getUsersById: userController.getUsersById.bind(userController),
    register: userController.register.bind(userController),
    login: userController.login.bind(userController),
};
