SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0; 

use gzhaopin;

BEGIN;
INSERT INTO `zhaopin_job` values(1, '网页前端开发工程师', '巨人网络','中辰路699', '1~2','全职', '1.1年以上微信小程序开发经验或2年以上前端开发经验\n2.熟练掌握Js、html5、CSS、Jquery，Vue等技术\n3.工作积极主动，具备一定的抗压能力和较强的执行力', '1.前端开发', 2000, 1, 0);
INSERT INTO `zhaopin_job` values(2, 'APP策划工程师', '巨人网络','中辰路699', '1~2','全职', '1.2年以上互联网行业从业经验，对微信小程序或APP有一定的策划经验\n2.具备一定的数据分析能力，对市场风向有较高的敏锐度\n3.工作积极主动，具备一定的抗压能力和较强的执行力', '1.APP策划', 2000, 1, 0);
INSERT INTO `zhaopin_job` values(3, '游戏服务器工程师', '巨人网络','中辰路699', '1~2','全职', '1.c++\n2.go', '1.服务器开发\n2.引擎优化', 2000, 1, 0);
INSERT INTO `zhaopin_job` values(4, '游戏客户端工程师', '巨人网络','中辰路699', '1~2','全职', '1.c++\n2.go', '1.服务器开发\n2.引擎优化', 2000, 1, 0);
INSERT INTO `zhaopin_job` values(5, '美术', '巨人网络','中辰路699', '1~2','全职', '1.c++\n2.go', '1.服务器开发\n2.引擎优化', 2000, 1, 0);
INSERT INTO `zhaopin_job` values(6, '策划', '巨人网络','中辰路699', '1~2','全职', '1.c++\n2.go', '1.服务器开发\n2.引擎优化', 2000, 1, 0);
COMMIT;

-- BEGIN; -- release data
-- INSERT INTO `zhaopin_job` values(1, '网页前端开发工程师', '巨人网络','中辰路699', '1~2','全职', '1.1年以上微信小程序开发经验或2年以上前端开发经验\n2.熟练掌握Js、html5、CSS、Jquery，Vue等技术\n3.工作积极主动，具备一定的抗压能力和较强的执行力', '1.前端开发', 2000, 1, 0);
-- INSERT INTO `zhaopin_job` values(2, 'APP策划工程师', '巨人网络','中辰路699', '1~2','全职', '1.2年以上互联网行业从业经验，对微信小程序或APP有一定的策划经验\n2.具备一定的数据分析能力，对市场风向有较高的敏锐度\n3.工作积极主动，具备一定的抗压能力和较强的执行力', '1.APP策划', 2000, 1, 0);
-- COMMIT;


-- BEGIN;
-- INSERT INTO `zhaopin_share` values(1, 5, 1, 0, 1537546013);
-- INSERT INTO `zhaopin_share` values(1, 5, 2, 1, 1537546013);
-- INSERT INTO `zhaopin_share` values(1, 5, 3, 2, 1537546013);
-- INSERT INTO `zhaopin_share` values(1, 5, 4, 3, 1537546013);
-- INSERT INTO `zhaopin_share` values(1, 5, 5, 4, 1537546013);
-- INSERT INTO `zhaopin_share` values(1, 5, 6, 5, 1537546013);
-- INSERT INTO `zhaopin_share` values(1, 5, 7, 2, 1537546013);
-- INSERT INTO `zhaopin_share` values(1, 5, 8, 3, 1537546013);
-- INSERT INTO `zhaopin_share` values(1, 5, 9, 8, 1537546013);
-- INSERT INTO `zhaopin_share` values(1, 5, 10, 9, 1537546013);
-- COMMIT;

-- BEGIN:
-- INSERT INTO `zhaopin_contact` values(11, '42', '42@glaxy.com', '10086', 'glaxy', 5, 6, 1, 0);
-- COMMIT:


SET FOREIGN_KEY_CHECKS = 1; 
