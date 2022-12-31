BEGIN;

USE smartgrader_test_global
--

INSERT INTO `users`(`id`,`username`,`email`,`password`,`is_active`,`is_enabled`,`is_logged_in`) values(1,'1','snandkule@gmail.com','pbkdf2_sha256$150000$g8U72wO3upzY$TuQ2TI81R1CLDZ+f0MlqLnKxQEL9vVDQNY/E0M5xGFk=','1','1','1');
COMMIT;
-- create a courses in database
--
INSERT INTO `courses`(`id`,`name`,`title`,`description`,`is_active`,`image_directory`) values(1,'cs771','Introduction to machine learning','this is basic course','1','/code/media/cs771/');
COMMIT;

--
-- Dumping data for table `user_has_courses`
--
USE smartgrader_test_cs771


INSERT INTO `roles` (`id`, `deleted`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_by`, `name`, `action_list`) VALUES
(1, NULL, NULL, NULL, NULL, NULL, NULL, 'INSTRUCTOR', '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111');
-- --------------------------------------------------------

INSERT INTO `enrollments` (`id`, `deleted`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_by`, `role_id`, `user_id`) VALUES
(1, NULL, '2019-05-24 10:30:31.988758', NULL, '2020-01-02 17:06:17.056547', NULL, NULL, 1, 1);
COMMIT;


USE smartgrader_test_global

INSERT INTO `user_has_courses` (`id`, `deleted`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_by`, `enrollment_id`, `enrollment_role_id`, `enrollment_action_list`, `course_id`, `user_id`) VALUES
(1, NULL, '2019-05-24 10:30:36.237230', NULL, '2019-05-24 10:30:36.237343', NULL, NULL, 1, 1, '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111', 1, 1);
--
COMMIT;
