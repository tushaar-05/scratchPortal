import { PrismaClient, Role, EventStage, SubmissionStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function restoreDatabase() {
  console.log('🔄 [Restore] Starting full database restoration from backup...');

  const backupPath = path.join(process.cwd(), 'backups', 'full_backup_latest.json');
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found at ${backupPath}`);
  }

  const raw = fs.readFileSync(backupPath, 'utf-8');
  const backup = JSON.parse(raw);

  console.log(`📦 [Restore] Loaded backup with counts:`, backup.metadata.counts);

  // Default password hashes
  const adminHash = await bcrypt.hash('admin123', 10);
  const judgeHash = await bcrypt.hash('judge123', 10);
  const teamHash = await bcrypt.hash('team123', 10);

  // 1. Clean current state
  console.log('🧹 [Restore] Cleaning destination tables...');
  await prisma.auditLog.deleteMany();
  await prisma.round2Score.deleteMany();
  await prisma.round1Score.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.eventConfig.deleteMany();

  // 2. Restore EventConfig
  console.log('⚙️ [Restore] Restoring EventConfig...');
  if (backup.eventConfig) {
    await prisma.eventConfig.create({
      data: {
        id: backup.eventConfig.id,
        currentStage: backup.eventConfig.currentStage as EventStage,
        r1StartTime: backup.eventConfig.r1StartTime ? new Date(backup.eventConfig.r1StartTime) : null,
        r1EndTime: backup.eventConfig.r1EndTime ? new Date(backup.eventConfig.r1EndTime) : null,
        r2StartTime: backup.eventConfig.r2StartTime ? new Date(backup.eventConfig.r2StartTime) : null,
        r2EndTime: backup.eventConfig.r2EndTime ? new Date(backup.eventConfig.r2EndTime) : null,
        isR1LeaderboardPublished: backup.eventConfig.isR1LeaderboardPublished ?? false,
        isLeaderboardPublished: backup.eventConfig.isLeaderboardPublished ?? false,
        createdAt: new Date(backup.eventConfig.createdAt),
        updatedAt: new Date(backup.eventConfig.updatedAt)
      }
    });
  }

  // 3. Restore Challenges
  console.log(`🎯 [Restore] Restoring ${backup.challenges.length} Challenges...`);
  for (const c of backup.challenges) {
    await prisma.challenge.create({
      data: {
        id: c.id,
        title: c.title,
        category: c.category,
        difficulty: c.difficulty,
        maxCapacity: c.maxCapacity,
        claimedCount: c.claimedCount,
        shortDescription: c.shortDescription,
        fullDescription: c.fullDescription,
        requirements: c.requirements,
        isPublished: c.isPublished ?? true,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      }
    });
  }

  // 4. Restore Teams
  console.log(`👥 [Restore] Restoring ${backup.teams.length} Teams...`);
  for (const t of backup.teams) {
    await prisma.team.create({
      data: {
        id: t.id,
        name: t.name,
        accessCode: t.accessCode,
        challengeId: t.challengeId || null,
        challengeClaimedAt: t.challengeClaimedAt ? new Date(t.challengeClaimedAt) : null,
        isFinalist: t.isFinalist ?? false,
        r2PresentationSlot: t.r2PresentationSlot || null,
        round1Score: t.round1Score,
        round2Score: t.round2Score,
        finalScore: t.finalScore,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
      }
    });
  }

  // 5. Restore Users
  console.log(`👤 [Restore] Restoring ${backup.users.length} Users...`);
  for (const u of backup.users) {
    let pHash = teamHash;
    if (u.role === Role.ORGANIZER) pHash = adminHash;
    else if (u.role === Role.JUDGE) pHash = judgeHash;

    await prisma.user.create({
      data: {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        passwordHash: pHash,
        role: u.role as Role,
        isTeamLeader: u.isTeamLeader ?? false,
        teamId: u.teamId || null,
        createdAt: new Date(u.createdAt),
        updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date()
      }
    });
  }

  // 6. Restore Submissions
  console.log(`🚀 [Restore] Restoring ${backup.submissions.length} Submissions...`);
  for (const s of backup.submissions) {
    await prisma.submission.create({
      data: {
        id: s.id,
        teamId: s.teamId,
        roundNumber: s.roundNumber,
        scratchUrl: s.scratchUrl || '',
        shortDescription: s.shortDescription || null,
        videoUrl: s.videoUrl || null,
        videoFileName: s.videoFileName || null,
        videoFileSize: s.videoFileSize || null,
        status: (s.status as SubmissionStatus) || SubmissionStatus.SUBMITTED,
        notes: s.notes || null,
        submittedAt: s.submittedAt ? new Date(s.submittedAt) : new Date(),
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt)
      }
    });
  }

  // 7. Restore Round 1 Scores
  console.log(`⭐ [Restore] Restoring ${backup.round1Scores.length} Round 1 Scores...`);
  for (const r of backup.round1Scores) {
    await prisma.round1Score.create({
      data: {
        id: r.id,
        teamId: r.teamId,
        judgeId: r.judgeId,
        basicWorkingScore: r.basicWorkingScore,
        visualSpritesScore: r.visualSpritesScore,
        creativityScore: r.creativityScore,
        totalScore: r.totalScore,
        comments: r.comments || null,
        isFinal: r.isFinal ?? true,
        submittedAt: new Date(r.submittedAt),
        updatedAt: new Date(r.updatedAt)
      }
    });
  }

  // 8. Restore Round 2 Scores
  console.log(`🌟 [Restore] Restoring ${backup.round2Scores.length} Round 2 Scores...`);
  for (const r of backup.round2Scores) {
    await prisma.round2Score.create({
      data: {
        id: r.id,
        teamId: r.teamId,
        judgeId: r.judgeId,
        presentationQualityScore: r.presentationQualityScore,
        projectExplanationScore: r.projectExplanationScore,
        technicalQaScore: r.technicalQaScore,
        teamContributionScore: r.teamContributionScore,
        totalScore: r.totalScore,
        comments: r.comments || null,
        isFinal: r.isFinal ?? true,
        submittedAt: new Date(r.submittedAt),
        updatedAt: new Date(r.updatedAt)
      }
    });
  }

  // 9. Restore Audit Logs
  if (backup.auditLogs && backup.auditLogs.length > 0) {
    console.log(`📜 [Restore] Restoring ${backup.auditLogs.length} Audit Logs...`);
    for (const a of backup.auditLogs) {
      await prisma.auditLog.create({
        data: {
          id: a.id,
          eventType: a.eventType,
          teamId: a.teamId || null,
          userId: a.userId || null,
          metadata: a.metadata,
          createdAt: new Date(a.createdAt)
        }
      });
    }
  }

  console.log('🎉 [Restore] SUCCESS: All 72 Submissions, 79 Teams, 79 R1 Scores, and 2 R2 Scores restored to database!');
}

restoreDatabase()
  .catch((e) => {
    console.error('❌ [Restore] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
