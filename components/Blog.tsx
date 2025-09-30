/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { CrownIcon, FlameIcon } from './icons';

// --- MOCK DATA ---

const posts = [
    { id: 1, title: 'The Rise of Gorpcore: From Hiking Trails to High Fashion', author: 'Alex Chen', date: 'Oct 2, 2023', excerpt: 'Explore how technical outdoor gear, once confined to mountain trails, has now stormed the city streets and runways, defining a new era of functional fashion.', imageUrl: 'https://picsum.photos/seed/blog1/800/600' },
    { id: 2, title: 'Sneakerhead Culture: More Than Just Shoes', author: 'Mia Rodriguez', date: 'Sep 15, 2023', excerpt: 'A deep dive into the community, the history, and the billion-dollar resale market that fuels the global obsession with sneakers.', imageUrl: 'https://picsum.photos/seed/blog2/800/600' },
    { id: 3, title: 'Decoding Archival Fashion: Why Old is the New New', author: 'Leo Kim', date: 'Aug 28, 2023', excerpt: 'From vintage Raf Simons to classic Helmut Lang, we unpack the growing trend of collecting and wearing pieces from iconic past collections.', imageUrl: 'https://picsum.photos/seed/blog3/800/600' },
];

const fitRanks = [
    { id: 3, artist: 'Kid Chrome', fitCost: 7600, rating: 9.8, imageUrl: 'https://picsum.photos/seed/fit3/600/800' },
    { id: 1, artist: 'Yung Drip', fitCost: 4250, rating: 9.5, imageUrl: 'https://picsum.photos/seed/fit1/600/800' },
    { id: 2, artist: 'Lila Stylez', fitCost: 2800, rating: 8.9, imageUrl: 'https://picsum.photos/seed/fit2/600/800' },
];

const dripWarsMatchup = {
  contestantA: { id: 'a', name: 'Metro Flex', imageUrl: 'https://picsum.photos/seed/dripA/600/800', initialVotes: 1204 },
  contestantB: { id: 'b', name: 'Uptown Ace', imageUrl: 'https://picsum.photos/seed/dripB/600/800', initialVotes: 987 },
};

const leaderboard = [
  { rank: 1, name: 'Metro Flex', score: 15, avatarUrl: 'https://picsum.photos/seed/dripA/100/100' },
  { rank: 2, name: 'Vanta Black', score: 12, avatarUrl: 'https://picsum.photos/seed/leader2/100/100' },
  { rank: 3, name: 'Uptown Ace', score: 11, avatarUrl: 'https://picsum.photos/seed/dripB/100/100' },
  { rank: 4, name: 'Lila Stylez', score: 9, avatarUrl: 'https://picsum.photos/seed/fit2/100/100' },
  { rank: 5, name: 'Kid Chrome', score: 7, avatarUrl: 'https://picsum.photos/seed/fit3/100/100' },
];


// --- SECTION COMPONENTS ---

const TheLog: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-12 max-w-4xl mx-auto">
        {posts.map((post, index) => (
            <motion.div
                key={post.id}
                className="group flex flex-col md:flex-row items-center gap-8"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
            >
                <div className="w-full md:w-1/2 lg:w-2/5 flex-shrink-0 overflow-hidden rounded-lg">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                </div>
                <div>
                    <p className="text-sm text-gray-400 mb-2">{post.author} &middot; {post.date}</p>
                    <h2 className="text-2xl font-semibold font-serif text-white mb-3 group-hover:text-gray-300 transition-colors">{post.title}</h2>
                    <p className="text-gray-300 leading-relaxed">{post.excerpt}</p>
                    <a href="#" className="inline-block text-white font-semibold mt-4 relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bottom-0 after:left-0 after:bg-white after:origin-bottom-right after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:ease-out after:duration-300">Read More &rarr;</a>
                </div>
            </motion.div>
        ))}
    </div>
);

const FitRankings: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {fitRanks.map((rank, index) => (
            <motion.div
                key={rank.id}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
            >
                <div className="relative aspect-[3/4] bg-gray-800/30 rounded-lg overflow-hidden border border-gray-800/80 shadow-lg transition-all duration-300 group-hover:shadow-yellow-400/20 group-hover:border-gray-700">
                    <img src={rank.imageUrl} alt={rank.artist} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    
                    <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-2xl font-bold font-serif drop-shadow-lg">{rank.artist}</h3>
                        <p className="text-sm font-semibold text-green-400 drop-shadow-md">${rank.fitCost.toLocaleString()}</p>
                    </div>

                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full w-20 h-20 flex flex-col items-center justify-center border-2 border-yellow-400/80 shadow-xl">
                        <span className="text-3xl font-bold text-yellow-400 font-serif">{rank.rating}</span>
                        <span className="text-xs uppercase tracking-widest text-gray-300">Score</span>
                    </div>
                </div>
            </motion.div>
        ))}
    </div>
);

// A component to animate a number with a spring effect
const SpringyNumber: React.FC<{ value: number; format: (val: number) => string; }> = ({ value, format }) => {
    const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => format(current));

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return <motion.span>{display}</motion.span>;
};

