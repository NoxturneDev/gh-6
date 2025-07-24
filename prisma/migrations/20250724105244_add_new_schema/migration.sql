-- CreateTable
CREATE TABLE `RegionClassification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `regionId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegionDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `regionId` INTEGER NOT NULL,
    `educationStatus` INTEGER NOT NULL DEFAULT 0,
    `sekolahNegeri` INTEGER NOT NULL,
    `sekolahSwasta` INTEGER NOT NULL,
    `sdInSchool` INTEGER NOT NULL,
    `sdOutSchool` INTEGER NOT NULL,
    `smpInSchool` INTEGER NOT NULL,
    `smpOutSchool` INTEGER NOT NULL,
    `smaInSchool` INTEGER NOT NULL,
    `smaOutSchool` INTEGER NOT NULL,
    `teacherCount` INTEGER NOT NULL,

    UNIQUE INDEX `RegionDetail_regionId_key`(`regionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RegionClassification` ADD CONSTRAINT `RegionClassification_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegionDetail` ADD CONSTRAINT `RegionDetail_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
