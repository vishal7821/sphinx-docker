
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


BEGIN;
--
-- Create model Assignment
--
CREATE TABLE `assignments` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `name` varchar(100) NOT NULL UNIQUE, `comments` varchar(200) NULL);
--
-- Create model Question
--
CREATE TABLE `questions` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `subpart_no` varchar(100) NULL, `title` varchar(100) NOT NULL, `type` varchar(100) NULL, `file_page` integer NULL, `file_cords` varchar(200) NULL, `text` varchar(300) NULL, `difficulty_level` varchar(100) NULL, `marks` double precision NULL, `solution_list` varchar(300) NULL, `is_autograded` bool NULL, `grading_duty_scheme` varchar(100) NULL, `is_actual_question` bool NOT NULL, `parent_id` integer NULL);
--
-- Create model QuestionHasTopics
--
CREATE TABLE `question_has_topics` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `question_id` integer NOT NULL, `topic_id` integer NOT NULL);
--
-- Create model QuestionOptions
--
CREATE TABLE `question_options` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `label` varchar(200) NOT NULL, `text` varchar(200) NOT NULL, `is_correct` bool NOT NULL, `image_path` varchar(200) NOT NULL, `image_size` integer NOT NULL, `question_id` integer NOT NULL);
--
-- Create model QuestionSet
--
CREATE TABLE `question_sets` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `name` varchar(100) NOT NULL, `question_file_path` varchar(100) NOT NULL, `supplementary_file_path` varchar(100) NOT NULL, `solution_file_path` varchar(100) NOT NULL, `total_marks` integer NOT NULL, `original_question_file_name` varchar(100) NULL, `original_supplementary_file_name` varchar(100) NULL, `original_solution_file_name` varchar(100) NULL, `assignment_id` integer NOT NULL);
--
-- Create model Rubric
--
CREATE TABLE `rubrics` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `text` varchar(200) NOT NULL, `marks` integer NOT NULL, `question_id` integer NOT NULL);
--
-- Add field question_set to question
--
ALTER TABLE `questions` ADD COLUMN `question_set_id` integer NOT NULL;
--
-- Add field topics to question
--
ALTER TABLE `questions` ADD CONSTRAINT `questions_parent_id_9e481514_fk_questions_id` FOREIGN KEY (`parent_id`) REFERENCES `questions` (`id`);
ALTER TABLE `question_has_topics` ADD CONSTRAINT `question_has_topics_question_id_cbbb433b_fk_questions_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`);
ALTER TABLE `question_has_topics` ADD CONSTRAINT `question_has_topics_topic_id_4a4a32ac_fk_topics_id` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`);
ALTER TABLE `question_options` ADD CONSTRAINT `question_options_question_id_10370079_fk_questions_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`);
ALTER TABLE `question_sets` ADD CONSTRAINT `question_sets_assignment_id_9f66d97a_fk_assignments_id` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`);
ALTER TABLE `rubrics` ADD CONSTRAINT `rubrics_question_id_5f33cfa8_fk_questions_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`);
ALTER TABLE `questions` ADD CONSTRAINT `questions_question_set_id_b6dd5073_fk_question_sets_id` FOREIGN KEY (`question_set_id`) REFERENCES `question_sets` (`id`);
COMMIT;


