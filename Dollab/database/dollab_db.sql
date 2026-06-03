/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.16-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: dollab_db
-- ------------------------------------------------------
-- Server version	10.11.16-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `dollab_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `dollab_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `dollab_db`;

--
-- Table structure for table `BlockedUsers`
--

DROP TABLE IF EXISTS `BlockedUsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `BlockedUsers` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `BlockerId` int(11) NOT NULL,
  `BlockedId` int(11) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_BlockedUsers_BlockerId_BlockedId` (`BlockerId`,`BlockedId`),
  KEY `IX_BlockedUsers_BlockedId` (`BlockedId`),
  CONSTRAINT `FK_BlockedUsers_Users_BlockedId` FOREIGN KEY (`BlockedId`) REFERENCES `Users` (`Id`),
  CONSTRAINT `FK_BlockedUsers_Users_BlockerId` FOREIGN KEY (`BlockerId`) REFERENCES `Users` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BlockedUsers`
--

LOCK TABLES `BlockedUsers` WRITE;
/*!40000 ALTER TABLE `BlockedUsers` DISABLE KEYS */;
/*!40000 ALTER TABLE `BlockedUsers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CartItems`
--

DROP TABLE IF EXISTS `CartItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `CartItems` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` int(11) NOT NULL,
  `ProductAdId` int(11) NOT NULL,
  `AddedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_CartItems_UserId_ProductAdId` (`UserId`,`ProductAdId`),
  KEY `IX_CartItems_ProductAdId` (`ProductAdId`),
  CONSTRAINT `FK_CartItems_ProductAds_ProductAdId` FOREIGN KEY (`ProductAdId`) REFERENCES `ProductAds` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_CartItems_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CartItems`
--

