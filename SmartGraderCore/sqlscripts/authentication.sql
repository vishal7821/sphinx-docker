BEGIN;

CREATE DATABASE smartgrader_test_global;

CREATE DATABASE smartgrader_test_cs771;
CREATE DATABASE smartgrader_test_cs772;



USE smartgrader_test_global
--
-- Create model Action
--
CREATE TABLE `actions` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `app` varchar(100) NULL, `url` varchar(100) NULL, `method` varchar(100) NULL);
--
-- Create model Course
--
CREATE TABLE `courses` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `name` varchar(50) NOT NULL UNIQUE, `title` varchar(50) NOT NULL UNIQUE, `description` varchar(200) NULL, `semester` varchar(50) NULL, `year` integer NULL, `department` varchar(50) NULL, `is_active` bool NOT NULL, `image_directory` varchar(100) NULL);
--
-- Create model GlobalLogs
--
CREATE TABLE `global_logs` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `is_logged_in` bool NOT NULL, `user_id` varchar(100) NULL, `ip` varchar(50) NULL, `app` varchar(50) NULL, `url` integer NULL, `method` varchar(50) NULL, `meta` varchar(500) NULL, `file_path` varchar(200) NULL);
--
-- Create model User
--
CREATE TABLE `users` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `username` varchar(100) NOT NULL UNIQUE, `roll_no` varchar(12) NULL, `first_name` varchar(100) NULL, `last_name` varchar(100) NULL, `email` varchar(70) NOT NULL UNIQUE, `department` varchar(50) NULL, `program` varchar(30) NULL, `password` varchar(100) NULL, `last_login` datetime(6) NULL, `last_login_ip` varchar(100) NULL, `is_active` bool NOT NULL, `is_enabled` bool NOT NULL, `is_logged_in` bool NOT NULL, `password_reset_token` varchar(100) NULL, `session_id` varchar(100) NULL);
--
-- Create model UserHasCourses
--
CREATE TABLE `user_has_courses` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `enrollment_id` bigint NULL, `enrollment_role_id` bigint NULL, `enrollment_action_list` varchar(300) NULL, `enrollment_section_list` varchar(300) NULL, `course_id` integer NOT NULL, `user_id` integer NOT NULL);
--
-- Add field courses to user
--
ALTER TABLE `user_has_courses` ADD CONSTRAINT `user_has_courses_course_id_7b342441_fk_courses_id` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);
ALTER TABLE `user_has_courses` ADD CONSTRAINT `user_has_courses_user_id_08220ece_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;
--
-- create a user in database
--
INSERT INTO `users`(`username`,`email`,`password`,`is_active`,`is_enabled`,`is_logged_in`) values('7111055','nerajkumar9923@gmail.com','bkdf2_sha256$120000$Eh75yWGVQcvU$cBonU1yT2oAJytV+LnvoRl+X9gNremJhAmROi4G+pC0=','1','1','1');
COMMIT;
--
-- create a courses in database
--
INSERT INTO `courses`(`name`,`title`,`description`,`is_active`) values('cs771','Introduction to machine learning','this is basic course','1');
COMMIT;

INSERT INTO `courses`(`name`,`title`,`description`,`is_active`) values('cs772','Advance machine learning','this is advance course','1');
COMMIT;