BEGIN;
--
-- Create model Assignment
--
CREATE TABLE `assignments` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `name` varchar(100) NOT NULL UNIQUE, `comments` varchar(200) NULL);
--
-- Create model Question
--
CREATE TABLE `questions` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `subpart_no` varchar(100) NULL, `title` varchar(100) NOT NULL, `type` varchar(100) NULL, `file_page` integer NULL, `file_cords` varchar(200) NULL, `text` varchar(300) NULL, `difficulty_level` varchar(100) NULL, `marks` double precision NULL, `solution_list` varchar(300) NULL, `is_autograded` bool NULL, `grading_duty_scheme` varchar(100) NULL, `is_actual_question` bool NOT NULL, `parent_id` integer NULL);
--
-- Create model QuestionHasTopics
--
CREATE TABLE `question_has_topics` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `question_id` integer NOT NULL, `topic_id` integer NOT NULL);
--
-- Create model QuestionOptions
--
CREATE TABLE `question_options` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `label` varchar(200) NOT NULL, `text` varchar(200) NOT NULL, `is_correct` bool NOT NULL, `image_path` varchar(200) NOT NULL, `image_size` integer NOT NULL, `question_id` integer NOT NULL);
--
-- Create model QuestionSet
--
CREATE TABLE `question_sets` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `name` varchar(100) NOT NULL, `question_file_path` varchar(100) NOT NULL, `supplementary_file_path` varchar(100) NOT NULL, `solution_file_path` varchar(100) NOT NULL, `total_marks` integer NOT NULL, `original_question_file_name` varchar(100) NULL, `original_supplementary_file_name` varchar(100) NULL, `original_solution_file_name` varchar(100) NULL, `assignment_id` integer NOT NULL);
--
-- Create model Rubric
--
CREATE TABLE `rubrics` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `text` varchar(200) NOT NULL, `marks` integer NOT NULL, `question_id` integer NOT NULL);
--
-- Add field question_set to question
--
ALTER TABLE `questions` ADD COLUMN `question_set_id` integer NOT NULL;
--
-- Add field topics to question
--
ALTER TABLE `questions` ADD CONSTRAINT `questions_parent_id_9e481514_fk_questions_id` FOREIGN KEY (`parent_id`) REFERENCES `questions` (`id`);
ALTER TABLE `question_has_topics` ADD CONSTRAINT `question_has_topics_question_id_cbbb433b_fk_questions_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`);
ALTER TABLE `question_has_topics` ADD CONSTRAINT `question_has_topics_topic_id_4a4a32ac_fk_topics_id` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`);
ALTER TABLE `question_options` ADD CONSTRAINT `question_options_question_id_10370079_fk_questions_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`);
ALTER TABLE `question_sets` ADD CONSTRAINT `question_sets_assignment_id_9f66d97a_fk_assignments_id` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`);
ALTER TABLE `rubrics` ADD CONSTRAINT `rubrics_question_id_5f33cfa8_fk_questions_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`);
ALTER TABLE `questions` ADD CONSTRAINT `questions_question_set_id_b6dd5073_fk_question_sets_id` FOREIGN KEY (`question_set_id`) REFERENCES `question_sets` (`id`);
COMMIT;


