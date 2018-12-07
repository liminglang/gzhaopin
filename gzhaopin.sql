SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

DROP DATABASE gzhaopin;
CREATE SCHEMA `gzhaopin` DEFAULT CHARACTER SET utf8mb4;
USE gzhaopin

/*user info table*/
DROP TABLE IF EXISTS `zhaopin_user`;
CREATE TABLE `zhaopin_user` (
    `id` int(11) unsigned not null AUTO_INCREMENT,
    `wxopenid` varchar(64) not null default '',
    `wxnickname` varchar(64) not null default '',
    `avatar` varchar(255) not null default '',
    `gender` tinyint(1) unsigned not null default '0',
    PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=10000000 DEFAULT CHARSET=utf8mb4;

/* job info */
DROP TABLE IF EXISTS `zhaopin_job`;
CREATE TABLE `zhaopin_job` (
    `id` int(11) unsigned not null AUTO_INCREMENT,
    `name` varchar(128) not null default '',
    `company` varchar(128) not null default '',
    `location` varchar(128) not null default '',
    `salary` varchar(64) not null default '',
    `jobtype` varchar(32) not null default '',
    `trequirements` varchar(1024) not null default '',
    `responsibility` varchar(1024) not null default '',
    `bonus` int(11) unsigned not null default '0',
    `count` int(11) unsigned not null default '1',
    `status` tinyint(1) unsigned not null default '0',
    PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

/* share info */
DROP TABLE IF EXISTS `zhaopin_share`;
CREATE TABLE `zhaopin_share` (
    `first` int(11) unsigned not null default '0',
    `jobid` int(11) unsigned not null,
    `userid` int(11) unsigned not null,
    `father` int(11) unsigned not null default '0',
    `optime` int(11) unsigned not null default '0',
    UNIQUE u_index(`userid`, `jobid`),
    INDEX user_index(`userid`),
    PRIMARY KEY(`first`, `jobid`, `userid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

/* user contact     userid指的是最终入职的人；spreaduser指的是分享给入职人的用户，shareuser这条分享链的第一人*/
DROP TABLE IF EXISTS `zhaopin_contact`;
CREATE TABLE `zhaopin_contact` (
    `userid` int(11) unsigned not null default '0',
    `name` varchar(64) not null default '',
    `mail` varchar(128) not null default '',
    `phone` varchar(16) not null default '',
    `weixin` varchar(64) not null default '',
    `jobid` int(11) unsigned not null default '0',
    `spreaduser` int(11) unsigned not null default '0' comment '传播者',
    `shareuser` int(11) unsigned not null default '0' comment '分享者',
    `status` tinyint(1) unsigned not null default '0' comment '应聘结果',
    PRIMARY KEY(`userid`, `jobid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

/* bonus info */
DROP TABLE IF EXISTS `zhaopin_bonushistory`;
CREATE TABLE `zhaopin_bonushistory` (
    `id` int(11) unsigned not null AUTO_INCREMENT,
    `userid` int(11) unsigned not null default '0',
    `jobid` int(11) unsigned not null default '0',
    `first` int(11) unsigned not null default '0',
    `money` int(11) unsigned not null default '0',
    `isaverage` tinyint(1) unsigned not null default '0',
    `addtime` int(11) unsigned not null default '0',
    `status` tinyint(1) unsigned not null default '0' comment '提现状态',
    `deposittime` int(11) unsigned not null default '0' comment '提现时间',
    `adminid` int(11) unsigned not null default '0' comment '管理员ID',
    PRIMARY KEY(`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS=1;


/*第二版数据库修改*/
ALTER TABLE `zhaopin_job`
ADD COLUMN `city` varchar(128) NOT NULL AFTER `status`,

ALTER TABLE `zhaopin_user`
ADD COLUMN `email`  varchar(255) NOT NULL AFTER `gender`,
ADD COLUMN `phone`  varchar(64) NOT NULL AFTER `email`,
ADD COLUMN `birthday`  varchar(64) NOT NULL AFTER `phone`,
ADD COLUMN `address`  varchar(255) NOT NULL AFTER `birthday`,
ADD COLUMN `education`  varchar(64) NOT NULL AFTER `address`,
ADD COLUMN `balance` int(11) DEFAULT '0' AFTER `education`,
ADD COLUMN `name` varchar(64)  DEFAULT '' AFTER `balance`;

ALTER TABLE `zhaopin_share` add constraint `FK_user` foreign key (`userid`) references `zhaopin_user`(`id`);
ALTER TABLE `zhaopin_share` add constraint `FK_job` foreign key (`jobid`) references `zhaopin_job`(`id`);
ALTER TABLE `zhaopin_share` ALTER COLUMN 'userid' DROP DEFAULT;
ALTER TABLE `zhaopin_share` ALTER COLUMN 'jobid' DROP DEFAULT;

DROP TABLE IF EXISTS `zhaopin_bill`;
CREATE TABLE `zhaopin_bill` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(11) NOT NULL DEFAULT '0',
  `reason` varchar(255) DEFAULT '',
  `result` varchar(255) DEFAULT '',
  `created` varchar(16) NOT NULL,
  `status` int(16) NOT NULL,
  `money` int(16) NOT NULL,
  `related_user` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `zhaopin_fankui`;
CREATE TABLE `zhaopin_fankui` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` longtext,
  `created` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;
