import React, { useState, useEffect } from 'react';
import { QueryInput } from './components/QueryInput';
import { TabPanel, type TabKey } from './components/TabPanel';
import { MPPicker } from './components/MPPicker';
import { MPCard } from './components/MPCard';
import { SecondaryPrompt } from './components/SecondaryPrompt';
import { Scale, type ScalePointer } from './components/Scale';
import { CommentaryList } from './components/CommentaryList';
import { DebateSection, type Message } from './components/DebateSection';
import type { MP, MPWithOpinion } from './interfaces/MP';
import { allCommentators, type Commentator } from './interfaces/Commentator';
import SupportBreakdownBar, { type SupportBreakdownCounts } from './components/SupportBreakdownBar';
import './App.css';

const gradientFor = (tab: TabKey) => {
  switch (tab) {
    case 'mp': return 'linear-gradient(to right, #ff8b94, #a8e6cf)';
    case 'commentary': return 'linear-gradient(to right, #dcedc1, #ffd3b6)';
    case 'debate': return 'linear-gradient(to right, #ffaaa5, #ff8b94)';
    case 'stakeholder': return 'linear-gradient(to right, #f6e2b3, #a8e6cf)';
  }
};

const pointersFor = (tab: TabKey): ScalePointer[] => {
  switch (tab) {
    case 'mp': return [];
    case 'commentary':
      return allCommentators.map((c, i) => ({
        id: c.name,
        position: (i + 1) / (allCommentators.length + 1),
      }));
    case 'debate': return [];
    case 'stakeholder': return [];
  }
};

