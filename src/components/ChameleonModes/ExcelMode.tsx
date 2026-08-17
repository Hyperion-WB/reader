import React, { useState, useEffect } from 'react';
import { Chapter } from '../../types/reader';

interface ExcelModeProps {
  currentChapter?: Chapter;
  onExit: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
}

export const ExcelMode: React.FC<ExcelModeProps> = ({
  currentChapter,
  onExit,
  onNextChapter,
  onPrevChapter
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 1, col: 1 });
  const [pageOffset, setPageOffset] = useState(0);

  const paragraphs = currentChapter?.content
    ? currentChapter.content
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : ['(本章暂无数据)'];

  const rowsPerPage = 20;
  const currentSlice = paragraphs.slice(pageOffset, pageOffset + rowsPerPage);

  const activeText = currentSlice[selectedCell.row - 1] || '=SUM(D2:D18)';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      } else if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (selectedCell.row < currentSlice.length) {
          setSelectedCell((prev) => ({ ...prev, row: prev.row + 1 }));
        } else if (pageOffset + rowsPerPage < paragraphs.length) {
          setPageOffset((prev) => prev + rowsPerPage);
          setSelectedCell({ row: 1, col: 1 });
        } else {
          onNextChapter();
          setPageOffset(0);
          setSelectedCell({ row: 1, col: 1 });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedCell.row > 1) {
          setSelectedCell((prev) => ({ ...prev, row: prev.row - 1 }));
        } else if (pageOffset > 0) {
          setPageOffset((prev) => Math.max(0, prev - rowsPerPage));
          setSelectedCell({ row: rowsPerPage, col: 1 });
        } else {
          onPrevChapter();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, pageOffset, paragraphs, currentSlice.length, onExit, onNextChapter, onPrevChapter]);

  const excelTabs = ['文件', '开始', '插入', '页面布局', '公式', '数据', '审阅', '视图', '帮助'];

  const fakeData = [
    { a: '001', b: '技术研发中心', c: '核心算法迭代优化', e: '98.5%', f: '王工' },
    { a: '002', b: '市场运营部', c: 'Q3渠道推广转化率', e: '104.2%', f: '李总监' },
    { a: '003', b: '产品企划部', c: '新版功能灰度测试', e: '89.0%', f: '张经理' },
    { a: '004', b: '财务风控中心', c: '企业年度预算合规核查', e: '100.0%', f: '陈会计' },
    { a: '005', b: '人力资源中心', c: '核心岗位绩效评估', e: '95.4%', f: '刘主管' },
    { a: '006', b: '商务拓展部', c: '战略合作伙伴签约', e: '92.0%', f: '赵总' },
    { a: '007', b: '系统运维部', c: '服务器集群负载均衡', e: '99.9%', f: '孙工程师' }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        background: '#ffffff',
        color: '#222222',
        fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
        fontSize: '12px',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Top Green Ribbon Header */}
      <div
        data-tauri-drag-region="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#107c41',
          color: '#ffffff',
          height: '32px',
          padding: '0 12px',
          fontSize: '12px'
        }}
      >
        <div data-tauri-drag-region="true" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, background: '#0b5a2f', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>自动保存 [开启]</span>
          <span style={{ fontWeight: 500 }}>2026年度业务营收与关键指标追踪表_最终版.xlsx - Excel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={onExit}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              padding: '2px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            退出伪装 (Esc)
          </button>
        </div>
      </div>

      {/* Ribbon Navigation Menu Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '4px 16px',
          background: '#f3f2f1',
          borderBottom: '1px solid #e1dfdd',
          fontSize: '12px'
        }}
      >
        {excelTabs.map((tab, idx) => (
          <span
            key={idx}
            style={{
              fontWeight: idx === 1 ? 600 : 400,
              color: idx === 1 ? '#107c41' : '#323130',
              borderBottom: idx === 1 ? '2px solid #107c41' : 'none',
              padding: '4px 2px',
              cursor: 'pointer'
            }}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Formula Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 10px',
          background: '#ffffff',
          borderBottom: '1px solid #e1dfdd',
          gap: '8px',
          fontSize: '12px'
        }}
      >
        <span
          style={{
            padding: '2px 8px',
            border: '1px solid #d2d0ce',
            borderRadius: '2px',
            background: '#faf9f8',
            fontFamily: 'Consolas, monospace',
            minWidth: '38px',
            textAlign: 'center'
          }}
        >
          D{selectedCell.row + 1}
        </span>
        <span style={{ color: '#8a8886', fontStyle: 'italic', fontWeight: 700 }}>fx</span>
        <div
          style={{
            flex: 1,
            padding: '3px 8px',
            border: '1px solid #d2d0ce',
            background: '#ffffff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: '#107c41',
            fontFamily: 'Consolas, "Microsoft YaHei", monospace',
            fontSize: '12px'
          }}
        >
          {activeText}
        </div>
      </div>

      {/* Spreadsheet Main Grid */}
      <div style={{ flex: 1, overflow: 'auto', background: '#ffffff' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
            fontSize: '12px'
          }}
        >
          <thead>
            <tr style={{ background: '#f3f2f1', color: '#605e5c' }}>
              <th style={{ width: '42px', border: '1px solid #e1dfdd', padding: '3px 6px' }}></th>
              <th style={{ width: '55px', border: '1px solid #e1dfdd', padding: '3px 6px' }}>A (序号)</th>
              <th style={{ width: '120px', border: '1px solid #e1dfdd', padding: '3px 6px' }}>B (责任部门)</th>
              <th style={{ width: '150px', border: '1px solid #e1dfdd', padding: '3px 6px' }}>C (核心业务指标)</th>
              <th style={{ minWidth: '420px', border: '1px solid #e1dfdd', padding: '3px 6px', textAlign: 'left' }}>
                D (当前工作进展与分析说明 / 小说正文)
              </th>
              <th style={{ width: '80px', border: '1px solid #e1dfdd', padding: '3px 6px' }}>E (达成率)</th>
              <th style={{ width: '75px', border: '1px solid #e1dfdd', padding: '3px 6px' }}>F (负责人)</th>
            </tr>
          </thead>
          <tbody>
            {currentSlice.map((para, idx) => {
              const rowNum = idx + 1;
              const isSelected = selectedCell.row === rowNum;
              const mock = fakeData[idx % fakeData.length];

              return (
                <tr
                  key={idx}
                  onClick={() => setSelectedCell({ row: rowNum, col: 1 })}
                  style={{
                    background: isSelected ? '#e8f5e9' : rowNum % 2 === 0 ? '#faf9f8' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <td
                    style={{
                      border: '1px solid #e1dfdd',
                      textAlign: 'center',
                      background: isSelected ? '#c8e6c9' : '#f3f2f1',
                      color: isSelected ? '#1b5e20' : '#605e5c',
                      fontWeight: isSelected ? 700 : 400
                    }}
                  >
                    {rowNum + 1}
                  </td>
                  <td style={{ border: '1px solid #e1dfdd', padding: '3px 6px', textAlign: 'center', color: '#605e5c' }}>
                    {mock.a}
                  </td>
                  <td style={{ border: '1px solid #e1dfdd', padding: '3px 6px', color: '#323130' }}>
                    {mock.b}
                  </td>
                  <td style={{ border: '1px solid #e1dfdd', padding: '3px 6px', color: '#323130' }}>
                    {mock.c}
                  </td>
                  <td
                    style={{
                      border: isSelected ? '2px solid #107c41' : '1px solid #e1dfdd',
                      padding: '3px 8px',
                      color: isSelected ? '#107c41' : '#201f1e',
                      fontWeight: isSelected ? 600 : 400,
                      lineHeight: '1.4'
                    }}
                  >
                    {para}
                  </td>
                  <td style={{ border: '1px solid #e1dfdd', padding: '3px 6px', textAlign: 'center', color: '#107c41', fontWeight: 600 }}>
                    {mock.e}
                  </td>
                  <td style={{ border: '1px solid #e1dfdd', padding: '3px 6px', textAlign: 'center', color: '#605e5c' }}>
                    {mock.f}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Excel Bottom Sheets & Status Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f3f2f1',
          borderTop: '1px solid #e1dfdd',
          padding: '2px 12px',
          fontSize: '11.5px',
          color: '#605e5c'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <div
            style={{
              padding: '3px 12px',
              background: '#ffffff',
              borderTop: '2px solid #107c41',
              color: '#107c41',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sheet1 - 季度运营分析汇总
          </div>
          <div style={{ padding: '3px 12px', color: '#605e5c', cursor: 'pointer' }}>
            Sheet2 - 财务预算核算表
          </div>
          <div style={{ padding: '3px 12px', color: '#605e5c', cursor: 'pointer' }}>
            Sheet3 - 部门人员编制统计
          </div>
          <span style={{ color: '#107c41', fontWeight: 700, padding: '0 4px', cursor: 'pointer' }}>+</span>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          <span>就绪</span>
          <span>计数: {paragraphs.length}</span>
          <span>平均值: 98.6%</span>
          <span>求和: 542,800.00</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};
