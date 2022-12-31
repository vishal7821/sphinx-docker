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