export default function App() {
  const [allMPs, setAllMPs] = useState<MP[]>([]);
  const [opinions, setOpinions] = useState<MPWithOpinion[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [query, setQuery] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [tab, setTab] = useState<TabKey>('mp');
  const [search, setSearch] = useState<string>('');
  const [selectedName, setSelectedName] = useState<string>('');
  const [secondary, setSecondary] = useState<string>('');
  const [followUpResponse, setFollowUpResponse] = useState<string>('');
  const [loadingOpinions, setLoadingOpinions] = useState<boolean>(false);
  const [loadingExplanation, setLoadingExplanation] = useState<boolean>(false);
  const [counts, setCounts] = useState<SupportBreakdownCounts>({
    stronglySupport: 0,
    slightlySupport: 0,
    neutral: 0,
    slightlyDisagree: 0,
    stronglyDisagree: 0,
  });

  const [filteredMPs, setFilteredMPs] = useState<MP[]>([]);
  const [filteredCommentators, setFilteredCommentators] = useState<Commentator[]>(allCommentators);

  useEffect(() => {
    fetch('http://localhost:4000/api/mps')
      .then(res => res.json() as Promise<MP[]>)
      .then(data => {
        setAllMPs(data);
        setFilteredMPs(data);
        if (data.length) setSelectedName(data[0].name);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (tab === 'mp') {
      setFilteredMPs(
        allMPs.filter(mp =>
          mp.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredCommentators(
        allCommentators.filter(c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.associations.toLowerCase().includes(search.toLowerCase()) ||
          c.interests.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, tab, allMPs]);

  const handleQuerySubmit = async (q: string) => {
    setQuery(q);
    setSubmittedQuery(q);
    setLoadingOpinions(true);
    setOpinions([]);
    setExplanation('');
    setTags([]);
    setFollowUpResponse('');

    try {
      const res = await fetch('http://localhost:4000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data: MPWithOpinion[] = await res.json();
      setOpinions(data);
      updateCounts(data);
    } catch (err) {
      console.error('Failed to fetch opinions:', err);
    } finally {
      setLoadingOpinions(false);
    }
  };

  const updateCounts = (mps: MPWithOpinion[]) => {
    const newCounts: SupportBreakdownCounts = {
      stronglySupport: 0,
      slightlySupport: 0,
      neutral: 0,
      slightlyDisagree: 0,
      stronglyDisagree: 0,
    };

    for (const mp of mps) {
      const rating = mp.rating;
      if (rating >= 80) newCounts.stronglySupport++;
      else if (rating >= 60) newCounts.slightlySupport++;
      else if (rating >= 40) newCounts.neutral++;
      else if (rating >= 20) newCounts.slightlyDisagree++;
      else newCounts.stronglyDisagree++;
    }

    setCounts(newCounts);
  };

  useEffect(() => {
    if (!selectedName || !submittedQuery) {
      setExplanation('');
      setTags([]);
      return;
    }
    setLoadingExplanation(true);
    fetch('http://localhost:4000/api/explanation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: selectedName, query: submittedQuery }),
    })
      .then(res => res.json())
      .then((body: { explanation: string; tags: string[] }) => {
        setExplanation(body.explanation);
        setTags(body.tags);
      })
      .catch(err => {
        console.error('Failed to load explanation:', err);
        setExplanation('');
        setTags([]);
      })
      .finally(() => setLoadingExplanation(false));
  }, [selectedName, submittedQuery]);

  const mpsToShow: MPWithOpinion[] = filteredMPs.map(mp => {
    const enriched = opinions.find(o => o.name === mp.name);
    return enriched ?? { ...mp, rating: 0, snippet: '' };
  });

  const selectedMP: MPWithOpinion | null =
    mpsToShow.find(mp => mp.name === selectedName) ?? null;

  const handleSecondarySubmit = async () => {
    if (!secondary.trim() || !selectedMP) return;
    console.log(secondary);

    try {
      const res = await fetch('http://localhost:4000/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedMP.name,
          question: secondary,
        }),
      });
      const data = await res.json();
      setFollowUpResponse(data.response);
    } catch (err) {
      console.error('Follow-up failed:', err);
      setFollowUpResponse('⚠️ Failed to get a response.');
    } finally {
      setSecondary('');
    }
  };

  const debateMessages: Message[] = [
    { id: '1', sender: allCommentators[0].name, senderType: 'commentator', text: 'I believe this policy is overdue.' },
    { id: '2', sender: allCommentators[1].name, senderType: 'commentator', text: 'Policy needs refinement for minority groups.' },
  ];

  const debateParticipantsCommentary = filteredCommentators.map((c, i) => ({
    ...c,
    position: (i + 1) / (filteredCommentators.length + 1),
  }));
  const debateParticipantsMP = mpsToShow.map((m, i) => ({
    ...m,
    position: (i + 1) / (mpsToShow.length + 1),
  }));

  return (
    <div className="app-container">
      <header className="app-header">
        <h2 className="app-title">PARLLMENT</h2>
        <QueryInput
          value={query}
          onChange={setQuery}
          onSubmit={handleQuerySubmit}
        />
      </header>

      <main className="app-main">
        <section className="left-panel">
          <TabPanel active={tab} onChange={setTab} onSearch={setSearch}>
            {tab === 'mp' && (
              <MPPicker
                mps={mpsToShow}
                selected={selectedMP}
                onSelect={mp => setSelectedName(mp.name)}
              />
            )}
            {tab === 'commentary' && (
              <CommentaryList commentators={filteredCommentators} />
            )}
            {tab === 'debate' && (
              <DebateSection
                mode="commentary"
                messages={debateMessages}
                participants={debateParticipantsCommentary}
                gradient={gradientFor(tab)}
              />
            )}
            {tab === 'stakeholder' && <div>Stakeholders UI…</div>}
          </TabPanel>
        </section>

        <aside className="right-panel">
          {loadingOpinions && <p>Loading opinions…</p>}
          {selectedMP && (
            <MPCard
              mp={selectedMP}
              explanation={explanation}
              tags={tags}
              followUpQ={secondary}
              followUpResponse={followUpResponse}
            />
          )}
          {loadingExplanation && <p>Loading detailed explanation…</p>}
        </aside>
      </main>

      <SupportBreakdownBar counts={counts} />

      <footer className="app-footer">
        <SecondaryPrompt
          value={secondary}
          onChange={setSecondary}
          onSubmit={handleSecondarySubmit}
        />
      </footer>
    </div>
  );
}
