import axios from 'axios';

// 定义仓库 (repo) 数据的类型
export interface Repo {
  name: string; // 仓库名称
  upstream: string; // 上游地址
  syncing: boolean; // 是否正在同步
  size: number; // 仓库大小
  exitCode: number; // 最后退出代码
  lastSuccess: number; // 上次成功的时间戳
  updatedAt: number; // 最近更新时间
  prevRun: number; // 上次运行的时间戳
  nextRun: number; // 下次运行的时间戳
}

const YUKI_URL = process.env.YUKI_URL || "";

export const fetchRepos = async () => {
  return axios.get(`${YUKI_URL}/api/v1/metas`);
};

export const syncRepo = async (repoName: string) => {
  return axios.post(`${YUKI_URL}/api/v1/repos/${repoName}/sync`);
};