const DripWars: React.FC = () => {
    const [votes, setVotes] = useState({ a: dripWarsMatchup.contestantA.initialVotes, b: dripWarsMatchup.contestantB.initialVotes });
    const [votedFor, setVotedFor] = useState<string | null>(null);

    const handleVote = (contestantId: 'a' | 'b') => {
        if (votedFor) return;
        setVotedFor(contestantId);
        setVotes(prev => ({ ...prev, [contestantId]: prev[contestantId] + 1 }));
    };

    const totalVotes = votes.a + votes.b;
    const percentA = totalVotes > 0 ? (votes.a / totalVotes) * 100 : 50;
    const percentB = totalVotes > 0 ? (votes.b / totalVotes) * 100 : 50;

    interface ContestantCardProps {
      contestant: {
        name: string;
        imageUrl: string;
        votes: number;
      };
      onVote: () => void;
      voted: boolean;
      percentage: number;
      isWinner: boolean;
    }

    const ContestantCard: React.FC<ContestantCardProps> = ({ contestant, onVote, voted, percentage, isWinner }) => (
         <div className={`relative group transition-all duration-300 ${voted && isWinner ? 'scale-105' : ''} ${voted && !isWinner ? 'opacity-60' : ''}`}>
            <div className={`relative aspect-[3/4] bg-gray-800/30 rounded-lg overflow-hidden border-2 transition-colors duration-300 ${voted && isWinner ? 'border-green-400' : 'border-gray-800'}`}>
                <img src={contestant.imageUrl} alt={contestant.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                     <h3 className="text-2xl font-bold font-serif text-white">{contestant.name}</h3>
                </div>
            </div>
            {!voted ? (
                <button onClick={onVote} className="mt-4 w-full py-3 bg-white text-black font-semibold rounded-md hover:bg-gray-300 transition-transform active:scale-95">Vote</button>
            ) : (
                <div className="mt-4 text-center">
                    <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <motion.div 
                            className="bg-green-500 h-2.5 rounded-full" 
                            initial={{ width: '0%' }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ type: 'spring', stiffness: 50, damping: 15, duration: 1.5 }}
                        />
                    </div>
                    <p className="mt-2 text-lg font-bold">
                        <SpringyNumber value={percentage} format={(v) => v.toFixed(1)} />%
                        <span className="text-sm font-normal text-gray-400">
                           {' '}(<SpringyNumber value={contestant.votes} format={(v) => Math.round(v).toLocaleString()} /> votes)
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-serif font-bold text-white uppercase tracking-wider">Drip Wars</h2>
                <p className="text-gray-400 mt-1">Vote for the best fit. Who takes the crown this week?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-4 relative items-center">
                <ContestantCard contestant={{...dripWarsMatchup.contestantA, votes: votes.a}} onVote={() => handleVote('a')} voted={!!votedFor} percentage={percentA} isWinner={percentA >= percentB} />
                
                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
                    <FlameIcon className="w-12 h-12 text-red-500" />
                    <span className="text-6xl font-black font-serif text-gray-700">VS</span>
                </div>

                <ContestantCard contestant={{...dripWarsMatchup.contestantB, votes: votes.b}} onVote={() => handleVote('b')} voted={!!votedFor} percentage={percentB} isWinner={percentB > percentA} />
            </div>
        </div>
    );
};

const Leaderboard: React.FC = () => {
    const rankBorders = ['border-yellow-400/80', 'border-gray-400/80', 'border-yellow-600/80'];
    const rankText = ['text-yellow-400', 'text-gray-400', 'text-yellow-600'];

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-serif font-bold">Hall of Fame</h2>
                <p className="text-gray-400">Top contenders in the style game.</p>
            </div>
            <div className="space-y-3">
                {leaderboard.map((player, index) => (
                    <motion.div 
                        key={player.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`flex items-center p-3 rounded-lg bg-gray-900/50 border ${rankBorders[index] || 'border-gray-800'} transition-all hover:bg-gray-900 hover:border-gray-700`}
                    >
                        <div className={`flex-shrink-0 w-12 text-2xl font-bold text-center ${rankText[index] || 'text-gray-500'}`}>{player.rank}</div>
                        <img src={player.avatarUrl} alt={player.name} className="w-12 h-12 rounded-full mx-4 object-cover"/>
                        <span className="font-semibold text-lg text-white">{player.name}</span>
                        <div className="ml-auto text-right flex items-center gap-2">
                            <span className="text-xl font-bold text-white">{player.score}</span>
                            {index === 0 && <CrownIcon className="w-6 h-6 text-yellow-400"/>}
                            {index > 0 && <span className="text-sm text-gray-400">Wins</span>}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};


// --- MAIN BLOG COMPONENT ---

const Blog: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dripwars');

    const tabs = [
        { id: 'rankings', label: 'Fit Rankings' },
        { id: 'dripwars', label: 'Drip Wars' },
        { id: 'leaderboard', label: 'Leaderboard' },
        { id: 'log', label: 'The GL-Log' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'rankings': return <FitRankings />;
            case 'dripwars': return <DripWars />;
            case 'leaderboard': return <Leaderboard />;
            case 'log': return <TheLog />;
            default: return null;
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-2 text-center">Culture Hub</h1>
            <p className="text-lg text-gray-400 mb-12 text-center">Rate the fits. Join the wars. Read the stories.</p>
            
            <div className="flex justify-center border-b border-gray-800 mb-12">
                <div className="flex space-x-2 sm:space-x-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors ${
                                activeTab === tab.id 
                                    ? 'text-white' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.span 
                                    layoutId="underline" 
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Blog;