-- CreateTable
CREATE TABLE `Friend` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `address` VARCHAR(191) NOT NULL,
    `friendAddress` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NULL,

    INDEX `Friend_address_idx`(`address`),
    INDEX `Friend_friendAddress_idx`(`friendAddress`),
    UNIQUE INDEX `Friend_address_friendAddress_key`(`address`, `friendAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
