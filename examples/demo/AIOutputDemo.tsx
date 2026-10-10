import { useEffect, useState } from 'react';
import { AIActivity, AIResponse, Button, InternalScrollArea, ToolVisibilityContext } from '../../src';

export const aiFixture = '有可能表现不同，但通常不是 `sleep_for` 的标准语义变了。\n\n`std::this_thread::sleep_for()` 只保证休眠时间不小于指定时长。👩🏽‍💻\n\n### 影响因素\n\n- STL / runtime 实现\n- Windows 系统计时器分辨率\n  - `timeBeginPeriod` 与实际负载\n\n> 使用 `std::chrono::steady_clock` 实测。\n\n```cpp\nstd::this_thread::sleep_for(400ms);\nauto elapsed = steady_clock::now() - start;\n```\n\n| Version | Observation |\n| --- | --- |\n| VS2017 | Timing depends on the runtime |\n| VS2022 | Verify with the same workload |\n\n[Reference](https://en.cppreference.com/w/cpp/thread/sleep_for)';

/** Synthetic, repeatable AI states; no model or account is connected. */
export function AIOutputDemo() {
  const [scenario, setScenario] = useState('waiting');
  const [run, setRun] = useState(0);
  const [content, setContent] = useState('');
  const [mounted, setMounted] = useState(true);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (scenario !== 'streaming') return;
    setContent('');
    let offset = 0;
    const parts = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(aiFixture), x => x.segment);
    const timer = setInterval(() => { offset += 9; setContent(parts.slice(0, offset).join('')); if (offset >= parts.length) clearInterval(timer); }, 35);
    return () => clearInterval(timer);
  }, [scenario, run]);
  const output = ['streaming', 'cancelled', 'failed'].includes(scenario) ? content : scenario === 'waiting' || scenario === 'processing' ? '' : scenario === 'long' ? Array(18).fill(aiFixture).join('\n\n') : aiFixture;
  return <main style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 24, gap: 16 }}>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {['waiting', 'processing', 'streaming', 'complete', 'long', 'cancelled', 'failed', 'history'].map(value => <Button key={value} actionId={`demo.ai.${value}`} onClick={() => { setContent(value === 'streaming' ? '' : output); setScenario(value); if (value !== 'cancelled' && value !== 'failed') setRun(v => v + 1); }}>{value}</Button>)}
      <Button actionId="demo.ai.remount" onClick={() => setMounted(v => !v)}>Toggle mount</Button>
      <Button actionId="demo.ai.hide" onClick={() => setHidden(v => !v)}>Toggle visibility</Button>
    </div>
    <InternalScrollArea style={{ flex: 1, minHeight: 0 }}>
      {scenario === 'waiting' || scenario === 'processing' ? <AIActivity>{scenario === 'waiting' ? 'Replying' : 'Analyzing sources'}</AIActivity> : null}
      <ToolVisibilityContext.Provider value={!hidden}>
        {mounted && <div style={{ maxWidth: 760 }}><AIResponse responseId={`demo-${run}`} content={output} animate={scenario !== 'history'} state={scenario === 'streaming' && content !== aiFixture ? 'streaming' : scenario === 'cancelled' ? 'cancelled' : scenario === 'failed' ? 'failed' : 'complete'} /></div>}
      </ToolVisibilityContext.Provider>
    </InternalScrollArea>
  </main>;
}
