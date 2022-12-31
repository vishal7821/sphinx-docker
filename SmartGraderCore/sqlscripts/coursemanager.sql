USE smartgrader_test_cs771

BEGIN;
--
-- Create model CourseLog
--
CREATE TABLE `course_log` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `user_id` varchar(100) NOT NULL, `ip` varchar(100) NOT NULL, `app` varchar(100) NOT NULL, `url` varchar(100) NOT NULL, `method` varchar(100) NOT NULL, `file_path` varchar(100) NOT NULL, `flag_id` varchar(100) NOT NULL, `message_id` varchar(100) NOT NULL);
--
-- Create model Enrollment
--
CREATE TABLE `enrollments` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL);
--
-- Create model EnrollmentHasSections
--
CREATE TABLE `enrollment_has_sections` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `enrollment_id` integer NOT NULL);
--
-- Create model Role
--
CREATE TABLE `roles` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `name` varchar(100) NOT NULL UNIQUE, `action_list` varchar(100) NOT NULL);
--
-- Create model Section
--
CREATE TABLE `sections` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `name` varchar(100) NOT NULL UNIQUE);
--
-- Create model Topic
--
CREATE TABLE `topics` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `name` varchar(100) NOT NULL UNIQUE, `description` varchar(100) NOT NULL, `super_topic_id` integer NULL);
--
-- Add field section to enrollmenthassections
--
ALTER TABLE `enrollment_has_sections` ADD COLUMN `section_id` integer NOT NULL;
--
-- Add field role to enrollment
--
ALTER TABLE `enrollments` ADD COLUMN `role_id` integer NOT NULL;
--
-- Add field sections to enrollment
--
--
-- Add field user to enrollment
--
ALTER TABLE `enrollments` ADD COLUMN `user_id` integer NULL;
ALTER TABLE `enrollment_has_sections` ADD CONSTRAINT `enrollment_has_sections_enrollment_id_29605ebd_fk_enrollments_id` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`);
ALTER TABLE `topics` ADD CONSTRAINT `topics_super_topic_id_39ac8ecd_fk_topics_id` FOREIGN KEY (`super_topic_id`) REFERENCES `topics` (`id`);
ALTER TABLE `enrollment_has_sections` ADD CONSTRAINT `enrollment_has_sections_section_id_ecdfb6c4_fk_sections_id` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`);
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_role_id_0a835a90_fk_roles_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);
CREATE INDEX `enrollments_user_id_149cb742` ON `enrollments` (`user_id`);
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_user_id_149cb742_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `smartgrader_test_global`.`users` (`id`);
COMMIT;
