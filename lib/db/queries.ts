/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
/**
 * Database Query Functions
 * Real database integration for report data
 */

import { sql } from '@vercel/postgres';

// Types
export interface HackathonData {
  id: string;
  name: string;
  university: string;
  startDate: string;
  endDate: string;
  venue: string;
  host: string;
  organizer: string;
  theme: string;
  status: string;
}

export interface ParticipantWithScores {
  id: string;
  hackathonId: string;
  name: string;
  studentId: string;
  email: string;
  major: string;
  majorCategory: string;
  grade: number;
  gender: string;
  isExternal: boolean;
  teamId: string | null;
  preScore?: CompetencyScore;
  postScore?: CompetencyScore;
  surveyCompleted: boolean;
}

export interface CompetencyScore {
  understanding: number;
  toolUsage: number;
  problemSolving: number;
  collaboration: number;
  ethics: number;
  completedAt: string;
}

/**
 * Get hackathon by ID with all related data
 */
export async function getHackathonReport(hackathonId: string) {
  try {
    // 1. Get hackathon basic info
    const hackathonResult = await sql`
      SELECT * FROM hackathons WHERE id = ${hackathonId}
    `;
    const hackathon = hackathonResult.rows[0];

    if (!hackathon) {
      return null;
    }

    // 2. Get tracks
    const tracksResult = await sql`
      SELECT * FROM tracks WHERE hackathon_id = ${hackathonId}
    `;
    const tracks = tracksResult.rows;

    // 3. Get participants with scores
    const participantsResult = await sql`
      SELECT 
        p.*,
        pre.understanding as pre_understanding,
        pre.tool_usage as pre_tool_usage,
        pre.problem_solving as pre_problem_solving,
        pre.collaboration as pre_collaboration,
        pre.ethics as pre_ethics,
        pre.completed_at as pre_completed_at,
        post.understanding as post_understanding,
        post.tool_usage as post_tool_usage,
        post.problem_solving as post_problem_solving,
        post.collaboration as post_collaboration,
        post.ethics as post_ethics,
        post.completed_at as post_completed_at
      FROM participants p
      LEFT JOIN competency_assessments_pre pre ON p.id = pre.participant_id
      LEFT JOIN competency_assessments_post post ON p.id = post.participant_id
      WHERE p.hackathon_id = ${hackathonId}
    `;
    const participants = participantsResult.rows;

    // 4. Get teams with projects
    const teamsResult = await sql`
      SELECT 
        t.*,
        p.name as project_name,
        p.description as project_description,
        p.tech_stack,
        p.github_url,
        p.demo_url,
        p.completion_level,
        e.creativity,
        e.tech_completion,
        e.feasibility,
        e.teamwork,
        e.ux,
        e.award,
        e.judge_comment
      FROM teams t
      LEFT JOIN projects p ON t.id = p.team_id
      LEFT JOIN evaluations e ON p.id = e.project_id
      WHERE t.hackathon_id = ${hackathonId}
    `;
    const teams = teamsResult.rows;

    // 5. Get satisfaction surveys
    const surveysResult = await sql`
      SELECT * FROM satisfaction_surveys 
      WHERE hackathon_id = ${hackathonId}
    `;
    const surveys = surveysResult.rows;

    // 6. Get follow-ups
    const followUpsResult = await sql`
      SELECT * FROM follow_ups 
      WHERE hackathon_id = ${hackathonId}
    `;
    const followUps = followUpsResult.rows;

    return {
      hackathon,
      tracks,
      participants,
      teams,
      surveys,
      followUps,
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get benchmark data for comparison
 */
export async function getBenchmarkData(year?: number) {
  try {
    const query = year
      ? sql`SELECT * FROM university_benchmarks WHERE year = ${year} ORDER BY avg_post_score DESC`
      : sql`SELECT * FROM university_benchmarks ORDER BY created_at DESC LIMIT 10`;

    const result = await query;
    return result.rows;
  } catch (error) {
    console.error('Benchmark query error:', error);
    throw error;
  }
}

/**
 * Save benchmark data after hackathon completion
 */
export async function saveBenchmarkData(data: {
  university: string;
  hackathonId: string;
  participantCount: number;
  avgPreScore: number;
  avgPostScore: number;
  growthRate: number;
  satisfaction: number;
  nps: number;
  projectSubmitRate: number;
  year: number;
}) {
  try {
    const result = await sql`
      INSERT INTO university_benchmarks (
        id, university, hackathon_id, participant_count,
        avg_pre_score, avg_post_score, growth_rate,
        satisfaction, nps, project_submit_rate, year
      ) VALUES (
        ${`bench-${Date.now()}`},
        ${data.university},
        ${data.hackathonId},
        ${data.participantCount},
        ${data.avgPreScore},
        ${data.avgPostScore},
        ${data.growthRate},
        ${data.satisfaction},
        ${data.nps},
        ${data.projectSubmitRate},
        ${data.year}
      )
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Save benchmark error:', error);
    throw error;
  }
}

/**
 * Insert participant with competency assessment
 */
export async function insertParticipantWithAssessment(
  participant: Omit<ParticipantWithScores, 'id'>,
  preScore: CompetencyScore
) {
  try {
    const participantId = `p-${Date.now()}`;

    // Insert participant
    await sql`
      INSERT INTO participants (
        id, hackathon_id, name, student_id, email,
        major, major_category, grade, gender,
        is_external, team_id, survey_completed
      ) VALUES (
        ${participantId},
        ${participant.hackathonId},
        ${participant.name},
        ${participant.studentId},
        ${participant.email},
        ${participant.major},
        ${participant.majorCategory},
        ${participant.grade},
        ${participant.gender},
        ${participant.isExternal},
        ${participant.teamId},
        ${participant.surveyCompleted}
      )
    `;

    // Insert pre-assessment
    await sql`
      INSERT INTO competency_assessments_pre (
        id, participant_id, understanding, tool_usage,
        problem_solving, collaboration, ethics
      ) VALUES (
        ${`pre-${Date.now()}`},
        ${participantId},
        ${preScore.understanding},
        ${preScore.toolUsage},
        ${preScore.problemSolving},
        ${preScore.collaboration},
        ${preScore.ethics}
      )
    `;

    return participantId;
  } catch (error) {
    console.error('Insert participant error:', error);
    throw error;
  }
}
