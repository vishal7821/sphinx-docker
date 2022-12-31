BEGIN;

CREATE DATABASE smartgrader_test_global;

CREATE DATABASE smartgrader_test_cs771;
CREATE DATABASE smartgrader_test_cs772;



USE smartgrader_test_global


CREATE TABLE `actions` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `app` varchar(100) DEFAULT NULL,
  `url` varchar(100) DEFAULT NULL,
  `method` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `title` varchar(50) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `semester` varchar(50) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `image_directory` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `django_migrations` (
  `id` int(11) NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `global_logs` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `is_logged_in` tinyint(1) NOT NULL,
  `user_id` varchar(100) DEFAULT NULL,
  `ip` varchar(50) DEFAULT NULL,
  `app` varchar(50) DEFAULT NULL,
  `url` int(11) DEFAULT NULL,
  `method` varchar(50) DEFAULT NULL,
  `meta` varchar(500) DEFAULT NULL,
  `file_path` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `roll_no` varchar(12) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(70) NOT NULL,
  `department` varchar(50) DEFAULT NULL,
  `program` varchar(30) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `last_login_ip` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_enabled` tinyint(1) NOT NULL,
  `is_logged_in` tinyint(1) NOT NULL,
  `password_reset_token` varchar(100) DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `user_has_courses` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `enrollment_id` bigint(20) DEFAULT NULL,
  `enrollment_role_id` bigint(20) DEFAULT NULL,
  `enrollment_action_list` varchar(300) DEFAULT NULL,
  `enrollment_section_list` varchar(300) DEFAULT NULL,
  `course_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


ALTER TABLE `actions`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `global_logs`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

ALTER TABLE `user_has_courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_has_courses_course_id_7b342441_fk_courses_id` (`course_id`),
  ADD KEY `user_has_courses_user_id_08220ece_fk_users_id` (`user_id`);


ALTER TABLE `actions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `django_migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `global_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;
ALTER TABLE `user_has_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

ALTER TABLE `user_has_courses`
  ADD CONSTRAINT `user_has_courses_course_id_7b342441_fk_courses_id` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `user_has_courses_user_id_08220ece_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

COMMIT;
