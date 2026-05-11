import { ObjectId, type Collection } from "mongodb";

import { getDb } from "@/lib/db";
import {
  type DbFeedback,
  type DbProfession,
  type DbResponse,
  type DbSunbed,
  type KioskConfig,
  toProfessionDto,
  toSunbedDto,
} from "@/lib/models";
import { createSunbedTitle } from "@/lib/sunbed-title";

export type DashboardSummary = {
  totalResponses: number;
  totalProfessions: number;
  totalSunbeds: number;
  totalFeedbacks: number;
  professionBreakdown: Array<{ professionName: string; count: number }>;
  finalWinnerBreakdown: Array<{
    sunbedId: string;
    title: string;
    imagePath: string;
    count: number;
    percentage: number;
  }>;
};

export type FeedbackDto = {
  id: string;
  message: string;
  createdAt: string;
  professionName?: string;
  selectedSunbed?: {
    id: string;
    title: string;
    imagePath: string;
  };
};

export async function getCollections() {
  const db = await getDb();

  return {
    professions: db.collection<DbProfession>("professions"),
    sunbeds: db.collection<DbSunbed>("sunbeds"),
    responses: db.collection<DbResponse>("responses"),
    feedbacks: db.collection<DbFeedback>("feedbacks"),
  };
}

export async function getKioskConfig(): Promise<KioskConfig> {
  const { professions, sunbeds } = await getCollections();
  const [professionDocs, sunbedDocs] = await Promise.all([
    professions.find({}).sort({ sortOrder: 1, name: 1 }).toArray(),
    sunbeds.find({}).sort({ sortOrder: 1, title: 1 }).toArray(),
  ]);

  return {
    professions: professionDocs.map(toProfessionDto),
    sunbeds: sunbedDocs.map(toSunbedDto),
  };
}

export async function getAdminDashboardData() {
  const { professions, sunbeds } = await getCollections();
  const [professionDocs, sunbedDocs, summary, feedbacks] = await Promise.all([
    professions.find({}).sort({ sortOrder: 1, name: 1 }).toArray(),
    sunbeds.find({}).sort({ sortOrder: 1, title: 1 }).toArray(),
    getDashboardSummary(),
    getRecentFeedbacks(),
  ]);

  return {
    professions: professionDocs.map(toProfessionDto),
    sunbeds: sunbedDocs.map(toSunbedDto),
    summary,
    feedbacks,
  };
}

const feedbackBackfillWindowMs = 30 * 60 * 1000;

export async function getRecentFeedbacks(limit = 200): Promise<FeedbackDto[]> {
  const { feedbacks, responses, sunbeds } = await getCollections();
  const docs = await feedbacks
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  if (docs.length === 0) {
    return [];
  }

  const needsBackfill = docs.filter((doc) => !doc.finalWinnerSunbedId);
  let responsesInWindow: Array<{
    createdAt: Date;
    professionName: string;
    finalWinnerSunbedId: string;
  }> = [];

  if (needsBackfill.length > 0) {
    const oldestFeedback = docs[docs.length - 1].createdAt;
    const newestFeedback = docs[0].createdAt;
    const windowStart = new Date(
      oldestFeedback.getTime() - feedbackBackfillWindowMs,
    );

    responsesInWindow = await responses
      .find({
        createdAt: { $gte: windowStart, $lte: newestFeedback },
      })
      .project<{
        createdAt: Date;
        professionName: string;
        finalWinnerSunbedId: string;
      }>({ createdAt: 1, professionName: 1, finalWinnerSunbedId: 1, _id: 0 })
      .sort({ createdAt: 1 })
      .toArray();
  }

  const resolved = docs.map((doc) => {
    if (doc.finalWinnerSunbedId) {
      return {
        doc,
        finalWinnerSunbedId: doc.finalWinnerSunbedId,
        professionName: doc.professionName,
      };
    }

    const cutoff = doc.createdAt.getTime();
    const windowFloor = cutoff - feedbackBackfillWindowMs;
    let match: (typeof responsesInWindow)[number] | undefined;
    for (const response of responsesInWindow) {
      const time = response.createdAt.getTime();
      if (time > cutoff) break;
      if (time < windowFloor) continue;
      match = response;
    }

    return {
      doc,
      finalWinnerSunbedId: match?.finalWinnerSunbedId,
      professionName: match?.professionName,
    };
  });

  const sunbedIds = Array.from(
    new Set(
      resolved
        .map((item) => item.finalWinnerSunbedId)
        .filter((id): id is string => Boolean(id) && ObjectId.isValid(id ?? "")),
    ),
  );

  const sunbedDocs =
    sunbedIds.length === 0
      ? []
      : await sunbeds
          .find({ _id: { $in: sunbedIds.map((id) => new ObjectId(id)) } })
          .toArray();
  const sunbedsById = new Map(
    sunbedDocs.map((sunbed) => [sunbed._id.toString(), sunbed]),
  );

  return resolved.map((item) => {
    const sunbed = item.finalWinnerSunbedId
      ? sunbedsById.get(item.finalWinnerSunbedId)
      : undefined;

    return {
      id: item.doc._id.toString(),
      message: item.doc.message,
      createdAt: item.doc.createdAt.toISOString(),
      professionName: item.professionName,
      selectedSunbed: sunbed
        ? {
            id: sunbed._id.toString(),
            title: sunbed.title,
            imagePath: sunbed.imagePath,
          }
        : item.finalWinnerSunbedId
          ? {
              id: item.finalWinnerSunbedId,
              title: "Silinmiş şezlong",
              imagePath: "",
            }
          : undefined,
    };
  });
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { professions, sunbeds, responses, feedbacks } = await getCollections();
  const [
    totalResponses,
    totalProfessions,
    totalSunbeds,
    totalFeedbacks,
    professionGroups,
  ] = await Promise.all([
    responses.countDocuments({}),
    professions.countDocuments({}),
    sunbeds.countDocuments({}),
    feedbacks.countDocuments({}),
    responses
      .aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$professionName", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ])
      .toArray(),
  ]);

  const [winnerGroups, sunbedDocs] = await Promise.all([
    responses
      .aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$finalWinnerSunbedId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray(),
    sunbeds.find({}).toArray(),
  ]);
  const sunbedsById = new Map(
    sunbedDocs.map((sunbed) => [sunbed._id.toString(), sunbed]),
  );

  return {
    totalResponses,
    totalProfessions,
    totalSunbeds,
    totalFeedbacks,
    professionBreakdown: professionGroups.map((group) => ({
      professionName: group._id,
      count: group.count,
    })),
    finalWinnerBreakdown: winnerGroups.map((group) => {
      const sunbed = sunbedsById.get(group._id);

      return {
        sunbedId: group._id,
        title: sunbed?.title ?? "Silinmiş şezlong",
        imagePath: sunbed?.imagePath ?? "",
        count: group.count,
        percentage:
          totalResponses === 0
            ? 0
            : Math.round((group.count / totalResponses) * 100),
      };
    }),
  };
}

