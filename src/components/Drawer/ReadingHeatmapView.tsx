import React, { useMemo } from 'react';
import { Calendar, Flame, Clock, BookOpen, Trophy, Sparkles } from 'lucide-react';

interface ReadingHeatmapViewProps {
  todayReadingMinutes: number;
}

export const ReadingHeatmapView: React.FC<ReadingHeatmapViewProps> = ({ todayReadingMinutes }) => {
  // Generate 52 weeks of dates (past 364 days + today)
  const heatmapData = useMemo(() => {
    const days: { date: string; dayOfWeek: number; minutes: number; level: number }[] = [];
    const today = new Date();

    let totalMinutesAllTime = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let totalDaysRead = 0;

    for (let i = 363; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday...

      let minutes = 0;
      try {
        const val = localStorage.getItem(`moyu_reading_${dateStr}`);
        if (val) {
          minutes = Math.round(parseInt(val, 10) / 60);
        }
      } catch {}

      if (i === 0 && todayReadingMinutes > 0) {
        minutes = Math.max(minutes, todayReadingMinutes);
      }

      totalMinutesAllTime += minutes;

      let level = 0;
      if (minutes >= 60) level = 4;
      else if (minutes >= 30) level = 3;
      else if (minutes >= 15) level = 2;
      else if (minutes > 0) level = 1;

      if (minutes > 0) {
        totalDaysRead++;
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }

      days.push({
        date: dateStr,
        dayOfWeek: dayOfWeek === 0 ? 6 : dayOfWeek - 1, // 0 = Mon, 6 = Sun
        minutes,
        level
      });
    }

    // Current Streak counting back from today
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].minutes > 0) {
        currentStreak++;
      } else if (i === days.length - 1) {
        // Today might not have reading yet, check yesterday
        continue;
      } else {
        break;
      }
    }

    // Group into 52 columns (weeks)
    const weeks: typeof days[] = [];
    let currentWeek: typeof days = [];

    days.forEach((day, index) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6 || index === days.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return {
      weeks,
      totalMinutesAllTime,
      currentStreak,
      maxStreak,
      totalDaysRead
    };
  }, [todayReadingMinutes]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'rgba(16, 185, 129, 0.35)';
      case 2:
        return 'rgba(16, 185, 129, 0.6)';
      case 3:
        return 'rgba(16, 185, 129, 0.85)';
      case 4:
        return '#10b981';
      default:
        return 'var(--glass-surface-hover)';
    }
  };

  const totalHours = (heatmapData.totalMinutesAllTime / 60).toFixed(1);
  const estimatedWords = (heatmapData.totalMinutesAllTime * 400).toLocaleString();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 0px', minHeight: 0, overflowY: 'auto', gap: '12px', padding: '2px 2px 36px 2px', boxSizing: 'border-box' }} className="smooth-scroll tauri-no-drag">
      {/* Top 4 KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div
          className="frosted-card"
          style={{
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--glass-surface)'
          }}
        >
          <div style={{ padding: '7px', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '10px', color: 'var(--accent-color)' }}>
            <Clock size={16} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>今日摸鱼时长</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {todayReadingMinutes} <span style={{ fontSize: '11px', fontWeight: 400 }}>分钟</span>
            </div>
          </div>
        </div>

        <div
          className="frosted-card"
          style={{
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--glass-surface)'
          }}
        >
          <div style={{ padding: '7px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '10px', color: '#ef4444' }}>
            <Flame size={16} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>连续阅读打卡</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {heatmapData.currentStreak} <span style={{ fontSize: '11px', fontWeight: 400 }}>天</span>
            </div>
          </div>
        </div>

        <div
          className="frosted-card"
          style={{
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--glass-surface)'
          }}
        >
          <div style={{ padding: '7px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px', color: '#10b981' }}>
            <Trophy size={16} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>年度累计阅读</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {totalHours} <span style={{ fontSize: '11px', fontWeight: 400 }}>小时</span>
            </div>
          </div>
        </div>

        <div
          className="frosted-card"
          style={{
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--glass-surface)'
          }}
        >
          <div style={{ padding: '7px', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '10px', color: '#a855f7' }}>
            <BookOpen size={16} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>预估阅读字数</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {estimatedWords} <span style={{ fontSize: '11px', fontWeight: 400 }}>字</span>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Style Heatmap Grid Card */}
      <div
        className="frosted-card"
        style={{
          padding: '14px',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'var(--glass-surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
            <Calendar size={14} style={{ color: 'var(--accent-color)' }} />
            <span>365 天摸鱼阅读热力图</span>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
            <span>少</span>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: getLevelColor(0) }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: getLevelColor(1) }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: getLevelColor(2) }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: getLevelColor(3) }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: getLevelColor(4) }} />
            <span>多</span>
          </div>
        </div>

        {/* 52 Columns Grid with Horizontal Scrolling */}
        <div
          className="smooth-scroll"
          style={{
            display: 'flex',
            gap: '3px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}
        >
          {heatmapData.weeks.map((week, wIdx) => (
            <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {week.map((day) => (
                <div
                  key={day.date}
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '2px',
                    background: getLevelColor(day.level),
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease'
                  }}
                  data-tooltip={`${day.date}: 阅读 ${day.minutes} 分钟`}
                  data-tooltip-pos="bottom"
                />
              ))}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', paddingTop: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="var(--accent-color)" />
            <span>最长连续阅读记录: <strong>{heatmapData.maxStreak}</strong> 天</span>
          </div>
          <span>共打卡 {heatmapData.totalDaysRead} 天</span>
        </div>
      </div>
    </div>
  );
};
