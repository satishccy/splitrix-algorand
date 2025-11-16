-- CreateTable
CREATE TABLE `SyncStatus` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `lastSyncedBlock` BIGINT UNSIGNED NOT NULL,
    `lastSyncedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Group` (
    `id` VARCHAR(191) NOT NULL,
    `admin` VARCHAR(191) NOT NULL,
    `memberCount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Group_admin_idx`(`admin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupMember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `groupId` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,

    INDEX `GroupMember_address_idx`(`address`),
    UNIQUE INDEX `GroupMember_groupId_address_key`(`groupId`, `address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bill` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `billId` VARCHAR(191) NOT NULL,
    `payer` VARCHAR(191) NOT NULL,
    `totalAmount` BIGINT UNSIGNED NOT NULL,
    `memo` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Bill_groupId_idx`(`groupId`),
    INDEX `Bill_payer_idx`(`payer`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Debtor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `billId` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `amount` BIGINT UNSIGNED NOT NULL,
    `paid` BIGINT UNSIGNED NOT NULL,

    INDEX `Debtor_billId_idx`(`billId`),
    INDEX `Debtor_address_idx`(`address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GroupMember` ADD CONSTRAINT `GroupMember_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bill` ADD CONSTRAINT `Bill_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Debtor` ADD CONSTRAINT `Debtor_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `Bill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
