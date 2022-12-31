-- phpMyAdmin SQL Dump
-- version 4.6.6deb5
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 29, 2020 at 07:51 PM
-- Server version: 5.7.29-0ubuntu0.18.04.1
-- PHP Version: 7.2.24-0ubuntu0.18.04.2

BEGIN;
USE smartgrader_test_cs771
--
-- Database: `smartgrader_test_cs771`
--

-- --------------------------------------------------------

--
-- Table structure for table `actions`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `comments` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `course_log`
--

CREATE TABLE `course_log` (
  `id` int(11) NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `ip` varchar(100) NOT NULL,
  `app` varchar(100) NOT NULL,
  `url` varchar(100) NOT NULL,
  `method` varchar(100) NOT NULL,
  `file_path` varchar(100) NOT NULL,
  `flag_id` varchar(100) NOT NULL,
  `message_id` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` int(11) NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `role_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `enrollment_has_sections`
--

CREATE TABLE `enrollment_has_sections` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `enrollment_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `grade_aggregation_method` varchar(50) DEFAULT NULL,
  `is_external` tinyint(1) NOT NULL,
  `assignment_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `global_logs`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `grading_duties`
--

CREATE TABLE `grading_duties` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `marks_adjustment` int(11) DEFAULT NULL,
  `is_regrading` tinyint(1) NOT NULL,
  `grader_comment` varchar(200) DEFAULT NULL,
  `student_comment` varchar(200) DEFAULT NULL,
  `is_completed` tinyint(1) NOT NULL,
  `aggregate_marks` int(11) DEFAULT NULL,
  `is_late_grading` tinyint(1) NOT NULL,
  `is_aggregate_marks_dirty` tinyint(1) NOT NULL,
  `grader_id` int(11) NOT NULL,
  `response_id` int(11) NOT NULL,
  `subevent_id` int(11) NOT NULL,
  `prev_grading_duty_id` int(11) DEFAULT NULL,
  `request_subevent_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `grading_duty_has_rubrics`
--

CREATE TABLE `grading_duty_has_rubrics` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `gradingduty_id` int(11) NOT NULL,
  `rubric_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `subpart_no` varchar(100) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `file_page` int(11) DEFAULT NULL,
  `file_cords` varchar(200) DEFAULT NULL,
  `text` varchar(300) DEFAULT NULL,
  `difficulty_level` int(11) NOT NULL,
  `marks` double DEFAULT NULL,
  `solution_list` varchar(300) DEFAULT NULL,
  `is_autograded` tinyint(1) DEFAULT NULL,
  `grading_duty_scheme` varchar(100) DEFAULT NULL,
  `is_actual_question` tinyint(1) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `question_set_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `question_has_topics`
--

CREATE TABLE `question_has_topics` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `question_id` int(11) NOT NULL,
  `topic_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `question_options`
--

CREATE TABLE `question_options` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `label` varchar(200) NOT NULL,
  `text` varchar(200) NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `image_path` varchar(200) NOT NULL,
  `image_size` int(11) NOT NULL,
  `question_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `question_sets`
--

CREATE TABLE `question_sets` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `question_file_path` varchar(100) NOT NULL,
  `supplementary_file_path` varchar(100) NOT NULL,
  `solution_file_path` varchar(100) NOT NULL,
  `total_marks` int(11) NOT NULL,
  `name_coords` varchar(50) DEFAULT NULL,
  `roll_coords` varchar(50) DEFAULT NULL,
  `original_question_file_name` varchar(100) DEFAULT NULL,
  `original_supplementary_file_name` varchar(100) DEFAULT NULL,
  `original_solution_file_name` varchar(100) DEFAULT NULL,
  `assignment_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `responses`
--

CREATE TABLE `responses` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `upload_page_no` int(11) DEFAULT NULL,
  `upload_coords` varchar(50) DEFAULT NULL,
  `response_text` varchar(200) DEFAULT NULL,
  `question_id` int(11) NOT NULL,
  `submission_group_id` int(11) NOT NULL,
  `upload_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `action_list` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `rubrics`
--

CREATE TABLE `rubrics` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `text` varchar(200) NOT NULL,
  `marks` int(11) NOT NULL,
  `question_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `subevents`
--

CREATE TABLE `subevents` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `start_time` datetime(6) NOT NULL,
  `end_time` datetime(6) NOT NULL,
  `display_end_time` datetime(6) NOT NULL,
  `allow_late_ending` tinyint(1) NOT NULL,
  `late_end_time` datetime(6) DEFAULT NULL,
  `display_late_end_time` datetime(6) DEFAULT NULL,
  `is_blocking` tinyint(1) NOT NULL,
  `participants_spec` tinyint(1) DEFAULT NULL,
  `params` varchar(2000) DEFAULT NULL,
  `event_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `submission_groups`
--

CREATE TABLE `submission_groups` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `access_code_gold` varchar(50) DEFAULT NULL,
  `access_code_submitted` varchar(50) DEFAULT NULL,
  `is_late_submission` tinyint(1) NOT NULL,
  `choosen_question_set_id` int(11) DEFAULT NULL,
  `subevent_id` int(11) NOT NULL,
  `upload_id_main_id` int(11) DEFAULT NULL,
  `upload_id_supp_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `submission_group_has_users`
--

CREATE TABLE `submission_group_has_users` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `enrollment_id` int(11) NOT NULL,
  `submission_group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `topics`
--

CREATE TABLE `topics` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(100) NOT NULL,
  `super_topic_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `uploads`
--

CREATE TABLE `uploads` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `file_path` varchar(100) NOT NULL,
  `file_size` int(11) NOT NULL,
  `is_successful_upload` tinyint(1) NOT NULL,
  `uploaded_at` datetime(6) DEFAULT NULL,
  `uploader_ip` varchar(100) DEFAULT NULL,
  `is_bulk_upload` tinyint(1) NOT NULL,
  `is_paginated` tinyint(1) NOT NULL,
  `uploader_id` int(11) NOT NULL,
  `original_file_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `user_has_courses`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `user_has_subevents`
--

CREATE TABLE `user_has_subevents` (
  `id` int(11) NOT NULL,
  `deleted` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `deleted_by` varchar(100) DEFAULT NULL,
  `enrollment_id` int(11) NOT NULL,
  `subevent_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `actions`
--
ALTER TABLE `actions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `course_log`
--
ALTER TABLE `course_log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enrollments_role_id_0a835a90_fk_roles_id` (`role_id`),
  ADD KEY `enrollments_user_id_149cb742` (`user_id`);

--
-- Indexes for table `enrollment_has_sections`
--
ALTER TABLE `enrollment_has_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enrollment_has_sections_enrollment_id_29605ebd_fk_enrollments_id` (`enrollment_id`),
  ADD KEY `enrollment_has_sections_section_id_ecdfb6c4_fk_sections_id` (`section_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `events_assignment_id_c0d4d67c` (`assignment_id`);

--
-- Indexes for table `global_logs`
--
ALTER TABLE `global_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `grading_duties`
--
ALTER TABLE `grading_duties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `grading_duties_grader_id_fcf01e00_fk_enrollments_id` (`grader_id`),
  ADD KEY `grading_duties_response_id_ac58ef33_fk_responses_id` (`response_id`),
  ADD KEY `grading_duties_subevent_id_67792a28_fk_subevents_id` (`subevent_id`),
  ADD KEY `grading_duties_prev_grading_duty_id_8d323384_fk_grading_d` (`prev_grading_duty_id`),
  ADD KEY `grading_duties_request_subevent_id_b35cc925_fk_subevents_id` (`request_subevent_id`);

--
-- Indexes for table `grading_duty_has_rubrics`
--
ALTER TABLE `grading_duty_has_rubrics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `grading_duty_has_rub_gradingduty_id_bbb7f5bd_fk_grading_d` (`gradingduty_id`),
  ADD KEY `grading_duty_has_rubrics_rubric_id_26c30cbe_fk_rubrics_id` (`rubric_id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `questions_parent_id_9e481514_fk_questions_id` (`parent_id`),
  ADD KEY `questions_question_set_id_b6dd5073_fk_question_sets_id` (`question_set_id`);

--
-- Indexes for table `question_has_topics`
--
ALTER TABLE `question_has_topics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_has_topics_question_id_cbbb433b_fk_questions_id` (`question_id`),
  ADD KEY `question_has_topics_topic_id_4a4a32ac_fk_topics_id` (`topic_id`);

--
-- Indexes for table `question_options`
--
ALTER TABLE `question_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_options_question_id_10370079_fk_questions_id` (`question_id`);

--
-- Indexes for table `question_sets`
--
ALTER TABLE `question_sets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_sets_assignment_id_9f66d97a_fk_assignments_id` (`assignment_id`);

--
-- Indexes for table `responses`
--
ALTER TABLE `responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `responses_question_id_d207dd66_fk_questions_id` (`question_id`),
  ADD KEY `responses_submission_group_id_7398f276_fk_submission_groups_id` (`submission_group_id`),
  ADD KEY `responses_upload_id_ab5ff934_fk_uploads_id` (`upload_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rubrics`
--
ALTER TABLE `rubrics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rubrics_question_id_5f33cfa8_fk_questions_id` (`question_id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subevents`
--
ALTER TABLE `subevents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subevents_event_id_5381467f_fk_events_id` (`event_id`);

--
-- Indexes for table `submission_groups`
--
ALTER TABLE `submission_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_groups_choosen_question_set_6cf15543_fk_question_` (`choosen_question_set_id`),
  ADD KEY `submission_groups_subevent_id_cdbf9553_fk_subevents_id` (`subevent_id`),
  ADD KEY `submission_groups_upload_id_main_id_a63ae945_fk_uploads_id` (`upload_id_main_id`),
  ADD KEY `submission_groups_upload_id_supp_id_5a544dd2_fk_uploads_id` (`upload_id_supp_id`);

--
-- Indexes for table `submission_group_has_users`
--
ALTER TABLE `submission_group_has_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_group_has_enrollment_id_4181c69e_fk_enrollmen` (`enrollment_id`),
  ADD KEY `submission_group_has_submission_group_id_72daac5e_fk_submissio` (`submission_group_id`);

--
-- Indexes for table `topics`
--
ALTER TABLE `topics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `topics_super_topic_id_39ac8ecd_fk_topics_id` (`super_topic_id`);

--
-- Indexes for table `uploads`
--
ALTER TABLE `uploads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploads_uploader_id_742d82e4_fk_enrollments_id` (`uploader_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_has_courses`
--
ALTER TABLE `user_has_courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_has_courses_course_id_7b342441_fk_courses_id` (`course_id`),
  ADD KEY `user_has_courses_user_id_08220ece_fk_users_id` (`user_id`);

--
-- Indexes for table `user_has_subevents`
--
ALTER TABLE `user_has_subevents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_has_subevents_enrollment_id_f24d3648_fk_enrollments_id` (`enrollment_id`),
  ADD KEY `user_has_subevents_subevent_id_70c3a64c_fk_subevents_id` (`subevent_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `actions`
--
ALTER TABLE `actions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;
--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `course_log`
--
ALTER TABLE `course_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;
--
-- AUTO_INCREMENT for table `enrollment_has_sections`
--
ALTER TABLE `enrollment_has_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;
--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;
--
-- AUTO_INCREMENT for table `global_logs`
--
ALTER TABLE `global_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `grading_duties`
--
ALTER TABLE `grading_duties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=330;
--
-- AUTO_INCREMENT for table `grading_duty_has_rubrics`
--
ALTER TABLE `grading_duty_has_rubrics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;
--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;
--
-- AUTO_INCREMENT for table `question_has_topics`
--
ALTER TABLE `question_has_topics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;
--
-- AUTO_INCREMENT for table `question_options`
--
ALTER TABLE `question_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `question_sets`
--
ALTER TABLE `question_sets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;
--
-- AUTO_INCREMENT for table `responses`
--
ALTER TABLE `responses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;
--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
--
-- AUTO_INCREMENT for table `rubrics`
--
ALTER TABLE `rubrics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;
--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
--
-- AUTO_INCREMENT for table `subevents`
--
ALTER TABLE `subevents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=147;
--
-- AUTO_INCREMENT for table `submission_groups`
--
ALTER TABLE `submission_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;
--
-- AUTO_INCREMENT for table `submission_group_has_users`
--
ALTER TABLE `submission_group_has_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=124;
--
-- AUTO_INCREMENT for table `topics`
--
ALTER TABLE `topics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;
--
-- AUTO_INCREMENT for table `uploads`
--
ALTER TABLE `uploads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user_has_courses`
--
ALTER TABLE `user_has_courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user_has_subevents`
--
ALTER TABLE `user_has_subevents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=472;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `enrollment_has_sections`
--
ALTER TABLE `enrollment_has_sections`
  ADD CONSTRAINT `enrollment_has_sections_enrollment_id_29605ebd_fk_enrollments_id` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`),
  ADD CONSTRAINT `enrollment_has_sections_section_id_ecdfb6c4_fk_sections_id` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`);

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_assignment_id_c0d4d67c_fk_assignments_id` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`);

--
-- Constraints for table `grading_duties`
--
ALTER TABLE `grading_duties`
  ADD CONSTRAINT `grading_duties_grader_id_fcf01e00_fk_enrollments_id` FOREIGN KEY (`grader_id`) REFERENCES `enrollments` (`id`),
  ADD CONSTRAINT `grading_duties_prev_grading_duty_id_8d323384_fk_grading_d` FOREIGN KEY (`prev_grading_duty_id`) REFERENCES `grading_duties` (`id`),
  ADD CONSTRAINT `grading_duties_request_subevent_id_b35cc925_fk_subevents_id` FOREIGN KEY (`request_subevent_id`) REFERENCES `subevents` (`id`),
  ADD CONSTRAINT `grading_duties_response_id_ac58ef33_fk_responses_id` FOREIGN KEY (`response_id`) REFERENCES `responses` (`id`),
  ADD CONSTRAINT `grading_duties_subevent_id_67792a28_fk_subevents_id` FOREIGN KEY (`subevent_id`) REFERENCES `subevents` (`id`);

--
-- Constraints for table `grading_duty_has_rubrics`
--
ALTER TABLE `grading_duty_has_rubrics`
  ADD CONSTRAINT `grading_duty_has_rub_gradingduty_id_bbb7f5bd_fk_grading_d` FOREIGN KEY (`gradingduty_id`) REFERENCES `grading_duties` (`id`),
  ADD CONSTRAINT `grading_duty_has_rubrics_rubric_id_26c30cbe_fk_rubrics_id` FOREIGN KEY (`rubric_id`) REFERENCES `rubrics` (`id`);

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `questions_parent_id_9e481514_fk_questions_id` FOREIGN KEY (`parent_id`) REFERENCES `questions` (`id`),
  ADD CONSTRAINT `questions_question_set_id_b6dd5073_fk_question_sets_id` FOREIGN KEY (`question_set_id`) REFERENCES `question_sets` (`id`);

--
-- Constraints for table `question_has_topics`
--
ALTER TABLE `question_has_topics`
  ADD CONSTRAINT `question_has_topics_question_id_cbbb433b_fk_questions_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`),
  ADD CONSTRAINT `question_has_topics_topic_id_4a4a32ac_fk_topics_id` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`);

--
-- Constraints for table `question_options`
--
ALTER TABLE `question_options`
  ADD CONSTRAINT `question_options_question_id_10370079_fk_questions_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`);

