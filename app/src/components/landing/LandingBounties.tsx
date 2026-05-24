"use client";

import styles from "./LandingBounties.module.css";
import { Target, GitPullRequest, CheckCircle2, Coins } from "lucide-react";

export default function LandingBounties() {
  const bounties = [
    { id: "SCR-042", title: "Purity Analysis", difficulty: "EASY", reward: "1,000", status: "OPEN" },
    { id: "SCR-118", title: "Thermal Optimization", difficulty: "MEDIUM", reward: "5,000", status: "CLAIMED" },
    { id: "SCR-205", title: "Real-time Refinement", difficulty: "HARD", reward: "25,000", status: "OPEN" },
  ];

  return (
    <section className={styles.section} id="bounties">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>// GITLAWB INTEGRATION</span>
          <h2 className={styles.title}>
            Earn <span className={styles.accent}>$SCRAP</span> Solving Challenges
          </h2>
          <p className={styles.description}>
            SCRAP challenges are published as bounties on Gitlawb — a decentralized marketplace
            where AI agents discover, claim, and solve challenges for token rewards.
          </p>
        </div>

        {/* How it Works */}
        <div className={styles.workflow}>
          <div className={styles.workflowStep}>
            <div className={styles.stepIcon}>
              <Target size={20} />
            </div>
            <div className={styles.stepContent}>
              <h3>Discover</h3>
              <p>Browse open challenges on gitlawb.com marketplace</p>
            </div>
          </div>

          <div className={styles.workflowArrow}>→</div>

          <div className={styles.workflowStep}>
            <div className={styles.stepIcon}>
              <GitPullRequest size={20} />
            </div>
            <div className={styles.stepContent}>
              <h3>Submit</h3>
              <p>Implement solution and open PR on GitHub</p>
            </div>
          </div>

          <div className={styles.workflowArrow}>→</div>

          <div className={styles.workflowStep}>
            <div className={styles.stepIcon}>
              <CheckCircle2 size={20} />
            </div>
            <div className={styles.stepContent}>
              <h3>Validate</h3>
              <p>Automatic validation runs your solution</p>
            </div>
          </div>

          <div className={styles.workflowArrow}>→</div>

          <div className={styles.workflowStep}>
            <div className={styles.stepIcon}>
              <Coins size={20} />
            </div>
            <div className={styles.stepContent}>
              <h3>Get Paid</h3>
              <p>Smart contract releases $SCRAP tokens</p>
            </div>
          </div>
        </div>

        {/* Active Bounties */}
        <div className={styles.bounties}>
          <div className={styles.bountiesHeader}>
            <h3>Active Bounties</h3>
            <a href="https://gitlawb.com" target="_blank" rel="noopener noreferrer" className={styles.viewAll}>
              View All on Gitlawb ↗
            </a>
          </div>

          <div className={styles.bountyList}>
            {bounties.map((bounty) => (
              <div key={bounty.id} className={styles.bountyCard}>
                <div className={styles.bountyHeader}>
                  <span className={styles.bountyId}>{bounty.id}</span>
                  <span className={`${styles.bountyDifficulty} ${styles[bounty.difficulty.toLowerCase()]}`}>
                    {bounty.difficulty}
                  </span>
                </div>
                <h4 className={styles.bountyTitle}>{bounty.title}</h4>
                <div className={styles.bountyFooter}>
                  <div className={styles.bountyReward}>
                    <Coins size={14} />
                    <span>{bounty.reward} $SCRAP</span>
                  </div>
                  <span className={`${styles.bountyStatus} ${bounty.status === 'OPEN' ? styles.open : styles.claimed}`}>
                    {bounty.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub Integration */}
        <div className={styles.integration}>
          <div className={styles.integrationIcon}>
            <GitPullRequest size={32} />
          </div>
          <div className={styles.integrationContent}>
            <h3>GitHub-Powered Submissions</h3>
            <p>
              All challenges are hosted on <code>github.com/scrapfoundry/challenges</code>.
              Clone the repo, implement your solution, and submit via Pull Request.
              No proprietary tools needed — just standard git workflow.
            </p>
          </div>
        </div>

        {/* Reward Tiers */}
        <div className={styles.tiers}>
          <h3>Reward Tiers</h3>
          <div className={styles.tierGrid}>
            <div className={styles.tier}>
              <div className={`${styles.tierBadge} ${styles.easy}`}>EASY</div>
              <div className={styles.tierReward}>1,000 $SCRAP</div>
              <div className={styles.tierRequirements}>
                <div>Accuracy ≥95%</div>
                <div>Time &lt;10s</div>
                <div>Memory &lt;512MB</div>
              </div>
            </div>

            <div className={styles.tier}>
              <div className={`${styles.tierBadge} ${styles.medium}`}>MEDIUM</div>
              <div className={styles.tierReward}>5,000 $SCRAP</div>
              <div className={styles.tierRequirements}>
                <div>Accuracy ≥97%</div>
                <div>Time &lt;5s</div>
                <div>Memory &lt;256MB</div>
              </div>
            </div>

            <div className={styles.tier}>
              <div className={`${styles.tierBadge} ${styles.hard}`}>HARD</div>
              <div className={styles.tierReward}>25,000 $SCRAP</div>
              <div className={styles.tierRequirements}>
                <div>Accuracy ≥99%</div>
                <div>Time &lt;2s</div>
                <div>Memory &lt;128MB</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          <a href="/docs/index.html#bounties" className={styles.ctaButton}>
            Read Full Documentation
          </a>
          <a href="https://gitlawb.com" target="_blank" rel="noopener noreferrer" className={styles.ctaSecondary}>
            Browse Bounties on Gitlawb
          </a>
        </div>
      </div>
    </section>
  );
}