export async function createProfession(name: string) {
  const { professions } = await getCollections();
  const now = new Date();
  const sortOrder = await getNextSortOrder(professions);

  await professions.insertOne({
    _id: new ObjectId(),
    name: name.trim(),
    active: true,
    sortOrder,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateProfession(input: {
  id: string;
  name?: string;
  active?: boolean;
  sortOrder?: number;
}) {
  const { professions } = await getCollections();
  const update: Partial<DbProfession> = { updatedAt: new Date() };

  if (input.name !== undefined) {
    update.name = input.name.trim();
  }
  if (input.active !== undefined) {
    update.active = input.active;
  }
  if (input.sortOrder !== undefined) {
    update.sortOrder = input.sortOrder;
  }

  await professions.updateOne({ _id: toObjectId(input.id) }, { $set: update });
}

export async function deleteProfession(id: string) {
  const { professions } = await getCollections();
  await professions.deleteOne({ _id: toObjectId(id) });
}

export async function createSunbed(input: {
  title: string;
  imagePath: string;
  imageFilename: string;
}) {
  const { sunbeds } = await getCollections();
  const now = new Date();
  const sortOrder = await getNextSortOrder(sunbeds);

  await sunbeds.insertOne({
    _id: new ObjectId(),
    title: input.title.trim(),
    imagePath: input.imagePath,
    imageFilename: input.imageFilename,
    active: true,
    sortOrder,
    createdAt: now,
    updatedAt: now,
  });
}

export async function createSunbeds(
  inputs: Array<{
    imagePath: string;
    imageFilename: string;
  }>,
) {
  if (inputs.length === 0) {
    return;
  }

  const { sunbeds } = await getCollections();
  const now = new Date();
  const startSortOrder = await getNextSortOrder(sunbeds);

  await sunbeds.insertMany(
    inputs.map((input, index) => {
      const sortOrder = startSortOrder + index;

      return {
        _id: new ObjectId(),
        title: createSunbedTitle(sortOrder),
        imagePath: input.imagePath,
        imageFilename: input.imageFilename,
        active: true,
        sortOrder,
        createdAt: now,
        updatedAt: now,
      };
    }),
  );
}

export async function updateSunbed(input: {
  id: string;
  title?: string;
  active?: boolean;
  sortOrder?: number;
}) {
  const { sunbeds } = await getCollections();
  const update: Partial<DbSunbed> = { updatedAt: new Date() };

  if (input.title !== undefined) {
    update.title = input.title.trim();
  }
  if (input.active !== undefined) {
    update.active = input.active;
  }
  if (input.sortOrder !== undefined) {
    update.sortOrder = input.sortOrder;
  }

  await sunbeds.updateOne({ _id: toObjectId(input.id) }, { $set: update });
}

export async function deleteSunbed(id: string) {
  const { sunbeds } = await getCollections();
  const result = await sunbeds.findOneAndDelete({ _id: toObjectId(id) });

  return result;
}

export async function recordKioskResponse(
  input: Omit<DbResponse, "_id" | "createdAt">,
) {
  const { responses } = await getCollections();
  const _id = new ObjectId();

  await responses.insertOne({
    _id,
    ...input,
    createdAt: new Date(),
  });

  return { id: _id.toString() };
}

export async function recordKioskFeedback(input: {
  message: string;
  responseId?: string;
  professionId?: string;
  professionName?: string;
  finalWinnerSunbedId?: string;
}) {
  const { feedbacks } = await getCollections();

  await feedbacks.insertOne({
    _id: new ObjectId(),
    message: input.message,
    responseId: input.responseId,
    professionId: input.professionId,
    professionName: input.professionName,
    finalWinnerSunbedId: input.finalWinnerSunbedId,
    createdAt: new Date(),
  });
}

async function getNextSortOrder<TDocument extends { sortOrder: number }>(
  collection: Collection<TDocument>,
) {
  const lastItem = await collection
    .find({})
    .sort({ sortOrder: -1 })
    .limit(1)
    .next();

  return (lastItem?.sortOrder ?? 0) + 1;
}

export function toObjectId(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid MongoDB id.");
  }

  return new ObjectId(id);
}
