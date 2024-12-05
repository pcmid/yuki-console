/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
import { fetchRepos, Repo, syncRepo } from './api';
import styled from '@emotion/styled';

const App: React.FC = () => {
    const [repos, setRepos] = useState<Repo[]>([]); // 状态保存仓库数据
    const [loading, setLoading] = useState<boolean>(true); // 状态保存加载状态
    const [syncingRepos, setSyncingRepos] = useState<Set<string>>(new Set()); // 使用 Set 存储正在同步的仓库名

    useEffect(() => {
        // 初次加载时获取仓库数据
        fetchRepos()
            .then(response => {
                console.log(response.data);
                setRepos(response.data); // 设置仓库数据
                setLoading(false); // 设置加载状态为已完成
            })
            .catch(error => {
                console.error('Error fetching repo data:', error);
                setLoading(false); // 即使发生错误，设置加载状态为已完成
            });

        // 设置轮询间隔（例如每 5 秒获取一次仓库状态）
        const interval = setInterval(() => {
            fetchRepos()
                .then(response => {
                    setRepos(response.data); // 更新仓库数据
                })
                .catch(error => {
                    console.error('Error fetching repo data during polling:', error);
                });
        }, 5000); // 每 5 秒请求一次仓库状态

        // 清理定时器
        return () => clearInterval(interval);

    }, []); // 只在组件挂载时执行一次

    // 同步仓库
    const handleSync = (repoName: string) => {
        setSyncingRepos(prev => new Set(prev).add(repoName)); // 将仓库名添加到正在同步的集合中
        syncRepo(repoName)
            .then(response => {
                console.log(`Repository ${repoName} synced successfully!`);
                // 同步完成后更新仓库列表
                setRepos(prevRepos => prevRepos.map(repo =>
                    repo.name === repoName ? { ...repo, syncing: false } : repo
                ));
                setSyncingRepos(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(repoName); // 同步完成后移除仓库名
                    return newSet;
                });
            })
            .catch(error => {
                console.error(`Error syncing repository ${repoName}:`, error);
                setSyncingRepos(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(repoName); // 同步失败也移除仓库名
                    return newSet;
                });
            });
    };

    if (loading) {
        return <LoadingDiv>Loading...</LoadingDiv>;
    }

    return (
        <Container>
            <Title>仓库列表</Title>
            <Table>
                <thead>
                <TableRow>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Upstream</TableHeader>
                    <TableHeader>Syncing</TableHeader>
                    <TableHeader>Last Success</TableHeader>
                    <TableHeader>Next Run</TableHeader>
                    <TableHeader>Actions</TableHeader> {/* 添加操作列 */}
                </TableRow>
                </thead>
                <tbody>
                {repos.map(repo => (
                    <TableRow key={repo.name}>
                        <TableCell>{repo.name}</TableCell>
                        <TableCell>{repo.upstream}</TableCell>
                        <TableCell>{repo.syncing ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{new Date(repo.lastSuccess * 1000).toLocaleString()}</TableCell>
                        <TableCell>{new Date(repo.nextRun * 1000).toLocaleString()}</TableCell>
                        <TableCell>
                            <SyncButton
                                onClick={() => handleSync(repo.name)}
                                disabled={syncingRepos.has(repo.name) || repo.syncing} // 如果该仓库正在同步，禁用按钮
                            >
                                {syncingRepos.has(repo.name) ? 'Syncing...' : 'Sync'}
                            </SyncButton>
                        </TableCell>
                    </TableRow>
                ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default App;

// Emotion 样式定义
const Container = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f9f9f9;
`;

const Title = styled.h1`
  font-size: 24px;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

const LoadingDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: #666;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  table-layout: auto; /* 让列宽根据内容自动调整 */
`;

const TableRow = styled.tr`
  &:nth-of-type(odd) {
    background-color: #f2f2f2;
  }
`;

const TableHeader = styled.th`
  border: 1px solid #ddd;
  text-align: left;
  padding: 8px;
  background-color: #007bff;
  color: white;
`;

const TableCell = styled.td`
  border: 1px solid #ddd;
  text-align: left;
  padding: 8px;
  color: #333;
  font-size: 14px;
  white-space: nowrap; /* 防止单元格文本换行，保持内容在一行显示 */
`;

const SyncButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  &:hover {
    background-color: #0056b3;
  }
`;
