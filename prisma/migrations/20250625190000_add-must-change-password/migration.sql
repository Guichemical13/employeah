-- Migration to add mustChangePassword field to User table
ALTER TABLE `User` ADD COLUMN `mustChangePassword` BOOLEAN NOT NULL DEFAULT false;