LOCK TABLES `CartItems` WRITE;
/*!40000 ALTER TABLE `CartItems` DISABLE KEYS */;
/*!40000 ALTER TABLE `CartItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Comments`
--

DROP TABLE IF EXISTS `Comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Comments` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Text` longtext NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UserId` int(11) NOT NULL,
  `PostId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Comments_PostId` (`PostId`),
  KEY `IX_Comments_UserId` (`UserId`),
  CONSTRAINT `FK_Comments_Posts_PostId` FOREIGN KEY (`PostId`) REFERENCES `Posts` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Comments_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Comments`
--

LOCK TABLES `Comments` WRITE;
/*!40000 ALTER TABLE `Comments` DISABLE KEYS */;
INSERT INTO `Comments` VALUES
(1,'а если ты петух','2026-05-21 21:44:43.200255',1,2);
/*!40000 ALTER TABLE `Comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Dolls`
--

DROP TABLE IF EXISTS `Dolls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Dolls` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` longtext NOT NULL,
  `Series` longtext DEFAULT NULL,
  `Description` longtext DEFAULT NULL,
  `ImageUrl` longtext DEFAULT NULL,
  `ReleaseYear` int(11) NOT NULL DEFAULT 0,
  `Brand` longtext DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Dolls`
--

LOCK TABLES `Dolls` WRITE;
/*!40000 ALTER TABLE `Dolls` DISABLE KEYS */;
/*!40000 ALTER TABLE `Dolls` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Favorites`
--

DROP TABLE IF EXISTS `Favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Favorites` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` int(11) NOT NULL,
  `PostId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Favorites_PostId` (`PostId`),
  KEY `IX_Favorites_UserId` (`UserId`),
  CONSTRAINT `FK_Favorites_Posts_PostId` FOREIGN KEY (`PostId`) REFERENCES `Posts` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Favorites_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Favorites`
--

LOCK TABLES `Favorites` WRITE;
/*!40000 ALTER TABLE `Favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `Favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FollowRequests`
--

DROP TABLE IF EXISTS `FollowRequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `FollowRequests` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `RequesterId` int(11) NOT NULL,
  `TargetUserId` int(11) NOT NULL,
  `Status` longtext NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_FollowRequests_RequesterId` (`RequesterId`),
  KEY `IX_FollowRequests_TargetUserId` (`TargetUserId`),
  CONSTRAINT `FK_FollowRequests_Users_RequesterId` FOREIGN KEY (`RequesterId`) REFERENCES `Users` (`Id`),
  CONSTRAINT `FK_FollowRequests_Users_TargetUserId` FOREIGN KEY (`TargetUserId`) REFERENCES `Users` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FollowRequests`
--

LOCK TABLES `FollowRequests` WRITE;
/*!40000 ALTER TABLE `FollowRequests` DISABLE KEYS */;
/*!40000 ALTER TABLE `FollowRequests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Follows`
--

DROP TABLE IF EXISTS `Follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Follows` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `FollowerId` int(11) NOT NULL,
  `FollowingId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Follows_FollowerId` (`FollowerId`),
  KEY `IX_Follows_FollowingId` (`FollowingId`),
  CONSTRAINT `FK_Follows_Users_FollowerId` FOREIGN KEY (`FollowerId`) REFERENCES `Users` (`Id`),
  CONSTRAINT `FK_Follows_Users_FollowingId` FOREIGN KEY (`FollowingId`) REFERENCES `Users` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Follows`
--

LOCK TABLES `Follows` WRITE;
/*!40000 ALTER TABLE `Follows` DISABLE KEYS */;
/*!40000 ALTER TABLE `Follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Likes`
--

DROP TABLE IF EXISTS `Likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Likes` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` int(11) NOT NULL,
  `PostId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Likes_PostId` (`PostId`),
  KEY `IX_Likes_UserId` (`UserId`),
  CONSTRAINT `FK_Likes_Posts_PostId` FOREIGN KEY (`PostId`) REFERENCES `Posts` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Likes_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Likes`
--

LOCK TABLES `Likes` WRITE;
/*!40000 ALTER TABLE `Likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `Likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notifications` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` int(11) NOT NULL,
  `FromUserId` int(11) NOT NULL,
  `Type` int(11) NOT NULL,
  `PostId` int(11) DEFAULT NULL,
  `ReviewId` int(11) DEFAULT NULL,
  `Message` longtext NOT NULL,
  `IsRead` tinyint(1) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `FollowRequestId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Notifications_FromUserId` (`FromUserId`),
  KEY `IX_Notifications_PostId` (`PostId`),
  KEY `IX_Notifications_UserId` (`UserId`),
  CONSTRAINT `FK_Notifications_Posts_PostId` FOREIGN KEY (`PostId`) REFERENCES `Posts` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `FK_Notifications_Users_FromUserId` FOREIGN KEY (`FromUserId`) REFERENCES `Users` (`Id`),
  CONSTRAINT `FK_Notifications_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notifications`
--

LOCK TABLES `Notifications` WRITE;
/*!40000 ALTER TABLE `Notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Posts`
--

DROP TABLE IF EXISTS `Posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Posts` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ImageUrl` longtext NOT NULL,
  `Description` longtext DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UserId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Posts_UserId` (`UserId`),
  CONSTRAINT `FK_Posts_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Posts`
--

LOCK TABLES `Posts` WRITE;
/*!40000 ALTER TABLE `Posts` DISABLE KEYS */;
INSERT INTO `Posts` VALUES
(1,'/posts/9b3c636d-3148-450f-b4b3-08200eeb3af7.jpg','Привет','2026-05-21 21:27:56.549069',1),
(2,'/posts/e292eef9-b485-47ea-8c7a-87d536717ea8.jpg','проро','2026-05-21 21:41:09.215956',1);
/*!40000 ALTER TABLE `Posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductAds`
--

DROP TABLE IF EXISTS `ProductAds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProductAds` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Title` longtext NOT NULL,
  `Description` longtext NOT NULL,
  `Price` decimal(65,30) NOT NULL,
  `CategoryId` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_ProductAds_CategoryId` (`CategoryId`),
  KEY `IX_ProductAds_UserId` (`UserId`),
  CONSTRAINT `FK_ProductAds_ProductCategories_CategoryId` FOREIGN KEY (`CategoryId`) REFERENCES `ProductCategories` (`Id`),
  CONSTRAINT `FK_ProductAds_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductAds`
--

LOCK TABLES `ProductAds` WRITE;
/*!40000 ALTER TABLE `ProductAds` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProductAds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductCategories`
--

DROP TABLE IF EXISTS `ProductCategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProductCategories` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` longtext NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductCategories`
--

LOCK TABLES `ProductCategories` WRITE;
/*!40000 ALTER TABLE `ProductCategories` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProductCategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductImages`
--

DROP TABLE IF EXISTS `ProductImages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProductImages` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ImageUrl` longtext NOT NULL,
  `ProductAdId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_ProductImages_ProductAdId` (`ProductAdId`),
  CONSTRAINT `FK_ProductImages_ProductAds_ProductAdId` FOREIGN KEY (`ProductAdId`) REFERENCES `ProductAds` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductImages`
--

LOCK TABLES `ProductImages` WRITE;
/*!40000 ALTER TABLE `ProductImages` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProductImages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserReviews`
--

DROP TABLE IF EXISTS `UserReviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserReviews` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ReviewerId` int(11) NOT NULL,
  `ReviewedUserId` int(11) NOT NULL,
  `Rating` int(11) NOT NULL,
  `Description` longtext DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_UserReviews_ReviewerId_ReviewedUserId` (`ReviewerId`,`ReviewedUserId`),
  KEY `IX_UserReviews_ReviewedUserId` (`ReviewedUserId`),
  CONSTRAINT `FK_UserReviews_Users_ReviewedUserId` FOREIGN KEY (`ReviewedUserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_UserReviews_Users_ReviewerId` FOREIGN KEY (`ReviewerId`) REFERENCES `Users` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserReviews`
--

LOCK TABLES `UserReviews` WRITE;
/*!40000 ALTER TABLE `UserReviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `UserReviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Username` longtext NOT NULL,
  `Email` longtext NOT NULL,
  `PasswordHash` longtext NOT NULL,
  `Role` longtext NOT NULL,
  `AllowReviews` tinyint(1) NOT NULL DEFAULT 1,
  `AvatarUrl` longtext DEFAULT NULL,
  `Bio` longtext DEFAULT NULL,
  `City` longtext DEFAULT NULL,
  `ContactMethod` longtext DEFAULT NULL,
  `NotifyComments` tinyint(1) NOT NULL DEFAULT 1,
  `NotifyFollowers` tinyint(1) NOT NULL DEFAULT 1,
  `NotifyLikes` tinyint(1) NOT NULL DEFAULT 1,
  `NotifyReviews` tinyint(1) NOT NULL DEFAULT 1,
  `ProfileVisibility` longtext NOT NULL,
  `ShowRatingInProfile` tinyint(1) NOT NULL DEFAULT 1,
  `ShowStoreInProfile` tinyint(1) NOT NULL DEFAULT 1,
  `Theme` longtext NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES
(1,'Woijech','woijech1@gmail.com','$2a$11$koTwsGTZIcUHrOR6z8KLV.0YZ2KgNrHTxXHp7SK3fvF3R1KkGO2LK','User',1,NULL,NULL,NULL,NULL,1,1,1,1,'public',1,1,'dark');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `__EFMigrationsHistory`
--

DROP TABLE IF EXISTS `__EFMigrationsHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `__EFMigrationsHistory` (
  `MigrationId` varchar(150) NOT NULL,
  `ProductVersion` varchar(32) NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__EFMigrationsHistory`
--

LOCK TABLES `__EFMigrationsHistory` WRITE;
/*!40000 ALTER TABLE `__EFMigrationsHistory` DISABLE KEYS */;
INSERT INTO `__EFMigrationsHistory` VALUES
('20260121194359_InitialCreate','8.0.13'),
('20260122202847_AddPriceToDoll','8.0.13'),
('20260122204209_AddUsers','8.0.13'),
('20260130020115_AddReleaseYearToDoll','8.0.13'),
('20260130181858_RemovePriceFromDoll','8.0.13'),
('20260130183241_ForceRemovePrice','8.0.13'),
('20260521211547_SyncCurrentSchema','8.0.13');
/*!40000 ALTER TABLE `__EFMigrationsHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'dollab_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-03 11:27:03
