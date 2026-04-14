require('dotenv').config();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.getUsers = async (req, res) => { 
    try { 
        const [rows] = await db.query('SELECT * FROM user'); 
        res.status(200).json({ success: true, data: rows }); 
    } catch (err) 
    { 
        console.log(err)
        res.status(500).json({ success: false, message: 'Internal Server Error' }); 
    } 
};

exports.getUsersById = async (req, res) => { 
    try { 
        const { id } = req.params;

        const [rows] = await db.query(
            'SELECT * FROM user WHERE id = ?',
            [id]
        ); 

        res.status(200).json({ 
            success: true, 
            data: rows 
        }); 

    } catch (err) { 
        console.log(err);

        res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error' 
        }); 
    } 
};

exports.register = async (req, res) => {
    try {
        const { username, password, email, first_name, last_name } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password required'
            });
        }

        const [existing] = await db.query(
            'SELECT id FROM user WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await db.query(
            `INSERT INTO user 
            (username, password, email, first_name, last_name, is_active) 
            VALUES (?, ?, ?, ?, ?, 1)`,
            [username, hashedPassword, email, first_name, last_name]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [rows] = await db.query(
            "SELECT * FROM user WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = rows[0];


        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                first_name : user.first_name,
                last_name : user.last_name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1h"
            }
        );

        res.status(200).json({
            success: true,
            token: token,
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};
