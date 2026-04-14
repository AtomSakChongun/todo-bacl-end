require('dotenv').config();
const db = require('../db');

const taskController = {

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

    getUserId(req) {
        if (!req.user || !req.user.id) {
            throw new Error("Unauthorized");
        }
        return req.user.id;
    },

    async getAllTaskByUserId(req, res) {
        try {
            const userId = this.getUserId(req);

            const [rows] = await db.query(
                `SELECT 
                    t.id,
                    t.title,
                    t.description,
                    mts.description_th,
                    mts.description_en,
                    t.created_at,
                    u.first_name,
                    u.last_name
                FROM task t
                LEFT JOIN user u ON u.id = t.user_id 
                LEFT JOIN master_task_status mts ON mts.id = t.status_id 
                WHERE t.user_id = ? AND t.is_active = 1`,
                [userId]
            );

            return this.success(res, rows);

        } catch (err) {
            console.error(err);
            return this.error(
                res,
                err.message === "Unauthorized" ? err.message : undefined,
                err.message === "Unauthorized" ? 401 : 500
            );
        }
    },

    async getTaskByTaskId(req, res) {
        try {
            const userId = this.getUserId(req);
            const { id: taskId } = req.params;

            const [rows] = await db.query(
                `SELECT 
                    t.id,
                    t.title,
                    t.description,
                    mts.description_th,
                    mts.description_en,
                    t.created_at,
                    u.first_name,
                    u.last_name
                FROM task t
                LEFT JOIN user u ON u.id = t.user_id 
                LEFT JOIN master_task_status mts ON mts.id = t.status_id 
                WHERE t.user_id = ? AND t.is_active = 1 AND t.id = ?`,
                [userId, taskId]
            );

            return this.success(res, rows);

        } catch (err) {
            console.error(err);
            return this.error(
                res,
                err.message === "Unauthorized" ? err.message : undefined,
                err.message === "Unauthorized" ? 401 : 500
            );
        }
    },

    async createTaskByUser(req, res) {
        try {
            const userId = this.getUserId(req);

            const {
                title,
                description = null,
                status_id = 1
            } = req.body;

            if (!title || title.trim() === "") {
                return this.error(res, "title จำเป็น", 400);
            }

            const [result] = await db.query(
                `INSERT INTO task
                (user_id, title, description, status_id, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [userId, title.trim(), description, status_id]
            );

            return this.success(
                res,
                { taskId: result.insertId },
                "Create task success",
                201
            );

        } catch (err) {
            console.error(err);
            return this.error(
                res,
                err.message === "Unauthorized" ? err.message : undefined,
                err.message === "Unauthorized" ? 401 : 500
            );
        }
    },

    async updateTaskByUser(req, res) {
        try {
            const userId = this.getUserId(req);
            const { id: taskId } = req.params;

            const {
                title,
                description,
                status_id
            } = req.body;

            // 🔥 check task ว่ามีจริง และเป็นของ user นี้
            const [existing] = await db.query(
                `SELECT id FROM task WHERE id = ? AND user_id = ? AND is_active = 1`,
                [taskId, userId]
            );

            if (existing.length === 0) {
                return this.error(res, "Task not found", 404);
            }

            const fields = [];
            const values = [];

            if (title !== undefined) {
                if (title.trim() === "") {
                    return this.error(res, "title ห้ามว่าง", 400);
                }
                fields.push("title = ?");
                values.push(title.trim());
            }

            if (description !== undefined) {
                fields.push("description = ?");
                values.push(description);
            }

            if (status_id !== undefined) {
                fields.push("status_id = ?");
                values.push(status_id);
            }

            if (fields.length === 0) {
                return this.error(res, "ไม่มีข้อมูลให้อัปเดต", 400);
            }

            // 🔥 update
            await db.query(
                `UPDATE task 
             SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?`,
                [...values, taskId, userId]
            );

            return this.success(res, null, "Update task success");

        } catch (err) {
            console.error(err);
            return this.error(
                res,
                err.message === "Unauthorized" ? err.message : undefined,
                err.message === "Unauthorized" ? 401 : 500
            );
        }
    }

};

module.exports = {
    getAllTaskByUserId: taskController.getAllTaskByUserId.bind(taskController),
    createTaskByUser: taskController.createTaskByUser.bind(taskController),
    getTaskByTaskId: taskController.getTaskByTaskId.bind(taskController),
    updateTaskByUser: taskController.updateTaskByUser.bind(taskController)
};
