import { ModuleData, ModuleId } from '../types/socMasterLab';
import { module01Prerequisites } from './modules/module01_prerequisites';
import { module02Elasticsearch } from './modules/module02_elasticsearch';
import { module03Logstash } from './modules/module03_logstash';
import { module04Kibana } from './modules/module04_kibana';
import { module05Filebeat } from './modules/module05_filebeat';
import { module06Suricata } from './modules/module06_suricata';
import { module07HardenVerify } from './modules/module07_harden_verify';

export const ALL_CORE_MODULES: ModuleData[] = [
  module01Prerequisites,
  module02Elasticsearch,
  module03Logstash,
  module04Kibana,
  module05Filebeat,
  module06Suricata,
  module07HardenVerify,
];

export const MODULES_BY_ID: Record<string, ModuleData> = {
  prerequisites: module01Prerequisites,
  elasticsearch: module02Elasticsearch,
  logstash: module03Logstash,
  kibana: module04Kibana,
  filebeat: module05Filebeat,
  suricata: module06Suricata,
  'harden-verify': module07HardenVerify,
};

export const getModuleById = (id: ModuleId | string): ModuleData | undefined => {
  return MODULES_BY_ID[id];
};
