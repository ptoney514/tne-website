import { db } from '../lib/db';
import { coaches, teams } from '../lib/schema';
import { requireAdmin } from '../lib/auth-middleware';
import { eq, sql, or } from 'drizzle-orm';

export const config = {
  runtime: 'nodejs',
};

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const includeInactive = url.searchParams.get('includeInactive') === 'true';

    const coachesData = await db
      .select()
      .from(coaches)
      .where(includeInactive ? sql`true` : eq(coaches.isActive, true))
      .orderBy(coaches.lastName, coaches.firstName);

    // Get team assignments for coaches
    const coachIds = coachesData.map((c) => c.id);
    let teamAssignments: Array<{
      coachId: string;
      role: string;
      teamId: string;
      teamName: string;
      gradeLevel: string;
    }> = [];

    if (coachIds.length > 0) {
      const headCoachTeams = await db
        .select({
          coachId: teams.headCoachId,
          role: sql<string>`'head_coach'`,
          teamId: teams.id,
          teamName: teams.name,
          gradeLevel: teams.gradeLevel,
        })
        .from(teams)
        .where(sql`${teams.headCoachId} IN ${coachIds}`);

      const assistantCoachTeams = await db
        .select({
          coachId: teams.assistantCoachId,
          role: sql<string>`'assistant_coach'`,
          teamId: teams.id,
          teamName: teams.name,
          gradeLevel: teams.gradeLevel,
        })
        .from(teams)
        .where(sql`${teams.assistantCoachId} IN ${coachIds}`);

      teamAssignments = [
        ...headCoachTeams.filter((t) => t.coachId),
        ...assistantCoachTeams.filter((t) => t.coachId),
      ] as typeof teamAssignments;
    }

    const assignmentsByCoach = teamAssignments.reduce(
      (acc, t) => {
        if (!acc[t.coachId]) acc[t.coachId] = [];
        acc[t.coachId].push({
          role: t.role,
          team_id: t.teamId,
          team_name: t.teamName,
          grade_level: t.gradeLevel,
        });
        return acc;
      },
      {} as Record<string, Array<Record<string, unknown>>>
    );

    const result = coachesData.map((coach) => ({
      id: coach.id,
      first_name: coach.firstName,
      last_name: coach.lastName,
      email: coach.email,
      phone: coach.phone,
      bio: coach.bio,
      is_active: coach.isActive,
      created_at: coach.createdAt,
      updated_at: coach.updatedAt,
      team_assignments: assignmentsByCoach[coach.id] || [],
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching coaches:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch coaches' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    const [newCoach] = await db
      .insert(coaches)
      .values({
        firstName: body.first_name,
        lastName: body.last_name,
        email: body.email,
        phone: body.phone,
        bio: body.bio,
        isActive: body.is_active ?? true,
      })
      .returning();

    return new Response(JSON.stringify(newCoach), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error creating coach:', error);
    return new Response(JSON.stringify({ error: 'Failed to create coach' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing coach ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.first_name !== undefined) updateData.firstName = body.first_name;
    if (body.last_name !== undefined) updateData.lastName = body.last_name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.is_active !== undefined) updateData.isActive = body.is_active;

    const [updated] = await db
      .update(coaches)
      .set(updateData)
      .where(eq(coaches.id, id))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Coach not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating coach:', error);
    return new Response(JSON.stringify({ error: 'Failed to update coach' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing coach ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if coach is assigned to any teams
    const [assigned] = await db
      .select()
      .from(teams)
      .where(or(eq(teams.headCoachId, id), eq(teams.assistantCoachId, id)))
      .limit(1);

    if (assigned) {
      return new Response(
        JSON.stringify({
          error: 'Cannot delete coach assigned to teams. Remove from teams first.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    await db.delete(coaches).where(eq(coaches.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting coach:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete coach' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
