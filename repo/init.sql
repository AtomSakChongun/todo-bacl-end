-- =============================================
-- Database Init Script
-- =============================================

-- Table: user
CREATE TABLE IF NOT EXISTS `user` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `username`   VARCHAR(100) NOT NULL UNIQUE,
    `password`   VARCHAR(255) NOT NULL,
    `email`      VARCHAR(150) DEFAULT NULL,
    `first_name` VARCHAR(100) DEFAULT NULL,
    `last_name`  VARCHAR(100) DEFAULT NULL,
    `is_active`  TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: master_task_status
CREATE TABLE IF NOT EXISTS `master_task_status` (
    `id`             INT AUTO_INCREMENT PRIMARY KEY,
    `description_th` VARCHAR(100) DEFAULT NULL,
    `description_en` VARCHAR(100) DEFAULT NULL
);

-- Seed: master_task_status
INSERT INTO `master_task_status` (`id`, `description_th`, `description_en`) VALUES
(1, 'รอดำเนินการ', 'Pending'),
(2, 'กำลังดำเนินการ', 'In Progress'),
(3, 'เสร็จสิ้น', 'Done');

-- Table: task
CREATE TABLE IF NOT EXISTS `task` (
    `id`          INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`     INT NOT NULL,
    `title`       VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `status_id`   INT NOT NULL DEFAULT 1,
    `is_active`   TINYINT(1) NOT NULL DEFAULT 1,
    `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`)   REFERENCES `user`(`id`),
    FOREIGN KEY (`status_id`) REFERENCES `master_task_status`(`id`)
);
