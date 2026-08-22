import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function runBackup() {
  console.log('📦 [Backup] Starting complete database export...');
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // 1. Fetch all table records
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isTeamLeader: true,
      teamId: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const teams = await prisma.team.findMany({
    include: {
      challenge: true,
      members: {
        select: {
          id: true,
          fullName: true,
          email: true,
          isTeamLeader: true
        }
      }
    }
  });

  const challenges = await prisma.challenge.findMany();
  const submissions = await prisma.submission.findMany({
    include: { team: true }
  });
  const r1Scores = await prisma.round1Score.findMany({
    include: { team: true, judge: true }
  });
  const r2Scores = await prisma.round2Score.findMany({
    include: { team: true, judge: true }
  });
  const eventConfig = await prisma.eventConfig.findFirst();
  const auditLogs = await prisma.auditLog.findMany();

  const fullData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      counts: {
        users: users.length,
        teams: teams.length,
        challenges: challenges.length,
        submissions: submissions.length,
        round1Scores: r1Scores.length,
        round2Scores: r2Scores.length,
        auditLogs: auditLogs.length
      }
    },
    eventConfig,
    challenges,
    teams,
    users,
    submissions,
    round1Scores: r1Scores,
    round2Scores: r2Scores,
    auditLogs
  };

  // 2. Write Timestamped JSON & Latest JSON
  const jsonPath = path.join(backupDir, `full_backup_${timestamp}.json`);
  const latestJsonPath = path.join(backupDir, `full_backup_latest.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(fullData, null, 2));
  fs.writeFileSync(latestJsonPath, JSON.stringify(fullData, null, 2));

  // 3. Write CSV: Submissions
  const subCsvHeader = 'id,teamId,teamName,roundNumber,scratchUrl,shortDescription,videoUrl,videoFileName,videoFileSize,status,submittedAt\n';
  const subCsvRows = submissions
    .map((s) => {
      const teamName = (s.team?.name || '').replace(/"/g, '""');
      const desc = (s.shortDescription || '').replace(/[\r\n]+/g, ' ').replace(/"/g, '""');
      const vName = (s.videoFileName || '').replace(/"/g, '""');
      return `"${s.id}","${s.teamId}","${teamName}",${s.roundNumber},"${s.scratchUrl || ''}","${desc}","${s.videoUrl || ''}","${vName}",${s.videoFileSize || 0},"${s.status}","${s.submittedAt}"`;
    })
    .join('\n');
  fs.writeFileSync(path.join(backupDir, `submissions_${timestamp}.csv`), subCsvHeader + subCsvRows);
  fs.writeFileSync(path.join(backupDir, `submissions_latest.csv`), subCsvHeader + subCsvRows);

  // 4. Write CSV: Round 1 Scores
  const r1CsvHeader = 'id,teamId,teamName,judgeId,judgeName,basicWorkingScore,visualSpritesScore,creativityScore,totalScore,comments,isFinal,submittedAt\n';
  const r1CsvRows = r1Scores
    .map((r) => {
      const teamName = (r.team?.name || '').replace(/"/g, '""');
      const judgeName = (r.judge?.fullName || '').replace(/"/g, '""');
      const comments = (r.comments || '').replace(/[\r\n]+/g, ' ').replace(/"/g, '""');
      return `"${r.id}","${r.teamId}","${teamName}","${r.judgeId}","${judgeName}",${r.basicWorkingScore},${r.visualSpritesScore},${r.creativityScore},${r.totalScore},"${comments}",${r.isFinal},"${r.submittedAt}"`;
    })
    .join('\n');
  fs.writeFileSync(path.join(backupDir, `round1_scores_${timestamp}.csv`), r1CsvHeader + r1CsvRows);
  fs.writeFileSync(path.join(backupDir, `round1_scores_latest.csv`), r1CsvHeader + r1CsvRows);

  // 5. Write CSV: Round 2 Scores
  const r2CsvHeader = 'id,teamId,teamName,judgeId,judgeName,presentationQualityScore,projectExplanationScore,technicalQaScore,teamContributionScore,totalScore,comments,isFinal,submittedAt\n';
  const r2CsvRows = r2Scores
    .map((r) => {
      const teamName = (r.team?.name || '').replace(/"/g, '""');
      const judgeName = (r.judge?.fullName || '').replace(/"/g, '""');
      const comments = (r.comments || '').replace(/[\r\n]+/g, ' ').replace(/"/g, '""');
      return `"${r.id}","${r.teamId}","${teamName}","${r.judgeId}","${judgeName}",${r.presentationQualityScore},${r.projectExplanationScore},${r.technicalQaScore},${r.teamContributionScore},${r.totalScore},"${comments}",${r.isFinal},"${r.submittedAt}"`;
    })
    .join('\n');
  fs.writeFileSync(path.join(backupDir, `round2_scores_${timestamp}.csv`), r2CsvHeader + r2CsvRows);
  fs.writeFileSync(path.join(backupDir, `round2_scores_latest.csv`), r2CsvHeader + r2CsvRows);

  // 6. Write CSV: Teams & claimed challenges
  const teamCsvHeader = 'teamId,teamName,accessCode,claimedChallengeTitle,claimedChallengeCategory,memberCount\n';
  const teamCsvRows = teams
    .map((t) => {
      const teamName = t.name.replace(/"/g, '""');
      const cTitle = (t.challenge?.title || 'None').replace(/"/g, '""');
      const cCat = (t.challenge?.category || 'None').replace(/"/g, '""');
      return `"${t.id}","${teamName}","${t.accessCode}","${cTitle}","${cCat}",${t.members.length}`;
    })
    .join('\n');
  fs.writeFileSync(path.join(backupDir, `teams_${timestamp}.csv`), teamCsvHeader + teamCsvRows);
  fs.writeFileSync(path.join(backupDir, `teams_latest.csv`), teamCsvHeader + teamCsvRows);

  console.log('✅ [Backup] Complete! Files saved to:');
  console.log(`   📁 ${backupDir}`);
  console.log(`   📄 full_backup_latest.json (${(fs.statSync(latestJsonPath).size / 1024).toFixed(1)} KB)`);
  console.log(`   📄 submissions_latest.csv (${submissions.length} rows)`);
  console.log(`   📄 round1_scores_latest.csv (${r1Scores.length} rows)`);
  console.log(`   📄 round2_scores_latest.csv (${r2Scores.length} rows)`);
  console.log(`   📄 teams_latest.csv (${teams.length} rows)`);
}

runBackup()
  .catch((e) => {
    console.error('❌ [Backup] Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
