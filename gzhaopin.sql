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
    `jobid` int(11) unsigned not null default '0',
    `userid` int(11) unsigned not null default '0',
    `father` int(11) unsigned not null default '0',
    `optime` int(11) unsigned not null default '0',
    UNIQUE u_index(`userid`, `jobid`),
    INDEX user_index(`userid`),
    PRIMARY KEY(`first`, `jobid`, `userid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

/* user contact */
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
