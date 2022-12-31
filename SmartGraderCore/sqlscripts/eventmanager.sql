USE smartgrader_test_cs772

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