--
-- Constraints for table `question_sets`
--
ALTER TABLE `question_sets`
  ADD CONSTRAINT `question_sets_assignment_id_9f66d97a_fk_assignments_id` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`);

--
-- Constraints for table `responses`
--
ALTER TABLE `responses`
  ADD CONSTRAINT `responses_question_id_d207dd66_fk_questions_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`),
  ADD CONSTRAINT `responses_submission_group_id_7398f276_fk_submission_groups_id` FOREIGN KEY (`submission_group_id`) REFERENCES `submission_groups` (`id`),
  ADD CONSTRAINT `responses_upload_id_ab5ff934_fk_uploads_id` FOREIGN KEY (`upload_id`) REFERENCES `uploads` (`id`);

--
-- Constraints for table `rubrics`
--
ALTER TABLE `rubrics`
  ADD CONSTRAINT `rubrics_question_id_5f33cfa8_fk_questions_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`);

--
-- Constraints for table `subevents`
--
ALTER TABLE `subevents`
  ADD CONSTRAINT `subevents_event_id_5381467f_fk_events_id` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`);

--
-- Constraints for table `submission_groups`
--
ALTER TABLE `submission_groups`
  ADD CONSTRAINT `submission_groups_choosen_question_set_6cf15543_fk_question_` FOREIGN KEY (`choosen_question_set_id`) REFERENCES `question_sets` (`id`),
  ADD CONSTRAINT `submission_groups_subevent_id_cdbf9553_fk_subevents_id` FOREIGN KEY (`subevent_id`) REFERENCES `subevents` (`id`),
  ADD CONSTRAINT `submission_groups_upload_id_main_id_a63ae945_fk_uploads_id` FOREIGN KEY (`upload_id_main_id`) REFERENCES `uploads` (`id`),
  ADD CONSTRAINT `submission_groups_upload_id_supp_id_5a544dd2_fk_uploads_id` FOREIGN KEY (`upload_id_supp_id`) REFERENCES `uploads` (`id`);

--
-- Constraints for table `submission_group_has_users`
--
ALTER TABLE `submission_group_has_users`
  ADD CONSTRAINT `submission_group_has_enrollment_id_4181c69e_fk_enrollmen` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`),
  ADD CONSTRAINT `submission_group_has_submission_group_id_72daac5e_fk_submissio` FOREIGN KEY (`submission_group_id`) REFERENCES `submission_groups` (`id`);

--
-- Constraints for table `topics`
--
ALTER TABLE `topics`
  ADD CONSTRAINT `topics_super_topic_id_39ac8ecd_fk_topics_id` FOREIGN KEY (`super_topic_id`) REFERENCES `topics` (`id`);

--
-- Constraints for table `uploads`
--
ALTER TABLE `uploads`
  ADD CONSTRAINT `uploads_uploader_id_742d82e4_fk_enrollments_id` FOREIGN KEY (`uploader_id`) REFERENCES `enrollments` (`id`);

--
-- Constraints for table `user_has_courses`
--
ALTER TABLE `user_has_courses`
  ADD CONSTRAINT `user_has_courses_course_id_7b342441_fk_courses_id` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `user_has_courses_user_id_08220ece_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

COMMIT;
