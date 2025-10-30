"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#c6dbd5] flex flex-col items-center font-sans relative">
        <header className="w-full  backdrop-blur-md bg-[#7aaa9d]/80 shadow-md py-4 px-6 flex flex-col items-center relative">
        {/* 🩵 Nav Buttons (Top-Left Corner) */}
        <div className="absolute right-6 top-4 flex gap-3">
          <Link href="/script">
            <button className="bg-[#CED3BA] text-gray-800 px-4 py-2 rounded-lg shadow font-semibold transition-all hover:bg-[#c6ccaf]">
              info
            </button>
          </Link>
          <Link href="/input">
            <button className="bg-[#CBC6DB] text-gray-800 px-4 py-2 rounded-lg shadow font-semibold transition-all hover:bg-[#bbb4cf]">
              todo
            </button>
          </Link>
          <Link href="/">
            <button className="bg-[#DBC6CC] text-gray-800 px-4 py-2 rounded-lg shadow font-semibold transition-all hover:bg-[#cfb3bb]">
              schedule
            </button>
          </Link>
        </div>

        {/* 🌸 Centered Site Title & Tagline */}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Synapse
          </h1>
          <p className="text-gray-600 font-medium mt-1">
            Organizing Student Success
          </p>
        </div>
      </header>

        {/* 📝 Text Content Card */}
        <div className="flex justify-center w-full px-4 mt-8">
        <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-md p-8 mt-20"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            The Science of Studying Smarter
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            Studying effectively isn’t just about spending long hours with a textbook—it’s about using strategies that are grounded in how our brains actually learn and remember. Modern cognitive science shows that things like how and when we review material, how we mix topics, and how we test ourselves all make a big difference in whether we retain knowledge and can use it later. By applying these principles intentionally, students can move from last-minute cramming to smarter, more efficient study routines that build real understanding.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4">
            One of the most powerful strategies is spaced practice (also called distributed practice)—this means spreading study sessions over time instead of doing one long marathon session. Research shows that revisiting material after a break lets your brain consolidate the information better and reduces the “forgetting” effect that happens after cramming.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4">
            Another vital technique is retrieval practice, which involves actively recalling information (through flashcards, self-quizzing, or explaining concepts aloud) rather than simply re-reading. Each act of retrieval strengthens memory pathways and helps identify gaps in knowledge.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4">
            Interleaving is the practice of mixing up different topics or problem types in a single study session instead of focusing on one type at a time. This forces your brain to discriminate between ideas, enhancing flexible application and deeper learning.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4">
            You can also use methods like elaboration (asking “why” and “how” questions), dual coding (pairing words and images together), and concrete examples (linking abstract ideas with specific cases). These strategies help transform raw information into meaningful knowledge by making connections, adding context, and engaging multiple cognitive pathways.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4">
            When you space out your study sessions, you reduce cognitive overload and give your working memory time to recover, which leads to stronger encoding of information. Interleaving keeps your brain active and prevents the illusion of mastery that often comes from repetitive blocked practice. Retrieval practice turns passive reading into active engagement—when you attempt to retrieve, you’re strengthening memory and revealing areas that need more work. Elaboration and dual coding deepen understanding, making it easier to apply what you learn rather than just memorizing isolated facts. The result? You spend less time forgetting and relearning, and more time building a foundation you can trust.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            By weaving these strategies into your routine—planning spaced sessions, interleaving topics, retrieving actively, and making connections through elaboration and dual coding—you shift from simply getting through study time to mastering your learning. You’ll retain more, understand deeper, and be better prepared—not just for exams, but for lifelong learning.
          </p>
            
          {/* 💙 Blue Card Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Practical Study Tips & Methods by Subject
            </h2>

            {/* Math */}
            <div className="mb-5">
              <h3 className="font-semibold text-gray-800 mb-2">Math</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Mix problem types in one session to engage interleaving.</li>
                <li>After solving a problem, hide the solution and try to redo it from memory for retrieval practice.</li>
                <li>Use spaced review: revisit older problem sets after several days to strengthen retention.</li>
                <li>Explain your solution out loud or teach a peer—this deepens your grasp and reveals weak spots.</li>
              </ul>
            </div>

            {/* English / Literature */}
            <div className="mb-5">
              <h3 className="font-semibold text-gray-800 mb-2">English / Literature</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>After reading a text, close it and write down what you remember (retrieval practice).</li>
                <li>Alternate between vocabulary, literary analysis, and essay drafts (interleaving).</li>
                <li>Create mind-maps or diagrams of characters/themes (dual coding).</li>
                <li>Ask yourself “Why did the author choose this? What does it represent?” (elaboration).</li>
              </ul>
            </div>

            {/* History */}
            <div className="mb-5">
              <h3 className="font-semibold text-gray-800 mb-2">History</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Create a timeline and then quiz yourself by covering parts and recalling them (retrieval).</li>
                <li>Study one historical era for a short time, then switch to another, then come back (interleaving).</li>
                <li>Turn reading notes into a visual chart, infographic, or audio summary (dual coding).</li>
                <li>Ask “How did this lead to that?” and “Why did this happen?” to deepen understanding (elaboration).</li>
              </ul>
            </div>

            {/* Science */}
            <div className="mb-5">
              <h3 className="font-semibold text-gray-800 mb-2">Science</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Mix review of concepts (theory) with problems/experiments (application) in one session for interleaving.</li>
                <li>Draw the process (e.g., cell cycle, chemical reaction) from memory, check against your book (dual coding + retrieval).</li>
                <li>Use spaced review: revisit earlier chapters when advancing to new ones.</li>
                <li>Ask “Why does this reaction proceed this way? What would happen if something changes?” (elaboration).</li>
              </ul>
            </div>

            {/* Languages */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Languages</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Use flashcards or apps to recall vocabulary and revisit them at spaced intervals (spaced + retrieval).</li>
                <li>Combine grammar drills, reading, speaking, and writing in one block (interleaving).</li>
                <li>Translate sentences into your native language and then back (dual coding + retrieval).</li>
                <li>Ask “How would I express this idea differently? What nuance changes?” (elaboration).</li>
              </ul>
            </div>
          </div>
        </motion.div>
        </div>
        </div>
    </main>
  );
}
