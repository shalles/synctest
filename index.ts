/**
 * 主要针对移动端测试同步命令  一个设备操作同时测试多个设备
 */

import path from 'path';

interface Utils {
  inArray: (item: string, array: string[]) => boolean;
  log: (message: string) => void;
  chalk: { green: (text: string) => string };
  readFile: (filePath: string) => string;
  simpleTemplate: (template: string, data: string) => string;
}

interface Params {
  ext: string;
  cnt: string;
}

interface Config {
  __serverConfig: {
    hostname: string;
    port: string | number;
    protocol: string;
  };
  __utils: Utils;
  exts?: string[];
  vpn?: string;
}

interface Plugin {
  excute: (params: Params) => string;
  init: (config: Config) => void;
}

const plugin: Plugin = {
  excute(parmas: Params) {
    if (utils && utils.inArray(parmas.ext, acceptExtname)) {
      utils.log(utils.chalk.green('[synctest loading]'));
      const syncCommandTop = utils.readFile(path.join(__dirname, './lib/synctest.min.js'));
      const processedSyncCommandTop = utils.simpleTemplate(syncCommandTop, origin + '?appname=synctest');
      parmas.cnt = parmas.cnt.replace(/<head>/, '<head>\n<meta charset="UTF-8">\n<script>' + processedSyncCommandTop + '</script>');
      return parmas.cnt;
    }
    return parmas.cnt;
  },

  init(config: Config) {
    const serverConfig = config.__serverConfig;
    utils = config.__utils;
    acceptExtname = config.exts || ['html', 'htm'];
    origin = (config.vpn || serverConfig.hostname) + ":" + serverConfig.port;
    protocol = serverConfig.protocol;
  }
};

let utils: Utils | undefined;
let acceptExtname: string[] = ['html', 'htm'];
let origin: string = '';
let protocol: string = '';

module.exports = plugin;