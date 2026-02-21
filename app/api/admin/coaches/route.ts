import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coaches, teams } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth-middleware';
import { eq, sql, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const includeInactive = request.nextUrl.searchParams.get('includeInactive') === 'true';

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

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error fetching coaches:', error);
    return NextResponse.json({ error: 'Failed to fetch coaches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    return NextResponse.json(newCoach, { status: 201 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error creating coach:', error);
    return NextResponse.json({ error: 'Failed to create coach' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing coach ID' }, { status: 400 });
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
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error updating coach:', error);
    return NextResponse.json({ error: 'Failed to update coach' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing coach ID' }, { status: 400 });
    }

    // Check if coach is assigned to any teams
    const [assigned] = await db
      .select()
      .from(teams)
      .where(or(eq(teams.headCoachId, id), eq(teams.assistantCoachId, id)))
      .limit(1);

    if (assigned) {
      return NextResponse.json(
        { error: 'Cannot delete coach assigned to teams. Remove from teams first.' },
        { status: 400 }
      );
    }

    await db.delete(coaches).where(eq(coaches.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Error deleting coach:', error);
    return NextResponse.json({ error: 'Failed to delete coach' }, { status: 500 });
  }
}