BEGIN;
--
-- Create model Event
--
CREATE TABLE `events` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `name` varchar(100) NOT NULL UNIQUE, `grade_aggregation_method` varchar(50) NULL, `is_external` bool NULL, `assignment_id` integer NOT NULL);
--
-- Create model GradingDuty
--
CREATE TABLE `grading_duties` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `marks_adjustment` integer NULL, `is_regrading` bool NOT NULL, `grader_comment` varchar(200) NULL, `student_comment` varchar(200) NULL, `is_completed` bool NOT NULL, `aggregate_marks` integer NULL, `is_late_grading` bool NOT NULL, `grader_id` integer NOT NULL);
--
-- Create model Subevent
--
CREATE TABLE `subevents` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `name` varchar(100) NULL, `type` varchar(50) NULL, `start_time` datetime(6) NULL, `end_time` datetime(6) NULL, `display_end_time` datetime(6) NULL, `allow_late_ending` bool NULL, `late_end_time` datetime(6) NULL, `display_late_end_time` datetime(6) NULL, `is_blocking` bool NULL, `params` varchar(300) NULL, `event_id` integer NOT NULL, `gen_subevent_id` integer NULL);
--
-- Create model SubmissionGroup
--
CREATE TABLE `submission_groups` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `access_code_gold` varchar(50) NULL, `access_code_submitted` bool NOT NULL, `is_late_submission` bool NOT NULL, `choosen_question_set_id` integer NULL);
--
-- Create model SubmissionGroupHasUser
--
CREATE TABLE `submission_group_has_users` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `enrollment_id` integer NOT NULL, `submission_group_id` integer NOT NULL);
--
-- Create model SubmissionResponse
--
CREATE TABLE `responses` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `upload_page_no` integer NULL, `upload_coords` varchar(50) NULL, `response_text` varchar(200) NULL, `question_id` integer NOT NULL, `submission_group_id` integer NOT NULL);
--
-- Create model Upload
--
CREATE TABLE `uploads` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `file_path` varchar(100) NULL, `file_size` integer NOT NULL, `is_successful_upload` bool NOT NULL, `uploader_at` datetime(6) NULL, `uploader_ip` varchar(100) NULL, `is_bulk_upload` bool NOT NULL, `is_paginated` bool NOT NULL, `uploader_id` integer NOT NULL);
--
-- Create model UserHasSubevents
--
CREATE TABLE `user_has_subevents` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `deleted` datetime(6) NULL, `created_at` datetime(6) NULL, `created_by` varchar(100) NULL, `updated_at` datetime(6) NULL, `updated_by` varchar(100) NULL, `deleted_by` varchar(100) NULL, `enrollment_id` integer NOT NULL, `subevent_id` integer NOT NULL);
--
-- Add field upload to submissionresponse
--
ALTER TABLE `responses` ADD COLUMN `upload_id` integer NOT NULL;
--
-- Add field enrollments to submissiongroup
--
--
-- Add field subevent to submissiongroup
--
ALTER TABLE `submission_groups` ADD COLUMN `subevent_id` integer NOT NULL;
--
-- Add field upload_id_main to submissiongroup
--
ALTER TABLE `submission_groups` ADD COLUMN `upload_id_main_id` integer NULL;
--
-- Add field upload_id_supp to submissiongroup
--
ALTER TABLE `submission_groups` ADD COLUMN `upload_id_supp_id` integer NULL;
--
-- Add field response to gradingduty
--
ALTER TABLE `grading_duties` ADD COLUMN `response_id` integer NOT NULL;
--
-- Add field subevent to gradingduty
--
ALTER TABLE `grading_duties` ADD COLUMN `subevent_id` integer NOT NULL;
ALTER TABLE `events` ADD CONSTRAINT `events_assignment_id_c0d4d67c_fk_assignments_id` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`);
CREATE INDEX `events_assignment_id_c0d4d67c` ON `events` (`assignment_id`);
ALTER TABLE `grading_duties` ADD CONSTRAINT `grading_duties_grader_id_fcf01e00_fk_enrollments_id` FOREIGN KEY (`grader_id`) REFERENCES `enrollments` (`id`);
ALTER TABLE `subevents` ADD CONSTRAINT `subevents_event_id_5381467f_fk_events_id` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`);
ALTER TABLE `subevents` ADD CONSTRAINT `subevents_gen_subevent_id_92a4c551_fk_subevents_id` FOREIGN KEY (`gen_subevent_id`) REFERENCES `subevents` (`id`);
ALTER TABLE `submission_groups` ADD CONSTRAINT `submission_groups_choosen_question_set_6cf15543_fk_question_` FOREIGN KEY (`choosen_question_set_id`) REFERENCES `question_sets` (`id`);
ALTER TABLE `submission_group_has_users` ADD CONSTRAINT `submission_group_has_enrollment_id_4181c69e_fk_enrollmen` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`);
ALTER TABLE `submission_group_has_users` ADD CONSTRAINT `submission_group_has_submission_group_id_72daac5e_fk_submissio` FOREIGN KEY (`submission_group_id`) REFERENCES `submission_groups` (`id`);
ALTER TABLE `responses` ADD CONSTRAINT `responses_question_id_d207dd66_fk_questions_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`);
ALTER TABLE `responses` ADD CONSTRAINT `responses_submission_group_id_7398f276_fk_submission_groups_id` FOREIGN KEY (`submission_group_id`) REFERENCES `submission_groups` (`id`);
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_uploader_id_742d82e4_fk_enrollments_id` FOREIGN KEY (`uploader_id`) REFERENCES `enrollments` (`id`);
ALTER TABLE `user_has_subevents` ADD CONSTRAINT `user_has_subevents_enrollment_id_f24d3648_fk_enrollments_id` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`);
ALTER TABLE `user_has_subevents` ADD CONSTRAINT `user_has_subevents_subevent_id_70c3a64c_fk_subevents_id` FOREIGN KEY (`subevent_id`) REFERENCES `subevents` (`id`);
ALTER TABLE `responses` ADD CONSTRAINT `responses_upload_id_ab5ff934_fk_uploads_id` FOREIGN KEY (`upload_id`) REFERENCES `uploads` (`id`);
ALTER TABLE `submission_groups` ADD CONSTRAINT `submission_groups_subevent_id_cdbf9553_fk_subevents_id` FOREIGN KEY (`subevent_id`) REFERENCES `subevents` (`id`);
ALTER TABLE `submission_groups` ADD CONSTRAINT `submission_groups_upload_id_main_id_a63ae945_fk_uploads_id` FOREIGN KEY (`upload_id_main_id`) REFERENCES `uploads` (`id`);
ALTER TABLE `submission_groups` ADD CONSTRAINT `submission_groups_upload_id_supp_id_5a544dd2_fk_uploads_id` FOREIGN KEY (`upload_id_supp_id`) REFERENCES `uploads` (`id`);
ALTER TABLE `grading_duties` ADD CONSTRAINT `grading_duties_response_id_ac58ef33_fk_responses_id` FOREIGN KEY (`response_id`) REFERENCES `responses` (`id`);
ALTER TABLE `grading_duties` ADD CONSTRAINT `grading_duties_subevent_id_67792a28_fk_subevents_id` FOREIGN KEY (`subevent_id`) REFERENCES `subevents` (`id`);
COMMIT;


